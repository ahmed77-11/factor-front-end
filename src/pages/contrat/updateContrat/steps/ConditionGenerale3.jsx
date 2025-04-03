/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import {forwardRef, useEffect, useImperativeHandle} from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../redux/formSteperSlice/FormSlice.js";

const tmmOptions = ["1", "2", "3"]; // Replace with actual options

const ConditionGenerale3 = forwardRef(({ formData, updateData, data,description }, ref) => {
    const dispatch = useDispatch();

    // Initial values with proper fallbacks from data prop
    const initialValues = {
        tmm: formData?.tmm || data?.contrat?.tmm?.toString() || "1", // Default to "1"
        tmmText: formData?.tmmText || data?.contrat?.contratTmm?.toString() || "",
        resiliation: formData?.resiliation || data?.contrat?.contratResiliationTexte || "",
        dateRevision: formData?.dateRevision || data?.contrat?.contratRevisionDate?.split('T')[0] || "",
        dateResiliation: formData?.dateResiliation || data?.contrat?.contratResiliationDate?.split('T')[0] || "",
    };

    const validationSchema = yup.object().shape({
        tmm: yup.string().required("Veuillez sélectionner une option pour TMM"),
        tmmText: yup.string().required("Veuillez entrer un texte pour TMM Texte"),
        resiliation: yup.string().required("Veuillez entrer une valeur pour Résiliation"),
        dateRevision: yup
            .date()
            .max(new Date(), "La date de révision ne peut pas être dans le futur")
            .required("Veuillez entrer une date valide pour Date de révision"),
        dateResiliation: yup
            .date()
            .max(new Date(), "La date de résiliation ne peut pas être dans le futur")
            .required("Veuillez entrer une date valide pour Date de résiliation"),
    });
    console.log(formData)

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 3
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => updateData(values)}
                enableReinitialize
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      submitForm,
                      validateForm,
                      setFieldValue,
                  }) => {
                    // Update Redux store whenever values change
                    useEffect(() => {
                        dispatch(setFormData(values));
                    }, [values, dispatch]);

                    // Expose a "submit" method via the ref
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    return (
                        <form onSubmit={handleSubmit}>
                            {/* TMM field (select) */}
                            <Box mb={2}>
                                <Typography>TMM</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="tmm"
                                    value={values.tmm}
                                    onChange={(e) => {
                                        handleChange(e);
                                        // You can add additional logic here if needed when TMM changes
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.tmm && errors.tmm)}
                                    helperText={touched.tmm && errors.tmm}
                                >
                                    {tmmOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {description.tmm && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.tmm}
                                    </Typography>
                                )}
                            </Box>

                            {/* TMM Texte field */}
                            <Box mb={2}>
                                <Typography>TMM Texte</Typography>
                                <TextField
                                    fullWidth
                                    name="tmmText"
                                    value={values.tmmText}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.tmmText && errors.tmmText)}
                                    helperText={touched.tmmText && errors.tmmText}
                                />
                                {description.tmmText && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.tmmText}
                                    </Typography>
                                )}
                            </Box>

                            {/* Résiliation */}
                            <Box mb={2}>
                                <Typography>Résiliation</Typography>
                                <TextField
                                    fullWidth
                                    name="resiliation"
                                    value={values.resiliation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.resiliation && errors.resiliation)}
                                    helperText={touched.resiliation && errors.resiliation}
                                />
                                {description.resiliation && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.resiliation}
                                    </Typography>
                                )}
                            </Box>

                            {/* Date révision */}
                            <Box mb={2}>
                                <Typography>Date révision</Typography>
                                <TextField
                                    fullWidth
                                    name="dateRevision"
                                    type="date"
                                    value={values.dateRevision}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.dateRevision && errors.dateRevision)}
                                    helperText={touched.dateRevision && errors.dateRevision}
                                    InputLabelProps={{ shrink: true }}
                                />
                                {description.dateRevision && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.dateRevision}
                                    </Typography>
                                )}
                            </Box>

                            {/* Date résiliation */}
                            <Box mb={2}>
                                <Typography>Date résiliation</Typography>
                                <TextField
                                    fullWidth
                                    name="dateResiliation"
                                    type="date"
                                    value={values.dateResiliation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.dateResiliation && errors.dateResiliation)}
                                    helperText={touched.dateResiliation && errors.dateResiliation}
                                    InputLabelProps={{ shrink: true }}
                                />
                                {description.dateResiliation && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.dateResiliation}
                                    </Typography>
                                )}

                            </Box>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale3;