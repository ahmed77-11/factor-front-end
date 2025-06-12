import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    MenuItem,
    Grid,
    useTheme, Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { demFinByIdAsync, acceptDemFinAsync } from "../../redux/demFin/demFinSlice.js";
import { getAllTraitesByContrat } from "../../redux/traite/traiteSlice.js";

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
    { code: "01", nom: "Banque de Tunisie" },
    { code: "02", nom: "STB" },
    { code: "03", nom: "BIAT" },
    { code: "10", nom: "Amen Bank" },
    { code: "20", nom: "UBCI" },
];

// — Reusable date validator —
const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, original) => (original === "" ? null : value))
        .typeError(invalidMsg);

// --- Validation schema with bankCode + ribSuffix fields ---
const validationSchema = yup.object().shape({
    factorExecNo: yup.string().required("Champ obligatoire"),
    factorExecDate: dateField("Date invalide")
        .required("Champ obligatoire")
        .max(new Date(), "La date ne peut pas être dans le futur"),
    factorTypeInstrument: yup.string().required("Champ obligatoire"),
    factorInstrumentNo: yup.string().required("Champ obligatoire"),
    bankCode: yup.string().required("Code banque requis"),
    ribSuffix: yup
        .string()
        .required("Suffixe RIB requis")
        .matches(/^\d{18}$/, "Le suffixe RIB doit contenir exactement 18 chiffres")
        .test("combined-valid-rib", "RIB invalide", function (suffix) {
            const { bankCode } = this.parent;
            if (!bankCode || suffix == null) return false;
            return validerRib(bankCode + suffix);
        }),
    factorMontant: yup
        .number()
        .typeError("Le montant doit être un nombre")
        .required("Champ obligatoire")
        .positive("Doit être positif")
        .min(0.01, "Doit être supérieur à 0.01"),
    factorLibelle: yup.string().required("Champ obligatoire"),
    factorInfoLibre: yup.string().required("Champ obligatoire"),
});

const AcceptDemFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    const { currentDemfin, loading: loadCDfin,error:errCDfin } = useSelector((state) => state.demFin);
    const { traites, loading: loadTraites } = useSelector((state) => state.traite);

    // Local state to split existing factorRib into bankCode & suffix
    const [initialValues, setInitialValues] = useState({
        factorExecNo: "",
        factorExecDate: "",
        factorTypeInstrument: "",
        factorInstrumentNo: "",
        bankCode: "",
        ribSuffix: "",
        factorMontant: "",
        factorLibelle: "",
        factorInfoLibre: "",
    });

    useEffect(() => {
        dispatch(demFinByIdAsync(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentDemfin && !loadCDfin) {
            // Fetch related traites if needed
            dispatch(getAllTraitesByContrat(currentDemfin.contrat?.id));
            // Split factorRib into bankCode and ribSuffix
            const rib = currentDemfin.factorRib || "";
            const bankCode = rib.slice(0, 2) || "";
            const ribSuffix = rib.slice(2) || "";
            setInitialValues({
                factorExecNo: "",
                factorExecDate: "",
                factorTypeInstrument: "",
                factorInstrumentNo: "",
                bankCode,
                ribSuffix,
                factorMontant: currentDemfin.factorMontant || "",
                factorLibelle: currentDemfin.factorLibelle || "",
                factorInfoLibre: currentDemfin.factorInfoLibre || "",
            });
        }
    }, [currentDemfin, loadCDfin, dispatch]);

    const handleFormSubmit = (values) => {
        // Build full 20-digit RIB
        const fullRib = values.bankCode + values.ribSuffix;

        const payload = {
            factorExecNo: values.factorExecNo,
            factorExecDate: values.factorExecDate,
            factorTypeInstrument: values.factorTypeInstrument,
            factorInstrumentNo: values.factorInstrumentNo,
            factorRib: fullRib,
            factorMontant: values.factorMontant,
            factorLibelle: values.factorLibelle,
            factorInfoLibre: values.factorInfoLibre,
        };

        dispatch(acceptDemFinAsync(id, payload));
        navigate("/financement");
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
        <Box m="20px">
            <Header
                subtitle="Demande De Financement"
                title="Acceptation d'une Demande de Financement"
            />
            {loadCDfin && (
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
                    backgroundColor: colors.grey[700],
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
                                {errCDfin && (
                                    <Box  my={2}>
                                        <Alert  severity="error" sx={{fontSize:"14px"}}>
                                            {errCDfin || "Une erreur s'est produite lors de la création de la personne physique !"}
                                        </Alert>
                                    </Box>
                                )}
                                <Grid container spacing={2}>
                                    {/* Numéro d'exécution */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Numéro d'exécution"
                                            name="factorExecNo"
                                            fullWidth
                                            value={values.factorExecNo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.factorExecNo && Boolean(errors.factorExecNo)}
                                            helperText={touched.factorExecNo && errors.factorExecNo}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Date d'exécution */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Date d'exécution"
                                            type="date"
                                            name="factorExecDate"
                                            fullWidth
                                            value={values.factorExecDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.factorExecDate && Boolean(errors.factorExecDate)}
                                            helperText={touched.factorExecDate && errors.factorExecDate}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize,color: colors.primary[100] } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Type d'instrument */}
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            label="Type d'instrument"
                                            name="factorTypeInstrument"
                                            fullWidth
                                            value={values.factorTypeInstrument}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("factorInstrumentNo", "");
                                            }}
                                            onBlur={handleBlur}
                                            error={
                                                touched.factorTypeInstrument &&
                                                Boolean(errors.factorTypeInstrument)
                                            }
                                            helperText={
                                                touched.factorTypeInstrument && errors.factorTypeInstrument
                                            }
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        >
                                            <MenuItem value="CHEQUE">Chèque</MenuItem>
                                            <MenuItem value="VIREMENT">Virement</MenuItem>
                                            <MenuItem value="TRAITE">Traite</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {/* Numéro d'instrument */}
                                    <Grid item xs={12}>
                                        {values.factorTypeInstrument === "TRAITE" ? (
                                            <TextField
                                                select
                                                label="Numéro de traite"
                                                name="factorInstrumentNo"
                                                fullWidth
                                                value={values.factorInstrumentNo}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                    touched.factorInstrumentNo &&
                                                    Boolean(errors.factorInstrumentNo)
                                                }
                                                helperText={
                                                    touched.factorInstrumentNo && errors.factorInstrumentNo
                                                }
                                                InputProps={{ style: { fontSize: inputFontSize } }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    style: { fontSize: labelFontSize, color: colors.primary[100] },
                                                }}
                                                FormHelperTextProps={{
                                                    style: { fontSize: helperFontSize },
                                                }}
                                                sx={{...focusStyles}}

                                            >
                                                {traites?.map((traite) => (
                                                    <MenuItem key={traite.id} value={traite.numero}>
                                                        {traite.numero}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <TextField
                                                label="Numéro d'instrument"
                                                name="factorInstrumentNo"
                                                fullWidth
                                                value={values.factorInstrumentNo}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                    touched.factorInstrumentNo &&
                                                    Boolean(errors.factorInstrumentNo)
                                                }
                                                helperText={
                                                    touched.factorInstrumentNo && errors.factorInstrumentNo
                                                }
                                                InputProps={{ style: { fontSize: inputFontSize } }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    style: { fontSize: labelFontSize, color: colors.primary[100] },
                                                }}
                                                FormHelperTextProps={{
                                                    style: { fontSize: helperFontSize },
                                                }}
                                                sx={{ ...focusStyles }}
                                            />
                                        )}
                                    </Grid>

                                    {/* Banque & RIB */}
                                    <Grid item xs={12} sm={1}>
                                        <TextField
                                            select
                                            label="Banque"
                                            name="bankCode"
                                            fullWidth
                                            value={values.bankCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("ribSuffix", "");
                                                setFieldValue(
                                                    "factorRib",
                                                    e.target.value + (values.ribSuffix || "")
                                                );
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.bankCode && Boolean(errors.bankCode)}
                                            helperText={touched.bankCode && errors.bankCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100]},
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        >
                                            {banques.map((bank) => (
                                                <MenuItem key={bank.code} value={bank.code}>
                                                    {bank.nom}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            label="RIB"
                                            name="ribSuffix"
                                            fullWidth
                                            value={values.ribSuffix}
                                            onChange={(e) => {
                                                const suffix = e.target.value;
                                                const bankCode = values.bankCode || "";
                                                setFieldValue("ribSuffix", suffix);
                                                setFieldValue("factorRib", bankCode + suffix);
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.ribSuffix && Boolean(errors.ribSuffix)}
                                            helperText={touched.ribSuffix && errors.ribSuffix}
                                            InputProps={{
                                                startAdornment: (
                                                    <Box
                                                        sx={{
                                                            padding: "8px",
                                                            borderRight: "1px solid #ccc",
                                                            fontSize: inputFontSize,
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {values.bankCode || ""}
                                                    </Box>
                                                ),
                                                style: { fontSize: inputFontSize },
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Hidden field for complete factorRib */}
                                    <input type="hidden" name="factorRib" value={values.factorRib} />

                                    {/* Montant */}
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Montant"
                                            name="factorMontant"
                                            type="number"
                                            fullWidth
                                            value={values.factorMontant}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.factorMontant && Boolean(errors.factorMontant)}
                                            helperText={touched.factorMontant && errors.factorMontant}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Libellé */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Libellé"
                                            name="factorLibelle"
                                            fullWidth
                                            value={values.factorLibelle}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.factorLibelle && Boolean(errors.factorLibelle)}
                                            helperText={touched.factorLibelle && errors.factorLibelle}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100]},
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Information libre */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Information libre"
                                            name="factorInfoLibre"
                                            fullWidth
                                            value={values.factorInfoLibre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.factorInfoLibre && Boolean(errors.factorInfoLibre)}
                                            helperText={touched.factorInfoLibre && errors.factorInfoLibre}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100] },
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{ ...focusStyles }}
                                        />
                                    </Grid>

                                    {/* Submit button */}
                                    <Grid item xs={12} display="flex" justifyContent="center">
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                mt: 2,
                                                backgroundColor: colors.greenAccent[600],
                                                color: colors.primary[100],
                                            }}
                                        >
                                            Accepter la demande
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AcceptDemFin;
