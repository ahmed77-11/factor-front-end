import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {demFinByIdAsync, updateDemFinAsync} from "../../redux/demFin/demFinSlice.js";

const validationSchema = yup.object().shape({
    contrat: yup.object().required("Le contrat est requis"),
    adherEmisNo: yup.string().required("Numéro de fin adhérent émis requis"),
    adherEmisDate: yup
        .date()
        .required("Date fin adhérent émis requise")
        .max(new Date(), "La date ne peut pas être dans le futur"),
    adherRib: yup.string().required("RIB fin adhérent requis"),
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
    const { currentDemfin } = useSelector((state) => state.demFin);

    useEffect(() => {
        dispatch(demFinByIdAsync(id));
    }, [dispatch, id]);

    const initialValues = {
        contrat: currentDemfin?.contrat || {},
        adherEmisNo: currentDemfin?.adherEmisNo || "",
        adherEmisDate: currentDemfin?.adherEmisDate?.split("T")[0] || "",
        adherRib: currentDemfin?.adherRib || "",
        adherMontant: currentDemfin?.adherMontant || "",
        devise: currentDemfin?.devise || {},
        adherLibelle: currentDemfin?.adherLibelle || "",
        adherInfoLibre: currentDemfin?.adherInfoLibre || "",
    };

    const handleFormSubmit = (values) => {
        console.log("✅ Données modifiées :", values);
        dispatch(updateDemFinAsync(id, values, navigate));
    };

    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

    return (
        <Box m="20px">
            <Header title="Modifier Demande" subtitle="Modifier une demande de financement" />
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
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* CONTRAT */}
                                    <TextField
                                        label="Contrat"
                                        name="contrat"
                                        fullWidth
                                        value={values.contrat?.contratNo || ""}
                                        onClick={() => alert("Replace with contract picker if needed")}
                                        InputProps={{ style: { fontSize: inputFontSize }, readOnly: true }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                        error={touched.contrat && Boolean(errors.contrat)}
                                        helperText={touched.contrat && errors.contrat?.contratNo}
                                    />

                                    <TextField
                                        label="Fin Adhérent Emission Num"
                                        name="adherEmisNo"
                                        fullWidth
                                        value={values.adherEmisNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherEmisNo && Boolean(errors.adherEmisNo)}
                                        helperText={touched.adherEmisNo && errors.adherEmisNo}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

                                    <TextField
                                        label="Date Fin Adhérent Emission"
                                        type="date"
                                        name="adherEmisDate"
                                        fullWidth
                                        value={values.adherEmisDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherEmisDate && Boolean(errors.adherEmisDate)}
                                        helperText={touched.adherEmisDate && errors.adherEmisDate}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

                                    <TextField
                                        label="RIB Fin Adhérent"
                                        name="adherRib"
                                        fullWidth
                                        value={values.adherRib}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherRib && Boolean(errors.adherRib)}
                                        helperText={touched.adherRib && errors.adherRib}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

                                    <TextField
                                        label="Montant Fin Adhérent"
                                        name="adherMontant"
                                        fullWidth
                                        value={values.adherMontant}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.adherMontant && Boolean(errors.adherMontant)}
                                        helperText={touched.adherMontant && errors.adherMontant}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

                                    {/* DEVISE */}
                                    <TextField
                                        label="Devise"
                                        name="devise"
                                        fullWidth
                                        value={values.devise?.codeAlpha || ""}
                                        onClick={() => alert("Replace with devise picker if needed")}
                                        InputProps={{ style: { fontSize: inputFontSize }, readOnly: true }}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                        error={touched.devise && Boolean(errors.devise)}
                                        helperText={touched.devise && errors.devise?.codeAlpha}
                                    />

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
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

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
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button type="submit" color="secondary" variant="contained" size="large">
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
