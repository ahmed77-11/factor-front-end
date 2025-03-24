/* eslint-disable react/prop-types */
import { forwardRef, useImperativeHandle } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDevise } from "../../../../customeHooks/useDevise.jsx";

const ConditionGenerale2 = forwardRef(({ formData, updateData }, ref) => {
    const { devises, loading, error } = useDevise();
    console.log(devises);

    const initialValues = {
        devise: formData.devise || null,
        previsionChiffreTotal: formData.previsionChiffreTotal || "",
        previsionChiffreLocal: formData.previsionChiffreLocal || "",
        previsionChiffreExport: formData.previsionChiffreExport || "",
        nombreAcheteur: formData.nombreAcheteur || "",
        nombreRemise: formData.nombreRemise || "",
        nombreDocumentRemise: formData.nombreDocumentRemise || "",
        tauxConcentration: formData.tauxConcentration || "",
        nombreAvoir: formData.nombreAvoir || "",
        dureeMaxPaiement: formData.dureeMaxPaiement || "",
        limiteFinAuto: formData.limiteFinAuto || "",
        finMarge: formData.finMarge || "",
        margeRet: formData.margeRet || "",
        scannerPath: formData.scannerPath || "",
        nomFichierScanner: formData.nomFichierScanner || "",
        dateAcceptationRemise: formData.dateAcceptationRemise || "",
        exigenceLittrage: formData.exigenceLittrage || "",
    };

    const validationSchema = yup.object().shape({
        devise: yup.object().required("La devise est requise"),
        previsionChiffreTotal: yup.string().required("Champ requis"),
        previsionChiffreLocal: yup.string().required("Champ requis"),
        previsionChiffreExport: yup.string().required("Champ requis"),
        nombreAcheteur: yup.string().required("Champ requis"),
        nombreRemise: yup.string().required("Champ requis"),
        nombreDocumentRemise: yup.string().required("Champ requis"),
        tauxConcentration: yup.string().required("Champ requis"),
        nombreAvoir: yup.string().required("Champ requis"),
        dureeMaxPaiement: yup.string().required("Champ requis"),
        limiteFinAuto: yup.string().required("Champ requis"),
        finMarge: yup.string().required("Champ requis"),
        margeRet: yup.string().required("Champ requis"),
        scannerPath: yup.string().required("Champ requis"),
        nomFichierScanner: yup.string().required("Champ requis"),
        dateAcceptationRemise: yup.string().required("Champ requis"),
        exigenceLittrage: yup.string().required("L'exigence de littrage est requise"),
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 2
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
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    return (
                        <form onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <Typography>Devise</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="devise"
                                    value={values.devise ? values.devise.id : ""}
                                    onChange={(e) => {
                                        const selectedDevise = devises.find(devise => devise.id === e.target.value);
                                        handleChange({
                                            target: {
                                                name: "devise",
                                                value: selectedDevise, // Set the entire devise object
                                            }
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.devise && errors.devise)}
                                    helperText={touched.devise && errors.devise}
                                >
                                    {loading ? (
                                        <MenuItem value="">Chargement...</MenuItem>
                                    ) : error ? (
                                        <MenuItem value="">Erreur de chargement</MenuItem>
                                    ) : (
                                        devises?.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item?.dsg}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Box>
                            <Box mb={2}>
                                <Typography>Prévision chiffre total</Typography>
                                <TextField fullWidth name="previsionChiffreTotal" value={values.previsionChiffreTotal} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.previsionChiffreTotal && errors.previsionChiffreTotal)} helperText={touched.previsionChiffreTotal && errors.previsionChiffreTotal} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Prévision chiffre local</Typography>
                                <TextField fullWidth name="previsionChiffreLocal" value={values.previsionChiffreLocal} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.previsionChiffreLocal && errors.previsionChiffreLocal)} helperText={touched.previsionChiffreLocal && errors.previsionChiffreLocal} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Prévision chiffre export</Typography>
                                <TextField fullWidth name="previsionChiffreExport" value={values.previsionChiffreExport} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.previsionChiffreExport && errors.previsionChiffreExport)} helperText={touched.previsionChiffreExport && errors.previsionChiffreExport} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Nombre acheteur</Typography>
                                <TextField fullWidth name="nombreAcheteur" value={values.nombreAcheteur} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.nombreAcheteur && errors.nombreAcheteur)} helperText={touched.nombreAcheteur && errors.nombreAcheteur} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Nombre Remise</Typography>
                                <TextField fullWidth name="nombreRemise" value={values.nombreRemise} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.nombreRemise && errors.nombreRemise)} helperText={touched.nombreRemise && errors.nombreRemise} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Nombre document de remise</Typography>
                                <TextField fullWidth name="nombreDocumentRemise" value={values.nombreDocumentRemise} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.nombreDocumentRemise && errors.nombreDocumentRemise)} helperText={touched.nombreDocumentRemise && errors.nombreDocumentRemise} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Taux de concentration</Typography>
                                <TextField fullWidth name="tauxConcentration" value={values.tauxConcentration} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.tauxConcentration && errors.tauxConcentration)} helperText={touched.tauxConcentration && errors.tauxConcentration} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Nombre avoir</Typography>
                                <TextField fullWidth name="nombreAvoir" value={values.nombreAvoir} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.nombreAvoir && errors.nombreAvoir)} helperText={touched.nombreAvoir && errors.nombreAvoir} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Durée max de paiement</Typography>
                                <TextField fullWidth name="dureeMaxPaiement" value={values.dureeMaxPaiement} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.dureeMaxPaiement && errors.dureeMaxPaiement)} helperText={touched.dureeMaxPaiement && errors.dureeMaxPaiement} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Limite fin auto</Typography>
                                <TextField fullWidth name="limiteFinAuto" value={values.limiteFinAuto} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.limiteFinAuto && errors.limiteFinAuto)} helperText={touched.limiteFinAuto && errors.limiteFinAuto} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Fin de Marge</Typography>
                                <TextField fullWidth name="finMarge" value={values.finMarge} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.finMarge && errors.finMarge)} helperText={touched.finMarge && errors.finMarge} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Marge Ret</Typography>
                                <TextField fullWidth name="margeRet" value={values.margeRet} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.margeRet && errors.margeRet)} helperText={touched.margeRet && errors.margeRet} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Scanner Path</Typography>
                                <TextField fullWidth name="scannerPath" value={values.scannerPath} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.scannerPath && errors.scannerPath)} helperText={touched.scannerPath && errors.scannerPath} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Nom du fichier de Scanner</Typography>
                                <TextField fullWidth name="nomFichierScanner" value={values.nomFichierScanner} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.nomFichierScanner && errors.nomFichierScanner)} helperText={touched.nomFichierScanner && errors.nomFichierScanner} />
                            </Box>
                            <Box mb={2}>
                                <Typography>Date d'acceptation de remise</Typography>
                                <TextField fullWidth name="dateAcceptationRemise" value={values.dateAcceptationRemise} onChange={handleChange} onBlur={handleBlur} type="date" InputLabelProps={{ shrink: true }} error={Boolean(touched.dateAcceptationRemise && errors.dateAcceptationRemise)} helperText={touched.dateAcceptationRemise && errors.dateAcceptationRemise} />
                            </Box>
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
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale2;
