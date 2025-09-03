// src/pages/Traite/TraitesLettrer.jsx
import { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    useTheme,
    Autocomplete,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { LinkOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { tokens, localeText } from "../../theme.js";
import {
    getAllTraitesByContrat,
    getAllTraitesByContratAndAchetCode,
    deleteTraite,
} from "../../redux/traite/traiteSlice.js";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { fetchAdherentsAsync, fetchRelationsAsync } from "../../redux/relations/relationsSlice.js";

const TraitesLettrer = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // redux state
    const { contrats = [] } = useSelector((s) => s.contrat);
    const { adherents = [] } = useSelector((s) => s.relations);
    const { relations = [] } = useSelector((s) => s.relations);
    const { traites = [], loadingTraite, errorTraite } = useSelector((s) => s.traite);

    // local state
    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [acheteurs, setAcheteurs] = useState([]);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [loadingAcheteurs, setLoadingAcheteurs] = useState(false);

    // filter for traites similar to the "docs filter" you requested
    // "all" | "dejaLettre" (restant == 0) | "semiLettre" (restant > 0 && montantLettre > 0) | "noLettre" (montantLettre == 0)
    const [traiteFilter, setTraiteFilter] = useState("all");

    // load contracts + adherents on mount
    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    // build adherent options (same logic as your CreateInCheque)
    const adherentOptions = (adherents || []).map((a) => ({
        id: a.id,
        adherFactorCode: a.adherFactorCode ?? a.factorAdherCode ?? "",
        label:
            a.typePieceIdentite?.code === "RNE"
                ? `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite} - ${a.raisonSocial || ""}`
                : `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite}  - ${a.nom || ""} ${a.prenom || ""}`,
        raw: a,
    }));

    // filter contracts by selected adherent
    const filteredContrats = (contrats || []).filter(
        (c) => !selectedAdherentId || c.adherent === selectedAdherentId
    );

    // when a contrat is selected -> fetch relations (acheteurs) for its adherent
    useEffect(() => {
        if (!selectedContrat) {
            setAcheteurs([]);
            setSelectedAcheteur(null);
            return;
        }
        const adherId = selectedContrat.adherent;
        setLoadingAcheteurs(true);
        dispatch(fetchRelationsAsync(adherId)).finally(() => setLoadingAcheteurs(false));
        // Also fetch traites for this contrat (no acheteur selected yet)
        dispatch(getAllTraitesByContrat(selectedContrat.id));
    }, [selectedContrat, dispatch]);

    // when relations change, map to acheteurs list
    useEffect(() => {
        if (relations && relations.length > 0) {
            const acheteursList = relations
                .map((relation) => {
                    if (relation.acheteurMorale) {
                        return {
                            id: relation.acheteurMorale.id,
                            pieceId: `${relation.acheteurMorale.typePieceIdentite?.dsg}${relation.acheteurMorale.numeroPieceIdentite}`,
                            name: relation.acheteurMorale.raisonSocial,
                            type: "pm",
                            factorAchetCode: relation.acheteurMorale?.factorAchetCode,
                            raw: relation.acheteurMorale,
                        };
                    } else if (relation.acheteurPhysique) {
                        return {
                            id: relation.acheteurPhysique.id,
                            pieceId: `${relation.acheteurPhysique.typePieceIdentite?.dsg}${relation.acheteurPhysique.numeroPieceIdentite}`,
                            name: `${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`,
                            type: "pp",
                            factorAchetCode: relation.acheteurPhysique?.factorAchetCode,
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

    // when acheteur changes -> fetch traites filtered by contrat + achet code
    useEffect(() => {
        if (!selectedContrat) return;
        if (selectedAcheteur && selectedAcheteur.factorAchetCode) {
            dispatch(getAllTraitesByContratAndAchetCode(selectedContrat.id, selectedAcheteur.factorAchetCode));
        } else {
            dispatch(getAllTraitesByContrat(selectedContrat.id));
        }
    }, [selectedAcheteur, selectedContrat, dispatch]);

    // delete handler
    const handleDelete = async (id) => {
        await dispatch(deleteTraite(id, navigate));
        if (selectedContrat) {
            // refresh
            if (selectedAcheteur && selectedAcheteur.factorAchetCode) {
                dispatch(getAllTraitesByContratAndAchetCode(selectedContrat.id, selectedAcheteur.factorAchetCode));
            } else {
                dispatch(getAllTraitesByContrat(selectedContrat.id));
            }
        } else {
            dispatch(getAllTraitesByContrat()); // fallback
        }
    };

    const clearFilters = () => {
        setSelectedAdherentId(null);
        setSelectedContrat(null);
        setSelectedAcheteur(null);
        dispatch(getAllTraitesByContrat(null)); // or load all traites if desired
    };

    // computed filtered traites according to traiteFilter
    const filteredTraites = useMemo(() => {
        if (!traites || traites.length === 0) return [];
        return traites.filter((t) => {
            // Restant: try common names for the remaining amount
            const restant = Number(
                t.montantNonLettre ??
                t.restantALetter ??
                t.restant ??
                t.montantNonLettre ??
                0
            );
            // Montant lettre already lettré
            const montantLettre = Number(t.montantLettre ?? t.dejaLettre ?? 0);

            switch (traiteFilter) {
                case "dejaLettre":
                    return restant === 0;
                case "semiLettre":
                    return restant > 0 && montantLettre > 0;
                case "noLettre":
                    return montantLettre === 0;
                default:
                    return true;
            }
        });
    }, [traites, traiteFilter]);

    const columns = [
        { field: "numero", headerName: "Numéro de Traite", flex: 1 },
        { field: "echFirst", headerName: "Echance", flex: 1 },
        { field: "montant", headerName: "Montant", flex: 1 },
        { field: "devise", headerName: "Devise", flex: 1, valueGetter: (_,params) => params?.devise?.dsg || params?.devise.dsg || "" },
        { field: "montantLettre", headerName: "dont déjà lettré", flex: 1, valueGetter: (_,p) => p.montantLettre ?? p.dejaLettre ?? 0 },
        { field: "montantNonLettre", headerName: "Restant à lettrer", flex: 1, valueGetter: (_,p) => p.montantNonLettre ?? p.restantALetter ?? p.restant ?? 0 },
        {
            field: "actions",
            headerName: "Lettrer",
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const row = params.row || {};
                const restant = Number(row.montantNonLettre ?? row.restantALetter ?? row.restant ?? 0);
                // disable Lettrer button when already fully lettré (restant === 0)
                const disabled = restant === 0;
                return (
                    <Box display="flex" gap={1} mt="8px">
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<LinkOutlined />}
                            onClick={() => navigate(`/lettrage/${params.row.id}`, { state: { traite: params.row } })}
                            disabled={disabled}
                        >
                            Lettrer
                        </Button>
                    </Box>
                );
            },
        },
    ];

    return (
        <Box m="20px">
            <Header title="Lettrage" subtitle="Selectioner Instrument A Lettrer" />

            <Card sx={{ p: 2, boxShadow: 5, borderRadius: 3, backgroundColor: colors.primary[900] }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Typography fontWeight="bold" gutterBottom>
                            Adhérent
                        </Typography>
                        {/* Adherent selects */}
                        <Grid container item xs={12} spacing={2}>

                            <Grid item xs={4}>
                                <Autocomplete
                                    options={adherentOptions}
                                    getOptionLabel={(option) => option?.adherFactorCode || ""}
                                    value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                    onChange={(e, newValue) => {
                                        setSelectedAdherentId(newValue?.id ?? null);
                                        setSelectedContrat(null);
                                        setSelectedAcheteur(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Code Factor" fullWidth />}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Autocomplete
                                    options={adherentOptions}
                                    getOptionLabel={(option) => option?.label || ""}
                                    value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                    onChange={(e, newValue) => {
                                        setSelectedAdherentId(newValue?.id ?? null);
                                        setSelectedContrat(null);
                                        setSelectedAcheteur(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Identité Adhérent" fullWidth />}
                                />
                            </Grid>

                            {/* Contrat */}
                            <Grid item xs={4}>

                                <Autocomplete
                                    options={filteredContrats}
                                    getOptionLabel={(option) => option?.contratNo || ""}
                                    value={selectedContrat}
                                    onChange={(e, newValue) => {
                                        setSelectedContrat(newValue);
                                        if (newValue) setSelectedAdherentId(newValue.adherent);
                                        setSelectedAcheteur(null);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Contrat" fullWidth />}
                                />
                            </Grid>
                        </Grid>

                        {/* Acheteur select (appears after contrat -> relations fetched) */}
                        <Grid item xs={12}>
                            <Typography fontWeight="bold" gutterBottom>
                                Acheteur
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={4}>
                                    <Autocomplete
                                        options={acheteurs}
                                        getOptionLabel={(option) => option?.name || ""}
                                        loading={loadingAcheteurs}
                                        value={selectedAcheteur}
                                        onChange={(e, newValue) => {
                                            setSelectedAcheteur(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Acheteur (nom)"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingAcheteurs ? <CircularProgress size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={4}>
                                    <Autocomplete
                                        options={acheteurs}
                                        getOptionLabel={(option) => option?.pieceId || ""}
                                        loading={loadingAcheteurs}
                                        value={selectedAcheteur}
                                        onChange={(e, newValue) => {
                                            setSelectedAcheteur(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Acheteur (identité)"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingAcheteurs ? <CircularProgress size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Autocomplete
                                        options={acheteurs}
                                        getOptionLabel={(option) => option?.factorAchetCode || ""}
                                        loading={loadingAcheteurs}
                                        value={selectedAcheteur}
                                        onChange={(e, newValue) => {
                                            setSelectedAcheteur(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Acheteur (code)"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingAcheteurs ? <CircularProgress size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                            <Button variant="outlined" onClick={clearFilters}>
                                Effacer filtres
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }}
                        onClick={() => navigate("/ajouter-traite")}
                    >
                        Ajouter Traite
                    </Button>
                </Box>

                {/* Traite filter select (same semantics as doc filter in previous component) */}
                <Box display="flex" alignItems="center" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                        <InputLabel id="traite-filter-label">Filtrer par lettrage</InputLabel>
                        <Select
                            labelId="traite-filter-label"
                            value={traiteFilter}
                            label="Filtrer par lettrage"
                            onChange={(e) => setTraiteFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tous</MenuItem>
                            <MenuItem value="dejaLettre">Déjà lettré</MenuItem>
                            <MenuItem value="semiLettre">Semi-lettré </MenuItem>
                            <MenuItem value="noLettre">Non lettré</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box
                height="65vh"
                mt={2}
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: `1px solid ${colors.blueAccent[500]}`, fontSize: "14px" },
                    "& .MuiDataGrid-columnHeader": { backgroundColor: colors.blueAccent[700], fontSize: "14px" },
                    "& .MuiDataGrid-footerContainer": { backgroundColor: colors.blueAccent[700] },
                    "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
                }}
            >
                <DataGrid
                    rows={filteredTraites || []}
                    loading={loadingTraite}
                    getRowId={(row) => row.id}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                />
            </Box>
        </Box>
    );
};

export default TraitesLettrer;
