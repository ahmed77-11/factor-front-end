// src/pages/InsFin/UpdateInsFin.jsx

import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    useTheme,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useTypeInsfin } from "../../customeHooks/useTypeInsfin.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchInsfinByIdAsync, updateInsfinAsync } from "../../redux/insfin/InsfinSlice.js";
import { useEffect, useState } from "react";

const validationSchema = yup.object().shape({
    typeInsfin: yup.object().nullable().required("Type d'institution requis"),
    codeNum: yup.string().required("Code numérique requis").max(3),
    codeAlpha: yup.string().required("Code alpha requis").max(3),
    dsg: yup.string().required("Désignation requise").max(64),
    telFixeNo: yup.string().max(13),
    siteWeb: yup.string().max(64),
    adresse: yup.string().max(64),
});

const UpdateInsFin = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { typeInsfins, loading: loadingTypeInsfins, error: errorTypeInsfins } = useTypeInsfin();
    const { currentInsfin, loading, error } = useSelector((state) => state.insfin);

    const [initialValues, setInitialValues] = useState(null);

    // Fetch Insfin by ID
    useEffect(() => {
        dispatch(fetchInsfinByIdAsync(id));
    }, [dispatch, id]);

    // Set initial values when data arrives
    useEffect(() => {
        if (currentInsfin) {
            setInitialValues({
                typeInsfin: typeInsfins.find((t) => Number(t.id) === currentInsfin.typeInsfin.id) || null,
                codeNum: currentInsfin.codeNum || "",
                codeAlpha: currentInsfin.codeAlpha || "",
                dsg: currentInsfin.dsg || "",
                telFixeNo: currentInsfin.telFixeNo || "",
                siteWeb: currentInsfin.siteWeb || "",
                adresse: currentInsfin.adresse || "",
            });

        }
    }, [currentInsfin, typeInsfins]);

    if (loading || !initialValues) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box m="20px">
            <Header title="Institution Financière" subtitle="Modifier une institution" />
            <Card
                sx={{
                    p: 3,
                    boxShadow: 5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[900],
                }}
            >
                <CardContent>
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            console.log("✏️ Données InsFin mises à jour :", values);

                            const payload = {
                                ...values,
                                typeInsfin: values.typeInsfin
                                , // only send id to backend
                            };

                            dispatch(updateInsfinAsync( id,  payload, navigate ));
                        }}
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
                                    {/* Type Insfin */}
                                    <Autocomplete
                                        options={typeInsfins}
                                        getOptionLabel={(option) => option?.dsg || ""}
                                        value={values.typeInsfin}
                                        onChange={(e, val) => setFieldValue("typeInsfin", val)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Type d'institution"
                                                error={!!touched.typeInsfin && !!errors.typeInsfin}
                                                helperText={touched.typeInsfin && errors.typeInsfin}
                                            />
                                        )}
                                    />

                                    <TextField
                                        name="codeNum"
                                        label="Code Numérique"
                                        value={values.codeNum}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.codeNum && !!errors.codeNum}
                                        helperText={touched.codeNum && errors.codeNum}
                                    />

                                    <TextField
                                        name="codeAlpha"
                                        label="Code Alpha"
                                        value={values.codeAlpha}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.codeAlpha && !!errors.codeAlpha}
                                        helperText={touched.codeAlpha && errors.codeAlpha}
                                    />

                                    <TextField
                                        name="dsg"
                                        label="Désignation"
                                        value={values.dsg}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.dsg && !!errors.dsg}
                                        helperText={touched.dsg && errors.dsg}
                                    />

                                    <TextField
                                        name="telFixeNo"
                                        label="Téléphone Fixe"
                                        value={values.telFixeNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.telFixeNo && !!errors.telFixeNo}
                                        helperText={touched.telFixeNo && errors.telFixeNo}
                                    />

                                    <TextField
                                        name="siteWeb"
                                        label="Site Web"
                                        value={values.siteWeb}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.siteWeb && !!errors.siteWeb}
                                        helperText={touched.siteWeb && errors.siteWeb}
                                    />

                                    <TextField
                                        name="adresse"
                                        label="Adresse"
                                        value={values.adresse}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.adresse && !!errors.adresse}
                                        helperText={touched.adresse && errors.adresse}
                                    />

                                    <Box textAlign="center" mt={2}>
                                        <Button type="submit" variant="contained" color="secondary">
                                            Mettre à jour
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

export default UpdateInsFin;
