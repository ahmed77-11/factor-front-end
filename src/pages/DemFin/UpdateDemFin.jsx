import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    MenuItem,
    useTheme, Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { demFinByIdAsync, updateDemFinAsync } from "../../redux/demFin/demFinSlice.js";

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

// — Reusable date validator —
const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, original) => (original === "" ? null : value))
        .typeError(invalidMsg);

// --- Validation schema with bankCode + ribSuffix fields ---
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
        .matches(/^\d{18}$/, "Le suffixe RIB doit contenir exactement 18 chiffres")
        .test("combined-valid-rib", "RIB invalide", function (suffix) {
            const { bankCode } = this.parent;
            if (!bankCode || suffix == null) return false;
            return validerRib(bankCode + suffix);
        }),
    adherMontant: yup
        .number()
        .typeError("Le montant doit être un nombre")
        .required("Le montant est requis"),
    devise: yup.object().required("La devise est requise"),
    adherLibelle: yup.string().required("Libellé requis"),
    adherInfoLibre: yup.string().optional(),
});

const UpdateDemFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentDemfin,loading,error } = useSelector((state) => state.demFin);

    // We need local state for bankCode and ribSuffix to split adherRib
    const [initialValues, setInitialValues] = useState({
        contrat: {},
        adherEmisNo: "",
        adherEmisDate: "",
        bankCode: "",
        ribSuffix: "",
        adherMontant: "",
        devise: {},
        adherLibelle: "",
        adherInfoLibre: "",
    });

    useEffect(() => {
        dispatch(demFinByIdAsync(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentDemfin) {
            // Split adherRib into bankCode (first 2) and ribSuffix (remaining 18)
            const rib = currentDemfin.adherRib || "";
            const bankCode = rib.slice(0, 2) || "";
            const ribSuffix = rib.slice(2) || "";

            setInitialValues({
                contrat: currentDemfin.contrat || {},
                adherEmisNo: currentDemfin.adherEmisNo || "",
                adherEmisDate: currentDemfin.adherEmisDate?.split("T")[0] || "",
                bankCode,
                ribSuffix,
                adherMontant: currentDemfin.adherMontant || "",
                devise: currentDemfin.devise || {},
                adherLibelle: currentDemfin.adherLibelle || "",
                adherInfoLibre: currentDemfin.adherInfoLibre || "",
            });
        }
    }, [currentDemfin]);

    const handleFormSubmit = (values, { resetForm }) => {
        // Build full 20-digit RIB
        const fullRib = values.bankCode + values.ribSuffix;

        // Construct payload with updated adherRib
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

        console.log("✅ Données modifiées :", payload);
        dispatch(updateDemFinAsync(id, payload, navigate));
        resetForm();
    };

    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

    return (
        <Box m="20px">
            <Header
                title="Modifier Demande"
                subtitle="Modifier une demande de financement"
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
                        enableReinitialize
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
                                    {/* CONTRAT */}
                                    <TextField
                                        label="Contrat"
                                        name="contrat"
                                        fullWidth
                                        value={values.contrat?.contratNo || ""}
                                        onClick={() =>
                                            alert("Remplacez par un sélecteur de contrat si nécessaire")
                                        }
                                        InputProps={{
                                            style: { fontSize: inputFontSize },
                                            readOnly: true,
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        error={touched.contrat && Boolean(errors.contrat)}
                                        helperText={touched.contrat && errors.contrat?.contratNo}
                                    />

                                    {/* Emission No */}
                                    <TextField
                                        label="Financement Adhérent Numéro d'Émission"
                                        name="adherEmisNo"
                                        fullWidth
                                        value={values.adherEmisNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherEmisNo && Boolean(errors.adherEmisNo)}
                                        helperText={touched.adherEmisNo && errors.adherEmisNo}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
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
                                        error={touched.adherEmisDate && Boolean(errors.adherEmisDate)}
                                        helperText={touched.adherEmisDate && errors.adherEmisDate}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                    />

                                    {/* ── BANQUE + RIB FIELDS ── */}
                                    <Box display="flex" gap={2}>
                                        {/* 1) Sélecteur Banque (2 digits) */}
                                        <TextField
                                            select
                                            label="Banque"
                                            name="bankCode"
                                            value={values.bankCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Clear suffix when bank changes
                                                setFieldValue("ribSuffix", "");
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.bankCode && !!errors.bankCode}
                                            helperText={touched.bankCode && errors.bankCode}
                                            sx={{ minWidth: "180px", flexShrink: 0 }}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize },
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

                                        {/* 2) RIB unique field: prefix bankCode + 18 digits */}
                                        <TextField
                                            label="RIB Financement Adhérent (20 chiffres)"
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
                                                style: { fontSize: labelFontSize },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            placeholder="18 chiffres restants"
                                        />
                                    </Box>
                                    {/* ──────────────────────────────────────── */}

                                    {/* Montant */}
                                    <TextField
                                        label="Montant Financement Adhérent"
                                        name="adherMontant"
                                        fullWidth
                                        value={values.adherMontant}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherMontant && Boolean(errors.adherMontant)}
                                        helperText={touched.adherMontant && errors.adherMontant}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                    />

                                    {/* DEVISE (read-only) */}
                                    <TextField
                                        label="Devise"
                                        name="devise"
                                        fullWidth
                                        value={values.devise?.codeAlpha || ""}
                                        onClick={() =>
                                            alert("Remplacez par un sélecteur de devise si nécessaire")
                                        }
                                        InputProps={{
                                            readOnly: true,
                                            style: { fontSize: inputFontSize },
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                        error={touched.devise && Boolean(errors.devise)}
                                        helperText={touched.devise && errors.devise?.codeAlpha}
                                    />

                                    {/* Libellé */}
                                    <TextField
                                        label="Libellé"
                                        name="adherLibelle"
                                        fullWidth
                                        value={values.adherLibelle}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherLibelle && Boolean(errors.adherLibelle)}
                                        helperText={touched.adherLibelle && errors.adherLibelle}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                    />

                                    {/* Info Libre */}
                                    <TextField
                                        label="Info Libre"
                                        name="adherInfoLibre"
                                        fullWidth
                                        value={values.adherInfoLibre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherInfoLibre && Boolean(errors.adherInfoLibre)}
                                        helperText={touched.adherInfoLibre && errors.adherInfoLibre}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { fontSize: labelFontSize },
                                        }}
                                        FormHelperTextProps={{
                                            style: { fontSize: helperFontSize },
                                        }}
                                    />

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                        >
                                            Modifier la demande
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

export default UpdateDemFin;
