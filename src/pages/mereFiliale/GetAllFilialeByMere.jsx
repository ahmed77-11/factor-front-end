import  { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    useTheme,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Autocomplete } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { tokens, localeText } from "../../theme.js";
import { useNavigate } from "react-router-dom";
import { getPM } from "../../redux/personne/PersonneMoraleSlice.js";
import {
    deleteMereFiliale,
    fetchAllMereFilialesByMere,
} from "../../redux/MereFiliale/MereFilialeSlice.js";
import { Delete, Edit } from "@mui/icons-material";

const GetAllFilialeByMere = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { personneMorales } = useSelector((state) => state.personneMorale);
    const { mereFiliales, loadingMereFiliale } = useSelector((state) => state.mereFiliale);

    const [selectedMere, setSelectedMere] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (!personneMorales || personneMorales.length === 0) {
            dispatch(getPM());
        }
    }, [personneMorales, dispatch]);

    useEffect(() => {
        if (selectedMere) {
            dispatch(fetchAllMereFilialesByMere(selectedMere.id));
        }
    }, [selectedMere, dispatch]);

    const handleDeleteConfirm = () => {
        if (deleteTarget) {
            dispatch(deleteMereFiliale(deleteTarget.id));
            setDeleteTarget(null);
        }
    };

    const handleOpenDialog = (row) => {
        setDeleteTarget(row);
    };

    const columns = [
        {
            field: "PieceIdentite",
            headerName: "pièce d'identité",
            flex: 1,
            valueGetter: (value,row) => {
                return row.filiale?.typePieceIdentite?.dsg + " " + row.filiale?.numeroPieceIdentite || "—";
            },
            renderCell: (params) => {
                return params.row.filiale?.typePieceIdentite?.dsg + " " + params.row?.filiale?.numeroPieceIdentite || "—";
            },
        },
        {
            field: "raisonSociale",
            headerName: "Raison sociale",
            flex: 1,
            valueGetter: (value,row) => row.filiale?.raisonSocial || "—",
            renderCell: (params) => params.row.filiale?.raisonSocial || "—",
        },
        {
            field: "entryDate",
            headerName: "Date entrée",
            flex: 1,
            valueGetter: (value,row) => new Date(row.entryDate).toLocaleDateString(),
            renderCell: (params) => new Date(params.value).toLocaleDateString(),
        },
        {
            field: "expireDate",
            headerName: "Date expiration",
            flex: 1,
            valueGetter: (value,row) => new Date(row.expireDate).toLocaleDateString(),
            renderCell: (params) => new Date(params.value).toLocaleDateString(),
        },
        { field: "infoLibre", headerName: "Info libre", flex: 1 },
        {
            field: "factorTauxFin",
            headerName: "Factor taux fin",
            flex: 1,
            valueGetter: (value,row) => row.factorTauxFin || "—",
            renderCell: (params) => `${params.value} %`,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1.5,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Box display="flex" alignItems="center" justifyContent={"center"} padding={"5px"} gap={1}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit />}
                        fullWidth
                        onClick={() =>
                            navigate(`/modifier-mere-filiale/${row.id}`, {
                                state: { accord: row },
                            })
                        }
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<Delete />}
                        onClick={() => handleOpenDialog(row)}
                    >
                        Supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px" >
            <Typography variant="h4" mb={3}>
                Relations Mère‑Filiale
            </Typography>

            <Box display="flex" alignItems="center" justifyContent={"space-between"} mb={3} gap={2}>
                <Autocomplete
                    options={personneMorales || []}
                    getOptionLabel={(option) =>
                        `${option?.typePieceIdentite?.dsg ?? ""}${option?.numeroPieceIdentite ?? ""} | ${option?.raisonSocial ?? ""}`
                    }
                    renderInput={(params) => <TextField {...params} label="Choisir une Mère" />}
                    value={selectedMere}
                    onChange={(e, val) => setSelectedMere(val)}
                    sx={{ width: "500px", mb: 0 }}  // removed mb from autocomplete
                />
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900], height: "56px" }}
                    onClick={() => navigate("/ajouter-mere-filiale")}
                >
                    Ajouter
                </Button>
            </Box>

            <Card
                sx={{
                    height: "75vh",
                    backgroundColor: colors.grey[900],
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "13px",
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: colors.blueAccent[700],
                        fontSize: "13px",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={mereFiliales || []}
                    columns={columns}
                    loading={loadingMereFiliale}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
                />
            </Card>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    Voulez‑vous vraiment supprimer la relation avec la filiale&nbsp;
                    <strong>{deleteTarget?.filiale?.raisonSocial}</strong> ?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
                    <Button color="error" onClick={handleDeleteConfirm}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GetAllFilialeByMere;
