import {
    Box, Button, TextField, Typography, Card, CardContent, MenuItem,
    useTheme, CircularProgress, FormHelperText
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";

// Redux Actions
import {
    fetchAdherentsAsync,
    fetchAcheteursAsync,
    fetchAdherentsByAcheteur,
} from "../../redux/relations/relationsSlice";
import { fetchContratByAdherentIdAsync } from "../../redux/contrat/ContratSlice";
import { addTraite } from "../../redux/traite/traiteSlice";

const initialValues = {
    factorDate: "",
    numero: "",
    tireEmisDate: "",
    tireEmisLieu: "",
    bankCode: "",
    tireRib: "",
    tireNom: "",
    adherFactorCode: "",
    achetFactorCode: "",
    linkedAdherent: "",
    montant: "",
    devise: null,
    echFirst: "",
};

const banques = [
    { code: "01", nom: "Banque de Tunisie" },
    { code: "02", nom: "STB" },
    { code: "03", nom: "BIAT" },
    { code: "10", nom: "Amen Bank" },
    { code: "20", nom: "UBCI" },
];

const validerRib = (value) => {
    if (!value) return true;
    value = value.replace(/[\s-]/g, '');
    if (value.length !== 20) return false;
    let strN = value.slice(0, value.length - 2) + '00';
    let strCheck = value.slice(value.length - 2);
    try {
        let big = BigInt(strN);
        let check = BigInt(97) - (big % BigInt(97));
        return BigInt(strCheck) === check;
    } catch (e) {
        return false;
    }
};

const dateField = (invalidMsg) =>
    yup
        .date()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
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

    tireRib: yup
        .string()
        .required("RIB requis")
        .test("is-valid-rib", "RIB invalide", validerRib),

    tireNom: yup
        .string()
        .required("Nom du tire requis")
        .min(5, "Le nom doit contenir au moins 5 caractères"),

    bankCode: yup.string().required("Choisir une banque"),

    adherFactorCode: yup.string(),
    achetFactorCode: yup.string(),
    linkedAdherent: yup.string(),

    montant: yup
        .number()
        .typeError("Le montant doit être un nombre")
        .required("Le montant est requis")
        .positive("Le montant doit être positif"),

    devise: yup.string().required("La devise est requise"),

    echFirst: dateField("Date 1ère échéance invalide")
        .required("Date 1ère échéance requise")
        .min(new Date(), "La date d'échéance ne peut pas être dans le passé"),
});

const OcrAddTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(initialValues);
    const [ribSuffix, setRibSuffix] = useState("");

    // Redux States
    const { adherents } = useSelector((state) => state.relations);
    const { acheteurs } = useSelector((state) => state.relations);
    const { currentContrat } = useSelector((state) => state.contrat);

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchAcheteursAsync());

        if (location.state?.extractedData) {
            const { bankCode, ribSuffix, ...rest } = location.state.extractedData;
            setInitialData(prev => ({
                ...prev,
                ...rest,
                bankCode,
                tireRib: `${bankCode || ''}${ribSuffix || ''}`
            }));
            setRibSuffix(ribSuffix || "");
        }
    }, [dispatch, location.state]);

    const handleFormSubmit = (values, { setSubmitting }) => {
        const payload = {
            ...values,
            devise: currentContrat?.devise,
            contrat: currentContrat
        };

        dispatch(addTraite(payload))
            .unwrap()
            .then(() => navigate("/all-traite"))
            .catch((error) => {
                alert(`Erreur: ${error.message}`);
                setSubmitting(false);
            });
    };

    const combinedAcheteurs = [
        ...(acheteurs?.pps || []),
        ...(acheteurs?.pms || []),
    ];

    return (
        <Box m="20px">
            <Header title="Création Traite" subtitle="Complétez les informations de la traite" />

            <Card sx={{ backgroundColor: colors.primary[400], p: 3, borderRadius: '12px' }}>
                <Formik
                    initialValues={initialData}
                    validationSchema={validationSchema}
                    onSubmit={handleFormSubmit}
                    enableReinitialize
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          setFieldValue
                      }) => (
                        <form onSubmit={handleSubmit}>
                            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>

                                {/* Row 1 */}
                                <TextField
                                    fullWidth
                                    label="Date Factor"
                                    type="date"
                                    name="factorDate"
                                    value={values.factorDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.factorDate && !!errors.factorDate}
                                    helperText={touched.factorDate && errors.factorDate}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    fullWidth
                                    label="Numéro Traite"
                                    name="numero"
                                    value={values.numero}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.numero && !!errors.numero}
                                    helperText={touched.numero && errors.numero}
                                />

                                {/* Row 2 */}
                                <Box sx={{ gridColumn: "span 2" }}>
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Banque"
                                            name="bankCode"
                                            value={values.bankCode}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("tireRib", `${e.target.value}${ribSuffix}`);
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.bankCode && !!errors.bankCode}
                                            helperText={touched.bankCode && errors.bankCode}
                                        >
                                            {banques.map((bank) => (
                                                <MenuItem key={bank.code} value={bank.code}>
                                                    {bank.nom}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            fullWidth
                                            label="RIB du Tire"
                                            name="tireRib"
                                            value={values.tireRib}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFieldValue("bankCode", val.substring(0, 2));
                                                setRibSuffix(val.substring(2));
                                                setFieldValue("tireRib", val);
                                            }}
                                            onBlur={handleBlur}
                                            error={!!touched.tireRib && !!errors.tireRib}
                                            helperText={touched.tireRib && errors.tireRib}
                                        />
                                    </Box>
                                </Box>

                                {/* Row 3 */}
                                <TextField
                                    fullWidth
                                    label="Nom du Tire"
                                    name="tireNom"
                                    value={values.tireNom}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.tireNom && !!errors.tireNom}
                                    helperText={touched.tireNom && errors.tireNom}
                                />

                                <TextField
                                    fullWidth
                                    label="Montant"
                                    name="montant"
                                    type="number"
                                    value={values.montant}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.montant && !!errors.montant}
                                    helperText={touched.montant && errors.montant}
                                />

                                {/* Row 4 */}
                                <TextField
                                    fullWidth
                                    label="Date Tire Émis"
                                    type="date"
                                    name="tireEmisDate"
                                    value={values.tireEmisDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.tireEmisDate && !!errors.tireEmisDate}
                                    helperText={touched.tireEmisDate && errors.tireEmisDate}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    fullWidth
                                    label="Lieu Tire Émis"
                                    name="tireEmisLieu"
                                    value={values.tireEmisLieu}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.tireEmisLieu && !!errors.tireEmisLieu}
                                    helperText={touched.tireEmisLieu && errors.tireEmisLieu}
                                />

                                {/* Row 5 */}
                                <TextField
                                    select
                                    fullWidth
                                    label="Adhérent"
                                    name="adherFactorCode"
                                    value={values.adherFactorCode}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFieldValue("achetFactorCode", "");
                                        setFieldValue("linkedAdherent", "");
                                        dispatch(fetchContratByAdherentIdAsync(e.target.value));
                                    }}
                                    onBlur={handleBlur}
                                    error={!!touched.adherFactorCode && !!errors.adherFactorCode}
                                    helperText={touched.adherFactorCode && errors.adherFactorCode}
                                    disabled={!!values.achetFactorCode}
                                >
                                    {adherents.map((adh) => (
                                        <MenuItem key={adh.id} value={adh.id.toString()}>
                                            {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    fullWidth
                                    label="Acheteur"
                                    name="achetFactorCode"
                                    value={values.achetFactorCode}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFieldValue("adherFactorCode", "");
                                        setFieldValue("linkedAdherent", "");
                                        dispatch(fetchAdherentsByAcheteur(e.target.value));
                                    }}
                                    onBlur={handleBlur}
                                    error={!!touched.achetFactorCode && !!errors.achetFactorCode}
                                    helperText={touched.achetFactorCode && errors.achetFactorCode}
                                    disabled={!!values.adherFactorCode}
                                >
                                    {combinedAcheteurs.map((ach) => (
                                        <MenuItem key={ach.id} value={ach.id.toString()}>
                                            {ach.raisonSocial || `${ach.nom} ${ach.prenom}`}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                {/* Row 6 */}
                                {values.achetFactorCode && adherents.length > 0 && (
                                    <TextField
                                        select
                                        fullWidth
                                        label="Adhérent lié"
                                        name="linkedAdherent"
                                        value={values.linkedAdherent}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("adherFactorCode", e.target.value);
                                            dispatch(fetchContratByAdherentIdAsync(e.target.value));
                                        }}
                                        onBlur={handleBlur}
                                        error={!!touched.linkedAdherent && !!errors.linkedAdherent}
                                        helperText={touched.linkedAdherent && errors.linkedAdherent}
                                        sx={{ gridColumn: "span 2" }}
                                    >
                                        {adherents.map((adh) => (
                                            <MenuItem key={adh.id} value={adh.id.toString()}>
                                                {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}

                                {/* Row 7 */}
                                <TextField
                                    fullWidth
                                    label="Date 1ère Échéance"
                                    type="date"
                                    name="echFirst"
                                    value={values.echFirst}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touched.echFirst && !!errors.echFirst}
                                    helperText={touched.echFirst && errors.echFirst}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    fullWidth
                                    label="Devise"
                                    name="devise"
                                    value={currentContrat?.devise?.dsg || ""}
                                    InputProps={{ readOnly: true }}
                                    helperText="Devise liée au contrat sélectionné"
                                />

                                {/* Submit Button */}
                                <Box sx={{ gridColumn: "span 2", textAlign: 'center', mt: 3 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        disabled={isSubmitting}
                                        sx={{
                                            px: 6,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <CircularProgress size={24} sx={{ color: 'white' }} />
                                        ) : (
                                            'Valider la Traite'
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Card>
        </Box>
    );
};

export default OcrAddTraite;