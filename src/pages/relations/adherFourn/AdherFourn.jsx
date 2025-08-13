import { useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import Header from "../../../components/Header.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    addRelationFournAsync,
    fetchAdherentsAsync,
    fetchFournisseursAsync,
    fetchRelationsFournAsync,
} from "../../../redux/relations/relationsSlice.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import { localeText, tokens } from "../../../theme.js";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object().shape({
    adherent: Yup.object().required("Adhérent requis"),
    fournisseur: Yup.object().required("Fournisseur requis"),
    limiteFinAuto: Yup.number()
        .min(0, "Doit être positif")
        .required("Limite requise"),
    comiteRisqueTexte: Yup.string().required("Comite du Risque est requise"),
    comiteDerogTexte: Yup.string().required("Comite du Derogation est requise"),
    effetDate: Yup.date().required("Date effet requise"),
    infoLibre: Yup.string().max(255, "Max 255 caractères"),
});

const AdherFourn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adherents, fournisseurs, relationsFourns, loading, error } =
        useSelector((state) => state.relations);
    const formik = useFormik({
        initialValues: {
            adherent: null,
            fournisseur: null,
            limiteFinAuto: 0,
            comiteRisqueTexte: "",
            comiteDerogTexte: "",
            effetDate: "",
            infoLibre: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            const relationPayload = {
                ...values,
                adherentId: values.adherent.id,
                fournisseurPhysiqueId: values.fournisseur.nom
                    ? values.fournisseur.id
                    : null,
                fournisseurMoraleId: values.fournisseur.raisonSocial
                    ? values.fournisseur.id
                    : null,
            };

            await dispatch(addRelationFournAsync(relationPayload));
            dispatch(fetchRelationsFournAsync(values.adherent.id));
            console.log(relationsFourns)
            formik.setValues({
                ...formik.values,
                fournisseur: null,
                limiteFinAuto: 0,
                comiteRisqueTexte: "",
                comiteDerogTexte: "",
                effetDate: "",
                infoLibre: "",
            });
        },
    });

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchFournisseursAsync());
    }, [dispatch]);

    useEffect(() => {
        if (formik.values.adherent?.id) {
            dispatch(fetchRelationsFournAsync(formik.values.adherent.id));
        }
    }, [dispatch, formik.values.adherent]);

    console.log(relationsFourns)

    const associatedFournisseurIds = useMemo(() => {
        const ids = new Set();
        if (formik.values.adherent?.id) {
            (relationsFourns || []).forEach((relation) => {
                if (relation.fournisseurPhysique) {
                    ids.add(relation.fournisseurPhysique?.id);
                }
                if (relation.fournisseurMorale) {
                    ids.add(relation.fournisseurMorale?.id);
                }
            });
        }
        return ids;
    }, [relationsFourns, formik.values.adherent]);

    const fournisseursOptions = useMemo(() => {
        const pps = fournisseurs?.pps || [];
        const pms = fournisseurs?.pms || [];
        return [...pps, ...pms].filter(
            (fournisseur) => !associatedFournisseurIds.has(fournisseur.id)
        );
    }, [fournisseurs, associatedFournisseurIds]);

    function handleUpdate(id) {
        navigate("/update-relations-fourn/" + id);
    }

    const columns = [
        {
            field: "pieceIdentite",
            headerName: "Pièce Identité",
            flex: 1,
            renderCell: (params) => {
                const fournisseur =
                    params.row.fournisseurPhysique || params.row.fournisseurMorale;
                return `${fournisseur.typePieceIdentite?.dsg} ${fournisseur.numeroPieceIdentite}`;
            },
        },
        {
            field: "nomRaisonSociale",
            headerName: "Nom/Raison Sociale",
            flex: 1,
            renderCell: (params) => {
                return params.row.fournisseurPhysique
                    ? `${params.row.fournisseurPhysique.nom} ${params.row.fournisseurPhysique.prenom}`
                    : params.row.fournisseurMorale.raisonSocial;
            },
        },
        {
            field: "adresse",
            headerName: "Adresse",
            flex: 1,
            renderCell: (params) => {
                const fournisseur =
                    params.row.fournisseurPhysique || params.row.fournisseurMorale;
                return fournisseur.adresse;
            },
        },
        {
            field: "limiteFinAuto",
            headerName: "Limite Financière",
            flex: 1,
        },
        {
            field: "effetDate",
            headerName: "Date Effet",
            flex: 1,
            renderCell: (params) => new Date(params.row.effetDate).toLocaleDateString(),
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
                <Box display="flex" justifyContent="center" width="100%">
                    <IconButton
                        color="success"
                        onClick={() => handleUpdate(params.row.id)}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header
                title="Relations Adhérents et Fournisseurs"
                subtitle="Gestion des relations"
            />

            {/* Form Section */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={adherents}
                                value={formik.values.adherent}
                                onChange={(_, value) => formik.setFieldValue("adherent", value)}
                                getOptionLabel={(option) =>
                                    option.nom
                                        ? `${option.typePieceIdentite?.dsg || ""} ${
                                            option.numeroPieceIdentite
                                        } - ${option.nom} ${option.prenom} `
                                        : `${option.typePieceIdentite?.dsg || ""} ${
                                            option.numeroPieceIdentite
                                        } - ${option.raisonSocial}`
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Adhérent"
                                        error={formik.touched.adherent && !!formik.errors.adherent}
                                        helperText={
                                            formik.touched.adherent && formik.errors.adherent
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={fournisseursOptions}
                                disabled={!formik.values.adherent?.id}
                                value={formik.values.fournisseur}
                                onChange={(_, value) =>
                                    formik.setFieldValue("fournisseur", value)
                                }
                                getOptionLabel={(option) => {
                                    if (option.nom) {
                                        return `${option.typePieceIdentite?.dsg} ${
                                            option.numeroPieceIdentite
                                        } - ${option.nom} ${option.prenom || ""}`;
                                    }
                                    return `${option.typePieceIdentite?.dsg} ${
                                        option.numeroPieceIdentite
                                    } - ${option.raisonSocial}`;
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Fournisseur"
                                        error={
                                            formik.touched.fournisseur && !!formik.errors.fournisseur
                                        }
                                        helperText={
                                            formik.touched.fournisseur && formik.errors.fournisseur
                                        }
                                        disabled={!formik.values.adherent?.id}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Limite Financière"
                                name="limiteFinAuto"
                                value={formik.values.limiteFinAuto}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.limiteFinAuto && !!formik.errors.limiteFinAuto
                                }
                                helperText={
                                    formik.touched.limiteFinAuto && formik.errors.limiteFinAuto
                                }
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Comite Du Risque"
                                name="comiteRisqueTexte"
                                value={formik.values.comiteRisqueTexte}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.comiteRisqueTexte &&
                                    !!formik.errors.comiteRisqueTexte
                                }
                                helperText={
                                    formik.touched.comiteRisqueTexte &&
                                    formik.errors.comiteRisqueTexte
                                }
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Comite Du Derogation"
                                name="comiteDerogTexte"
                                value={formik.values.comiteDerogTexte}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.comiteDerogTexte &&
                                    !!formik.errors.comiteDerogTexte
                                }
                                helperText={
                                    formik.touched.comiteDerogTexte &&
                                    formik.errors.comiteDerogTexte
                                }
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date effet"
                                name="effetDate"
                                value={formik.values.effetDate || ""}
                                onChange={formik.handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={formik.touched.effetDate && !!formik.errors.effetDate}
                                helperText={formik.touched.effetDate && formik.errors.effetDate}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Info Libre"
                                name="infoLibre"
                                value={formik.values.infoLibre}
                                onChange={formik.handleChange}
                                error={formik.touched.infoLibre && !!formik.errors.infoLibre}
                                helperText={formik.touched.infoLibre && formik.errors.infoLibre}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{ height: "56px" }}
                                disabled={!formik.isValid || !formik.dirty}
                            >
                                Ajouter Relation
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Card>

            {/* Relations List */}
            <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                <Typography variant="h6" gutterBottom>
                    Liste des Relations
                </Typography>
                <Box
                    sx={{
                        height: 400,
                        "& .MuiDataGrid-root": { border: "none" },
                        "& .MuiDataGrid-cell": { borderBottom: "none" },
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: colors.blueAccent[700],
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
                        rows={relationsFourns || []}
                        columns={columns}
                        pageSizeOptions={[5, 10, 20]}
                        slots={{ toolbar: GridToolbar }}
                        checkboxSelection
                        disableRowSelectionOnClick
                        localeText={localeText}
                        getRowId={(row) => row.id}
                        loading={loading}
                    />
                </Box>
            </Card>
        </Box>
    );
};

export default AdherFourn;