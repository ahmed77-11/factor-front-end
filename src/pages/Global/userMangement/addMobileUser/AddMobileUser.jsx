import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {Box, Card, CardContent, TextField, Typography, Button, Autocomplete, Alert} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { fetchAdherentsAsync } from "../../../../redux/relations/relationsSlice.js";
import Header from "../../../../components/Header.jsx";
import {useNavigate} from "react-router-dom";
import {addMobileUser} from "../../../../redux/user/userSlice.js";

const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    adherentId: "",
};

const userSchema = yup.object().shape({
    firstName: yup.string().required("First Name est requis"),
    lastName: yup.string(),
    email: yup.string().email("Email n'est pas valid").required("Email est requis"),
    adherentId: yup.string().required("Adhérent est requis"),
});

const AddMobileUser = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);
    const { adherents, loading: adhLoading, error: adhError } = useSelector((state) => state.relations);

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    const handleFormSubmit = (values, { resetForm }) => {
        console.log(values);
        dispatch(addMobileUser(values,navigate))// Replace with dispatch logic or API call
        resetForm();
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Header title="Ajouter un utilisateur mobile" subtitle="Ajouter un utilisateur mobile à l'application" />

            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3 }}>
                <CardContent>
                    {error && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {error}
                            </Alert>
                        </Box>
                    )}
                    <Formik initialValues={initialValues} validationSchema={userSchema} onSubmit={handleFormSubmit}>
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                          }) => (
                            <form onSubmit={handleSubmit}>
                                {loading && (
                                    <div className="loader-overlay">
                                        <div className="loader"></div>
                                    </div>
                                )}

                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Autocomplete */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Adhérent
                                        </Typography>
                                        <Autocomplete
                                            options={adherents || []}
                                            loading={adhLoading}
                                            getOptionLabel={(option) =>
                                                `${option.raisonSocial} - ${option.typePieceIdentite?.dsg || "N/A"} - ${option.numeroPieceIdentite}`
                                            }
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    setFieldValue("firstName", newValue.raisonSocial);
                                                    setFieldValue("email", newValue.email);
                                                    setFieldValue("adherentId", newValue.id);
                                                } else {
                                                    setFieldValue("firstName", "");
                                                    setFieldValue("email", "");
                                                    setFieldValue("adherentId", "");
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    variant="outlined"
                                                    name="adherent"
                                                    error={!!touched.adherentId && !!errors.adherentId}
                                                    helperText={touched.adherentId && errors.adherentId}
                                                />
                                            )}
                                        />
                                    </Box>

                                    {/* First Name */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Nom</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="firstName"
                                            value={values.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.firstName && !!errors.firstName}
                                            helperText={touched.firstName && errors.firstName}
                                        />
                                    </Box>

                                    {/* Last Name */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Prénom</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="lastName"
                                            value={values.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.lastName && !!errors.lastName}
                                            helperText={touched.lastName && errors.lastName}
                                        />
                                    </Box>

                                    {/* Email */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Email</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.email && !!errors.email}
                                            helperText={touched.email && errors.email}
                                        />
                                    </Box>

                                    {/* Submit */}
                                    <Box display="flex" justifyContent="center">
                                        <Button type="submit" variant="contained" color="secondary" size="large" sx={{ borderRadius: 2 }}>
                                            Créer utilisateur mobile
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

export default AddMobileUser;
