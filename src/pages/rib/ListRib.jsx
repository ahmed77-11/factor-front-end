import Header from "../../components/Header.jsx";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import DeletePopup from "../../components/DeletePopup.jsx";
import {
    allAdherRibs,
    allAchetPmRibs,
    allAchetPpRibs,
    allFournPmRibs,
    allFournPpRibs,
    deleteRibByIdAsync
} from "../../redux/rib/ribSlice.js";
import {
    fetchAcheteursAsync,
    fetchAdherentsAsync,
    fetchFournisseursAsync
} from "../../redux/relations/relationsSlice.js";

const AllRibs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { contrats = [] } = useSelector(state => state.contrat);
    const { ribs = [], loadingRib, errorRib } = useSelector(state => state.rib);
    const {
        acheteurs = {},
        fournisseurs = {},
        adherents = [],
        loading: loadingRelations,
        error: errorRelations
    } = useSelector(state => state.relations);

    const [selectedContrat, setSelectedContrat] = useState(null);
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [selectedEntityType, setSelectedEntityType] = useState("adherent"); // 'adherent', 'acheteur', 'fournisseur'
    const [selectedEntitySubType, setSelectedEntitySubType] = useState(""); // 'pm' or 'pp'
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Build adherent options
    const adherentOptions = (adherents || []).map(ad => ({
        id: ad.id,
        name: ad.typePieceIdentite?.code === "RNE"
            ? ad.raisonSocial
            : `${ad.nom} ${ad.prenom}`,
        code: ad.factorAdherCode,
        identity: `${ad.typePieceIdentite?.dsg || ""}${ad.numeroPieceIdentite || ""}`,
        raw: ad
    }));

    // Build contrat options (all contrats). We'll allow selecting any contract even without selecting an adherent first.
    const contratOptions = contrats || [];

    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAdherentsAsync());
        dispatch(fetchAcheteursAsync());
        dispatch(fetchFournisseursAsync());
    }, [dispatch]);

    // When adherent is selected, find their contrats and if only one contrat exists, auto-select it.
    useEffect(() => {
        if (!selectedAdherent) {
            // don't automatically clear a contract chosen explicitly by user
            return;
        }

        const filtered = contratOptions.filter(c => c.adherent === selectedAdherent.id);

        if (filtered.length === 1) {
            setSelectedContrat(filtered[0]);
        } else {
            // Leave contract alone only if currently selected contract belongs to this adherent
            if (!selectedContrat || selectedContrat.adherent !== selectedAdherent.id) {
                setSelectedContrat(null);
            }
        }
    }, [selectedAdherent, contratOptions, selectedContrat]);

    // When contrat is selected, sync adherent (vice-versa) and reset entity filters
    useEffect(() => {
        if (selectedContrat && selectedAdherent) {
            // Sync adherent to the contract's adherent (if present in adherentOptions)
            const matchedAdherent = adherentOptions.find(a => a.id === selectedContrat.adherent) || null;
            if (matchedAdherent) {
                setSelectedAdherent(matchedAdherent);
            }

            // Reset entity filters when a contract is chosen
            setSelectedEntityType("adherent");
            setSelectedEntitySubType("");
            setSelectedEntity(null);
        }
    }, [selectedContrat]);

    // Fetch RIBs when filters change
    useEffect(() => {
        // we require a contract to fetch ribs (business logic kept as original)
        if (!selectedContrat) return;

        if (selectedEntityType === "adherent") {
            dispatch(allAdherRibs(selectedContrat.id));
        }
        else if (selectedEntityType === "acheteur" && selectedEntity) {
            if (selectedEntitySubType === "pm") {
                dispatch(allAchetPmRibs(selectedContrat.id, selectedEntity.id));
            } else if (selectedEntitySubType === "pp") {
                dispatch(allAchetPpRibs(selectedContrat.id, selectedEntity.id));
            }
        }
        else if (selectedEntityType === "fournisseur" && selectedEntity) {
            if (selectedEntitySubType === "pm") {
                dispatch(allFournPmRibs(selectedContrat.id, selectedEntity.id));
            } else if (selectedEntitySubType === "pp") {
                dispatch(allFournPpRibs(selectedContrat.id, selectedEntity.id));
            }
        }
    }, [selectedContrat, selectedEntityType, selectedEntitySubType, selectedEntity, dispatch]);

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const handleConfirmDelete = () => {
        if (selectedId) {
            dispatch(deleteRibByIdAsync(selectedId));
        }
        setOpenDelete(false);
    };

    // Build entity options based on type and subtype
    const getEntityOptions = () => {
        if (!selectedEntitySubType) return [];

        let options = [];

        if (selectedEntityType === "acheteur") {
            if (selectedEntitySubType === "pm") {
                options = (acheteurs.pms || []).map(pm => ({
                    id: pm.id,
                    name: pm.raisonSocial,
                    identity: `${pm.typePieceIdentite?.dsg || ""}${pm.numeroPieceIdentite || ""}`,
                    raw: pm
                }));
            } else if (selectedEntitySubType === "pp") {
                options = (acheteurs.pps || []).map(pp => ({
                    id: pp.id,
                    name: `${pp.nom} ${pp.prenom}`,
                    identity: `${pp.typePieceIdentite?.dsg || ""}${pp.numeroPieceIdentite || ""}`,
                    raw: pp
                }));
            }
        }
        else if (selectedEntityType === "fournisseur") {
            if (selectedEntitySubType === "pm") {
                options = (fournisseurs.pms || []).map(pm => ({
                    id: pm.id,
                    name: pm.raisonSocial,
                    identity: `${pm.typePieceIdentite?.dsg || ""}${pm.numeroPieceIdentite || ""}`,
                    raw: pm
                }));
            } else if (selectedEntitySubType === "pp") {
                options = (fournisseurs.pps || []).map(pp => ({
                    id: pp.id,
                    name: `${pp.nom} ${pp.prenom}`,
                    identity: `${pp.typePieceIdentite?.dsg || ""}${pp.numeroPieceIdentite || ""}`,
                    raw: pp
                }));
            }
        }

        return options;
    };

    const entityOptions = getEntityOptions();

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "rib", headerName: "RIB", flex: 1.5 },
        {
            field: "role",
            headerName: "Rôle",
            flex: 1.5,
            renderCell: (params) => {
                return params.row.achetPpId
                    ? "Acheteur Physique"
                    : params.row.fournPpId
                        ? "Fournisseur Physique"
                        : params.row.achetPmId
                            ? "Acheteur Morale"
                            : params.row.fournPmId
                                ? "Fournisseur Morale"
                                : "Adhérent";
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
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" width="100%" gap={1}>
                    <IconButton
                        color="secondary"
                        onClick={() =>
                            navigate(`/modifier-rib/${params.row.id}`, {
                                state: { rib: params.row }
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

    return (
        <Box m="20px">
            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
            <Header title="RIB" subtitle="Gestion des RIBs"  />
            <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/ajouter-rib")}
                sx={{ height: "100%",mb: 4 }}
            >
                Ajouter un RIB
            </Button>
            </Box>
            {(errorRib || errorRelations) && (
                <Box m={2}>
                    <Alert severity="error" sx={{ fontSize: "14px" }}>
                        {errorRib || errorRelations || "Une erreur s'est produite !"}
                    </Alert>
                </Box>
            )}


            {/* Single Card containing both contract + entity filters (merged) */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Contrat No */}
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={contratOptions}
                            getOptionLabel={(option) => option?.contratNo || ""}
                            value={selectedContrat}
                            onChange={(e, v) => {
                                setSelectedContrat(v);
                                // When the user picks a contract, set the adherent accordingly
                                if (v) {
                                    const matched = adherentOptions.find(a => a.id === v.adherent) || null;
                                    setSelectedAdherent(matched);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Contrat No" fullWidth />
                            )}
                            disabled={contrats.length === 0}
                        />
                    </Grid>

                    {/* Adherent Name */}
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={adherentOptions}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedAdherent}
                            onChange={(e, v) => {
                                setSelectedAdherent(v);
                                // if user picks an adherent, clear contract so effect can auto-select if only one
                                setSelectedContrat(null);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Adhérent (Nom)" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Adherent Code */}
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={adherentOptions}
                            getOptionLabel={(option) => option.code || ""}
                            value={selectedAdherent}
                            onChange={(e, v) => {
                                setSelectedAdherent(v);
                                setSelectedContrat(null);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Code Adhérent" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Adherent Identity */}
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={adherentOptions}
                            getOptionLabel={(option) => option.identity || ""}
                            value={selectedAdherent}
                            onChange={(e, v) => {
                                setSelectedAdherent(v);
                                setSelectedContrat(null);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Identité Adhérent" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Entity Type Selection */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type d'entité</InputLabel>
                            <Select
                                value={selectedEntityType}
                                onChange={(e) => {
                                    setSelectedEntityType(e.target.value);
                                    setSelectedEntitySubType("");
                                    setSelectedEntity(null);
                                }}
                                disabled={!selectedContrat}
                            >
                                <MenuItem value="adherent">Adhérent</MenuItem>
                                <MenuItem value="acheteur">Acheteur</MenuItem>
                                <MenuItem value="fournisseur">Fournisseur</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Entity Subtype Selection (only for acheteur/fournisseur) */}
                    {(selectedEntityType === "acheteur" || selectedEntityType === "fournisseur") && (
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={selectedEntitySubType}
                                    onChange={(e) => {
                                        setSelectedEntitySubType(e.target.value);
                                        setSelectedEntity(null);
                                    }}
                                    disabled={!selectedContrat}
                                >
                                    <MenuItem value="pm">Personne morale</MenuItem>
                                    <MenuItem value="pp">Personne physique</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {/* Entity Name Autocomplete (only for acheteur/fournisseur with subtype) */}
                    {(selectedEntityType === "acheteur" || selectedEntityType === "fournisseur") &&
                        selectedEntitySubType && (
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={entityOptions}
                                    getOptionLabel={(option) => option.name || ""}
                                    value={selectedEntity}
                                    onChange={(e, v) => {
                                        setSelectedEntity(v);
                                    }}
                                    disabled={!selectedContrat || loadingRelations}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Nom"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                    {/* Entity Identity Autocomplete (only for acheteur/fournisseur with subtype) */}
                    {(selectedEntityType === "acheteur" || selectedEntityType === "fournisseur") &&
                        selectedEntitySubType && (
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={entityOptions}
                                    getOptionLabel={(option) => option.identity || ""}
                                    value={selectedEntity}
                                    onChange={(e, v) => {
                                        setSelectedEntity(v);
                                    }}
                                    disabled={!selectedContrat || loadingRelations}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Identité"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                    {/* Add RIB Button */}
                    <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">

                    </Grid>
                </Grid>
            </Card>

            {selectedContrat && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                            <Typography variant="h6" gutterBottom>
                                Liste des RIBs
                            </Typography>
                            <Box
                                sx={{
                                    height: 500,
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
                                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                                        color: `${colors.grey[100]} !important`,
                                    },
                                }}
                            >
                                <DataGrid
                                    rows={ribs}
                                    columns={columns}
                                    pageSizeOptions={[5, 10, 20]}
                                    slots={{ toolbar: GridToolbar }}
                                    disableRowSelectionOnClick
                                    localeText={localeText}
                                    getRowId={(row) => row.id}
                                    loading={loadingRib || loadingRelations}
                                />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <DeletePopup
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
            />
        </Box>
    );
};

export default AllRibs;
