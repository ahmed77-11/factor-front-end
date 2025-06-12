import React, { useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    MenuItem,
    useTheme, Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { addDemfinAsync } from "../../redux/demFin/demFinSlice.js";
import {useNavigate} from "react-router-dom";

// --- RIB validation helper (mod 97) ---
const validerRib = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, ""); // keep only digits
    if (digits.length !== 20) return false;
    try {
        const base = BigInt(digits.slice(0, 18) + "00");
        const key = BigInt(digits.slice(18));
        return 97n - (base % 97n) === key;
    } catch {
        return false;
    }
};

// --- List of banques ---
const banques = [
    { code: "05", nom: "Banque de Tunisie" },
    { code: "10", nom: "STB" },
    { code: "08", nom: "BIAT" },
    { code: "07", nom: "Amen Bank" },
    { code: "11", nom: "UBCI" },
];

// --- initialValues now include bankCode + ribSuffix instead of adherRib directly ---
const initialValues = {
    contrat: null,
    adherEmisNo: "",
    adherEmisDate: "",
    bankCode: "",
    ribSuffix: "",
    adherMontant: "",
    devise: null,
    adherLibelle: "",
    adherInfoLibre: "",
};

// — Reusable date validator —
const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, original) => (original === "" ? null : value))
        .typeError(invalidMsg);

// --- Validation schema with combined RIB logic ---
const validationSchema = yup.object().shape({
    contrat: yup.object().required("Le contrat est requis"),
    adherEmisNo: yup.string().required("Numéro de fin adhérent émis requis"),
    adherEmisDate: dateField("Date invalide")
        .required("Date fin adhérent émis requise")
        .max(new Date(), "La date ne peut pas être dans le futur"),
    bankCode: yup.string().required("Choisir une banque"),
    ribSuffix: yup
        .string()
        .required("Le suffixe RIB est requis")
        .matches(/^\d{18}$/, "Le suffixe RIB doit contenir exactement 18 chiffres")
        .test("combined-valid-rib", "RIB invalide", function (suffix) {
            const { bankCode } = this.parent;
            if (!bankCode || suffix == null) return false;
            return validerRib(bankCode + suffix);
        }),
    adherMontant: yup
        .number()
        .typeError("Le montant doit être un nombre")
        .required("Le montant fin adhérent est requis"),
    devise: yup.object().required("La devise est requise"),
    adherLibelle: yup.string().required("Libellé requis"),
    adherInfoLibre: yup.string().optional(),
});

const AddDemFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { contrats } = useSelector((state) => state.contrat);
    const {loading,error} = useSelector((state) => state.demFin);

    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

    useEffect(() => {
        dispatch(fetchContratsSigner());
    }, [dispatch]);

    const handleFormSubmit = (values, { resetForm }) => {
        // Build full 20-digit RIB
        const fullRib = values.bankCode + values.ribSuffix;

        const payload = {
            contrat: values.contrat,
            adherEmisNo: values.adherEmisNo,
            adherEmisDate: values.adherEmisDate,
            adherRib: fullRib,
            adherMontant: values.adherMontant,
            devise: values.devise,
            adherLibelle: values.adherLibelle,
            adherInfoLibre: values.adherInfoLibre,
        };

        console.log("📦 Données soumises :", payload);
        dispatch(addDemfinAsync(payload));
        // Redirect to Demande de financement list after successful submission
        navigate("/financement");
        resetForm();
    };

    const focusStyles = {
        '& .Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${colors.primary[100]} !important`,
                borderWidth: '2px !important'
            },
            '& .MuiInputLabel-root': {
                color: `${colors.primary[100]} !important`,
                fontWeight: 'bold'
            },

        }
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            <Header
                title="Demande de financement"
                subtitle="Ajouter une demande de financement"
            />
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Card
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    boxShadow: 5,
                    borderRadius: 3,
                    p: 3,
                    backgroundColor: `${colors.primary[900]}`,
                }}
            >
                <CardContent>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
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
                                {error && (
                                    <Box  my={2}>
                                        <Alert  severity="error" sx={{fontSize:"14px"}}>
                                            {error || "Une erreur s'est produite lors de la création de la personne physique !"}
                                        </Alert>
                                    </Box>
                                )}
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Contrat */}
                                    <TextField
                                        select
                                        label="Numéro Contrat"
                                        name="contrat"
                                        fullWidth
                                        value={values.contrat?.contratNo || ""}
                                        onChange={(e) => {
                                            const contratObj = contrats.find(
                                                (c) => c.contratNo === e.target.value
                                            );
                                            setFieldValue("contrat", contratObj);
                                            setFieldValue("devise", contratObj.devise);
                                        }}
                                        onBlur={handleBlur}
                                        error={touched.contrat && !!errors.contrat}
                                        helperText={touched.contrat && errors.contrat?.contratNo}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize,color: colors.primary[100] },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}

                                    >
                                        {contrats.map((contrat) => (
                                            <MenuItem key={contrat.id} value={contrat.contratNo}>
                                                {contrat.contratNo}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {/* Emission No */}
                                    <TextField
                                        label="Financement Adhérent Numéro d'Émission"
                                        name="adherEmisNo"
                                        fullWidth
                                        value={values.adherEmisNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherEmisNo && !!errors.adherEmisNo}
                                        helperText={touched.adherEmisNo && errors.adherEmisNo}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100]},
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                    />

                                    {/* Emission Date */}
                                    <TextField
                                        label="Date de Financement Adhérent Émission"
                                        type="date"
                                        name="adherEmisDate"
                                        fullWidth
                                        value={values.adherEmisDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherEmisDate && !!errors.adherEmisDate}
                                        helperText={touched.adherEmisDate && errors.adherEmisDate}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100] },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                    />

                                    {/* Banque & RIB */}
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            select
                                            label="Banque"
                                            name="bankCode"
                                            value={values.bankCode}
                                            onChange={(e) => {
                                                const selectedBank = banques.find(
                                                    (b) => b.code === e.target.value
                                                );
                                                setFieldValue("bankCode", selectedBank.code);
                                                // Clear suffix on bank change
                                                setFieldValue("ribSuffix", "");
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.bankCode && !!errors.bankCode}
                                            helperText={touched.bankCode && errors.bankCode}
                                            sx={{ minWidth: "180px", flexShrink: 0,...focusStyles }}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                        >
                                            {banques.map((bank) => (
                                                <MenuItem key={bank.code} value={bank.code}>
                                                    {bank.nom}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            label="RIB Financement Adhérent (20 chiffres)"
                                            name="ribSuffix"
                                            fullWidth
                                            value={values.ribSuffix}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.ribSuffix && !!errors.ribSuffix}
                                            helperText={
                                                touched.ribSuffix && errors.ribSuffix
                                                    ? errors.ribSuffix
                                                    : values.bankCode
                                                        ? ``
                                                        : ""
                                            }
                                            InputProps={{
                                                startAdornment: (
                                                    <Box
                                                        sx={{
                                                            px: "8px",
                                                            borderRight: "1px solid rgba(0,0,0,0.23)",
                                                            mr: "8px",
                                                            fontSize: inputFontSize,
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {values.bankCode || "--"}
                                                    </Box>
                                                ),
                                                inputMode: "numeric",
                                                style: { fontSize: inputFontSize },
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{...focusStyles}}
                                            placeholder="18 chiffres restants"
                                        />
                                    </Box>

                                    {/* Montant */}
                                    <TextField
                                        label="Montant Financement Adhérent"
                                        name="adherMontant"
                                        fullWidth
                                        value={values.adherMontant}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherMontant && !!errors.adherMontant}
                                        helperText={touched.adherMontant && errors.adherMontant}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100] },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                    />

                                    {/* Devise (read-only) */}
                                    <TextField
                                        label="Devise"
                                        name="devise"
                                        fullWidth
                                        value={values.devise?.dsg || ""}
                                        InputProps={{
                                            readOnly: true,
                                            style: { fontSize: inputFontSize },
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100] },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                        error={touched.devise && !!errors.devise}
                                        helperText={touched.devise && errors.devise?.dsg}
                                    />

                                    {/* Libellé */}
                                    <TextField
                                        label="Libellé"
                                        name="adherLibelle"
                                        fullWidth
                                        value={values.adherLibelle}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherLibelle && !!errors.adherLibelle}
                                        helperText={touched.adherLibelle && errors.adherLibelle}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100]},
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                    />

                                    {/* Info Libre */}
                                    <TextField
                                        label="Info Libre"
                                        name="adherInfoLibre"
                                        fullWidth
                                        value={values.adherInfoLibre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherInfoLibre && !!errors.adherInfoLibre}
                                        helperText={touched.adherInfoLibre && errors.adherInfoLibre}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize, color: colors.primary[100] },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        sx={{...focusStyles}}
                                    />

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                        >
                                            Ajouter une demande
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

export default AddDemFin;
