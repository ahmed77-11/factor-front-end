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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DoneOutline, CancelOutlined, Delete, Edit, Paid } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdherentsAsync, fetchRelationsAsync } from "../../redux/relations/relationsSlice.js";
import {
    fetchContratByAdherentIdAsync,
    fetchContratsSigner,
} from "../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";
import DeletePopup from "../../components/DeletePopup.jsx";
import {
    getAllInChequeEncaisse,
    getAllInChequeEnAttente,
    getAllInChequePaye,
    getAllInChequeRejete,
    fetchInChequesByAchetEnAttente,
    fetchInChequesByAchetEncaisse,
    fetchInChequesByAchetPaye,
    fetchInChequesByAchetRejete, deleteInChequeAsync,
} from "../../redux/inCheque/inChequeSlice.js";

const InCheque = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // --- redux state
    const { adherents, relations } = useSelector((state) => state.relations);
    const { contrats, loading: contratLoad } = useSelector((state) => state.contrat);
    const { currentPM } = useSelector((state) => state.personneMorale || {});
    const { currentPP } = useSelector((state) => state.personnePhysique || {});

    const {
        inChequeEnAttente,
        inChequeEncaisse,
        inChequePaye,
        inChequeRejete,
        loading,
        error,
    } = useSelector((state) => state.inCheque);

    // --- local state
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [selectedContrat, setSelectedContrat] = useState(null); // contrat chosen from contracts list
    const [adherentName, setAdherentName] = useState("");

    // Build adherent options like in CreateInCheque (factor code + identity label)
    const adherentOptions = (adherents || []).map((a) => ({
        id: a.id,
        adherFactorCode: a.adherFactorCode ?? a.factorAdherCode ?? "",
        label:
            a.typePieceIdentite?.code === "RNE"
                ? `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite} - ${a.raisonSocial || ""}`
                : `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite}  - ${a.nom || ""} ${a.prenom || ""}`,
        raw: a,
    }));

    // Filter contrats by selected adherent id (same as Add component)
    const filteredContrats = (contrats || []).filter(
        (c) => !selectedAdherentId || c.adherent === selectedAdherentId
    );

    const [acheteurs, setAcheteurs] = useState([]);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null); // used when chequesOfAcheteur === 'oui'

    // which status grid to show
    const [selectedStatus, setSelectedStatus] = useState("EN_ATTENTE");

    // cheques of acheteur: 'oui'|'non'
    const [chequesOfAcheteur, setChequesOfAcheteur] = useState("non");

    // acheteur selections (when chequesOfAcheteur === 'oui') - two autocompletes (id & name)
    const [selectedAcheteurById, setSelectedAcheteurById] = useState(null);
    const [selectedAcheteurByName, setSelectedAcheteurByName] = useState(null);

    // delete/status modal state
    const [openDelete, setOpenDelete] = useState(false);
    const [openStatusChange, setOpenStatusChange] = useState(false);
    const [selectedCheque, setSelectedCheque] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusOptions] = useState([
        { value: "EN_ATTENTE", label: "En attente" },
        { value: "ENCAISSE", label: "Encaissé" },
        { value: "PAYE", label: "Payé" },
        { value: "REJETE", label: "Rejeté" },
    ]);

    // Load adherents and contrats (like CreateInCheque)
    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchContratsSigner());
    }, [dispatch]);

    // Apply adherent selection helper (same behavior as CreateInCheque)
    const applyAdherentSelection = (adherObj) => {
        if (!adherObj) {
            setSelectedAdherentId(null);
            setSelectedContrat(null);
            setSelectedAdherent(null);
            return;
        }
        setSelectedAdherent(adherObj);
        setSelectedAdherentId(adherObj.id);
        setSelectedContrat(null);
    };

    // When contrat changes, fetch adherent details (PM/PP) and relations (acheteurs), like in Add
    useEffect(() => {
        if (selectedContrat) {
            const contrat = selectedContrat;

            if (contrat.contratNo && contrat.contratNo.startsWith("RNE")) {
                dispatch(getPMById(contrat.adherent));
            } else if (contrat.contratNo && contrat.contratNo.startsWith("PATENTE")) {
                dispatch(getPPById(contrat.adherent));
            }

            // Fetch relations for this adherent to build acheteurs list
            dispatch(fetchRelationsAsync(contrat.adherent));
        }
    }, [selectedContrat, dispatch]);

    // Update adherentName when details are fetched (same as Add)
    useEffect(() => {
        if (selectedContrat) {
            if (selectedContrat.contratNo && selectedContrat.contratNo.startsWith("RNE") && currentPM) {
                setAdherentName(currentPM.raisonSocial || "");
            } else if (selectedContrat.contratNo && selectedContrat.contratNo.startsWith("PATENTE") && currentPP) {
                setAdherentName(`${currentPP.nom || ""} ${currentPP.prenom || ""}`.trim());
            } else {
                setAdherentName("");
            }
        } else {
            setAdherentName("");
        }
    }, [selectedContrat, currentPM, currentPP]);

    // Build acheteurs from relations like in CreateInCheque
    useEffect(() => {
        if (relations && relations.length > 0) {
            const acheteursList = relations
                .map((relation) => {
                    if (relation.acheteurMorale) {
                        return {
                            id: relation.acheteurMorale.factorAchetCode,
                            pieceId: `${relation.acheteurMorale.typePieceIdentite?.dsg}${relation.acheteurMorale.numeroPieceIdentite}`,
                            name: relation.acheteurMorale.raisonSocial,
                            type: "pm",
                            raw: relation.acheteurMorale,
                        };
                    } else if (relation.acheteurPhysique) {
                        return {
                            id: relation.acheteurPhysique.factorAchetCode,
                            pieceId: `${relation.acheteurPhysique.typePieceIdentite?.dsg}${relation.acheteurPhysique.numeroPieceIdentite}`,
                            name: `${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`,
                            type: "pp",
                            raw: relation.acheteurPhysique,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            setAcheteurs(acheteursList);
        } else {
            setAcheteurs([]);
        }
    }, [relations]);

    // helper to extract acheteur code (adjust to your real field)
    const getAcheteurCode = (acheteur) => acheteur?.raw?.factorAchetCode || acheteur?.raw?.code || acheteur?.id || null;
    // fetch data whenever filters change: require explicit selectedContrat (don't use first contrat fallback)
    useEffect(() => {
        // if no contract selected, don't fetch anything — user requested empty grid until selection
        if (!selectedContrat) return;

        const contratId = selectedContrat.id;

        if (chequesOfAcheteur === "oui") {
            const chosenAcheteur = selectedAcheteurById || selectedAcheteurByName || selectedAcheteur;
            const acheteurCode = getAcheteurCode(chosenAcheteur);
            // if user chose to filter by acheteur but didn't select one yet, don't fetch
            if (!acheteurCode) return;

            switch (selectedStatus) {
                case "EN_ATTENTE":
                    dispatch(fetchInChequesByAchetEnAttente(contratId, acheteurCode));
                    break;
                case "ENCAISSE":
                    dispatch(fetchInChequesByAchetEncaisse(contratId, acheteurCode));
                    break;
                case "PAYE":
                    dispatch(fetchInChequesByAchetPaye(contratId, acheteurCode));
                    break;
                case "REJETE":
                    dispatch(fetchInChequesByAchetRejete(contratId, acheteurCode));
                    break;
                default:
                    break;
            }
        } else {
            switch (selectedStatus) {
                case "EN_ATTENTE":
                    dispatch(getAllInChequeEnAttente(contratId));
                    break;
                case "ENCAISSE":
                    dispatch(getAllInChequeEncaisse(contratId));
                    break;
                case "PAYE":
                    dispatch(getAllInChequePaye(contratId));
                    break;
                case "REJETE":
                    dispatch(getAllInChequeRejete(contratId));
                    break;
                default:
                    break;
            }
        }
    }, [selectedContrat, selectedStatus, chequesOfAcheteur, selectedAcheteurById, selectedAcheteurByName, selectedAcheteur, dispatch]);

    // handlers
    const handleAdherentChange = (event, newValue) => {
        // newValue is from adherentOptions: its .raw is the full adherent object
        applyAdherentSelection(newValue?.raw || null);
    };
    const handleContratChange = (event, newValue) => setSelectedContrat(newValue);
    const handleAcheteurByIdChange = (event, newValue) => {
        setSelectedAcheteurById(newValue || null);
        setSelectedAcheteur(newValue || null);
        setSelectedAcheteurByName(newValue || null);
    };
    const handleAcheteurByNameChange = (event, newValue) => {
        setSelectedAcheteurByName(newValue || null);
        setSelectedAcheteur(newValue || null);
        setSelectedAcheteurById(newValue || null);
    };

    const handleDeleteClick = (id) => {
        setSelectedCheque(id);
        setOpenDelete(true);
    };

    const handleStatusChangeClick = (cheque, status) => {
        setSelectedCheque(cheque);
        setNewStatus(status);
        setOpenStatusChange(true);
    };

    const handleConfirmStatusChange = () => {
        // dispatch update thunk when available
        setOpenStatusChange(false);
    };

    const handleConfirmDelete = () => {
        setOpenDelete(false);
        if (!selectedCheque) return;
        dispatch(deleteInChequeAsync(selectedCheque, navigate));
        setSelectedCheque(null);
    };

    const handleNavigateToAdd = () => navigate("/ajouter-in-cheque");
    const handleNavigateToEdit = (id) => navigate(`/modifier-in-cheque/${id}`);

    const commonColumns = [
        {
            field: "contrat",
            headerName: "Numéro Contrat",
            flex: 1,
            renderCell: (params) => params.row.contrat?.contratNo || "",
        },
        { field: "chequeNo", headerName: "Numéro Chèque", flex: 1.25 },
        {
            field: "tireurEmisDate",
            headerName: "Date Émission",
            flex: 0.75,
            renderCell: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
        },
        {
            field: "montant",
            headerName: "Montant",
            flex: 0.5,
            headerAlign: "left", // align header text
            align: "right",         // align cell content

            renderCell: (params) => {
                const devise = params.row?.contrat.devise?.codeAlpha;
                let fractionDigits = 0;

                if (devise === "TND") {
                    fractionDigits = 3;
                } else if (devise === "USD" || devise === "EUR") {
                    fractionDigits = 2;
                }

                const formatted = new Intl.NumberFormat("fr-FR", {
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits,
                }).format(params.value / 1000);

                return `${formatted} ${devise || ""}`;
            },
        },
        { field: "tireurEmisNom", headerName: "Tireur", flex: 0.5,align: "center",headerAlign: "center" },
        { field: "tireurEmisRib", headerName: "RIB Tireur", flex: 1 },
        {
            field: "statusMoyPai",
            headerName: "Statut",
            flex: 1,
            renderCell: (params) => (
                <Typography
                    color={
                        params.value?.code === "EN_ATTENTE"
                            ? "orange"
                            : params.value?.code === "ENCAISSE"
                                ? "green"
                                : params.value?.code === "PAYE"
                                    ? "blue"
                                    : "red"
                    }
                    sx={{ fontWeight: "bold", textTransform: "capitalize",display: "inline-block" }}
                >
                    {params.value?.dsg}
                </Typography>
            ),
        },
    ];

    const actionsColumn = (status) => ({
        field: "actions",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filterable: false,
        hideable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
            <Box display="flex" justifyContent="center" width="100%" gap={1}>
                {status === "EN_ATTENTE" && (
                    <>
                        <IconButton color="success" onClick={() => handleStatusChangeClick(params.row, "ENCAISSE")}>
                            <DoneOutline />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleStatusChangeClick(params.row, "REJETE")}>
                            <CancelOutlined />
                        </IconButton>
                    </>
                )}
                {status === "ENCAISSE" && (
                    <IconButton color="info" onClick={() => handleStatusChangeClick(params.row, "PAYE")}>
                        <Paid />
                    </IconButton>
                )}
                <IconButton color="secondary" onClick={() => handleNavigateToEdit(params.row.id)}>
                    <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}>
                    <Delete />
                </IconButton>
            </Box>
        ),
    });

    const getCurrentDataForStatus = () => {
        switch (selectedStatus) {
            case "EN_ATTENTE":
                return inChequeEnAttente;
            case "ENCAISSE":
                return inChequeEncaisse;
            case "PAYE":
                return inChequePaye;
            case "REJETE":
                return inChequeRejete;
            default:
                return [];
        }
    };

    const currentGridData = getCurrentDataForStatus();

    const totalMontant = currentGridData?.reduce(
        (sum, row) => sum + (row.montant || 0),
        0
    );

    // show grid only when user explicitly selected a contract. If filtering by acheteur, require acheteur selection too.
    const shouldShowGrid = !!selectedContrat && (chequesOfAcheteur === "non" || !!(selectedAcheteur || selectedAcheteurById || selectedAcheteurByName));

    return (
        <Box m="20px">
            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>

            <Header title="Gestion des Chèques" subtitle="Suivi des chèques entrants" />
                <Button variant="contained" color="secondary"  onClick={handleNavigateToAdd} sx={{ height: "100%" ,marginBottom:3.5}}>
                    Ajouter Chèque
                </Button>
            </Box>


            {error && (
                <Box my={2}>
                    <Alert severity="error" sx={{ fontSize: "14px" }}>
                        {error || "Une erreur s'est produite !"}
                    </Alert>
                </Box>
            )}

            {/* ---------- CONTROLS: 2 LINES ---------- */}

            {/* LINE 1: Adherent (3-autocompletes like Add) */}
            <Card sx={{ mb: 2, p: 2, backgroundColor: colors.grey[900] }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={adherentOptions}
                            getOptionLabel={(option) => option?.adherFactorCode || ""}
                            value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                            onChange={(e, newValue) => {
                                applyAdherentSelection(newValue?.raw);
                                setSelectedContrat(null);
                            }}
                            renderInput={(params) => <TextField {...params} label="Code Factor" fullWidth />}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={adherentOptions}
                            getOptionLabel={(option) => option?.label || ""}
                            value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                            onChange={(e, newValue) => {
                                applyAdherentSelection(newValue?.raw);
                                setSelectedContrat(null);
                            }}
                            renderInput={(params) => <TextField {...params} label="Identité Adhérent" fullWidth />}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={filteredContrats}
                            getOptionLabel={(option) => option?.contratNo || ""}
                            value={selectedContrat}
                            onChange={(e, newValue) => {
                                setSelectedContrat(newValue);
                                if (newValue) {
                                    setSelectedAdherentId(newValue.adherent);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Contrat" fullWidth />}
                        />
                    </Grid>
                </Grid>
            </Card>

            {/* LINE 2: Status type + Cheques of Acheteur toggle + Acheteur autocompletes (shown when 'oui') */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="status-select-label">Statut</InputLabel>
                            <Select
                                labelId="status-select-label"
                                value={selectedStatus}
                                label="Statut"
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statusOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="cheques-of-acheteur-label">Chèques d'acheteurs</InputLabel>
                            <Select
                                labelId="cheques-of-acheteur-label"
                                value={chequesOfAcheteur}
                                label="Chèques d'acheteurs"
                                onChange={(e) => {
                                    setChequesOfAcheteur(e.target.value);
                                    if (e.target.value === "non") {
                                        setSelectedAcheteurById(null);
                                        setSelectedAcheteurByName(null);
                                        setSelectedAcheteur(null);
                                    }
                                }}
                            >
                                <MenuItem value="non">Non</MenuItem>
                                <MenuItem value="oui">Oui</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>


                    {/* Acheteur autocompletes when oui */}
                    {chequesOfAcheteur === "oui" && (
                        <>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={acheteurs || []}
                                    getOptionLabel={(option) => option?.id?.toString() || ""}
                                    value={selectedAcheteurById}
                                    onChange={handleAcheteurByIdChange}
                                    renderInput={(params) => <TextField {...params} label="Acheteur (id/code)" variant="outlined" fullWidth />}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={acheteurs || []}
                                    getOptionLabel={(option) => option?.name || ""}
                                    value={selectedAcheteurByName}
                                    onChange={handleAcheteurByNameChange}
                                    renderInput={(params) => <TextField {...params} label="Acheteur (raison / nom)" variant="outlined" fullWidth />}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </Card>

            {/* Data grid area (single grid depending on selectedStatus) */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: colors.grey[900], mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {selectedStatus === "EN_ATTENTE" && "Chèques en Attente"}
                            {selectedStatus === "ENCAISSE" && "Chèques Encaissés"}
                            {selectedStatus === "PAYE" && "Chèques Payés"}
                            {selectedStatus === "REJETE" && "Chèques Rejetés"}
                        </Typography>

                        <Box
                            sx={{
                                height: 500,
                                "& .MuiDataGrid-root": { border: "none",zIndex:65 },
                                "& .MuiDataGrid-cell": { borderBottom: `1px solid ${colors.blueAccent[500]}`, fontSize: "12px" },
                                "& .MuiDataGrid-columnHeader": { backgroundColor: colors.blueAccent[700], fontSize: "14px" },
                                "& .MuiDataGrid-footerContainer": { backgroundColor: colors.blueAccent[700] },
                                "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
                                "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
                                // "& .MuiTypography-root .MuiTypography-h6": { color: colors.grey[100]+" !important"  },
                            }}
                        >
                            {shouldShowGrid ? (
                                <>
                                <DataGrid
                                    rows={currentGridData || []}
                                    columns={[...commonColumns, actionsColumn(selectedStatus)]}
                                    pageSizeOptions={[5, 10, 20]}
                                    slots={{ toolbar: GridToolbar }}
                                    disableRowSelectionOnClick
                                    localeText={localeText}
                                    getRowId={(row) => row.id}
                                    loading={loading}

                                />

                                </>

                            ) : (
                                <Box p={2}>
                                    <Typography variant="body2">Veuillez sélectionner un contrat{chequesOfAcheteur === "oui" ? " et un acheteur" : ""} pour afficher les chèques.</Typography>
                                </Box>
                            )}

                        </Box>


                        <Box p={2} display="flex" justifyContent="flex-start">
                            <Typography
                                variant="h6"
                                sx={{
                                    color: `${colors.grey[100]} !important`, // force text color
                                }}
                            >
                                Total Montant: {totalMontant.toLocaleString()}{" "}
                                {currentGridData?.[0]?.devise?.codeAlpha || ""}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Delete Confirmation Popup */}
            <DeletePopup
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le chèque"
                message="Êtes-vous sûr de vouloir supprimer ce chèque ?"
            />

            {/* Status Change Confirmation */}
            <Dialog open={openStatusChange} onClose={() => setOpenStatusChange(false)}>
                <DialogTitle>Changer le statut du chèque {selectedCheque?.chequeNo}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" mb={2}>
                        Vous êtes sur le point de changer le statut de ce chèque:
                    </Typography>
                    <Typography variant="h6" mb={2}>
                        Ancien statut: {selectedCheque?.statusMoyPai?.dsg}
                    </Typography>
                    <Typography variant="h6">Nouveau statut: {statusOptions.find((opt) => opt.value === newStatus)?.label}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusChange(false)} color="error">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirmStatusChange} color="success" autoFocus>
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InCheque;
