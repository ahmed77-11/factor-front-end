import  { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdherentsAsync,
    fetchAcheteursAsync,
    fetchAdherentsByAcheteur,
} from "../../redux/relations/relationsSlice.js";
import { fetchContratByAdherentIdAsync } from "../../redux/contrat/ContratSlice.js";
import { addTraite } from "../../redux/traite/traiteSlice.js";
import { useNavigate } from "react-router-dom";

const validerRib = (value) => {
    console.log(value)
    if (!value) return false;
    const digits = value.replace(/\D/g, ""); // Keep only digits
    if (digits.length !== 20) return false;
    try {
        const base = BigInt(digits.slice(0, 18) + "00");
        const key = BigInt(digits.slice(18));
        console.log(`Base: ${base}, Key: ${key}`);
        return 97n - (base % 97n) === key;
    } catch (e) {
        console.log(e)
        return false;
    }
};

const banques = [
    { code: "01", nom: "Banque de Tunisie" },
    { code: "02", nom: "STB" },
    { code: "03", nom: "BIAT" },
    { code: "10", nom: "Amen Bank" },
    { code: "20", nom: "UBCI" },
];

const initialValues = {
    factorDate: "",
    numero: "",
    tireEmisDate: "",
    tireEmisLieu: "",
    bankCode: "",
    ribSuffix: "",
    tireNom: "",
    adherFactorCode: "",
    achetFactorCode: "",
    linkedAdherent: "",
    montant: "",
    devise: "",
    echFirst: "",
};

const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, original) => (original === "" ? null : value))
        .typeError(invalidMsg);

const validationSchema = yup.object().shape({
    factorDate: dateField("Date factor invalide")
        .required("Date factor requise")
        .max(new Date(), "La date de factor ne peut pas être dans le futur"),

    numero: yup
        .string()
        .required("Le numéro est requis")
        .length(12, "Le numéro doit contenir exactement 12 caractères"),

    tireEmisDate: dateField("Date tire émis invalide")
        .required("Date tire émis requise")
        .max(new Date(), "La date tire émis ne peut pas être dans le futur")
        .when("factorDate", {
            is: (val) => val != null,
            then: (schema) =>
                schema.min(
                    yup.ref("factorDate"),
                    "La date tire émis doit être après la date de factor"
                ),
        }),

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

    tireNom: yup
        .string()
        .required("Nom du tire requis")
        .min(5, "Le nom doit contenir au moins 5 caractères"),

    adherFactorCode: yup.string(),
    achetFactorCode: yup.string(),
    linkedAdherent: yup.string(),

    montant: yup
        .number()
        .typeError("Le montant doit être un nombre")
        .required("Le montant est requis"),

    devise: yup.string().required("La devise est requise"),

    echFirst: dateField("Date 1ère échéance invalide")
        .required("Date 1ère échéance requise")
        .min(new Date(), "La date d'échéance ne peut pas être dans le passé"),
});

const AddTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [globalAdherents, setGlobalAdherents] = useState([]);
    const reduxAdherents = useSelector((state) => state.relations.adherents);
    const { acheteurs } = useSelector((state) => state.relations);
    const { currentContrat } = useSelector((state) => state.contrat);
    const { loading,error } = useSelector((state) => state.traite);

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchAcheteursAsync());
    }, [dispatch]);

    useEffect(() => {
        if (reduxAdherents.length > 0 && globalAdherents.length === 0) {
            setGlobalAdherents(reduxAdherents);
        }
    }, [reduxAdherents, globalAdherents.length]);

    const getContratIdByAdherent = (adhrId) => {
        if (adhrId) {
            dispatch(fetchContratByAdherentIdAsync(adhrId));
        }
    };

    const combinedAcheteurs =
        acheteurs && (acheteurs.pps || acheteurs.pms)
            ? [...(acheteurs.pps || []), ...(acheteurs.pms || [])]
            : [];

    const handleFormSubmit = (values, { resetForm }) => {
        // Construct the full 20-digit RIB: bankCode (2 digits) + ribSuffix (18 digits)
        const fullRib = values.bankCode + values.ribSuffix;

        const payload = {
            ...values,
            tireRib: fullRib,
            devise: currentContrat?.devise,
            contrat: currentContrat,
        };

        console.log("📦 Données soumises :", payload);
        dispatch(addTraite(payload));

        resetForm();
        navigate("/all-traite");
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
            <Header title="Traite" subtitle="Ajouter une traite" />
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
                    backgroundColor: `${colors.grey[900]}`,
                }}
            >
                <CardContent width={"100%"}>
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
                              setFieldValue,
                          }) => {
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            useEffect(() => {
                                if (currentContrat?.devise?.dsg) {
                                    setFieldValue("devise", currentContrat.devise.dsg);
                                }
                            }, [currentContrat]);

                            return (
                                <form onSubmit={handleSubmit} >
                                    {error && (
                                        <Box  my={2}>
                                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                                {error || "Une erreur s'est produite lors de la création de la personne physique !"}
                                            </Alert>
                                        </Box>
                                    )}
                                    <Box display="flex" flexDirection="column" gap="20px" >
                                        {currentContrat && currentContrat.id && (
                                            <TextField
                                                disabled
                                                fullWidth
                                                variant="outlined"
                                                label="Numéro de contrat"
                                                value={currentContrat.contratNo}
                                                InputProps={{
                                                    readOnly: true,
                                                    style: { fontSize: inputFontSize },
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    style: { fontSize: labelFontSize,color: colors.primary[100] },
                                                }}
                                                FormHelperTextProps={{
                                                    style: { fontSize: helperFontSize },
                                                }}
                                                sx={{ mt: 1 ,...focusStyles }}
                                            />
                                        )}

                                        <TextField
                                            label="Date Factor"
                                            type="date"
                                            fullWidth
                                            name="factorDate"
                                            value={values.factorDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.factorDate && !!errors.factorDate}
                                            helperText={touched.factorDate && errors.factorDate}
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

                                        <TextField
                                            label="Numéro Traite"
                                            name="numero"
                                            fullWidth
                                            value={values.numero}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.numero && !!errors.numero}
                                            helperText={touched.numero && errors.numero}
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

                                        <TextField
                                            label="Date Tire Émis"
                                            type="date"
                                            fullWidth
                                            name="tireEmisDate"
                                            value={values.tireEmisDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisDate && !!errors.tireEmisDate}
                                            helperText={touched.tireEmisDate && errors.tireEmisDate}
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

                                        <TextField
                                            label="Lieu Tire Émis"
                                            name="tireEmisLieu"
                                            fullWidth
                                            value={values.tireEmisLieu}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisLieu && !!errors.tireEmisLieu}
                                            helperText={touched.tireEmisLieu && errors.tireEmisLieu}
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


                                        {/* ── BANQUE + RIB FIELDS ── */}
                                        <Box display="flex" gap={2}>
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
                                                label="RIB du Tire (20 chiffres)"
                                                name="ribSuffix"
                                                fullWidth
                                                value={values.ribSuffix}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                sx={{...focusStyles}}

                                                error={!!touched.ribSuffix && !!errors.ribSuffix}
                                                helperText={
                                                    touched.ribSuffix && errors.ribSuffix
                                                        ? errors.ribSuffix
                                                        : values.bankCode
                                                            ? ""
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
                                                placeholder="18 chiffres restants"
                                            />
                                        </Box>
                                        {/* ──────────────────────────────────────── */}

                                        <TextField
                                            label="Nom du Tire"
                                            name="tireNom"
                                            fullWidth
                                            value={values.tireNom}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireNom && !!errors.tireNom}
                                            helperText={touched.tireNom && errors.tireNom}
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

                                        <TextField
                                            select
                                            label="Adhérent"
                                            name="adherFactorCode"
                                            fullWidth
                                            value={values.adherFactorCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("achetFactorCode", "");
                                                setFieldValue("linkedAdherent", "");
                                                getContratIdByAdherent(e.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            error={
                                                !!touched.adherFactorCode && !!errors.adherFactorCode
                                            }
                                            helperText={
                                                touched.adherFactorCode && errors.adherFactorCode
                                            }
                                            disabled={!!values.achetFactorCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize, color: colors.primary[100]},
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{...focusStyles}}

                                        >
                                            {globalAdherents.map((adh) => (
                                                <MenuItem key={adh.id} value={adh.id.toString()}>
                                                    {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            select
                                            label="Acheteur"
                                            name="achetFactorCode"
                                            fullWidth
                                            value={values.achetFactorCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("adherFactorCode", "");
                                                setFieldValue("linkedAdherent", "");
                                                dispatch(fetchAdherentsByAcheteur(e.target.value));
                                            }}
                                            onBlur={handleBlur}
                                            error={
                                                !!touched.achetFactorCode && !!errors.achetFactorCode
                                            }
                                            helperText={
                                                touched.achetFactorCode && errors.achetFactorCode
                                            }
                                            disabled={!!values.adherFactorCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{
                                                shrink: true,
                                                style: { fontSize: labelFontSize , color: colors.primary[100]},
                                            }}
                                            FormHelperTextProps={{
                                                style: { fontSize: helperFontSize },
                                            }}
                                            sx={{...focusStyles}}

                                        >
                                            {combinedAcheteurs.map((ach) => (
                                                <MenuItem key={ach.id} value={ach.id.toString()}>
                                                    {ach.nom && ach.prenom
                                                        ? `${ach.nom} ${ach.prenom}`
                                                        : ach.raisonSocial}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        {values.achetFactorCode && reduxAdherents.length > 0 && (
                                            <TextField
                                                select
                                                label="Adhérent lié à l’acheteur"
                                                name="linkedAdherent"
                                                fullWidth
                                                value={values.linkedAdherent}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setFieldValue("adherFactorCode", e.target.value);
                                                    getContratIdByAdherent(e.target.value);
                                                }}
                                                onBlur={handleBlur}
                                                error={
                                                    !!touched.linkedAdherent && !!errors.linkedAdherent
                                                }
                                                helperText={
                                                    touched.linkedAdherent && errors.linkedAdherent
                                                }
                                                InputProps={{
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
                                            >
                                                {reduxAdherents.map((adh) => (
                                                    <MenuItem key={adh.id} value={adh.id.toString()}>
                                                        {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}

                                        <TextField
                                            label="Montant"
                                            name="montant"
                                            fullWidth
                                            value={values.montant}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.montant && !!errors.montant}
                                            helperText={touched.montant && errors.montant}
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

                                        <TextField
                                            disabled
                                            label="Devise"
                                            name="devise"
                                            fullWidth
                                            value={values.devise}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.devise && !!errors.devise}
                                            helperText={touched.devise && errors.devise}
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

                                        <TextField
                                            label="Échéance"
                                            type="date"
                                            fullWidth
                                            name="echFirst"
                                            value={values.echFirst}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.echFirst && !!errors.echFirst}
                                            helperText={touched.echFirst && errors.echFirst}
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
                                                Ajouter une traite
                                            </Button>
                                        </Box>
                                    </Box>
                                </form>
                            );
                        }}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddTraite;
