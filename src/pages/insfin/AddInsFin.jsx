// src/pages/InsFin/AddInsFin.jsx

import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    useTheme,
    Autocomplete,
    CircularProgress,
    Alert,
    LinearProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useTypeInsfin } from "../../customeHooks/useTypeInsfin.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addInsfinAsync } from "../../redux/insfin/InsfinSlice.js";

// Valeurs initiales
const initialValues = {
    typeInsfin: null,
    codeNum: "",
    codeAlpha: "",
    dsg: "",
    telFixeNo: "",
    siteWeb: "",
    adresse: "",
};

const validationSchema = yup.object().shape({
    typeInsfin: yup.object().nullable().required("Type d'institution requis"),
    codeNum: yup.string().required("Code numérique requis").max(3),
    codeAlpha: yup.string().required("Code alpha requis").max(3),
    dsg: yup.string().required("Désignation requise").max(64),
    telFixeNo: yup.string().max(13),
    siteWeb: yup.string().max(64),
    adresse: yup.string().max(64),
});

const AddInsFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        typeInsfins,
        loading: loadingTypeInsfins,
        error: errorTypeInsfins,
    } = useTypeInsfin();

    const { loadingInsfin, errorInsfin } = useSelector((state) => state.insfin);

    return (
        <Box m="20px">
            <Header title="Institution Financière" subtitle="Ajouter une nouvelle institution" />

            <Card
                sx={{
                    p: 3,
                    boxShadow: 5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[900],
                }}
            >
                {/* Barre de chargement fine en haut au lieu de démonter le formulaire */}
                {(loadingInsfin || loadingTypeInsfins) && <LinearProgress sx={{ mb: 2 }} />}

                <CardContent>
                    {errorInsfin && (
                        <Box my={2}>
                            <Alert severity="error" sx={{ fontSize: "14px" }}>
                                {errorInsfin || "Une erreur s'est produite lors de la création de l'institution !"}
                            </Alert>
                        </Box>
                    )}

                    {errorTypeInsfins && (
                        <Box my={2}>
                            <Alert severity="warning" sx={{ fontSize: "14px" }}>
                                {errorTypeInsfins || "Impossible de charger les types d'institutions."}
                            </Alert>
                        </Box>
                    )}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize={false} // 🔒 Ne pas réinitialiser quand ça rerender
                        onSubmit={(values, { setSubmitting /*, resetForm */ }) => {
                            // Soumission : ne pas vider les champs sur erreur
                            dispatch(addInsfinAsync(values, navigate))
                                .unwrap?.() // si votre thunk utilise createAsyncThunk, unwrap est dispo
                                .then(() => {
                                    // Optionnel: reset si vous restez sur la page
                                    // resetForm();
                                })
                                .catch(() => {
                                    // garder les valeurs, juste arrêter l'état submitting
                                })
                                .finally(() => setSubmitting(false));
                        }}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                              isSubmitting,
                          }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Type Insfin */}
                                    <Autocomplete
                                        options={typeInsfins || []}
                                        loading={loadingTypeInsfins}
                                        getOptionLabel={(option) => option?.dsg || ""}
                                        value={values.typeInsfin}
                                        onChange={(e, val) => setFieldValue("typeInsfin", val)}
                                        isOptionEqualToValue={(option, value) =>
                                            option?.id === value?.id
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Type d'institution"
                                                error={!!touched.typeInsfin && !!errors.typeInsfin}
                                                helperText={touched.typeInsfin && errors.typeInsfin}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingTypeInsfins && (
                                                                <CircularProgress color="inherit" size={20} />
                                                            )}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />

                                    <TextField
                                        name="codeNum"
                                        label="Code Numérique"
                                        value={values.codeNum}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.codeNum && !!errors.codeNum}
                                        helperText={touched.codeNum && errors.codeNum}
                                    />

                                    <TextField
                                        name="codeAlpha"
                                        label="Code Alpha"
                                        value={values.codeAlpha}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.codeAlpha && !!errors.codeAlpha}
                                        helperText={touched.codeAlpha && errors.codeAlpha}
                                    />

                                    <TextField
                                        name="dsg"
                                        label="Désignation"
                                        value={values.dsg}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.dsg && !!errors.dsg}
                                        helperText={touched.dsg && errors.dsg}
                                    />

                                    <TextField
                                        name="telFixeNo"
                                        label="Téléphone Fixe"
                                        value={values.telFixeNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.telFixeNo && !!errors.telFixeNo}
                                        helperText={touched.telFixeNo && errors.telFixeNo}
                                    />

                                    <TextField
                                        name="siteWeb"
                                        label="Site Web"
                                        value={values.siteWeb}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.siteWeb && !!errors.siteWeb}
                                        helperText={touched.siteWeb && errors.siteWeb}
                                    />

                                    <TextField
                                        name="adresse"
                                        label="Adresse"
                                        value={values.adresse}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.adresse && !!errors.adresse}
                                        helperText={touched.adresse && errors.adresse}
                                    />

                                    <Box textAlign="center" mt={2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="secondary"
                                            disabled={isSubmitting || loadingInsfin}
                                            startIcon={
                                                (isSubmitting || loadingInsfin) ? (
                                                    <CircularProgress size={18} color="inherit" />
                                                ) : null
                                            }
                                        >
                                            {isSubmitting || loadingInsfin ? "En cours..." : "Ajouter institution"}
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddInsFin;
