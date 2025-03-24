/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import { forwardRef, useImperativeHandle } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";

const tmmOptions = ["1", "2", "3"]; // Replace with actual options

const ConditionGenerale3 = forwardRef(({ formData, updateData }, ref) => {
    const initialValues = {
        tmm: formData.tmm || "Option 1", // Default to "Option 1" or another valid option
        tmmText: formData.tmmText || "",
        resiliation: formData.resiliation || "",
        dateRevision: formData.dateRevision || "",
        dateResiliation: formData.dateResiliation || "",
    };

    const validationSchema = yup.object().shape({
        tmm: yup.string().required("Veuillez sélectionner une option pour TMM"),
        tmmText: yup.string().required("Veuillez entrer un texte pour TMM Texte"),
        resiliation: yup
            .string()
            .required("Veuillez entrer une valeur pour Résiliation"),
        dateRevision: yup
            .date()
            .max(new Date(), "La date de révision ne peut pas être dans le futur")
            .required("Veuillez entrer une date valide pour Date de révision"),
        dateResiliation: yup
            .date()
            .max(new Date(), "La date de résiliation ne peut pas être dans le futur")
            .required("Veuillez entrer une date valide pour Date de résiliation"),
    });

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
                  }) => {
                    // Expose a "submit" method via the ref so the parent can trigger validation/submission.
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            // Form is valid if there are no errors.
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
                                    onChange={handleChange}
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
                            </Box>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale3;
