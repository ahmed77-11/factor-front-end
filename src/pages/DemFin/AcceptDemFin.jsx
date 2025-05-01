import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    useTheme,
    MenuItem,
    Grid,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {acceptDemFinAsync, demFinByIdAsync} from "../../redux/demFin/demFinSlice.js";
import {getAllTraitesByContrat} from "../../redux/traite/traiteSlice.js";

const AcceptDemFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentDemfin,loading:loadCDfin } = useSelector((state) => state.demFin);
    const {traites,loading:loadTraites}=useSelector((state)=>state.traite)

    const banques = [
        { code: "01", nom: "Banque de Tunisie" },
        { code: "02", nom: "STB" },
        { code: "03", nom: "BIAT" },
        { code: "10", nom: "Amen Bank" },
        { code: "20", nom: "UBCI" },
    ];

    useEffect(()=>{
        dispatch(demFinByIdAsync(id))
    },[])

    useEffect(() => {
        if(currentDemfin || !loadCDfin){
            dispatch(getAllTraitesByContrat(currentDemfin?.contrat.id))
        }
    }, [currentDemfin, loadCDfin]);

    // Extract bank code and RIB suffix from current RIB if it exists
    const currentRib = currentDemfin?.factorRib || "";
    const currentBankCode = currentRib.substring(0, 2);
    const currentRibSuffix = currentRib.substring(2);

    const initialValues = {
        factorExecNo:  "",
        factorExecDate:  "",
        factorTypeInstrument:  "",
        factorInstrumentNo: "",
        bankCode: "",
        ribSuffix: "",
        factorRib: "",
        factorMontant:  0.0,
        factorLibelle:  "",
        factorInfoLibre: "",
    };

    const validationSchema = yup.object().shape({
        factorExecNo: yup.string().required("Champ Obligatoire"),
        factorExecDate: yup
            .date()
            .required("Champ Obligatoire")
            .max(new Date(), "La date ne peut pas être dans le futur"),
        factorTypeInstrument: yup.string().required("Champ Obligatoire"),
        factorInstrumentNo: yup.string().required("Champ Obligatoire"),
        bankCode: yup.string().required("Code banque requis"),
        ribSuffix: yup.string().required("Suffixe RIB requis"),
        factorRib: yup.string().required("RIB complet requis"),
        factorMontant: yup
            .number()
            .required("Champ Obligatoire")
            .positive("Doit être positif")
            .min(0.01, "Doit être supérieur à 0.01"),
        factorLibelle: yup.string().required("Champ Obligatoire"),
        factorInfoLibre: yup.string().required("Champ Obligatoire"),
    });

    const handleFormSubmit = (values) => {
        dispatch(acceptDemFinAsync(id,values));
        navigate("/financement");
    };

    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

    return (
        <Box m="20px">
            <Header subtitle="Demande De Financement" title="Acceptation D'une Demande Financement"/>
            <Card sx={{
                width: "100%",
                maxWidth: "1200px",
                boxShadow: 5,
                borderRadius: 3,
                p: 3,
                backgroundColor: colors.grey[700]
            }}>
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
                                <Grid container spacing={2}>
                                    {/* First Row: Exec No & Exec Date */}
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                        />
                                    </Grid>
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                                // Reset instrument number when type changes
                                                setFieldValue("factorInstrumentNo", "");
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.factorTypeInstrument && Boolean(errors.factorTypeInstrument)}
                                            helperText={touched.factorTypeInstrument && errors.factorTypeInstrument}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                                error={touched.factorInstrumentNo && Boolean(errors.factorInstrumentNo)}
                                                helperText={touched.factorInstrumentNo && errors.factorInstrumentNo}
                                                InputProps={{ style: { fontSize: inputFontSize } }}
                                                InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                                FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                                error={touched.factorInstrumentNo && Boolean(errors.factorInstrumentNo)}
                                                helperText={touched.factorInstrumentNo && errors.factorInstrumentNo}
                                                InputProps={{ style: { fontSize: inputFontSize } }}
                                                InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                                FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                                const selectedBank = banques.find(
                                                    (b) => b.code === e.target.value
                                                );
                                                const ribSuffix = values.ribSuffix || "";
                                                setFieldValue("bankCode", selectedBank.code);
                                                setFieldValue("factorRib", selectedBank.code + ribSuffix);
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.bankCode && Boolean(errors.bankCode)}
                                            helperText={touched.bankCode && errors.bankCode}
                                            InputProps={{ style: { fontSize: inputFontSize } }}
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                        />
                                    </Grid>

                                    {/* Hidden field for complete RIB */}
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
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
                                            InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                            FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                        />
                                    </Grid>

                                    {/* Submit button */}
                                    <Grid item xs={12} display="flex" justifyContent="center">
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            sx={{ mt: 2,backgroundColor:colors.greenAccent[600],color:colors.primary[100] }}
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