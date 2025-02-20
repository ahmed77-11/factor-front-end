import { Box, Container, TextField, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme.js";
import { Formik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {confirmCodeReq} from "../../redux/user/userSlice.js";

const ConfirmCode = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const {loading,error}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve the email from the location state
    const email = location.state?.email || "";

    const initialValues = {
        code: "",
    };

    const validationSchema = Yup.object().shape({
        code: Yup.string().required("Le code est requis"),
    });

    const handleSubmit = async (values, { resetForm }) => {
        dispatch(confirmCodeReq(email,values.code,navigate))
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
                {/* Header with logo and brand */}
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
                    Confirmer le code
                </Typography>
                {/* Optionally display the email */}
                <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
                    Un code de vérification a été envoyé à: {email}
                </Typography>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                      }) => (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                id="code"
                                label="Code"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.code}
                                error={touched.code && Boolean(errors.code)}
                                helperText={touched.code && errors.code ? errors.code : ""}
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    },
                                }}
                            />
                            {error && (
                                <Typography variant="body2" sx={{ color: "red", mt: 1 }}>
                                    {error}
                                </Typography>
                            )}
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
                                Confirmer
                            </Button>
                        </form>
                    )}
                </Formik>
                {error && (
                    <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                        {error}
                    </Typography>
                )}
                {loading && (
                    <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                        Chargement...
                    </Typography>
                )}
            </Container>
        </Box>
    );
};

export default ConfirmCode;
