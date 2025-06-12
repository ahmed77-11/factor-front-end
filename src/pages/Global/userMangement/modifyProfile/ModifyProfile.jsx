import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    useTheme,
    Button, Chip, Alert,
} from "@mui/material";
import { tokens } from "../../../../theme.js";
import { useSelector, useDispatch } from "react-redux";
import * as yup from "yup";
import Header from "../../../../components/Header.jsx";
import { Formik } from "formik";
import { useState } from "react";
import { updateUser } from "../../../../redux/user/userSlice.js";
import axios from "axios"; // make sure your redux slice has this

const ModifyProfile = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();

    const { current, loading,error } = useSelector((state) => state.user);
    const [newProfileImage, setNewProfileImage] = useState(null);
    console.log(current)
    const initialValues = {
        firstname: current.firstName || "",
        lastname: current.lastName || "",
        cin: current.cin || "",
        email: current.email || "",
        profilePicture: current.profilePicture || "",
    };

    const validationSchema = yup.object().shape({
        firstname: yup.string().required("Le prénom est requis"),
        lastname: yup.string().required("Le nom est requis"),
        cin: yup.string().required("Le numéro de CIN est requis"),
        email: yup.string().email("Email invalide").required("L'email est requis"),
        profilePicture: yup.mixed()
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

    const getRoleLabel = (roleValue) => {
        const role = availableRoles.find((r) => r.value === roleValue);
        return role ? role.label : roleValue; // fallback to raw role if not found
    };

    const handleFormSubmit = async (values) => {
        let finalProfilePicture = values.profilePicture;

        if (newProfileImage) {
            const formData = new FormData();
            formData.append("file", newProfileImage);

            try {
                const uploadRes = await axios.post(
                    "http://localhost:8082/factoring/users/api/files/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            // include Authorization header if needed
                            // Authorization: `Bearer ${yourToken}`
                        },
                        withCredentials:true
                    }
                );

                // Make sure backend returns the uploaded file name
                const result = uploadRes.data;
                finalProfilePicture = `/uploads/${result.fileName}`;
            } catch (error) {
                console.error("Image upload failed:", error.response?.data || error.message);
                return;
            }
        }

        const updatedData = {
            ...values,
            id: current.id,
            profilePicture: finalProfilePicture,
        };

        dispatch(updateUser(updatedData));
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            {error && (
                <Box  my={2}>
                    <Alert  severity="error" sx={{fontSize:"14px"}}>
                        {error}
                    </Alert>
                </Box>
            )}
            <Header title="Utilisateur" subtitle="Profil Utilisateur" />
            <Card
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    boxShadow: 5,
                    p: 3,
                    backgroundColor: `${colors.primary[900]}`,
                }}
            >
                <CardContent>
                    <Formik
                        onSubmit={handleFormSubmit}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                    >
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
                                <Box flex={1} display="flex" flexDirection="column" gap="30px">
                                    <Box display="flex" flexDirection="row" gap="15px">
                                        <Box display="flex" width="50%" flexDirection="column" gap="30px">
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    color={colors.grey[100]}
                                                >
                                                    Nom
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    name="lastname"
                                                    value={values.lastname}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    error={!!touched.lastname && !!errors.lastname}
                                                    helperText={touched.lastname && errors.lastname}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    color={colors.grey[100]}
                                                >
                                                    Prénom
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    name="firstname"
                                                    value={values.firstname}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    error={!!touched.firstname && !!errors.firstname}
                                                    helperText={touched.firstname && errors.firstname}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Right Image Upload */}
                                        <Box
                                            width="50%"
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            gap="7px"
                                            mt={2}
                                        >
                                            <Box
                                                component="img"
                                                src={
                                                    newProfileImage
                                                        ? URL.createObjectURL(newProfileImage)
                                                        : current.profilePicture
                                                            ? `http://localhost:8082/factoring/users${current.profilePicture}`
                                                            : "../../assets/userImage.jpeg"
                                                }
                                                alt="Profile Preview"
                                                sx={{
                                                    width: 128,
                                                    height: 128,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    border: `2px solid ${colors.grey[300]}`,
                                                }}
                                            />


                                            <TextField
                                                type="file"
                                                variant="outlined"
                                                name="profilePicture"


                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setNewProfileImage(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFieldValue("profilePicture", reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                inputProps={{ accept: "image/*" }}
                                                error={!!touched.profilePicture && !!errors.profilePicture}
                                                helperText={touched.profilePicture && errors.profilePicture}
                                            />

                                            <Typography variant="caption" color={colors.grey[300]}>
                                                Pour de meilleurs résultats, utilisez une image d&#39;au moins 128px par 128px au format .jpg
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color={colors.grey[100]}
                                        >
                                            CIN
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="cin"
                                            value={values.cin}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            error={!!touched.cin && !!errors.cin}
                                            helperText={touched.cin && errors.cin}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color={colors.grey[100]}
                                        >
                                            Email
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="email"
                                            value={values.email}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            error={!!touched.email && !!errors.email}
                                            helperText={touched.email && errors.email}
                                        />
                                    </Box>

                                    <Box display="flex" flexWrap="wrap" gap="10px" mt={2}>
                                        {current.roles?.map((role, index) => {
                                            const roleName = typeof role === "string" ? role : role.name;
                                            return (
                                                <Chip
                                                    key={index}
                                                    label={getRoleLabel(roleName)}
                                                    sx={{color:colors.greenAccent[400],backgroundColor:colors.primary[900],fontSize:"12px"}}
                                                    variant="outlined"
                                                />
                                            );
                                        })}
                                    </Box>


                                    <Box display="flex" justifyContent="flex-end">
                                        <Button variant="contained" color="primary" type="submit">
                                            Enregistrer les modifications
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

export default ModifyProfile;
