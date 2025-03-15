import {useState, useEffect} from "react";
import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme} from "@mui/material";
import {Formik} from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {deletePM, getPMById, updatePM} from "../../../redux/personne/PersonneMoraleSlice.js";
import {useTypePieceId} from "../../../customeHooks/useTypePieceId.jsx";
import {tokens} from "../../../theme.js"; // Custom hook for type pieces

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
});

const UpdatePM = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const {id} = useParams();
    const dispatch = useDispatch();
    const {typePieceId, loading: loadingTypes, error: errorTypes} = useTypePieceId();
    const {currentPM, loadingPM, errorPM} = useSelector((state) => state.personneMorale);

    const [initialValues, setInitialValues] = useState({
        numeroPieceIdentite: "",
        raisonSocial: "",
        sigle: "",
        adresse: "",
        ville: "",
        email: "",
        telNo: "",
        typePieceId: "",
        matriculeFiscal:""// pre-filled based on the selected type
    });

    useEffect(() => {
        if (id) {
            dispatch(getPMById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (currentPM) {
            setInitialValues({
                typePieceId: currentPM.typePieceIdentite.id, // assuming currentPM contains the type piece object
                numeroPieceIdentite: currentPM.numeroPieceIdentite,
                raisonSocial: currentPM.raisonSocial,
                sigle: currentPM.sigle,
                adresse: currentPM.adresse,
                ville: currentPM.ville,
                email: currentPM.email,
                telNo: currentPM.telNo,
                matriculeFiscal: currentPM.matriculeFiscal
            });
        }
    }, [currentPM]);

    const handleFormSubmit = (values) => {
        // Lookup the full type piece object
        const selectedType = typePieceId.find((item) => item.id === Number(values.typePieceId));
        // Merge full type piece object into payload
        const payload = {
            ...values,
            typePieceIdentite: selectedType,
        };

        dispatch(updatePM(id, payload, navigate));
    };


    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingPM && <Typography>Chargement...</Typography>}
            <Header title="Personne Morale" subtitle="Modifier"/>

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
                        {({values, errors, touched, handleBlur, handleChange, handleSubmit}) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Render fields */}
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
                                            disabled // Disable the field so users can't change it
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

                                    {/* Loop through remaining fields */}
                                    {Object.keys(initialValues)
                                        .filter((field) => field !== "typePieceId") // Don't render "typePieceId" again
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
                                                    disabled={field === "numeroPieceIdentite"} // Disable only this field
                                                />
                                            </Box>
                                        ))}

                                    {/* Submit and Archive buttons */}
                                    <Box display="flex" justifyContent="center" gap="10px" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100]}}
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
