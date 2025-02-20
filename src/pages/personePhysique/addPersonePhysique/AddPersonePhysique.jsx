import { Box, Button, TextField, Typography, Card, CardContent, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import {useTypePieceId} from "../../../customeHooks/useTypePieceId.jsx";
import {useSelector,useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {addPP} from "../../../redux/personne/PersonnePhysiqueSlice.js";

const initialValues = {
    numPieceIdentite: "",
    nom: "",
    prenom: "",
    adresse: "",
    typePieceId: "", // new field for the select
};

const validationSchema = yup.object().shape({
    numPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
    nom: yup.string().required("Le nom est requis"),
    prenom: yup.string().required("Le prénom est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
});

const AddPersonePhysique = () => {
    const { typePieceId, loading, error } = useTypePieceId();
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {loadingPP,errorPP}=useSelector(state=>state.personnePhysique);

    const handleFormSubmit = (values,{resetForm}) => {
        // Find the full object for the selected typePieceId (ensure conversion to number if needed)
        const selectedType = typePieceId.find(item => item.id === Number(values.typePieceId));
        // Create a payload that includes the full object instead of just the id
        const payload = {
            numeroPieceIdentite: values.numPieceIdentite,
            nom: values.nom,
            prenom: values.prenom,
            adresse: values.adresse,
            typePieceIdentite: selectedType
        };
        dispatch(addPP(payload,navigate))
        resetForm()

        // You can then submit `payload` to your API
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            {loadingPP && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Header
                title="CRÉER UNE PERSONNE PHYSIQUE"
                subtitle="Créer un nouveau profil pour une personne physique"
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
                                            typePieceId.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.dsg}
                                                </MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                </Box>
                                <Box display="flex" flexDirection="column" gap="20px">
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

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2 }}>
                                            Créer une personne physique
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    {errorPP && (
                        <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                            {errorPP}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddPersonePhysique;
