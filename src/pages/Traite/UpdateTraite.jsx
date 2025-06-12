import  { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getTraiteById, updateTraite } from "../../redux/traite/traiteSlice.js";
import { fetchAdherentsAsync, fetchAcheteursAsync, fetchAdherentsByAcheteur } from "../../redux/relations/relationsSlice.js";
import { fetchContratByAdherentIdAsync } from "../../redux/contrat/ContratSlice.js";

// --- RIB validation helper (mod 97) ---
const validerRib = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, ""); // Keep only digits
    if (digits.length !== 20) return false;
    try {
        const base = BigInt(digits.slice(0, 18) + "00");
        const key = BigInt(digits.slice(18));
        return 97n - (base % 97n) === key;
    } catch (e) {
        console.log(e)
        return false;
    }
};

// --- List of banques ---
const banques = [
    { code: "01", nom: "Banque de Tunisie" },
    { code: "02", nom: "STB" },
    { code: "03", nom: "BIAT" },
    { code: "10", nom: "Amen Bank" },
    { code: "20", nom: "UBCI" },
];

// --- Reusable date field validator ---
const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, original) => (original === "" ? null : value))
        .typeError(invalidMsg);

// --- Validation schema with bankCode + ribSuffix ---
const validationSchema = yup.object().shape({
    factorDate: dateField("Date factor invalide").required("Date factor requise"),
    numero: yup.string().required("Le numéro est requis"),
    tireEmisDate: dateField("Date tire émis invalide").required("Date tire émis requise"),
    tireEmisLieu: yup.string().required("Lieu tire émis requis"),
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
    tireNom: yup.string().required("Nom du tire requis"),
    adherFactorCode: yup.string().required("Code adhérent requis"),
    achetFactorCode: yup.string(),
    montant: yup.number().typeError("Le montant doit être un nombre").required("Le montant est requis"),
    // devise is taken from currentTraite.devise, so we don’t validate it here
    echFirst: dateField("Date 1ère échéance invalide").required("Date 1ère échéance requise"),
});

const UpdateTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentTraite, loadingTraite, errorTraite } = useSelector((state) => state.traite);
    const { currentContrat } = useSelector((state) => state.contrat);
    const reduxAdherents = useSelector((state) => state.relations.adherents);
    const { acheteurs } = useSelector((state) => state.relations);

    const [initialValues, setInitialValues] = useState({
        factorDate: "",
        numero: "",
        tireEmisDate: "",
        tireEmisLieu: "",
        bankCode: "",
        ribSuffix: "",
        tireNom: "",
        adherFactorCode: "",
        achetFactorCode: "",
        montant: "",
        echFirst: "",
    });

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchAcheteursAsync());
    }, [dispatch]);

    // Fetch the traite by ID when component mounts
    useEffect(() => {
        if (id) {
            dispatch(getTraiteById(id));
        }
    }, [id, dispatch]);

    // When currentTraite is loaded, split tireRib into bankCode + ribSuffix
    useEffect(() => {
        if (currentTraite) {
            const rib = currentTraite.tireRib || "";
            const bankCode = rib.slice(0, 2) || "";
            const ribSuffix = rib.slice(2) || "";
            setInitialValues({
                factorDate: currentTraite.factorDate?.split("T")[0] || "",
                numero: currentTraite.numero || "",
                tireEmisDate: currentTraite.tireEmisDate?.split("T")[0] || "",
                tireEmisLieu: currentTraite.tireEmisLieu || "",
                bankCode,
                ribSuffix,
                tireNom: currentTraite.tireNom || "",
                adherFactorCode: currentTraite.adherFactorCode || "",
                achetFactorCode: currentTraite.achetFactorCode || "",
                montant: currentTraite.montant || "",
                echFirst: currentTraite.echFirst?.split("T")[0] || "",
            });
        }
    }, [currentTraite]);

    // When adherent changes, fetch contract
    const getContratIdByAdherent = (adhrId) => {
        if (adhrId) {
            dispatch(fetchContratByAdherentIdAsync(adhrId));
        }
    };

    // Combine acheteurs lists
    const combinedAcheteurs =
        acheteurs && (acheteurs.pps || acheteurs.pms)
            ? [...(acheteurs.pps || []), ...(acheteurs.pms || [])]
            : [];

    const handleFormSubmit = (values, { resetForm }) => {
        // Build full 20-digit RIB
        const fullRib = values.bankCode + values.ribSuffix;

        // Payload includes the concatenated tireRib, plus the original devise & contrat & id
        const payload = {
            id: currentTraite?.id,
            factorDate: values.factorDate,
            numero: values.numero,
            tireEmisDate: values.tireEmisDate,
            tireEmisLieu: values.tireEmisLieu,
            tireRib: fullRib,
            tireNom: values.tireNom,
            adherFactorCode: values.adherFactorCode,
            achetFactorCode: values.achetFactorCode,
            montant: values.montant,
            devise: currentTraite?.devise, // keep existing devise
            contrat: currentTraite?.contrat,
            echFirst: values.echFirst,
        };

        console.log("📦 Payload mise à jour :", payload);
        dispatch(updateTraite(id, payload, navigate));
        resetForm();
    };

    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

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

            <Header title="Traite" subtitle="Modifier une traite" />
            {loadingTraite && (
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
                              handleBlur,
                              handleChange,
                              handleSubmit,
                              setFieldValue,
                          }) => (
                            <form onSubmit={handleSubmit}>
                                {errorTraite && (
                                    <Box  my={2}>
                                        <Alert  severity="error" sx={{fontSize:"14px"}}>
                                            {errorTraite || "Une erreur s'est produite lors de la création de la personne physique !"}
                                        </Alert>
                                    </Box>
                                )}
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Date Factor */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE FACTOR
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="factorDate"
                                            value={values.factorDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.factorDate && !!errors.factorDate}
                                            helperText={touched.factorDate && errors.factorDate}

                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize, color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Numéro Traite */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            NUMÉRO TRAITE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="numero"
                                            value={values.numero}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.numero && !!errors.numero}
                                            helperText={touched.numero && errors.numero}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}


                                        />
                                    </Box>

                                    {/* Date Tire Émis */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE TIRE ÉMIS
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="tireEmisDate"
                                            value={values.tireEmisDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisDate && !!errors.tireEmisDate}
                                            helperText={touched.tireEmisDate && errors.tireEmisDate}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize, color: colors.primary[100] } }}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}

                                        />
                                    </Box>

                                    {/* Lieu Tire Émis */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            LIEU TIRE ÉMIS
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="tireEmisLieu"
                                            value={values.tireEmisLieu}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisLieu && !!errors.tireEmisLieu}
                                            helperText={touched.tireEmisLieu && errors.tireEmisLieu}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}

                                        />
                                    </Box>

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
                                                setFieldValue("ribSuffix", "");
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.bankCode && !!errors.bankCode}
                                            helperText={touched.bankCode && errors.bankCode}
                                            sx={{ minWidth: "180px", flexShrink: 0, ...focusStyles }}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}

                                        >
                                            {banques.map((bank) => (
                                                <MenuItem key={bank.code} value={bank.code}>
                                                    {bank.nom}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        {/* 2) RIB unique field: prefix bankCode + 18 digits */}
                                        <TextField
                                            label="RIB du Tire (20 chiffres)"
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
                                                        ? `Préfixe : ${values.bankCode}`
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
                                                style: { fontSize: labelFontSize,color: colors.primary[100]},
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            placeholder="18 chiffres restants"
                                            sx={{...focusStyles}}
                                        />
                                    </Box>
                                    {/* ──────────────────────────────────────── */}

                                    {/* Nom du Tire */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            NOM DU TIRE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="tireNom"
                                            value={values.tireNom}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireNom && !!errors.tireNom}
                                            helperText={touched.tireNom && errors.tireNom}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Code Adhérent */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            CODE ADHÉRENT
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="adherFactorCode"
                                            value={values.adherFactorCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("achetFactorCode", "");
                                                setFieldValue("ribSuffix", values.ribSuffix || "");
                                                getContratIdByAdherent(e.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.adherFactorCode && !!errors.adherFactorCode}
                                            helperText={touched.adherFactorCode && errors.adherFactorCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Code Acheteur */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            CODE ACHETEUR
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="achetFactorCode"
                                            value={values.achetFactorCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("adherFactorCode", "");
                                                setFieldValue("ribSuffix", values.ribSuffix || "");
                                                dispatch(fetchAdherentsByAcheteur(e.target.value));
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.achetFactorCode && !!errors.achetFactorCode}
                                            helperText={touched.achetFactorCode && errors.achetFactorCode}
                                            disabled={!!values.adherFactorCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Montant */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            MONTANT
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="number"
                                            name="montant"
                                            value={values.montant}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.montant && !!errors.montant}
                                            helperText={touched.montant && errors.montant}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Devise (disabled) */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DEVISE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="devise"
                                            value={currentTraite?.devise?.dsg || ""}
                                            disabled
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    {/* Date 1ère Échéance */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE 1ÈRE ÉCHÉANCE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="echFirst"
                                            value={values.echFirst}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.echFirst && !!errors.echFirst}
                                            helperText={touched.echFirst && errors.echFirst}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize, color: colors.primary[100] } }}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{...focusStyles}}
                                        />
                                    </Box>

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Soumettre
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>

                    {errorTraite && <Typography color="error">{errorTraite}</Typography>}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateTraite;
