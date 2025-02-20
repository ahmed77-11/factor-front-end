import { Box, Container, TextField, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme.js";
import { Formik } from "formik";
import * as Yup from "yup";
import {useDispatch, useSelector} from "react-redux";
import {sendResetToken} from "../../redux/user/userSlice.js";
import {useNavigate} from "react-router";

const SendReset = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate=useNavigate();
    const { loading, error } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const initialValues = {
        email: "",
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Email is required"),
    });

    const handleSubmit = async (values, { resetForm }) => {
        dispatch(sendResetToken(values.email,navigate))

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
                    Réinitialiser le mot de passe
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
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    },
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

export default SendReset;
