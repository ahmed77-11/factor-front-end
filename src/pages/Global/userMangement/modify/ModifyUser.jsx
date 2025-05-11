import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, Chip } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import {useNavigate, useParams} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../../../components/Header.jsx";
import { fetchUserById, updateUser } from "../../../../redux/user/usersSlice.js";

const userSchema = yup.object().shape({
    prenom: yup.string().required("Le prénom est requis"),
    nom: yup.string().required("Le nom est requis"),
    cin: yup.string().required("Le CIN est requis"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    roles: yup.array().of(yup.string()).min(1, "Veuillez sélectionner au moins un rôle"),
});

const availableRoles = [
    { label: "Admin", value: "ROLE_ADMIN" },
    { label: "Responsable Commercial", value: "ROLE_RES_COMERCIAL" },
    { label: "Responsable Achat", value: "ROLE_RES_ACHAT" },
    { label: "Responsable Financement", value: "ROLE_RES_FINANCEMENT" },
    { label: "Responsable Juridique", value: "ROLE_RES_JURIDIQUE" },
    { label: "Validateur Du Contrat", value: "ROLE_VALIDATEUR" },
    { label: "Signateur Du Contrat", value: "ROLE_SIGNATAIRE" }
];

const ModifyUser = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentUser, loading, error } = useSelector((state) => state.users);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchUserById(id));
    }, [dispatch, id]);

    const handleFormSubmit = (values) => {
        dispatch(updateUser({
            id: id,
            email: values.email,
            cin: values.cin,
            lastName: values.nom,
            firstName: values.prenom,
            roles: values.roles
        }, navigate));
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    console.log(currentUser)
    const initialValues = {
        prenom: currentUser.firstname || "",
        nom: currentUser.lastname || "",
        cin: currentUser.cin || "",
        email: currentUser.email || "",
        roles: currentUser.roles?.map(role => role.role) || [],
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            <Header title="Les Utilisateurs" subtitle="Modifier un utilisateur" />

            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3 }}>
                <CardContent>
                    <Formik
                        onSubmit={handleFormSubmit}
                        initialValues={initialValues}
                        validationSchema={userSchema}
                        enableReinitialize
                    >
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
                                                                newRoles = newRoles.filter((r) => r !== role.value);
                                                            } else {
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
                                            Mettre à jour l&#39;utilisateur
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    {error && (
                        <Typography variant="body1" color="error" sx={{ mb: 2, textAlign: "center" }}>
                            {error}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ModifyUser;