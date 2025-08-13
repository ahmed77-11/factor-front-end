// AddAccordForm.jsx
import {
    Box, Button, Card, CardContent,
    Typography, TextField, Autocomplete,
    Grid, useTheme, Alert
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { getAllActiveEnquets } from "../../redux/enquete/enqueteSlice";
import { addAccord } from "../../redux/accord/accordSlice";
import { useNavigate } from "react-router-dom";
import { useDevise } from "../../customeHooks/useDevise";
import { useAssur } from "../../customeHooks/useAssur";

const AddAccordForm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { enquetes } = useSelector(state => state.enquete);
    const [selectedEnquete, setSelectedEnquete] = useState(null);

    const { devises, loading: loadingDevise, error: errorDevise } = useDevise();
    const [selectedDevise, setSelectedDevise] = useState(null);

    // NEW: Assurance hook
    const { assurances, loading: loadingAssur, error: errorAssur } = useAssur();
    const [selectedAssur, setSelectedAssur] = useState(null);

    useEffect(() => {
        dispatch(getAllActiveEnquets());
    }, [dispatch]);

    const initialValues = {
        enqueteId: "",
        enqueteRef: "",
        risqueRef: "",
        risqueDate: "",
        assurCode: "",
        accordAssurDate: "",
        accordAssurRef: "",
        factorRef: "",
        factorDate: "",
        revisionRisqueRef: "",
        debDate: "",
        finDate: "",
        nbrJourPreavis: "",
        risqueMontant: "",
        factorMontant: "",
        assurMontant: "",
        deviseId: ""
    };

    const validationSchema = yup.object({
        enqueteId: yup.number().required("Sélectionner une enquête"),
        risqueRef: yup.string().required("Référence risque requise"),
        risqueDate: yup.date().required("Date risque requise").typeError("Date invalide"),
        assurCode: yup.string().required("Code assurance requis"),
        accordAssurDate: yup.date().required("Date d'accord assurance requise").typeError("Date invalide"),
        accordAssurRef: yup.string().required("Référence d'accord assurance requise"),
        factorRef: yup.string().required("Référence factor requise"),
        factorDate: yup.date().required("Date factor requise").typeError("Date invalide"),
        revisionRisqueRef: yup.string().required("Rév. risque requise"),
        debDate: yup.date().required("Date début requise").typeError("Date invalide"),
        finDate: yup.date().required("Date fin requise").typeError("Date invalide"),
        nbrJourPreavis: yup.number().required("Jours de préavis requis").typeError("Nombre requis"),
        risqueMontant: yup.number().required("Montant risque requis").typeError("Nombre requis"),
        factorMontant: yup.number().required("Montant factor requis").typeError("Nombre requis"),
        assurMontant: yup.number().required("Montant assurance requis").typeError("Nombre requis"),
        deviseId: yup.string().required("Devise requise")
    });

    const humanPerson = (e) => {
        if (!e) return "";
        if (e.pmAdher) return `${e.pmAdher.raisonSocial} (Adhérent PM)`;
        if (e.ppAdher) return `${e.ppAdher.nom} ${e.ppAdher.prenom} (Adhérent PP)`;
        if (e.pmAchet) return `${e.pmAchet.raisonSocial} (Acheteur PM)`;
        if (e.ppAchet) return `${e.ppAchet.nom} ${e.ppAchet.prenom} (Acheteur PP)`;
        return "";
    };

    return (
        <Box m="20px">
            <Header title="Nouvel Accord" subtitle="Créer un accord" />
            <Card sx={{ p: 3, backgroundColor: colors.primary[900] }}>
                <CardContent>
                    {errorDevise && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Erreur lors du chargement des devises : {errorDevise}
                        </Alert>
                    )}
                    {errorAssur && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Erreur lors du chargement des assurances : {errorAssur}
                        </Alert>
                    )}
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            dispatch(addAccord({
                                ...values,
                                enqueteId: Number(values.enqueteId),
                                deviseId: values.deviseId,
                                enquete: selectedEnquete
                            }, navigate));
                        }}
                    >
                        {({
                              values, handleChange, handleBlur, handleSubmit,
                              errors, touched, setFieldValue
                          }) => (
                            <form onSubmit={handleSubmit}>
                                {/* Enquête selection */}
                                <Grid container spacing={2} mb={2}>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            options={enquetes || []}
                                            getOptionLabel={opt => `#${opt.id} – Ref: ${opt.adherRef}`}
                                            onChange={(e, val) => {
                                                setFieldValue("enqueteId", val?.id || "");
                                                setFieldValue("enqueteRef", val?.adherRef || "");
                                                setSelectedEnquete(val);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Choisir une Enquête"
                                                    error={!!errors.enqueteId && touched.enqueteId}
                                                    helperText={touched.enqueteId && errors.enqueteId}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name="enqueteRef"
                                            label="Référence Enquête"
                                            value={values.enqueteRef}
                                            InputProps={{ readOnly: true }}
                                            disabled
                                        />
                                    </Grid>

                                    {selectedEnquete && (
                                        <Grid item xs={12}>
                                            <Typography fontWeight="bold">Personne associée :</Typography>
                                            <TextField
                                                fullWidth
                                                value={humanPerson(selectedEnquete)}
                                                InputProps={{ readOnly: true }}
                                                disabled
                                            />
                                        </Grid>
                                    )}

                                    {/* Devise selector */}
                                    <Grid item xs={12} sm={12}>
                                        <Autocomplete
                                            options={devises}
                                            getOptionLabel={(opt) => `- ${opt.dsg}`}
                                            loading={loadingDevise}
                                            onChange={(e, val) => {
                                                setFieldValue("deviseId", val?.id || "");
                                                setSelectedDevise(val);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Sélectionner une devise"
                                                    error={!!errors.deviseId && touched.deviseId}
                                                    helperText={touched.deviseId && errors.deviseId}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Accord fields */}
                                <Grid container spacing={2}>
                                    {/* RisqueRef */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Réf. Risque</Typography>
                                        <TextField
                                            fullWidth
                                            name="risqueRef"
                                            value={values.risqueRef}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.risqueRef && !!errors.risqueRef}
                                            helperText={touched.risqueRef && errors.risqueRef}
                                        />
                                    </Grid>

                                    {/* RisqueDate */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Date Risque</Typography>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            name="risqueDate"
                                            value={values.risqueDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            InputLabelProps={{ shrink: true }}
                                            error={!!touched.risqueDate && !!errors.risqueDate}
                                            helperText={touched.risqueDate && errors.risqueDate}
                                        />
                                    </Grid>

                                    {/* AssurCode - NEW Autocomplete */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Code Assurance</Typography>
                                        <Autocomplete
                                            options={assurances}
                                            getOptionLabel={(opt) => opt.dsg || ""}
                                            loading={loadingAssur}
                                            onChange={(e, val) => {
                                                setFieldValue("assurCode", val?.code || "");
                                                setSelectedAssur(val);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Sélectionner Assurance"
                                                    error={!!errors.assurCode && touched.assurCode}
                                                    helperText={touched.assurCode && errors.assurCode}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* AccordAssurDate */}
                                    <Grid item xs={12} sm={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Date Accord Assurance</Typography>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            name="accordAssurDate"
                                            value={values.accordAssurDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            InputLabelProps={{ shrink: true }}
                                            error={!!touched.accordAssurDate && !!errors.accordAssurDate}
                                            helperText={touched.accordAssurDate && errors.accordAssurDate}
                                        />
                                    </Grid>

                                    {/* Rest of fields */}
                                    {[
                                        { name: "accordAssurRef", label: "Réf. Accord Assurance" },
                                        { name: "factorRef", label: "Réf. Factor" },
                                        { name: "factorDate", label: "Date Factor", type: "date" },
                                        { name: "revisionRisqueRef", label: "Rév. Risque Ref" },
                                        { name: "debDate", label: "Date Début", type: "date" },
                                        { name: "finDate", label: "Date Fin", type: "date" },
                                        { name: "nbrJourPreavis", label: "Nbr Jour Préavis" },
                                        { name: "risqueMontant", label: "Montant Risque" },
                                        { name: "factorMontant", label: "Montant Factor" },
                                        { name: "assurMontant", label: "Montant Assurance" },
                                    ].map(field => (
                                        <Grid item xs={12} sm={6} key={field.name}>
                                            <Typography fontWeight="bold" mb={0.5}>{field.label}</Typography>
                                            <TextField
                                                fullWidth
                                                name={field.name}
                                                type={field.type || "text"}
                                                value={values[field.name]}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                InputLabelProps={field.type === "date" ? { shrink: true } : {}}
                                                error={!!touched[field.name] && !!errors[field.name]}
                                                helperText={touched[field.name] && errors[field.name]}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box display="flex" justifyContent="center" mt={4}>
                                    <Button type="submit" variant="contained" color="secondary" sx={{ borderRadius: 2 }}>
                                        Créer Accord
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddAccordForm;
