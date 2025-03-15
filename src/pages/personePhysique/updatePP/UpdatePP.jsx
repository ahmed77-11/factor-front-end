    import { useState, useEffect } from "react";
    import { Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme } from "@mui/material";
    import { Formik } from "formik";
    import * as yup from "yup";
    import Header from "../../../components/Header.jsx";
    import { useNavigate, useParams } from "react-router-dom";
    import { useDispatch, useSelector } from "react-redux";
    import { deletePP, getPPById, updatePP } from "../../../redux/personne/PersonnePhysiqueSlice.js";
    import { tokens } from "../../../theme.js";


    // Updated validation schema to include naissanceDate
    const validationSchema = yup.object().shape({
        numeroPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
        nom: yup.string().required("Le nom est requis"),
        prenom: yup.string().required("Le prénom est requis"),
        adresse: yup.string().required("L'adresse est requise"),
        naissanceDate: yup.date()
            .required("La date de naissance est requise")
            .nullable()
            .max(new Date(), "La date de naissance ne peut pas être dans le futur") // Ensure the date is not in the future
            .test("age", "L'âge doit être d'au moins 18 ans", (value) => {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const m = today.getMonth() - value.getMonth();
                // Check if the person is at least 18 years old
                return age > 18 || (age === 18 && m >= 0);
            }), // Ensure date is valid and required
    });

    const UpdatePP = () => {
        const theme = useTheme();
        const colors = tokens(theme.palette.mode);
        const navigate = useNavigate();
        const { id } = useParams();
        const dispatch = useDispatch();
        const { currentPP, loadingPP, errorPP } = useSelector((state) => state.personnePhysique);

        // Set default form values; they will be updated when currentPP is loaded.
        const [initialValues, setInitialValues] = useState({
            numeroPieceIdentite: "",
            nom: "",
            prenom: "",
            adresse: "",
            typePieceId: "",
            naissanceDate: "", // Added for date
        });

        // Dispatch the action to fetch data by id on component mount
        useEffect(() => {
            if (id) {
                dispatch(getPPById(id));
            }
        }, [dispatch, id]);

        // Update initialValues once the data is loaded from the store
        useEffect(() => {
            if (currentPP) {
                setInitialValues({
                    numeroPieceIdentite: currentPP.numeroPieceIdentite,
                    nom: currentPP.nom,
                    prenom: currentPP.prenom,
                    adresse: currentPP.adresse,
                    typePieceId: currentPP.typePieceIdentite ? currentPP.typePieceIdentite.id : "", // Assuming typePieceIdentite is an object with an id
                    naissanceDate: currentPP.naissanceDate ? currentPP.naissanceDate.split("T")[0] : "", // Extract YYYY-MM-DD
                });
            }
        }, [currentPP]);


        const handleFormSubmit = async (values) => {
            const formattedValues = {
                ...values,
                naissanceDate: values.naissanceDate
                    ? new Date(values.naissanceDate).toISOString().replace("Z", "+00:00")
                    : null,
            };

            console.log("Final Date Format:", formattedValues); // Debugging
            await dispatch(updatePP(id, formattedValues, navigate));
            dispatch(getPPById(id)); // Refresh data after update
        };

        return (
            <Box m="20px" display="flex" flexDirection="column">
                {loadingPP && (
                    <div className="loader-overlay">
                        <div className="loader"></div>
                    </div>
                )}
                <Header title="Personnes Physique" subtitle="Mettre à jour la personne physique" />

                <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3, backgroundColor: `${colors.primary[900]}` }}>
                    <CardContent>
                        <Formik
                            enableReinitialize
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
                                            disabled
                                        >
                                            {/* Ensure MenuItems are properly populated */}
                                            {currentPP?.typePieceIdentite ? (
                                                <MenuItem value={currentPP.typePieceIdentite.id}>
                                                    {currentPP.typePieceIdentite.dsg}
                                                </MenuItem>
                                            ) : (
                                                <MenuItem value="">Aucune donnée</MenuItem>
                                            )}
                                        </TextField>
                                    </Box>

                                    {/* Numero Piece Identite (disabled) */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            NUMERO PIECE IDENTITE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Numéro de pièce d'identité"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.numeroPieceIdentite}
                                            name="numeroPieceIdentite"
                                            error={!!touched.numeroPieceIdentite && !!errors.numeroPieceIdentite}
                                            helperText={touched.numeroPieceIdentite && errors.numeroPieceIdentite}
                                            disabled
                                        />
                                    </Box>

                                    {/* Date of Birth (naissanceDate) */}


                                    {/* Other Fields */}
                                    {Object.keys(initialValues)
                                        .filter((field) => field !== "typePieceId" && field !== "numeroPieceIdentite" && field !== "naissanceDate")
                                        .map((field) => (
                                            <Box key={field}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="text"
                                                    placeholder={`Entrez ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    value={values[field]}
                                                    name={field}
                                                    error={!!touched[field] && !!errors[field]}
                                                    helperText={touched[field] && errors[field]}
                                                />
                                            </Box>
                                        ))}

                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE DE NAISSANCE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date" // Ensuring this is a date input
                                            placeholder="Date de naissance"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.naissanceDate}
                                            name="naissanceDate"
                                            error={!!touched.naissanceDate && !!errors.naissanceDate}
                                            helperText={touched.naissanceDate && errors.naissanceDate}
                                            InputLabelProps={{
                                                shrink: true, // Ensures the label is always visible
                                            }}

                                        />
                                    </Box>
                                    {/* Submit and Archive Buttons */}
                                    <Box display="flex" justifyContent="center" gap="10px" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100]}}
                                        >
                                            Soumettre
                                        </Button>

                                    </Box>
                                </form>
                            )}
                        </Formik>

                        {errorPP && <Typography color="error">{errorPP}</Typography>}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    export default UpdatePP;
