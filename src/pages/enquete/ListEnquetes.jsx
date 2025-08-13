import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens, localeText } from "../../theme";
import Header from "../../components/Header";
import {
    getAllEnquetes,
    deleteEnquete
} from "../../redux/enquete/enqueteSlice"; // Make sure deleteEnquete exists

const ListEnquete = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { enquetes, errorEnquete,loadingEnquete } = useSelector((state) => state.enquete);

    const [columnVisibility, setColumnVisibility] = useState({ id: false });

    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        dispatch(getAllEnquetes());
    }, [dispatch]);

    const confirmDelete = async () => {
        if (selectedId) {
            await dispatch(deleteEnquete(selectedId));
            dispatch(getAllEnquetes());
            setOpenConfirm(false);
            setSelectedId(null);
        }
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, hide: true },
        {
            field: "Personne",
            headerName: "Personne Morale/Physique",
            flex: 1,
            renderCell: (params) => {
                const { pmAdher, ppAdher, ppAchet, pmAchet } = params.row;
                if (pmAdher) return pmAdher.raisonSocial;
                if (ppAdher) return `${ppAdher.nom} ${ppAdher.prenom}`;
                if (pmAchet) return pmAchet.raisonSocial;
                if (ppAchet) return `${ppAchet.nom} ${ppAchet.prenom}`;
                return "-";
            }
        },
        {
            field: "type",
            headerName: "Type Personne",
            flex: 1,
            renderCell: (params) => {
                const { pmAdher, ppAdher, ppAchet, pmAchet } = params.row;
                if (pmAdher) return "Adhérent Morale";
                if (ppAdher) return "Adhérent Physique";
                if (pmAchet) return "Acheteur Morale";
                if (ppAchet) return "Acheteur Physique";
                return "-";
            }
        },
        {
            field: "adherRef",
            headerName: "Référence",
            flex: 0.75
        },
        {
            field: "adherDate",
            headerName: "Date Adhérent",
            flex: 1,
            renderCell: (params) => params.row.adherDate?.slice(0, 10) || "-"
        },
        {
            field: "adherMontant",
            headerName: "Montant Adhérent",
            flex: 0.75
        },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1.25,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" justifyContent={"center"} marginTop={"8px"}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit />}
                        fullWidth={true}
                        sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px" }}
                        onClick={() =>
                            navigate(`/modifier-enquete/${params.row.id}`, {
                                state: { enquete: params.row }
                            })
                        }
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        fullWidth={true}
                        onClick={() => {
                            setSelectedId(params.row.id);
                            setOpenConfirm(true);
                        }}
                    >
                        Supprimer
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box m="20px">
            <Header title="Liste des Enquêtes" subtitle="Toutes les enquêtes enregistrées" />
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }}
                    onClick={() => navigate("/ajouter-enquete")}
                >
                    Ajouter
                </Button>
            </Box>

            {errorEnquete && (
                <Box mb={2}>
                    <Alert severity="error">{errorEnquete}</Alert>
                </Box>
            )}

            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "13px"
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: colors.blueAccent[700],
                        fontSize: "13px"
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.blueAccent[700]
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`
                    }
                }}
            >
                <DataGrid
                    rows={enquetes || []}
                    getRowId={(row) => row.id}
                    columns={columns}
                    loading={loadingEnquete}
                    pagination
                    pageSizeOptions={[5, 10, 20]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibility({ ...newModel, id: false })
                    }
                    slots={{ toolbar: GridToolbar }}
                />
            </Box>

            {/* ✅ Confirmation Dialog */}
            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">Confirmation de suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        Êtes-vous sûr de vouloir supprimer cette enquête ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListEnquete;
