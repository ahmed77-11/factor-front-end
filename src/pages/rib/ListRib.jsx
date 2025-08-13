// src/pages/Rib/AllRibs.jsx
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
    fetchFournisseursAsync
} from "../../redux/relations/relationsSlice.js";

const AllRibs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { contrats } = useSelector(state => state.contrat);
    const { ribs, loadingRib, errorRib } = useSelector(state => state.rib);
    const {
        acheteurs,
        fournisseurs,
        loading: loadingRelations,
        error: errorRelations
    } = useSelector(state => state.relations);

    const [selectedContrat, setSelectedContrat] = useState(null);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [selectedFournisseur, setSelectedFournisseur] = useState(null);
    const [selectedAcheteurType, setSelectedAcheteurType] = useState("");
    const [selectedFournisseurType, setSelectedFournisseurType] = useState("");
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAcheteursAsync());
        dispatch(fetchFournisseursAsync());
    }, [dispatch]);

    useEffect(() => {
        setSelectedAcheteur(null);
        setSelectedFournisseur(null);
        setSelectedAcheteurType("");
        setSelectedFournisseurType("");
    }, [selectedContrat]);

    useEffect(() => {
        if (!selectedContrat) return;

        if (selectedAcheteur) {
            if (selectedAcheteurType === "pm") {
                dispatch(allAchetPmRibs(selectedContrat.id, selectedAcheteur.id));
            } else if (selectedAcheteurType === "pp") {
                dispatch(allAchetPpRibs(selectedContrat.id, selectedAcheteur.id));
            }
        }
        else if (selectedFournisseur) {
            if (selectedFournisseurType === "pm") {
                dispatch(allFournPmRibs(selectedContrat.id, selectedFournisseur.id));
            } else if (selectedFournisseurType === "pp") {
                dispatch(allFournPpRibs(selectedContrat.id, selectedFournisseur.id));
            }
        }
        else {
            dispatch(allAdherRibs(selectedContrat.id));
        }
    }, [selectedContrat, selectedAcheteur, selectedFournisseur, dispatch]);

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

    const getAcheteursList = () => {
        if (!selectedAcheteurType) return [];
        if (!acheteurs) return [];

        const list = selectedAcheteurType === "pp"
            ? acheteurs.pps || []
            : acheteurs.pms || [];

        return list.map(item => ({
            id: item.id,
            name: selectedAcheteurType === "pp"
                ? `${item.nom} ${item.prenom}`
                : item.raisonSocial
        }));
    };

    const getFournisseursList = () => {
        if (!selectedFournisseurType) return [];
        if (!fournisseurs) return [];

        const list = selectedFournisseurType === "pp"
            ? fournisseurs.pps || []
            : fournisseurs.pms || [];

        return list.map(item => ({
            id: item.id,
            name: selectedFournisseurType === "pp"
                ? `${item.nom} ${item.prenom}`
                : item.raisonSocial
        }));
    };

    return (
        <Box m="20px">
            <Header title="RIB" subtitle="Gestion des RIBs" />

            {(errorRib || errorRelations) && (
                <Box my={2}>
                    <Alert severity="error" sx={{ fontSize: "14px" }}>
                        {errorRib || errorRelations || "Une erreur s'est produite !"}
                    </Alert>
                </Box>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={contrats}
                            getOptionLabel={(option) => option.contratNo}
                            value={selectedContrat}
                            onChange={(e, v) => setSelectedContrat(v)}
                            renderInput={(params) => (
                                <TextField {...params} label="Sélectionner un contrat" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type Acheteur</InputLabel>
                            <Select
                                value={selectedAcheteurType}
                                onChange={(e) => {
                                    setSelectedAcheteurType(e.target.value);
                                    setSelectedAcheteur(null);
                                    setSelectedFournisseur(null);
                                    setSelectedFournisseurType("");
                                }}
                                disabled={!selectedContrat}
                            >
                                <MenuItem value=""><em>Aucun</em></MenuItem>
                                <MenuItem value="pm">Personne morale</MenuItem>
                                <MenuItem value="pp">Personne physique</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={getAcheteursList()}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedAcheteur}
                            onChange={(e, v) => {
                                setSelectedAcheteur(v);
                                setSelectedFournisseur(null);
                            }}
                            disabled={!selectedAcheteurType || !selectedContrat || loadingRelations}
                            renderInput={(params) => (
                                <TextField {...params} label="Sélectionner un acheteur" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Type Fournisseur</InputLabel>
                            <Select
                                value={selectedFournisseurType}
                                onChange={(e) => {
                                    setSelectedFournisseurType(e.target.value);
                                    setSelectedFournisseur(null);
                                    setSelectedAcheteur(null);
                                    setSelectedAcheteurType("");
                                }}
                                disabled={!selectedContrat}
                            >
                                <MenuItem value=""><em>Aucun</em></MenuItem>
                                <MenuItem value="pm">Personne morale</MenuItem>
                                <MenuItem value="pp">Personne physique</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={getFournisseursList()}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedFournisseur}
                            onChange={(e, v) => {
                                setSelectedFournisseur(v);
                                setSelectedAcheteur(null);
                            }}
                            disabled={!selectedFournisseurType || !selectedContrat || loadingRelations}
                            renderInput={(params) => (
                                <TextField {...params} label="Sélectionner un fournisseur" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate("/ajouter-rib")}
                            sx={{ height: "100%" }}
                        >
                            Ajouter un RIB
                        </Button>
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
