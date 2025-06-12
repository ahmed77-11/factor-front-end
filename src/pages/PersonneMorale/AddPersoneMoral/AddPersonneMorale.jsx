    import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme, Alert} from "@mui/material";
    import { Formik } from "formik";
    import * as yup from "yup";
    import Header from "../../../components/Header.jsx";
    import {useTypePieceId} from "../../../customeHooks/useTypePieceId.jsx";
    import {useDispatch, useSelector} from "react-redux";
    import {useNavigate} from "react-router-dom";
    import {addPM} from "../../../redux/personne/PersonneMoraleSlice.js";
    import {tokens} from "../../../theme.js";
    import {validateRNE} from "../../../helpers/ValidationHelper.jsx";

    // Add the new field for the select
    const initialValues = {
        numPieceIdentite: "",
        raisonSociale: "",
        sigle: "",
        adresse: "",
        ville: "",
        email: "",
        numTel: "",
        matriculeFiscal:"",
        typePieceId: "", // store selected type id (as string)
    };


    const AddPersonneMorale = () => {
        const theme = useTheme();
        const colors = tokens(theme.palette.mode);
        const { typePieceId: typePieceList, loading, error } = useTypePieceId();
        const dispatch=useDispatch();
        const navigate=useNavigate();
        const {loadingPM,errorPM}=useSelector(state=>state.personneMorale);

        const validationSchema = yup.object().shape({
            numPieceIdentite: yup.string().when("typePieceId", (typePieceId, schema) => {
                if (!typePieceId) {
                    return schema.required("Le numéro de pièce d'identité est requis");
                }

                // Ensure typePieceList is available and safely find the selected type
                const selectedType = (typePieceList || []).find(item => Number(item.id) === Number(typePieceId));

                if (selectedType?.dsg === "RNE") {
                    return schema.required("Le numéro de pièce d'identité est requis")
                        .test("rne-valid", "Numéro RNE non valide", (value) => validateRNE(value));
                }

                return schema.required("Le numéro de pièce d'identité est requis");
            }),
            raisonSociale: yup.string().required("La raison sociale est requise"),
            sigle: yup.string().required("Le sigle est requis"),
            adresse: yup.string().required("L'adresse est requise"),
            ville: yup.string().required("La ville est requise"),
            email: yup.string().email("Email invalide").required("L'email est requis"),
            numTel: yup.string()
                .required("Le numéro de téléphone est requis")
                .matches(/^\d{8}$/, "Le numéro de téléphone doit comporter 8 chiffres"),
            matriculeFiscal: yup.string().required("Le matricule fiscal est requis"),
            typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
        });


        const handleFormSubmit = (values,{resetForm}) => {
            // Lookup the full object from the list based on the selected id.
            const selectedType = typePieceList.find(
                (item) => item.id === Number(values.typePieceId)
            );
            // Merge the full type piece object into the payload.
            const payload = {
                numeroPieceIdentite: values.numPieceIdentite,
                raisonSocial: values.raisonSociale,
                sigle: values.sigle,
                adresse: values.adresse,
                ville: values.ville,
                email: values.email,
                telNo: values.numTel,
                matriculeFiscal: values.matriculeFiscal,
                typePieceIdentite: selectedType
            };
            dispatch(addPM(payload,navigate))
            resetForm()
            // Submit payload to your API as needed.
        };

        return (
            <Box m="20px" display="flex" flexDirection="column" alignItems="center">
                {loadingPM && (
                    <div className="loader-overlay">
                        <div className="loader"></div>
                    </div>
                )}
                <Header
                    title="Personnes Morale"
                    subtitle="Créer une personne morale"
                />

                <Card sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    boxShadow: 5,
                    borderRadius: 3,
                    p: 3,
                    backgroundColor:`${colors.primary[900]}`

                }}>
                    <CardContent>
                        {errorPM && (
                            <Box  my={2}>
                                <Alert  severity="error" sx={{fontSize:"14px"}}>
                                    {errorPM ||  "Une erreur s'est produite lors de la création de la personne morale !"}
                                </Alert>
                            </Box>
                        )}
                        <Formik
                            onSubmit={handleFormSubmit}
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                        >
                            {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
                                <form onSubmit={handleSubmit}>
                                    <Box>
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
                                        >
                                            {loading ? (
                                                <MenuItem value="">Loading...</MenuItem>
                                            ) : error ? (
                                                <MenuItem value="">Error loading options</MenuItem>
                                            ) : (
                                                typePieceList.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.dsg}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </TextField>
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="20px">
                                        {/* Render all standard fields except the select */}
                                        {Object.keys(initialValues)
                                            .filter(field => field !== "typePieceId")
                                            .map((field) => (
                                                <Box key={field}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        type="text"
                                                        placeholder={`Entrez ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        value={values[field]}
                                                        name={field}
                                                        error={!!touched[field] && !!errors[field]}
                                                        helperText={touched[field] && errors[field]}
                                                    />
                                                </Box>
                                            ))}

                                        {/* Select field for TypePieceIdentite */}


                                        <Box display="flex" justifyContent="center" mt="10px">
                                            <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2 }}>
                                                Créer une personne morale
                                            </Button>
                                        </Box>
                                    </Box>
                                </form>
                            )}
                        </Formik>
                        {errorPM && (
                            <Typography fontSize={20} mt={5} variant="body1"  color="error" sx={{ my: 2,textAlign:"center" }}>
                                {errorPM}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    export default AddPersonneMorale;
