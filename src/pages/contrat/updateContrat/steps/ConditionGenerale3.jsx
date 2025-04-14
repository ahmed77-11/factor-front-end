/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../redux/formSteperSlice/FormSlice.js";
import NotesDescription from "../../../../helpers/NotesDescription.jsx";
import {useTmm} from "../../../../customeHooks/useTmm.jsx";

const tmmOptions = ["1", "2", "3"]; // Replace with actual options

const ConditionGenerale3 = forwardRef(({ formData, updateData, data,description,updateDescription }, ref) => {
    const dispatch = useDispatch();
    const { tmms, loading, error } = useTmm();
    const [currentTmm, setCurrentTmm] = useState(null);



    // Initial values with proper fallbacks from data prop
    const initialValues = {
            tmm: formData?.tmmId || data?.contrat?.tmmId?.toString() ||
                (tmms.length > 0 ? tmms[tmms.length - 1].id.toString() : ""), // Default to "1"
        tmmText: formData?.tmmText || data?.contrat?.contratTmm?.toString() || "",
        // resiliation: formData?.resiliation || data?.contrat?.contratResiliationTexte || "",
        dateRevision: formData?.dateRevision || data?.contrat?.contratRevisionDate?.split('T')[0] || "",
        // dateResiliation: formData?.dateResiliation || data?.contrat?.contratResiliationDate?.split('T')[0] || "",
    };

    const validationSchema = yup.object().shape({
        tmm: yup.string().required("Veuillez sélectionner une option pour TMM"),
        tmmText:  yup.string()
            .matches(/^\d+([,.]\d{2})?$/, "Le nombre doit être un entier ou avoir exactement 2 décimales (virgule ou point)")
        .required("Champ requis"),

        // resiliation: yup.string(),
        dateRevision: yup
            .date()
            // .max(new Date(), "La date de révision ne peut pas être dans le futur")
            .required("Veuillez entrer une date valide pour Date de révision"),
        // dateResiliation: yup
        //     .date()
        //     .max(new Date(), "La date de résiliation ne peut pas être dans le futur")
    });
    console.log(formData)

    useEffect(() => {
        if (tmms.length > 0 && initialValues.tmm) {
            const foundTmm = tmms.find(t => t.id.toString() === initialValues.tmm);
            setCurrentTmm(foundTmm || null);
        }
    }, [tmms, initialValues.tmm]);

    console.log(description)



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
                                <Typography>TMM Date</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="tmm"
                                    value={values.tmm} // This is the selected value
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (description.tmm) {
                                           
                                            delete description.tmm;
                                            updateDescription(description);
                                        }
                                        // You can add additional logic here if needed when TMM changes
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.tmm && errors.tmm)}
                                    helperText={touched.tmm && errors.tmm}
                                    disabled={true} // Keep it disabled as per your requirements
                                >
                                    {tmms.map((tmm, index) => {
                                        return (
                                            <MenuItem
                                                key={tmm.id}
                                                value={tmm.id.toString()} // Use `tmm.id.toString()` as value
                                            >
                                                {tmm.aaaaMm} {/* Display the value of `aaaaMm` */}
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                                {description.tmm && (
                                    <NotesDescription msg={description.tmm}/>
                                )}
                            </Box>

                            {/* TMM Texte field */}
                            <Box mb={2}>
                                <Typography>TMM</Typography>
                                <TextField
                                    fullWidth
                                    name="tmmText"
                                    value={values.tmmText}
                                    onChange={(e) => {
                                        if (description.tmmText) {
                                            delete description.tmmText;
                                            updateDescription?.(description);
                                        }
                                        handleChange(e);

                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.tmmText && errors.tmmText)}
                                    helperText={touched.tmmText && errors.tmmText}
                                />
                                {description.tmmText && (
                                    <NotesDescription msg={description.tmmText}/>
                                )}
                            </Box>

                            {/* Résiliation */}
                            {/*<Box mb={2}>*/}
                            {/*    <Typography>Résiliation</Typography>*/}
                            {/*    <TextField*/}
                            {/*        fullWidth*/}
                            {/*        name="resiliation"*/}
                            {/*        value={values.resiliation}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        onBlur={handleBlur}*/}
                            {/*        error={Boolean(touched.resiliation && errors.resiliation)}*/}
                            {/*        helperText={touched.resiliation && errors.resiliation}*/}
                            {/*    />*/}
                            {/*    {description.resiliation && (*/}
                            {/*        <NotesDescription msg={description.resiliation}/>*/}
                            {/*    )}*/}
                            {/*</Box>*/}

                            {/* Date révision */}
                            <Box mb={2}>
                                <Typography>Date révision</Typography>
                                <TextField
                                    fullWidth
                                    name="dateRevision"
                                    type="date"
                                    value={values.dateRevision}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (description.dateRevision) {
                                           
                                            delete description.dateRevision;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.dateRevision && errors.dateRevision)}
                                    helperText={touched.dateRevision && errors.dateRevision}
                                    InputLabelProps={{ shrink: true }}
                                />
                                {description.dateRevision && (
                                    <NotesDescription msg={description.dateRevision}/>
                                )}
                            </Box>

                            {/* Date résiliation */}
                            {/*<Box mb={2}>*/}
                            {/*    <Typography>Date résiliation</Typography>*/}
                            {/*    <TextField*/}
                            {/*        fullWidth*/}
                            {/*        name="dateResiliation"*/}
                            {/*        type="date"*/}
                            {/*        value={values.dateResiliation}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        onBlur={handleBlur}*/}
                            {/*        error={Boolean(touched.dateResiliation && errors.dateResiliation)}*/}
                            {/*        helperText={touched.dateResiliation && errors.dateResiliation}*/}
                            {/*        InputLabelProps={{ shrink: true }}*/}
                            {/*    />*/}
                            {/*    {description.dateResiliation && (*/}
                            {/*       <NotesDescription msg={description.dateResiliation}/>*/}
                            {/*    )}*/}

                            {/*</Box>*/}
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale3;