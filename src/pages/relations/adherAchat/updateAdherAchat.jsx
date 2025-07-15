// src/pages/relations/UpdateRelation.jsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    useTheme,
} from "@mui/material";
import Header from "../../../components/Header.jsx";
import {
    fetchRelationAsync,
    updateRelationAsync,
} from "../../../redux/relations/relationsSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { tokens } from "../../../theme.js";

const validationSchema = Yup.object({
    delaiMaxPai: Yup.number()
        .min(0, "Doit être positif")
        .required("Requis")
        .integer("Doit être un entier"),
    limiteAchat: Yup.number()
        .min(0, "Doit être positif")
        .required("Requis"),
    limiteCouverture: Yup.number()
        .min(0, "Doit être positif")
        .required("Requis"),
    effetDate: Yup.date()
        .required("Requis")
        .typeError("Format de date invalide"),
});

const UpdateRelation = () => {
    const { relationId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { currentRelation, loading, error } = useSelector(
        (state) => state.relations
    );

    useEffect(() => {
        if (relationId) {
            dispatch(fetchRelationAsync(relationId));
        }
    }, [dispatch, relationId]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            delaiMaxPai: currentRelation?.delaiMaxPai || 0,
            limiteAchat: currentRelation?.limiteAchat || 0,
            limiteCouverture: currentRelation?.limiteCouverture || 0,
            effetDate: currentRelation?.effetDate?.substring(0, 10) || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            const payload = {
                ...currentRelation,
                ...values,
                effetDate: new Date(values.effetDate).toISOString(),
            };

            try {
                await dispatch(updateRelationAsync(payload));
                navigate("/ajouter-acheteurs");
            } catch (err) {
                console.error("Update failed:", err);
            }
        },
    });

    if (loading === "pending") {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m="20px">
                <Typography color="error" variant="h5">
                    Erreur: {error}
                </Typography>
            </Box>
        );
    }

    if (!currentRelation) {
        return (
            <Box m="20px">
                <Typography variant="h5">Aucune relation trouvée</Typography>
            </Box>
        );
    }

    // extract acheteur (physique or morale)
    const acheteur =
        currentRelation.acheteurPhysique || currentRelation.acheteurMorale;

    return (
        <Box m="20px">
            <Header
                title="Modifier une Relation"
                subtitle={`ID #${relationId}`}
            />

            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    {/* Affichage des données en lecture seule */}
                    <Typography variant="h6" gutterBottom>
                        Relation Adherent Acheteur
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Pièce d'identité"
                                value={`${acheteur.typePieceIdentite?.dsg || ''} ${acheteur.numeroPieceIdentite || ''}`}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Nom / Raison Sociale"
                                value={
                                    currentRelation.acheteurPhysique
                                        ? `${currentRelation.acheteurPhysique.nom} ${currentRelation.acheteurPhysique.prenom}`
                                        : currentRelation.acheteurMorale.raisonSocial
                                }
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Adresse"
                                value={acheteur.adresse || ''}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Comité Risque"
                                value={currentRelation.comiteRisqueTexte || ''}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Comité Dérogation"
                                value={currentRelation.comiteDerogTexte || ''}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Info Libre"
                                value={currentRelation.infoLibre || ''}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                    </Grid>



                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Délai paiement (jours)"
                                    name="delaiMaxPai"
                                    value={formik.values.delaiMaxPai}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.delaiMaxPai &&
                                        Boolean(formik.errors.delaiMaxPai)
                                    }
                                    helperText={
                                        formik.touched.delaiMaxPai &&
                                        formik.errors.delaiMaxPai
                                    }
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Limite achat"
                                    name="limiteAchat"
                                    value={formik.values.limiteAchat}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.limiteAchat &&
                                        Boolean(formik.errors.limiteAchat)
                                    }
                                    helperText={
                                        formik.touched.limiteAchat &&
                                        formik.errors.limiteAchat
                                    }
                                    inputProps={{ min: 0, step: "0.01" }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Limite couverture"
                                    name="limiteCouverture"
                                    value={formik.values.limiteCouverture}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.limiteCouverture &&
                                        Boolean(formik.errors.limiteCouverture)
                                    }
                                    helperText={
                                        formik.touched.limiteCouverture &&
                                        formik.errors.limiteCouverture
                                    }
                                    inputProps={{ min: 0, step: "0.01" }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date effet"
                                    name="effetDate"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.effetDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.effetDate &&
                                        Boolean(formik.errors.effetDate)
                                    }
                                    helperText={
                                        formik.touched.effetDate &&
                                        formik.errors.effetDate
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box display="flex" justifyContent={"center"} gap={2}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        disabled={formik.isSubmitting || !formik.dirty}
                                        sx={{ height: "56px", minWidth: "140px",backgroundColor: colors.greenAccent[500],color:colors.grey[100] }}
                                    >
                                        {formik.isSubmitting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Mettre à jour"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outlined"

                                        onClick={() => navigate("/ajouter-acheteurs")}
                                        sx={{ height: "56px" ,backgroundColor:colors.redAccent[500] ,color:colors.grey[100]  }}
                                    >
                                        Annuler
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateRelation;
