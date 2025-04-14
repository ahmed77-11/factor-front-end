import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPPById, updatePP } from "../../../redux/personne/PersonnePhysiqueSlice.js";
import { tokens } from "../../../theme.js";

// Define all possible role options
const roleOptions = [
    "ACHETEUR",
    "FOURNISSEUR",
    "CONTACT"
];

// Updated validation schema
const validationSchema = yup.object().shape({
    numeroPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
    nom: yup.string().required("Le nom est requis"),
    prenom: yup.string().required("Le prénom est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
    naissanceDate: yup.date()
        .required("La date de naissance est requise")
        .nullable()
        .max(new Date(), "La date de naissance ne peut pas être dans le futur")
        .test("age", "L'âge doit être d'au moins 18 ans", (value) => {
            if (!value) return false;
            const today = new Date();
            const age = today.getFullYear() - value.getFullYear();
            const m = today.getMonth() - value.getMonth();
            return age > 18 || (age === 18 && m >= 0);
        }),
    indviduRoles: yup.array()
        .min(1, "Au moins un rôle doit être sélectionné")
        .required("Les rôles sont requis"),
});

const UpdatePP = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentPP, loadingPP, errorPP } = useSelector((state) => state.personnePhysique);

    const [initialValues, setInitialValues] = useState({
        numeroPieceIdentite: "",
        nom: "",
        prenom: "",
        adresse: "",
        typePieceId: "",
        naissanceDate: "",
        indviduRoles: []
    });

    // Fetch PP data
    useEffect(() => {
        if (id) {
            dispatch(getPPById(id));
        }
    }, [dispatch, id]);

    // Update initial values when currentPP is fetched
    useEffect(() => {
        if (currentPP) {
            setInitialValues({
                numeroPieceIdentite: currentPP.numeroPieceIdentite,
                nom: currentPP.nom,
                prenom: currentPP.prenom,
                adresse: currentPP.adresse,
                typePieceId: currentPP.typePieceIdentite?.id || "",
                naissanceDate: currentPP.naissanceDate ? currentPP.naissanceDate.split("T")[0] : "",
                indviduRoles: currentPP.indviduRoles || []
            });
        }
    }, [currentPP]);

    const handleFormSubmit = (values) => {
        const formattedValues = {
            ...values,
            naissanceDate: values.naissanceDate
                ? new Date(values.naissanceDate).toISOString().replace("Z", "+00:00")
                : null,
        };

        dispatch(updatePP(id, formattedValues, navigate));
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingPP && <Typography>Chargement...</Typography>}
            <Header title="Personne Physique" subtitle="Modifier" />

            <Card sx={{
                width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3,
                backgroundColor: `${colors.primary[900]}`
            }}>
                <CardContent>
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* TYPE PIECE IDENTITE */}
                                    <Box key="typePieceId">
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
                                            {currentPP?.typePieceIdentite ? (
                                                <MenuItem value={currentPP.typePieceIdentite.id}>
                                                    {currentPP.typePieceIdentite.dsg}
                                                </MenuItem>
                                            ) : (
                                                <MenuItem value="">Aucune donnée</MenuItem>
                                            )}
                                        </TextField>
                                    </Box>

                                    {/* ROLES */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            RÔLES
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected) => selected.join(', '),
                                            }}
                                            variant="outlined"
                                            name="indviduRoles"
                                            value={values.indviduRoles}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.indviduRoles && !!errors.indviduRoles}
                                            helperText={touched.indviduRoles && errors.indviduRoles}
                                        >
                                            {roleOptions.map((role) => (
                                                <MenuItem key={role} value={role}>
                                                    {role}
                                                </MenuItem>
                                            ))}
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

                                    {/* Date of Birth */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE DE NAISSANCE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            placeholder="Date de naissance"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.naissanceDate}
                                            name="naissanceDate"
                                            error={!!touched.naissanceDate && !!errors.naissanceDate}
                                            helperText={touched.naissanceDate && errors.naissanceDate}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>

                                    {/* Other Fields */}
                                    {['nom', 'prenom', 'adresse'].map((field) => (
                                        <Box key={field}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {field.toUpperCase()}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                type="text"
                                                placeholder={`Entrez ${field}`}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values[field]}
                                                name={field}
                                                error={!!touched[field] && !!errors[field]}
                                                helperText={touched[field] && errors[field]}
                                            />
                                        </Box>
                                    ))}

                                    {/* Submit button */}
                                    <Box display="flex" justifyContent="center" gap="10px" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{ borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}
                                        >
                                            Soumettre
                                        </Button>
                                    </Box>
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