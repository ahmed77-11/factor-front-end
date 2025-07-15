import Header from "../../components/Header.jsx";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {DoneOutline, CancelOutlined, Delete, Edit, Paid} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import {
    deleteFinByIdAsync, demFinMarkAsPaid, getAllDemFinAccepterByContratAsync,
    getAllDemFinEnAttenteByContratAsync, getAllDemFinRejeterByContratAsync,
    rejectDemFinAsync,
} from "../../redux/demFin/demFinSlice.js";
import { fetchAdherentsAsync } from "../../redux/relations/relationsSlice.js";
import { fetchContratByAdherentIdAsync } from "../../redux/contrat/ContratSlice.js";
import DeletePopup from "../../components/DeletePopup.jsx";
import { Formik } from "formik";
import * as yup from "yup";
import EditIcon from "@mui/icons-material/Edit";

const Financement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { adherents } = useSelector(state => state.relations);
    const { currentContrat, loading: contratLoad } = useSelector(state => state.contrat);
    const { demFinEnCours, demFin,demFinRejeter,loading, error } = useSelector(state => state.demFin);

    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [openReject, setOpenReject] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    // Validation schema for rejection form
    const rejectValidationSchema = yup.object().shape({
        libelle: yup.string().required("Libellé est requis"),
        motif: yup.string().required("Motif est requis"),
    });


    const handleMarkAsPaid = async (id) => {
      await  dispatch(demFinMarkAsPaid(id));
      dispatch(getAllDemFinAccepterByContratAsync(currentContrat?.id));
    };




    const columns = [
        {
            field: "contrat",
            headerName: "Numéro Contrat",
            flex: 1,
            renderCell: (params) => params.row.contrat?.contratNo || "",
        },
        {
            field: "adherEmisNo",
            headerName: "Fin Adhérent Emission Num",
            flex: 1,
        },
        {
            field: "adherEmisDate",
            headerName: "Date Emission",
            flex: 1,
            renderCell: (params) => params.row.adherEmisDate?.split("T")[0] || "",
        },
        {
            field: "adherRib",
            headerName: "RIB Fin Adhérent",
            flex: 1,
        },
        {
            field: "adherMontant",
            headerName: "Montant",
            flex: 1,
        },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            renderCell: (params) => params.row.devise?.codeAlpha || "",
        },
        {
            field: "adherLibelle",
            headerName: "Libelle",
            flex: 1,
        },
        {
            field: "desicion",
            headerName: "desicion",
            flex: 1,
            renderCell:(params)=>{
                return (
                    <Box display="flex"  py={2} width="100%" >
                        {params.row.desicion === "ACCEPTE" ? (
                            <Typography color="green">{params.row.desicion}</Typography>
                        ) : params.row.desicion === "REJETE" ? (
                            <Typography color="red">{params.row.desicion}</Typography>
                        ) : (
                            <Typography color="orange">En Attente</Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "adherInfoLibre",
            headerName: "Info Libre",
            flex: 1,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" width="100%" gap={1}>
                    <IconButton
                        color="secondary"
                        onClick={() => handleAcceptClick(params.row)}
                    >
                        <DoneOutline />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleRejectClick(params.row.id)}
                    >
                        <CancelOutlined />
                    </IconButton>
                </Box>
            ),
        },
    ];
    const columnsRejeter = [
        {
            field: "contrat",
            headerName: "Numéro Contrat",
            flex: 1,
            renderCell: (params) => params.row.contrat?.contratNo || "",
        },
        {
            field: "adherEmisNo",
            headerName: "Fin Adhérent Emission Num",
            flex: 1,
        },
        {
            field: "adherEmisDate",
            headerName: "Date Emission",
            flex: 1,
            renderCell: (params) => params.row.adherEmisDate?.split("T")[0] || "",
        },
        {
            field: "adherRib",
            headerName: "RIB Fin Adhérent",
            flex: 1,
        },
        {
            field: "adherMontant",
            headerName: "Montant",
            flex: 1,
        },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            renderCell: (params) => params.row.devise?.codeAlpha || "",
        },
        {
            field: "adherLibelle",
            headerName: "Libelle",
            flex: 1,
        },
        {
            field: "desicion",
            headerName: "desicion",
            flex: 1,
            renderCell:(params)=>{
                return (
                    <Box display="flex"  py={2} width="100%" >
                        {params.row.desicion === "ACCEPTE" ? (
                            <Typography color="green">{params.row.desicion}</Typography>
                        ) : params.row.desicion === "REJETER" ? (
                            <Typography color="red">{params.row.desicion}</Typography>
                        ) : (
                            <Typography color="orange">En Attente</Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "adherInfoLibre",
            headerName: "Info Libre",
            flex: 1,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" width="100%" gap={1}>
                    <IconButton
                        color="secondary"
                        onClick={() =>
                            navigate(`/modifier-demfin/${params.row.id}`, {
                                state: { demande: params.row },
                            })
                        }
                    >
                        <Edit />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        <Delete />
                    </IconButton>
                </Box>
            ),
        },

    ];
    const columnsAccepter = [
        {
            field: "contrat",
            headerName: "Numéro Contrat",
            flex: 1,
            renderCell: (params) => params.row.contrat?.contratNo || "",
        },
        {
            field: "adherEmisNo",
            headerName: "Fin Adhérent Emission Num",
            flex: 1,
        },
        {
            field: "adherEmisDate",
            headerName: "Date Emission",
            flex: 1,
            renderCell: (params) => params.row.adherEmisDate?.split("T")[0] || "",
        },
        {
            field: "adherRib",
            headerName: "RIB Fin Adhérent",
            flex: 1,
        },
        {
            field: "adherMontant",
            headerName: "Montant",
            flex: 1,
        },
        {
            field: "montantInteret",
            headerName: "Montant Interet",
            flex: 1,
        },
        {
            field: "echeanceDate",
            headerName: "Date Échéance",
            flex: 1,
            renderCell: (params) => {
                const dateStr = params.row.echeanceDate?.split("T")[0] || "";
                const todayStr = new Date().toISOString().split("T")[0];

                const isToday = dateStr <= todayStr;

                return (
                    <span style={{ color: isToday && !params.row.paymentStatus ? "red" : "green" }}>
                {dateStr? dateStr : ""}
            </span>
                );
            },
        },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            renderCell: (params) => params.row.devise?.codeAlpha || "",
        },
        {
            field: "adherLibelle",
            headerName: "Libelle",
            flex: 1,
        },
        {
            field: "desicion",
            headerName: "desicion",
            flex: 1,
            renderCell:(params)=>{
                return (
                    <Box display="flex"  py={2} width="100%" >
                        {params.row.desicion === "VALIDER" ? (
                            <Typography color="green">{params.row.desicion}</Typography>
                        ) : params.row.desicion === "REJETER" ? (
                            <Typography color="red">{params.row.desicion}</Typography>
                        ) : (
                            <Typography color="orange">En Attente</Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "adherInfoLibre",
            headerName: "Info Libre",
            flex: 1,
        },
        {
            field: "paymentStatus",
            headerName:"Payé",
            flex: 1,
            renderCell: (params) => {
                return (
                    <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        disabled={params.row.paymentStatus}
                        startIcon={<Paid />}
                        onClick={()=>handleMarkAsPaid(params.row.id)}
                    >
                        Paid
                    </Button>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => {

                return (
                    <Box display="flex" justifyContent="center" alignItems="center" width="100%" gap={1}>
                        <IconButton
                            color="secondary"
                            onClick={() =>
                                navigate(`/modifier-demfin/${params.row.id}`, {
                                    state: { demande: params.row },
                                })
                            }
                        >
                            <Edit />
                        </IconButton>

                        <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(params.row.id)}
                        >
                            <Delete />
                        </IconButton>


                    </Box>
                );
            },
        },
    ];

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    useEffect(() => {
        if (selectedAdherent) {
            dispatch(fetchContratByAdherentIdAsync(selectedAdherent.id));
        }
    }, [selectedAdherent, dispatch]);

    useEffect(() => {
        if(currentContrat && !contratLoad ){
            dispatch(getAllDemFinEnAttenteByContratAsync(currentContrat?.id))
            dispatch(getAllDemFinAccepterByContratAsync(currentContrat?.id))
            dispatch(getAllDemFinRejeterByContratAsync(currentContrat?.id))
        }
    }, [currentContrat, contratLoad, dispatch]);

    const handleAdherentChange = (event, newValue) => {
        setSelectedAdherent(newValue);
    };

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const handleRejectClick = (id) => {
        setSelectedId(id);
        setOpenReject(true);
    };

    const handleAcceptClick = (demande) => {
        // Check if amount exceeds available or authorized
        const disponible = currentContrat?.contratFinDisponible || 0;
        const autorise = currentContrat?.contratLimiteFinAuto || 0;
        const montant = demande.adherMontant || 0;

        if (montant > disponible) {
            setWarningMessage(`Le montant (${montant}) dépasse le disponible (${disponible}). Vous ne pouvez pas accepter cette demande.`);
            setOpenWarning(true);
            return;
        }

        if (montant > autorise) {
            setWarningMessage(`Le montant (${montant}) dépasse l'autorisé (${autorise}). Vous ne pouvez pas accepter cette demande.`);
            setOpenWarning(true);
            return;
        }

        // If all checks pass, navigate to accept page
        navigate(`/accept-demfin/${demande.id}`, {
            state: { demande: demande },
        });
    };

    const handleConfirmDelete = () => {
        dispatch(deleteFinByIdAsync(selectedId));
        setOpenDelete(false);
        dispatch(getAllDemFinEnAttenteByContratAsync(currentContrat?.id));
    };

    const handleRejectSubmit = (values, { resetForm }) => {
        dispatch(rejectDemFinAsync(selectedId, values));
        setOpenReject(false);
        resetForm();
        dispatch(getAllDemFinEnAttenteByContratAsync(currentContrat?.id));
    };

    return (
        <Box m="20px">
            <Header title="Financement" subtitle="Gestion des financements" />

            {error && (
                <Box  my={2}>
                    <Alert  severity="error" sx={{fontSize:"14px"}}>
                        {error || "Une erreur s'est produite lors de la création de la personne physique !"}
                    </Alert>
                </Box>
            )}

            {/* Adherent Selection and Financial Info */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={adherents}
                            getOptionLabel={(option) =>option.raisonSocial? option.raisonSocial: option.nom + " " + option.prenom}
                            value={selectedAdherent}
                            onChange={handleAdherentChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Sélectionner un adhérent"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Disponible"
                            value={currentContrat?.contratFinDisponible || 0}
                            variant="outlined"
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Utilisé"
                            value={currentContrat?.contratFinUtlise || 0}
                            variant="outlined"
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Autorisé"
                            value={currentContrat?.contratLimiteFinAuto || 0}
                            variant="outlined"
                            fullWidth
                            disabled
                        />
                    </Grid>
                </Grid>
            </Card>

            {/* Demand Lists */}
            <Grid container spacing={3} mb={5}>
                <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                        <Typography variant="h6" gutterBottom>
                            Demandes en attente
                        </Typography>
                        <Box
                            sx={{
                                height: 400,
                                "& .MuiDataGrid-root": { border: "none" },
                                "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "12px"
                    },
                                "& .MuiDataGrid-columnHeader": {
                                    backgroundColor: colors.blueAccent[700],
                                    fontSize: "14px"
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
                            }}>
                            <DataGrid
                                rows={demFinEnCours || []}
                                columns={columns}
                                pageSizeOptions={[5, 10, 20]}
                                slots={{ toolbar: GridToolbar }}
                                checkboxSelection
                                disableRowSelectionOnClick
                                localeText={localeText}
                                getRowId={(row) => row.id}
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>
            <Grid container spacing={3}  mb={5}>
                <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                        <Typography variant="h6" gutterBottom>
                            Demandes Validées
                        </Typography>
                        <Box sx={{
                            height: 400,
                            "& .MuiDataGrid-root": { border: "none" },
                            "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "12px"
                    },
                            "& .MuiDataGrid-columnHeader": {
                                backgroundColor: colors.blueAccent[700],
                                fontSize: "14px"
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
                        }}>
                            <DataGrid
                                rows={demFin||[]}
                                columns={columnsAccepter}
                                pageSizeOptions={[5, 10, 20]}
                                slots={{ toolbar: GridToolbar }}
                                checkboxSelection
                                disableRowSelectionOnClick
                                localeText={localeText}
                                getRowId={(row) => row.id}
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                        <Typography variant="h6" gutterBottom>
                            Demandes Rejetées
                        </Typography>
                        <Box sx={{
                            height: 400,
                            "& .MuiDataGrid-root": { border: "none" },
                            "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "12px"
                    },
                            "& .MuiDataGrid-columnHeader": {
                                backgroundColor: colors.blueAccent[700],
                                fontSize: "14px"
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
                        }}>
                            <DataGrid
                                rows={demFinRejeter||[]}
                                columns={columnsRejeter}
                                pageSizeOptions={[5, 10, 20]}
                                slots={{ toolbar: GridToolbar }}
                                checkboxSelection
                                disableRowSelectionOnClick
                                localeText={localeText}
                                getRowId={(row) => row.id}
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Delete Confirmation Popup */}
            <DeletePopup
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
            />

            {/* Reject DemFin Popup */}
            <Dialog open={openReject} onClose={() => setOpenReject(false)}>
                <Formik
                    initialValues={{ libelle: '', motif: '' }}
                    validationSchema={rejectValidationSchema}
                    onSubmit={handleRejectSubmit}
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                      }) => (
                        <form onSubmit={handleSubmit}>
                            <DialogTitle>Rejeter la demande de financement</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    name="libelle"
                                    label="Libellé"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={values.libelle}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.libelle && Boolean(errors.libelle)}
                                    helperText={touched.libelle && errors.libelle}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    margin="dense"
                                    name="motif"
                                    label="Motif"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    value={values.motif}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.motif && Boolean(errors.motif)}
                                    helperText={touched.motif && errors.motif}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenReject(false)} color="error">
                                    Annuler
                                </Button>
                                <Button type="submit" color="secondary">
                                    Confirmer
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
            </Dialog>

            {/* Warning Popup for amount validation */}
            <Dialog open={openWarning} onClose={() => setOpenWarning(false)}>
                <DialogTitle>Avertissement</DialogTitle>
                <DialogContent>
                    <Typography>{warningMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenWarning(false)} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Financement;