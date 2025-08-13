import { Box, Container, TextField, Button, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme.js';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/user/userSlice.js";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { loading, error } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate=useNavigate()

    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    });

    const handleFormSubmit = async (values, { resetForm }) => {
        dispatch(login(values.email, values.password,navigate));
        resetForm(); // Reset form values
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundSize: 'cover',
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
                    background: '#ffffff',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <img src={'/assets/logoMf.jpg'} width="60px" height="60px" alt="logo" />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

                {/* Display error message if it exists */}


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
                                helperText={touched.email && errors.email ? errors.email : ''}
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        marginBottom: 1,
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    },
                                }}
                                FormHelperTextProps={{
                                    sx: {
                                        marginBottom: '16px',
                                    },
                                }}
                            />
                            <TextField
                                id="password"
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.password}
                                error={touched.password && Boolean(errors.password)}
                                helperText={touched.password && errors.password ? errors.password : ''}
                                required
                                InputLabelProps={{ style: { color: colors.primary[500] } }}
                                InputProps={{
                                    sx: {
                                        marginBottom: 1,
                                        color: colors.primary[500],
                                        borderBottom: `1px solid ${colors.primary[500]}`,
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    },
                                }}
                                FormHelperTextProps={{
                                    sx: {
                                        marginBottom: '16px',
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    backgroundColor: colors.primary[500],
                                    color: '#fff',
                                    padding: '10px 20px',
                                    fontSize: 16,
                                    borderRadius: 1,
                                    marginTop: 3,
                                    textTransform: 'none',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: colors.greenAccent[500],
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </form>
                    )}
                </Formik>
                {error && (
                    <Typography variant="body1"  color="error" sx={{ mb: 2,textAlign:"center" }}>
                        {error}
                    </Typography>
                )}
                <Link
                    href="/send-reset-code"
                    underline="hover"
                    variant="body2"
                    sx={{
                        mt: 2,
                        display: 'block',
                        textAlign: 'center',
                        color: colors.primary[500],
                    }}
                >
                    Mot de passe oublié?
                </Link>
            </Container>
        </Box>
    );
};

export default Login;
