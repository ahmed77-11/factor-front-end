import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { tokens, localeText } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { deleteAccord, fetchAllAccords } from "../../redux/accord/accordSlice";

const ListAccord = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { accords, errorAccord } = useSelector((state) => state.accord);
    const [columnVisibility, setColumnVisibility] = useState({ id: false });

    // State for dialog visibility and selected accord ID
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        dispatch(fetchAllAccords());
    }, [dispatch]);

    // Open dialog and set the selected ID
    const handleOpenDialog = (id) => {
        setSelectedId(id);
        setOpenDialog(true);
    };

    // Close the dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedId(null);
    };

    // Confirm delete action
    const handleConfirmDelete = () => {
        if (selectedId) {
            dispatch(deleteAccord(selectedId));
            // Optionally, refetch accords after deletion
            dispatch(fetchAllAccords());
            
        }

        handleCloseDialog();
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, hide: true },

        {
            field: "enqueteRef",
            headerName: "Réf. Enquête",
            flex: 1,
            renderCell: (params) => params.row.enqueteRef|| "-",
        },

        {
            field: "personne",
            headerName: "Personne Associée",
            flex: 1.5,
            renderCell: ({ row }) => {
                if (row.enquete.pmAdher) return row.enquete.pmAdher.raisonSocial;
                if (row.enquete.ppAdher) return `${row.enquete.ppAdher.nom} ${row.enquete.ppAdher.prenom}`;
                if (row.enquete.pmAchet) return row.enquete.pmAchet.raisonSocial;
                if (row.enquete.ppAchet) return `${row.enquete.ppAchet.nom} ${row.enquete.ppAchet.prenom}`;
                return "-";
            },
        },

        {
            field: "role",
            headerName: "Rôle",
            flex: 1,
            renderCell: ({ row }) => {
                if (row.pmFactorAdher || row.ppFactorAdher) return "Adhérent";
                if (row.pmFactorAchet || row.ppFactorAchet) return "Acheteur";
                return "-";
            },
        },

        {
            field: "type",
            headerName: "Type Personne",
            flex: 1,
            renderCell: ({ row }) => {
                if (row.pmFactorAdher || row.pmFactorAchet) return "Morale";
                if (row.ppFactorAdher || row.ppFactorAchet) return "Physique";
                return "-";
            },
        },

        {
            field: "risqueRef",
            headerName: "Réf. Risque",
            flex: 1,
        },
        {
            field: "risqueDate",
            headerName: "Date Risque",
            flex: 1,
            renderCell: ({ row }) => row.risqueDate?.slice(0, 10) || "-",
        },
        {
            field: "factorRef",
            headerName: "Réf. Factor",
            flex: 1,
        },
        {
            field: "factorDate",
            headerName: "Date Factor",
            flex: 1,
            renderCell: ({ row }) => row.factorDate?.slice(0, 10) || "-",
        },

        {
            field: "factorMontant",
            headerName: "factor Montant",
            flex: 1,
        },

        {
            field: "actions",
            headerName: "Actions",
            flex: 2.5,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    marginTop={"8px"}
                >
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit />}
                        fullWidth={true}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "10px",
                        }}
                        onClick={() =>
                            navigate(`/modifier-accord/${row.id}`, {
                                state: { accord: row },
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
                        onClick={() => handleOpenDialog(row.id)} // Open confirmation dialog
                    >
                        Supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header
                title="Liste des Accords"
                subtitle="Tous les accords enregistrés"
            />
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: colors.greenAccent[500],
                        color: colors.grey[900],
                    }}
                    onClick={() => navigate("/ajouter-accord")}
                >
                    Ajouter Accord
                </Button>
            </Box>

            {errorAccord && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorAccord}
                </Alert>
            )}

            <Box
                height="75vh"
                sx={{
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
                    rows={accords || []}
                    getRowId={(row) => row.id}
                    columns={columns}
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

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer cet accord ? Cette action
                        est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListAccord;
