import {
    Box, Button, Card, CardContent, Typography,
    TextField, useTheme, Grid, Alert, MenuItem
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { tokens } from "../../theme";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {fetchEnqueteById, updateEnquete} from "../../redux/enquete/enqueteSlice.js";
import {useDevise} from "../../customeHooks/useDevise.jsx";

const UpdateEnquete = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentEnquete,loadingEnquete,errorEnquete } = useSelector((state) => state.enquete);
    const { devises, loading: loadingDevise, error: errorDevise } = useDevise();


    useEffect(() => {
        if (id) dispatch(fetchEnqueteById(id));
    }, [dispatch, id]);

    if (!currentEnquete) return null;

    // Detect person
    let personneLabel = "";
    let personneType = "";
    if (currentEnquete.pmAdher) {
        personneLabel = currentEnquete.pmAdher.raisonSocial;
        personneType = "Adherent Morale";
    } else if (currentEnquete.pmAchet) {
        personneLabel = currentEnquete.pmAchet.raisonSocial;
        personneType = "Acheteur Morale";
    } else if (currentEnquete.ppAdher) {
        personneLabel = `${currentEnquete.ppAdher.nom} ${currentEnquete.ppAdher.prenom}`;
        personneType = "Adherent Physique";
    } else if (currentEnquete.ppAchet) {
        personneLabel = `${currentEnquete.ppAchet.nom} ${currentEnquete.ppAchet.prenom}`;
        personneType = "Acheteur Physique";
    }

    const initialValues = {
        adherRef: currentEnquete.adherRef || "",
        adherDate: currentEnquete.adherDate?.slice(0, 10) || "",
        adherMontant: currentEnquete.adherMontant || "",
        adherNbrJourReglem: currentEnquete.adherNbrJourReglem || "",
        adherModeReglem: currentEnquete.adherModeReglem || "",
        adherTexte: currentEnquete.adherTexte || "",
        deviseId: currentEnquete.deviseId || "",
        pmAdher: currentEnquete.pmAdher || null,
        pmAchet: currentEnquete.pmAchet || null,
        ppAdher: currentEnquete.ppAdher || null,
        ppAchet: currentEnquete.ppAchet || null
    };

    const validationSchema = yup.object({
        adherRef: yup.string().required("Référence est requise"),
        adherDate: yup.date().required("Date est requise").typeError("Date invalide"),
        adherMontant: yup.number().required("Montant requis"),
        adherNbrJourReglem: yup.number().required("Nombre de jours requis"),
        adherModeReglem: yup.string().required("Mode de règlement requis"),
        adherTexte: yup.string().required("Texte requis"),
       deviseId: yup.string().required("Devise est requise"),
    });

    const handleFormSubmit = (values) => {
        const payload = {
            ...values,
            id: currentEnquete.id
        };
        console.log(payload)
        dispatch(updateEnquete(id,payload, navigate));
    };

    return (
        <Box m="20px">
            <Typography variant="h4" fontWeight="bold" mb={2}>Modifier Enquête</Typography>
            {loadingEnquete && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Card sx={{ p: 3, backgroundColor: colors.primary[900] }}>
                <CardContent>
                    {errorEnquete && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {errorEnquete || "Une erreur s'est produite lors de la récupération des données."}
                            </Alert>
                        </Box>
                    )}
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                        enableReinitialize
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Personne associée</Typography>
                                        <TextField
                                            fullWidth
                                            disabled={true  }
                                            value={personneLabel}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography fontWeight="bold" mb={0.5}>Personne associée</Typography>
                                        <TextField
                                            fullWidth
                                            disabled={true}
                                            value={personneType}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight="bold" mb={0.5}>
                                        Devise
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        name="deviseId"
                                        label="Sélectionnez une devise"
                                        value={values.deviseId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.deviseId && !!errors.deviseId}
                                        helperText={touched.deviseId && errors.deviseId}
                                    >
                                        {devises.map((devise) => (
                                            <MenuItem key={devise.id} value={devise.id}>
                                                - {devise.dsg}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid container spacing={2}>
                                    {[
                                        "adherRef", "adherDate", "adherMontant", "adherNbrJourReglem",
                                        "adherModeReglem", "adherTexte"
                                    ].map((field) => {
                                        const label = field
                                            .replace(/^(adher)/i, "")
                                            .replace(/([A-Z])/g, " $1")
                                            .trim();
                                        const isDate = field.toLowerCase().includes("date");

                                        return (
                                            <Grid item xs={12} sm={6} key={field}>
                                                <Typography fontWeight="bold" mb={0.5}>
                                                    {label.charAt(0).toUpperCase() + label.slice(1)}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name={field}
                                                    type={isDate ? "date" : "text"}
                                                    value={values[field]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    InputLabelProps={isDate ? { shrink: true } : {}}
                                                    error={touched[field] && !!errors[field]}
                                                    helperText={touched[field] && errors[field]}
                                                />
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                <Box display="flex" justifyContent="center" mt={4}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="secondary"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Enregistrer les modifications
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

export default UpdateEnquete;
