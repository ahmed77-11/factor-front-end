// src/pages/relations/UpdateRelationFourn.jsx

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
    fetchRelationFournByIdAsync,
    updateRelationFournAsync,
} from "../../../redux/relations/relationsSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { tokens } from "../../../theme.js";

const validationSchema = Yup.object({
    limiteFinAuto: Yup.number()
        .min(0, "Doit être positif")
        .required("Requis"),
    effetDate: Yup.date()
        .required("Requis")
        .typeError("Format de date invalide"),
    comiteRisqueTexte: Yup.string().required("Comite du Risque est requise"),
    comiteDerogTexte: Yup.string().required("Comite du Derogation est requise"),
});

const UpdateRelationFourn = () => {
    const { relationId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { currentRelationFourn, loading, error } = useSelector(
        (state) => state.relations
    );

    useEffect(() => {
        if (relationId) {
            dispatch(fetchRelationFournByIdAsync(relationId));
        }
    }, [dispatch, relationId]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            limiteFinAuto: currentRelationFourn?.limiteFinAuto || 0,
            effetDate: currentRelationFourn?.effetDate?.substring(0, 10) || "",
            comiteRisqueTexte: currentRelationFourn?.comiteRisqueTexte || "",
            comiteDerogTexte: currentRelationFourn?.comiteDerogTexte || "",
            infoLibre: currentRelationFourn?.infoLibre || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            const payload = {
                ...currentRelationFourn,
                ...values,
                effetDate: new Date(values.effetDate).toISOString(),
            };

            try {
                await dispatch(updateRelationFournAsync(payload));
                navigate("/ajouter-fournisseurs");
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

    if (!currentRelationFourn) {
        return (
            <Box m="20px">
                <Typography variant="h5">Aucune relation trouvée</Typography>
            </Box>
        );
    }

    // Extract fournisseur (physique or morale)
    const fournisseur =
        currentRelationFourn.fournisseurPhysique ||
        currentRelationFourn.fournisseurMorale;

    return (
        <Box m="20px">
            <Header
                title="Modifier une Relation Fournisseur"
                subtitle={`ID #${relationId}`}
            />

            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Relation Adherent Fournisseur
                    </Typography>

                    {/* Read-only information section */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Pièce d'identité"
                                value={`${fournisseur.typePieceIdentite?.dsg || ""} ${
                                    fournisseur.numeroPieceIdentite || ""
                                }`}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Nom / Raison Sociale"
                                value={
                                    currentRelationFourn.fournisseurPhysique
                                        ? `${currentRelationFourn.fournisseurPhysique.nom} ${currentRelationFourn.fournisseurPhysique.prenom}`
                                        : currentRelationFourn.fournisseurMorale.raisonSocial
                                }
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Adresse"
                                value={fournisseur.adresse || ""}
                                InputProps={{ readOnly: true }}
                                disabled={true}
                            />
                        </Grid>
                    </Grid>

                    {/* Editable form section */}
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Limite Financière"
                                    name="limiteFinAuto"
                                    value={formik.values.limiteFinAuto}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.limiteFinAuto &&
                                        Boolean(formik.errors.limiteFinAuto)
                                    }
                                    helperText={
                                        formik.touched.limiteFinAuto && formik.errors.limiteFinAuto
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
                                        formik.touched.effetDate && formik.errors.effetDate
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    label="Comite Du Risque"
                                    name="comiteRisqueTexte"
                                    value={formik.values.comiteRisqueTexte}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.comiteRisqueTexte &&
                                        Boolean(formik.errors.comiteRisqueTexte)
                                    }
                                    helperText={
                                        formik.touched.comiteRisqueTexte &&
                                        formik.errors.comiteRisqueTexte
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    label="Comite Du Derogation"
                                    name="comiteDerogTexte"
                                    value={formik.values.comiteDerogTexte}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.comiteDerogTexte &&
                                        Boolean(formik.errors.comiteDerogTexte)
                                    }
                                    helperText={
                                        formik.touched.comiteDerogTexte &&
                                        formik.errors.comiteDerogTexte
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    label="Info Libre"
                                    name="infoLibre"
                                    value={formik.values.infoLibre}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.infoLibre &&
                                        Boolean(formik.errors.infoLibre)
                                    }
                                    helperText={
                                        formik.touched.infoLibre && formik.errors.infoLibre
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="center" gap={2}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        disabled={formik.isSubmitting || !formik.dirty}
                                        sx={{
                                            height: "56px",
                                            minWidth: "140px",
                                            backgroundColor: colors.greenAccent[500],
                                            color: colors.grey[100],
                                        }}
                                    >
                                        {formik.isSubmitting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Mettre à jour"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate("/ajouter-fournisseurs")}
                                        sx={{
                                            height: "56px",
                                            backgroundColor: colors.redAccent[500],
                                            color: colors.grey[100],
                                        }}
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

export default UpdateRelationFourn;