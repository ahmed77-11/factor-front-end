import { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, Chip } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../../components/Header.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {addUser} from "../../../../redux/user/userSlice.js";

const initialValues = {
    prenom: "",
    nom: "",
    cin: "",
    email: "",
    roles: [], // Added roles array to hold selected role values
};

const userSchema = yup.object().shape({
    prenom: yup.string().required("Le prénom est requis"),
    nom: yup.string().required("Le nom est requis"),
    cin: yup.string().required("Le CIN est requis"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    roles: yup.array().of(yup.string()).min(1, "Veuillez sélectionner au moins un rôle"),
});

// Available roles for selection
const availableRoles = [
    { label: "Admin", value: "ROLE_ADMIN" },
    { label: "Responsable Commercial", value: "ROLE_RES_COMERCIAL" },
    { label: "Responsable Achat", value: "ROLE_RES_ACHAT" },
    {label: "Responsable Financement", value: "ROLE_RES_FINANCEMENT"},
];

const AddUser = () => {

    const {loading,error}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const navigate=useNavigate();


    const handleFormSubmit = (values,{resetForm}) => {
        dispatch(addUser(values.email,values.cin,values.nom,values.prenom,values.roles,navigate));
        resetForm()
        // Here you can add the API call to create the user with the selected roles.
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            <Header title="CRÉER UN UTILISATEUR" subtitle="Créer un nouveau profil utilisateur" />

            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3 }}>
                <CardContent>
                    <Formik onSubmit={handleFormSubmit} initialValues={initialValues} validationSchema={userSchema}>
                        {({
                              values,
                              errors,
                              touched,
                              handleBlur,
                              handleChange,
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
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Prénom</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Entrez votre prénom"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.prenom}
                                            name="prenom"
                                            error={!!touched.prenom && !!errors.prenom}
                                            helperText={touched.prenom && errors.prenom}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Nom</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Entrez votre nom"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.nom}
                                            name="nom"
                                            error={!!touched.nom && !!errors.nom}
                                            helperText={touched.nom && errors.nom}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">CIN</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Entrez votre CIN"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.cin}
                                            name="cin"
                                            error={!!touched.cin && !!errors.cin}
                                            helperText={touched.cin && errors.cin}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Email</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Entrez votre email"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.email}
                                            name="email"
                                            error={!!touched.email && !!errors.email}
                                            helperText={touched.email && errors.email}
                                        />
                                    </Box>
                                    {/* Role selection Chip list */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: "8px" }}>
                                            Rôles
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            {availableRoles.map((role) => {
                                                const isSelected = values.roles?.includes(role.value);
                                                return (
                                                    <Chip
                                                        key={role.value}
                                                        label={role.label}
                                                        variant={isSelected ? "filled" : "outlined"}
                                                        color={isSelected ? "primary" : "default"}
                                                        onClick={() => {
                                                            let newRoles = [...values.roles];
                                                            if (isSelected) {
                                                                // Remove role
                                                                newRoles = newRoles.filter((r) => r !== role.value);
                                                            } else {
                                                                // Add role
                                                                newRoles.push(role.value);
                                                            }
                                                            setFieldValue("roles", newRoles);
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                        {touched.roles && errors.roles && (
                                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                {errors.roles}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2 }}>
                                            Créer un nouvel utilisateur
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    {error && (
                    <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                        {error}
                    </Typography>
                )}

                </CardContent>
            </Card>
        </Box>
    );
};

export default AddUser;
