/* eslint-disable react/prop-types */
import { forwardRef, useImperativeHandle } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useTypeFactoring } from "../../../../customeHooks/useTypeFactoring.jsx";

// For contrat, we now use two options: true and false.
const contratOptions = [
    { label: "Contrat avec recours", value: true },
    { label: "Contrat sans recours", value: false },
];

// eslint-disable-next-line react/display-name
const ConditionGenerale1 = forwardRef(({ formData, updateData }, ref) => {
    const { typeFactorings, loading, error } = useTypeFactoring();
    console.log(formData);

    // Prepare initial values. For typeContrat, default to null.
    const initialValues = {
        NumContrat: formData.typePieceIdentite?.dsg + "" + formData.numeroPieceIdentite || "",
        typeFactoring: formData.typeFactoring || "",
        typeContrat:
            formData.typeContrat !== undefined ? formData.typeContrat : null,
        chiffreAffaire: formData.chiffreAffaire || "",
        comiteRisque: formData.comiteRisque || "",
        comiteDerogation: formData.comiteDerogation || "",
        exigenceLittrage: formData.exigenceLittrage || "",
        contratBoolFinDebiteur: formData.contratBoolFinDebiteur || "",

    };

    const validationSchema = yup.object().shape({
        NumContrat: yup.string().required("Le numéro de contrat est requis"),
        typeFactoring: yup.object().required("Le type de factoring est requis"), // Changed from string to object
        // Expect a boolean value for typeContrat.
        typeContrat: yup
            .boolean()
            .typeError("Le type de contrat est requis")
            .required("Le type de contrat est requis"),
        // comiteRisque: yup.string().required("Le comité de risque est requis"),
        // comiteDerogation: yup.string(),
        exigenceLittrage: yup.string().required("L'exigence de littrage est requise"),
        contratBoolFinDebiteur: yup.string().required("Le Financement Debiteur est requis"),
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 1
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
                    // Expose a "submit" method to the parent via the ref.
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            // Form is valid if there are no error keys.
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    return (
                        <form onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <Typography>Numéro de contrat</Typography>
                                <TextField
                                    fullWidth
                                    name="NumContrat"
                                    value={values.NumContrat}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={true}
                                    error={Boolean(touched.NumContrat && errors.NumContrat)}
                                    helperText={touched.NumContrat && errors.NumContrat}
                                />
                            </Box>
                            <Box mb={2}>
                                <Typography>Type de factoring</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeFactoring"
                                    value={values.typeFactoring ? values.typeFactoring.id : ""}
                                    onChange={(e) => {
                                        const selectedFactoring = typeFactorings.find(devise => devise.id === e.target.value);
                                        handleChange({
                                            target: {
                                                name: "typeFactoring",
                                                value: selectedFactoring, // Store the full object
                                            }
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.typeFactoring && errors.typeFactoring)}
                                    helperText={touched.typeFactoring && errors.typeFactoring}
                                >
                                    {loading ? (
                                        <MenuItem value="">Loading...</MenuItem>
                                    ) : error ? (
                                        <MenuItem value="">Error loading options</MenuItem>
                                    ) : (
                                        typeFactorings.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.dsg}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Box>
                            <Box mb={2}>
                                <Typography>Type de contrat</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeContrat"
                                    // Show empty string if value is null.
                                    value={
                                        values.typeContrat === null
                                            ? ""
                                            : values.typeContrat.toString()
                                    }
                                    onChange={(e) => {
                                        // Convert string value back to boolean.
                                        const value =
                                            e.target.value === "true"
                                                ? true
                                                : e.target.value === "false"
                                                    ? false
                                                    : null;
                                        handleChange({ target: { name: "typeContrat", value } });
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.typeContrat && errors.typeContrat)}
                                    helperText={touched.typeContrat && errors.typeContrat}
                                >
                                    <MenuItem value="">Sélectionnez un type de contrat</MenuItem>
                                    {contratOptions.map((option) => (
                                        <MenuItem
                                            key={option.label}
                                            value={option.value.toString()}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/*<Box mb={2}>*/}
                            {/*    <Typography>Comité de risque</Typography>*/}
                            {/*    <TextField*/}
                            {/*        fullWidth*/}
                            {/*        name="comiteRisque"*/}
                            {/*        value={values.comiteRisque}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        onBlur={handleBlur}*/}
                            {/*        error={Boolean(touched.comiteRisque && errors.comiteRisque)}*/}
                            {/*        helperText={touched.comiteRisque && errors.comiteRisque}*/}
                            {/*    />*/}
                            {/*</Box>*/}
                            {/*<Box mb={2}>*/}
                            {/*    <Typography>Comité dérogation</Typography>*/}
                            {/*    <TextField*/}
                            {/*        fullWidth*/}
                            {/*        name="comiteDerogation"*/}
                            {/*        value={values.comiteDerogation}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        onBlur={handleBlur}*/}
                            {/*        error={Boolean(touched.comiteDerogation && errors.comiteDerogation)}*/}
                            {/*        helperText={touched.comiteDerogation && errors.comiteDerogation}*/}
                            {/*    />*/}
                            {/*</Box>*/}
                            <Box mb={2}>
                                <Typography>Exigence de littrage</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="exigenceLittrage"
                                    value={values.exigenceLittrage}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.exigenceLittrage && errors.exigenceLittrage)}
                                    helperText={touched.exigenceLittrage && errors.exigenceLittrage}
                                >
                                    <MenuItem value="Oui">Oui</MenuItem>
                                    <MenuItem value="Non">Non</MenuItem>
                                </TextField>
                            </Box>
                            <Box mb={2}>
                                <Typography>Financement de Debiteur</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="contratBoolFinDebiteur"
                                    value={values.contratBoolFinDebiteur}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.contratBoolFinDebiteur && errors.contratBoolFinDebiteur)}
                                    helperText={touched.contratBoolFinDebiteur && errors.contratBoolFinDebiteur}
                                >
                                    <MenuItem value="Oui">Oui</MenuItem>
                                    <MenuItem value="Non">Non</MenuItem>
                                </TextField>
                            </Box>

                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale1;
