import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPMById, updatePM } from "../../../redux/personne/PersonneMoraleSlice.js";
import { useTypePieceId } from "../../../customeHooks/useTypePieceId.jsx";
import { tokens } from "../../../theme.js";

// Validation schema
const validationSchema = yup.object().shape({
    numeroPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
    raisonSocial: yup.string().required("La raison sociale est requise"),
    sigle: yup.string().required("Le sigle est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    ville: yup.string().required("La ville est requise"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    telNo: yup.string()
        .required("Le numéro de téléphone est requis")
        .matches(/^\d{8}$/, "Le numéro de téléphone doit comporter 8 chiffres"),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
    matriculeFiscal: yup.string().required("Le matricule fiscal est requis"),
    indviduRoles: yup.array().min(1, "Au moins un rôle doit être sélectionné").required("Les rôles sont requis"),
});

const UpdatePM = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { typePieceId, loading: loadingTypes, error: errorTypes } = useTypePieceId();
    const { currentPM, loadingPM, errorPM } = useSelector((state) => state.personneMorale);

    // Define all possible role options including "CONTACT"
    const roleOptions = [
        "ACHETEUR",
        "FOURNISSEUR",
        "CONTACT"
    ];

    const [initialValues, setInitialValues] = useState({
        numeroPieceIdentite: "",
        raisonSocial: "",
        sigle: "",
        adresse: "",
        ville: "",
        email: "",
        telNo: "",
        typePieceId: "",
        matriculeFiscal: "",
        indviduRoles: [] // Note lowercase 'i' to match API
    });

    // Fetch PM data
    useEffect(() => {
        if (id) {
            dispatch(getPMById(id));
        }
    }, [dispatch, id]);

    // Update initial values when currentPM is fetched
    useEffect(() => {
        if (currentPM) {
            setInitialValues({
                typePieceId: currentPM.typePieceIdentite.id,
                numeroPieceIdentite: currentPM.numeroPieceIdentite,
                raisonSocial: currentPM.raisonSocial,
                sigle: currentPM.sigle,
                adresse: currentPM.adresse,
                ville: currentPM.ville,
                email: currentPM.email,
                telNo: currentPM.telNo,
                matriculeFiscal: currentPM.matriculeFiscal,
                // Use direct array from API (note lowercase 'i')
                indviduRoles: currentPM.indviduRoles || []
            });
        }
    }, [currentPM]);

    // Handle form submit
    const handleFormSubmit = (values) => {
        const selectedType = typePieceId.find((item) => item.id === Number(values.typePieceId));
        const payload = {
            ...values,
            typePieceIdentite: selectedType,
        };

        console.log(payload)
        dispatch(updatePM(id, payload, navigate));
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingPM && <Typography>Chargement...</Typography>}
            <Header title="Personne Morale" subtitle="Modifier" />

            <Card sx={{
                width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3,
                backgroundColor: `${colors.primary[900]}`
            }}>
                <CardContent>
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* TYPE PIECE IDENTITE */}
                                    <Box key="typePieceId">
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            TYPE PIECE IDENTITE
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            variant="outlined"
                                            name="typePieceId"
                                            value={values.typePieceId}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            error={!!touched.typePieceId && !!errors.typePieceId}
                                            helperText={touched.typePieceId && errors.typePieceId}
                                            disabled
                                        >
                                            {loadingTypes ? (
                                                <MenuItem value="">Chargement...</MenuItem>
                                            ) : errorTypes ? (
                                                <MenuItem value="">Erreur de chargement</MenuItem>
                                            ) : (
                                                typePieceId.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.dsg}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </TextField>
                                    </Box>

                                    {/* indviduRoles (Multi-Select) */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            RÔLES
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected) => selected.join(', '),
                                            }}
                                            variant="outlined"
                                            name="indviduRoles" // Match API field name
                                            value={values.indviduRoles}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.indviduRoles && !!errors.indviduRoles}
                                            helperText={touched.indviduRoles && errors.indviduRoles}
                                        >
                                            {roleOptions.map((role) => (
                                                <MenuItem key={role} value={role}>
                                                    {role}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>

                                    {/* Other Fields */}
                                    {Object.keys(initialValues)
                                        .filter((field) => field !== "typePieceId" && field !== "indviduRoles")
                                        .map((field) => (
                                            <Box key={field}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="text"
                                                    placeholder={`Entrez ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    value={values[field]}
                                                    name={field}
                                                    error={!!touched[field] && !!errors[field]}
                                                    helperText={touched[field] && errors[field]}
                                                    disabled={field === "numeroPieceIdentite"}
                                                />
                                            </Box>
                                        ))}

                                    {/* Submit button */}
                                    <Box display="flex" justifyContent="center" gap="10px" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{ borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}
                                        >
                                            Soumettre
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>

                    {errorPM && <Typography color="error">{errorPM}</Typography>}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdatePM;