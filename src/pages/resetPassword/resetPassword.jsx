import { Box, Container, TextField, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme.js";
import { Formik } from "formik";
import * as Yup from "yup";
import {useDispatch, useSelector} from "react-redux";
import {resetPasswordReq} from "../../redux/user/userSlice.js";
import {useNavigate} from "react-router-dom";

const ResetPassword = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { loading, error } = useSelector(state => state.user);
    const dispatch=useDispatch()
    const navigate=useNavigate()


    const initialValues = {
        email: "",
        newPassword: "",
        confirmPassword: "",
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required"),
        newPassword: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Nouveau mot de passe est requis"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword"), null], "Les mots de passe ne correspondent pas")
            .required("La confirmation du mot de passe est requise"),
    });

    const handleFormSubmit = async (values, { resetForm }) => {
        dispatch(resetPasswordReq(values.email,values.newPassword,values.confirmPassword,navigate))
        resetForm();
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundSize: "cover",
            }}
        >
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Container
                maxWidth="sm"
                sx={{
                    background: "#ffffff",
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <img
                        src={"/public/assets/logoMf.jpg"}
                        width="60px"
                        height="60px"
                        alt="logo"
                    />
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                color: colors.primary[500],
                            }}
                        >
                            MED-FACTOR
                        </Typography>
                    </Box>
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center",
                        mb: 3,
                        color: colors.primary[500],
                        fontWeight: 800,
                    }}
                >
                    Réinitialiser le mot de passe
                </Typography>
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
                          handleSubmit,
                          isSubmitting,
                      }) => (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                id="email"
                                label="Email"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email ? errors.email : ""}
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        marginBottom: 1,
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    },
                                }}
                                FormHelperTextProps={{
                                    sx: { marginBottom: "16px" },
                                }}
                            />
                            <TextField
                                id="newPassword"
                                label="Nouveau mot de passe"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.newPassword}
                                error={touched.newPassword && Boolean(errors.newPassword)}
                                helperText={
                                    touched.newPassword && errors.newPassword
                                        ? errors.newPassword
                                        : ""
                                }
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        marginBottom: 1,
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    },
                                }}
                                FormHelperTextProps={{
                                    sx: { marginBottom: "16px" },
                                }}
                            />
                            <TextField
                                id="confirmPassword"
                                label="Confirmer le mot de passe"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.confirmPassword}
                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                helperText={
                                    touched.confirmPassword && errors.confirmPassword
                                        ? errors.confirmPassword
                                        : ""
                                }
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        marginBottom: 1,
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    },
                                }}
                                FormHelperTextProps={{
                                    sx: { marginBottom: "16px" },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{
                                    backgroundColor: colors.primary[500],
                                    color: "#fff",
                                    padding: "10px 20px",
                                    fontSize: 16,
                                    borderRadius: 1,
                                    marginTop: 3,
                                    textTransform: "none",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: colors.greenAccent[500],
                                    },
                                }}
                            >
                                Réinitialiser
                            </Button>
                        </form>
                    )}
                </Formik>
                {error && (
                    <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                        {error}
                    </Typography>
                )}
            </Container>
        </Box>
    );
};

export default ResetPassword;
