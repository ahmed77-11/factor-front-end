import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Autocomplete,
    useTheme,
    Grid, Alert
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllAchetSansAccord,
    fetchAllAdherSansAccord
} from "../../redux/personne/PersonneMoraleSlice.js";
import {
    getPPByAchetSansAccord,
    getPPByAdherSansAccord
} from "../../redux/personne/PersonnePhysiqueSlice.js";
import {useNavigate} from "react-router-dom";
import {addEnquete} from "../../redux/enquete/enqueteSlice.js";
import {useDevise} from "../../customeHooks/useDevise.jsx";

const EnqueteForm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedPersonData, setSelectedPersonData] = useState(null);
    const [loadingPersons, setLoadingPersons] = useState(false);

    const { personnePhysiques, loading: loadingPP,errorPP } = useSelector(
        (state) => state.personnePhysique
    );
    const { personneMorales, loading: loadingPM, errorPM} = useSelector(
        (state) => state.personneMorale
    );
    const {loadingEnqeute,errorEnquete}= useSelector((state) => state.enquete);
    const { devises, loading: loadingDevise, error: errorDevise } = useDevise();


    const initialValues = {
        personType: "",
        role: "",
        selectedPersonId: "",
        adherRef: "",
        adherDate: "",
        deviseId:"",
        adherMontant: "",
        adherNbrJourReglem: "",
        adherModeReglem: "",
        adherTexte: "",
    };

    const validationSchema = yup.object({
        personType: yup.string().required("Type de personne est requis"),
        role: yup.string().required("Rôle est requis"),
        selectedPersonId: yup
            .number()
            .typeError("Personne est requise")
            .required("Personne est requise"),
        adherRef: yup.string().required("Référence de l'adhérent est requise"),
        adherDate: yup
            .date()
            .required("Date d'adhésion est requise")
            .typeError("Date d'adhésion invalide"),
        deviseId: yup
            .string()
            .required("La devise est requise"),
        adherMontant: yup
            .number()
            .typeError("Montant d'adhésion doit être un nombre")
            .required("Montant d'adhésion est requis"),
        adherNbrJourReglem: yup
            .number()
            .typeError("Nombre de jours de règlement doit être un nombre")
            .required("Nombre de jours de règlement est requis"),
        adherModeReglem: yup.string().required("Mode de règlement est requis"),
        adherTexte: yup.string().required("Texte d'adhésion est requis"),
    });

    const handleFormSubmit = (values) => {
        const payload = {
            ...values,
            selectedPersonId: Number(values.selectedPersonId)
        };

        if (selectedPersonData) {
            if (values.personType === "PM") {
                if (values.role === "Adherent") {
                    payload.pmAdher = selectedPersonData;
                } else {
                    payload.pmAchet = selectedPersonData;
                }
            } else {
                if (values.role === "Adherent") {
                    payload.ppAdher = selectedPersonData;
                } else {
                    payload.ppAchet = selectedPersonData;
                }
            }
        }
        dispatch(addEnquete(payload, navigate));
        console.log("Submitted Payload:", payload);
    };

    return (
        <Box m="20px">
            {loadingEnqeute || loadingPM ||loadingPP && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Header title="Nouvelle Enquête" subtitle="Créer une enquête" />

            <Card
                sx={{
                    width: "100%",
                    boxShadow: 4,
                    borderRadius: 3,
                    p: 3,
                    backgroundColor: colors.primary[900]
                }}
            >
                <CardContent>
                    {errorPP || errorPM  && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {errorPP || errorPM || "Une erreur s'est produite lors de la récupération des données."}
                            </Alert>
                        </Box>
                    )}
                    {errorEnquete && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {errorEnquete || "Une erreur s'est produite lors de la création de la enquete."}
                            </Alert>
                        </Box>
                    )}
                    {errorDevise && (
                        <Box my={2}>
                            <Alert severity="error" sx={{ fontSize: "14px" }}>
                                {errorDevise || "Erreur lors du chargement des devises."}
                            </Alert>
                        </Box>
                    )}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleBlur,
                              handleChange,
                              setFieldValue,
                              handleSubmit
                          }) => {
                            useEffect(() => {
                                if (!values.personType || !values.role) return;

                                const isPM = values.personType === "PM";
                                const fetchData = () => {
                                    if (values.role === "Adherent") {
                                        return isPM
                                            ? dispatch(fetchAllAdherSansAccord())
                                            : dispatch(getPPByAdherSansAccord());
                                    } else {
                                        return isPM
                                            ? dispatch(fetchAllAchetSansAccord())
                                            : dispatch(getPPByAchetSansAccord());
                                    }
                                };

                                setLoadingPersons(true);
                                Promise.resolve(fetchData()).finally(() =>
                                    setLoadingPersons(false)
                                );
                            }, [values.personType, values.role]);

                            const currentOptions =
                                values.personType === "PP"
                                    ? personnePhysiques
                                    : personneMorales;

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2} mb={2}>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Type de personne"
                                                name="personType"
                                                value={values.personType}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                    !!touched.personType &&
                                                    !!errors.personType
                                                }
                                                helperText={
                                                    touched.personType &&
                                                    errors.personType
                                                }
                                            >
                                                <MenuItem value="PP">
                                                    Personne Physique
                                                </MenuItem>
                                                <MenuItem value="PM">
                                                    Personne Morale
                                                </MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Rôle"
                                                name="role"
                                                value={values.role}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={!!touched.role && !!errors.role}
                                                helperText={touched.role && errors.role}
                                            >
                                                <MenuItem value="Adherent">
                                                    Adhérent
                                                </MenuItem>
                                                <MenuItem value="Acheteur">
                                                    Acheteur
                                                </MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>

                                    {values.personType && values.role && (
                                        <Box mb={3}>
                                            <Typography fontWeight="bold" mb={1}>
                                                Personne
                                            </Typography>
                                            <Autocomplete
                                                fullWidth
                                                loading={loadingPP || loadingPM}
                                                options={currentOptions}
                                                value={
                                                    currentOptions.find(
                                                        (p) =>
                                                            p.id ===
                                                            values.selectedPersonId
                                                    ) || null
                                                }
                                                getOptionLabel={(option) =>
                                                    values.personType === "PP"
                                                        ? `${option.typePieceIdentite.dsg}-${option.numeroPieceIdentite} | ${option.nom} ${option.prenom}`
                                                        : `${option.typePieceIdentite.dsg}-${option.numeroPieceIdentite} | ${option.raisonSocial}`
                                                }
                                                onChange={(event, newValue) => {
                                                    setFieldValue(
                                                        "selectedPersonId",
                                                        newValue?.id || ""
                                                    );
                                                    setSelectedPersonData(newValue);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Choisir une personne"
                                                        error={
                                                            !!touched.selectedPersonId &&
                                                            !!errors.selectedPersonId
                                                        }
                                                        helperText={
                                                            touched.selectedPersonId &&
                                                            errors.selectedPersonId
                                                        }
                                                    />
                                                )}
                                            />
                                        </Box>
                                    )}
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
                                            "adherRef",
                                            "adherDate",
                                            "adherMontant",
                                            "adherNbrJourReglem",
                                            "adherModeReglem",
                                            "adherTexte",
                                        ].map((field) => {
                                            const label = field
                                                .replace(/^(adher|factor)/i, "")
                                                .replace(/([A-Z])/g, " $1")
                                                .trim();
                                            const isDate =
                                                field.toLowerCase().includes("date");

                                            return (
                                                <Grid item xs={12} sm={6} key={field}>
                                                    <Typography fontWeight="bold" mb={0.5}>
                                                        {label.charAt(0).toUpperCase() +
                                                            label.slice(1)}
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        name={field}
                                                        value={values[field]}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        type={isDate ? "date" : "text"}
                                                        InputLabelProps={{
                                                            shrink: isDate
                                                        }}
                                                        error={
                                                            !!touched[field] && !!errors[field]
                                                        }
                                                        helperText={
                                                            touched[field] && errors[field]
                                                        }
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
                                            Créer Enquête
                                        </Button>
                                    </Box>
                                </form>
                            );
                        }}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EnqueteForm;
