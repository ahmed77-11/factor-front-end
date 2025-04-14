/* eslint-disable no-unused-vars,react/prop-types,react/display-name */
import { forwardRef, useEffect } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useTypeFactoring } from "../../../../customeHooks/useTypeFactoring.jsx";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../redux/formSteperSlice/FormSlice.js";
import NotesDescription from "../../../../helpers/NotesDescription.jsx";

const contratOptions = [
    { label: "Contrat avec recours", value: true },
    { label: "Contrat sans recours", value: false },
];

// eslint-disable-next-line ,
const ConditionGenerale1 = forwardRef(({ formData, updateData, data ,description,updateDescription}, ref) => {
    console.log(description.length);
    const { typeFactorings, loading, error } = useTypeFactoring();
    const dispatch = useDispatch();

    // Initial values
    const initialValues = {
        NumContrat: formData?.NumContrat || data?.contrat?.contratNo || "",
        typeFactoring: formData?.typeFactoring || data?.contrat?.typeFactoring || {},
        typeContrat: formData?.typeContrat ?? data?.contrat?.contratBoolRecours ?? null,
        comiteRisque: formData?.comiteRisque || data?.contrat?.contratComiteRisqueTexte || "",
        comiteDerogation: formData?.comiteDerogation || data?.contrat?.contratComiteDerogTexte || "",
    };

    // Validation schema
    const validationSchema = yup.object().shape({
        NumContrat: yup.string().required("Le numéro de contrat est requis"),
        typeFactoring: yup.object().required("Le type de factoring est requis"),
        typeContrat: yup
            .boolean()
            .typeError("Le type de contrat est requis")
            .required("Le type de contrat est requis"),
        comiteRisque: yup.string().required("Le comité de risque est requis"),
        comiteDerogation: yup.string(),
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 1
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => updateData(values)}
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      setFieldValue,
                  }) => {
                    // Update Redux store whenever values change
                    useEffect(() => {
                        dispatch(setFormData(values))   ;
                    }, [values, dispatch]);

                    return (
                        <form>
                            {/* Numéro de contrat */}
                            <Box mb={2}>
                                <Typography>Numéro de contrat</Typography>
                                <TextField
                                    fullWidth
                                    name="NumContrat"
                                    value={values.NumContrat}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (description.NumContrat) {
                                           
                                            delete description.NumContrat;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    disabled
                                    error={Boolean(touched.NumContrat && errors.NumContrat)}
                                    helperText={touched.NumContrat && errors.NumContrat}
                                />
                                {description.NumContrat && (
                                    <NotesDescription msg={description.NumContrat} />
                                )}
                            </Box>

                            <Box mb={2}>
                                <Typography>Type de factoring</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeFactoring"
                                    value={values.typeFactoring?.id || ""}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedFactoring = typeFactorings.find((item) => item.id === selectedId);
                                        setFieldValue("typeFactoring", selectedFactoring || null);
                                        if (description.typeFactoring) {
                                           
                                            delete description.typeFactoring;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.typeFactoring && errors.typeFactoring)}
                                    helperText={touched.typeFactoring && errors.typeFactoring}
                                >
                                    <MenuItem value="">Sélectionnez un type de factoring</MenuItem>
                                    {loading ? (
                                        <MenuItem disabled>Loading...</MenuItem>
                                    ) : error ? (
                                        <MenuItem disabled>Error loading options</MenuItem>
                                    ) : (
                                        typeFactorings.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.dsg}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                                {description.typeFactoring && (
                                    <NotesDescription msg={description.typeFactoring} />
                                )}
                            </Box>


                            {/* Type de contrat */}
                            <Box mb={2}>
                                <Typography>Type de contrat</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeContrat"
                                    value={values.typeContrat === null ? "" : values.typeContrat.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value === "true";
                                        setFieldValue("typeContrat", value);
                                        if (description.typeContrat) {
                                           
                                            delete description.typeContrat;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.typeContrat && errors.typeContrat)}
                                    helperText={touched.typeContrat && errors.typeContrat}
                                >
                                    <MenuItem value="">Sélectionnez un type de contrat</MenuItem>
                                    {contratOptions.map((option) => (
                                        <MenuItem key={option.label} value={option.value.toString()}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {description.typeContrat && (
                                    <NotesDescription msg={description.typeContrat} />
                                )}
                            </Box>

                            {/* Comité de risque */}
                            <Box mb={2}>
                                <Typography>Comité de risque</Typography>
                                <TextField
                                    fullWidth
                                    name="comiteRisque"
                                    value={values.comiteRisque}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (description.comiteRisque) {
                                           
                                            delete description.comiteRisque;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.comiteRisque && errors.comiteRisque)}
                                    helperText={touched.comiteRisque && errors.comiteRisque}
                                />
                                {description.comiteRisque && (
                                   <NotesDescription msg={description.comiteRisque} />
                                )}
                            </Box>

                            {/* Comité de dérogation */}
                            <Box mb={2}>
                                <Typography>Comité de dérogation</Typography>
                                <TextField
                                    fullWidth
                                    name="comiteDerogation"
                                    value={values.comiteDerogation}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (description.comiteDerogation) {
                                           
                                            delete description.comiteDerogation;
                                            updateDescription(description);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.comiteDerogation && errors.comiteDerogation)}
                                    helperText={touched.comiteDerogation && errors.comiteDerogation}
                                />
                                {description.comiteDerogation && (
                                    <NotesDescription msg={description.comiteDerogation} />
                                )}
                            </Box>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale1;
