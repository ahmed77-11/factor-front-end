import { Box, Button, TextField, Typography, Card, CardContent, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import {useTypePieceId} from "../../../customeHooks/useTypePieceId.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {addPM} from "../../../redux/personne/PersonneMoraleSlice.js";

// Add the new field for the select
const initialValues = {
    numPieceIdentite: "",
    raisonSociale: "",
    sigle: "",
    adresse: "",
    ville: "",
    email: "",
    numTel: "",
    typePieceId: "", // store selected type id (as string)
};

const validationSchema = yup.object().shape({
    numPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
    raisonSociale: yup.string().required("La raison sociale est requise"),
    sigle: yup.string().required("Le sigle est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    ville: yup.string().required("La ville est requise"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    numTel: yup.string().required("Le numéro de téléphone est requis"),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
});

const AddPersonneMorale = () => {
    const { typePieceId: typePieceList, loading, error } = useTypePieceId();
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {loadingPM,errorPM}=useSelector(state=>state.personneMorale);


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
                title="CRÉER UNE PERSONNE MORALE"
                subtitle="Créer un nouveau profil pour une personne morale"
            />

            <Card sx={{
                width: "100%",
                maxWidth: "1200px",
                boxShadow: 5,
                borderRadius: 3,
                p: 3
            }}>
                <CardContent>
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
                        <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                            {errorPM}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddPersonneMorale;
