/* eslint-disable no-unused-vars,react/prop-types,react/display-name */
import { forwardRef, useEffect } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDevise } from "../../../../customeHooks/useDevise.jsx";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../redux/formSteperSlice/FormSlice.js";

const contratOptions = [
    { label: "oui", value: true },
    { label: "non", value: false },
];

const ConditionGenerale2 = forwardRef(({ formData, updateData, data,description }, ref) => {
    const { devises, loading, error } = useDevise();
    const dispatch = useDispatch();

    // Initial values mapped to API response structure
    const initialValues = {
        devise: formData?.devise || data?.contrat?.devise || {},
        previsionChiffreTotal: formData?.previsionChiffreTotal || data?.contrat?.contratPrevChiffreTotal?.toString() || "",
        previsionChiffreLocal: formData?.previsionChiffreLocal || data?.contrat?.contratPrevChiffreLocal?.toString() || "",
        previsionChiffreExport: formData?.previsionChiffreExport || data?.contrat?.contratPrevChiffreExport?.toString() || "",
        nombreAcheteur: formData?.nombreAcheteur || data?.contrat?.contratPrevNbrAchet?.toString() || "",
        nombreRemise: formData?.nombreRemise || data?.contrat?.contratPrevNbrRemise?.toString() || "",
        nombreDocumentRemise: formData?.nombreDocumentRemise || data?.contrat?.contratPrevNbrDocRemise?.toString() || "",
        tauxConcentration: formData?.tauxConcentration || data?.contrat?.contratTauxConcentration?.toString() || "",
        nombreAvoir: formData?.nombreAvoir || data?.contrat?.contratPrevNbrAvoir?.toString() || "",
        dureeMaxPaiement: formData?.dureeMaxPaiement || data?.contrat?.contratDelaiMaxPai?.toString() || "",
        limiteFinAuto: formData?.limiteFinAuto || data?.contrat?.contratLimiteFinAuto?.toString() || "",
        finMarge: formData?.finMarge || data?.contrat?.contratMargeFin?.toString() || "",
        margeRet: formData?.margeRet || data?.contrat?.contratMargeRet?.toString() || "",
        scannerPath: formData?.scannerPath || data?.contrat?.contratScanPath || "",
        nomFichierScanner: formData?.nomFichierScanner || data?.contrat?.contratScanFileName || "",
        dateAcceptationRemise: formData?.dateAcceptationRemise || data?.contrat?.contratAcceptRemiseDate?.split('T')[0] || "",
        exigenceLittrage: formData?.exigenceLittrage || data?.contrat?.contratBoolLettrage?.toString() || "",
    };

    // Validation schema
    const validationSchema = yup.object().shape({
        devise: yup.object().required("La devise est requise"),
        previsionChiffreTotal: yup.string().required("Le chiffre total prévisionnel est requis"),
        previsionChiffreLocal: yup.string().required("Le chiffre local prévisionnel est requis"),
        previsionChiffreExport: yup.string().required("Le chiffre export prévisionnel est requis"),
        nombreAcheteur: yup.string().required("Le nombre d'acheteur est requis"),
        nombreRemise: yup.string().required("Le nombre de remise est requis"),
        nombreDocumentRemise: yup.string().required("Le nombre de document de remise est requis"),
        tauxConcentration: yup.string().required("Le taux de concentration est requis"),
        nombreAvoir: yup.string().required("Le nombre d'avoir est requis"),
        dureeMaxPaiement: yup.string().required("La durée maximale de paiement est requise"),
        limiteFinAuto: yup.string().required("La limite fin auto est requise"),
        finMarge: yup.string().required("La fin de marge est requise"),
        margeRet: yup.string().required("La marge ret est requise"),
        scannerPath: yup.string().required("Le chemin du scanner est requis"),
        nomFichierScanner: yup.string().required("Le nom du fichier scanner est requis"),
        dateAcceptationRemise: yup.string().required("La date d'acceptation de remise est requise"),
        exigenceLittrage: yup.string().required("L'exigence de littrage est requise"),
    });
    console.log(formData)

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 2
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
                        dispatch(setFormData(values));
                    }, [values, dispatch]);

                    return (
                        <form>
                            {/* Devise */}
                            <Box mb={2}>
                                <Typography>Devise</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    name="devise"
                                    value={values.devise?.id || ""}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedDevise = devises.find((item) => item.id === selectedId);
                                        setFieldValue("devise", selectedDevise || null);
                                    }}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.devise && errors.devise)}
                                    helperText={touched.devise && errors.devise}
                                >
                                    <MenuItem value="">Sélectionnez une devise</MenuItem>
                                    {loading ? (
                                        <MenuItem disabled>Chargement...</MenuItem>
                                    ) : error ? (
                                        <MenuItem disabled>Erreur de chargement</MenuItem>
                                    ) : (
                                        devises?.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.dsg}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                                {description.devise && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.devise}
                                    </Typography>
                                )}
                            </Box>

                            {/* Prévision chiffre total */}
                            <Box mb={2}>
                                <Typography>Prévision chiffre total</Typography>
                                <TextField
                                    fullWidth
                                    name="previsionChiffreTotal"
                                    value={values.previsionChiffreTotal}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.previsionChiffreTotal && errors.previsionChiffreTotal)}
                                    helperText={touched.previsionChiffreTotal && errors.previsionChiffreTotal}
                                />
                                {description.previsionChiffreTotal && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.previsionChiffreTotal}
                                    </Typography>
                                )}
                            </Box>

                            {/* Prévision chiffre local */}
                            <Box mb={2}>
                                <Typography>Prévision chiffre local</Typography>
                                <TextField
                                    fullWidth
                                    name="previsionChiffreLocal"
                                    value={values.previsionChiffreLocal}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.previsionChiffreLocal && errors.previsionChiffreLocal)}
                                    helperText={touched.previsionChiffreLocal && errors.previsionChiffreLocal}
                                />
                                {description.previsionChiffreLocal && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.previsionChiffreLocal}
                                    </Typography>
                                )}
                            </Box>

                            {/* Prévision chiffre export */}
                            <Box mb={2}>
                                <Typography>Prévision chiffre export</Typography>
                                <TextField
                                    fullWidth
                                    name="previsionChiffreExport"
                                    value={values.previsionChiffreExport}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.previsionChiffreExport && errors.previsionChiffreExport)}
                                    helperText={touched.previsionChiffreExport && errors.previsionChiffreExport}
                                />
                                {description.previsionChiffreExport && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.previsionChiffreExport}
                                    </Typography>
                                )}
                            </Box>

                            {/* Nombre acheteur */}
                            <Box mb={2}>
                                <Typography>Nombre acheteur</Typography>
                                <TextField
                                    fullWidth
                                    name="nombreAcheteur"
                                    value={values.nombreAcheteur}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.nombreAcheteur && errors.nombreAcheteur)}
                                    helperText={touched.nombreAcheteur && errors.nombreAcheteur}
                                />
                                {description.nombreAcheteur && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.nombreAcheteur}
                                    </Typography>
                                )}
                            </Box>

                            {/* Nombre remise */}
                            <Box mb={2}>
                                <Typography>Nombre remise</Typography>
                                <TextField
                                    fullWidth
                                    name="nombreRemise"
                                    value={values.nombreRemise}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.nombreRemise && errors.nombreRemise)}
                                    helperText={touched.nombreRemise && errors.nombreRemise}
                                />
                                {description.nombreRemise && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.nombreRemise}
                                    </Typography>
                                )}
                            </Box>

                            {/* Nombre document remise */}
                            <Box mb={2}>
                                <Typography>Nombre document remise</Typography>
                                <TextField
                                    fullWidth
                                    name="nombreDocumentRemise"
                                    value={values.nombreDocumentRemise}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.nombreDocumentRemise && errors.nombreDocumentRemise)}
                                    helperText={touched.nombreDocumentRemise && errors.nombreDocumentRemise}
                                />
                                {description.nombreDocumentRemise && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.nombreDocumentRemise}
                                    </Typography>
                                )}
                            </Box>

                            {/* Taux concentration */}
                            <Box mb={2}>
                                <Typography>Taux concentration</Typography>
                                <TextField
                                    fullWidth
                                    name="tauxConcentration"
                                    value={values.tauxConcentration}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.tauxConcentration && errors.tauxConcentration)}
                                    helperText={touched.tauxConcentration && errors.tauxConcentration}
                                />
                                {description.tauxConcentration && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.tauxConcentration}
                                    </Typography>
                                )}
                            </Box>

                            {/* Nombre avoir */}
                            <Box mb={2}>
                                <Typography>Nombre avoir</Typography>
                                <TextField
                                    fullWidth
                                    name="nombreAvoir"
                                    value={values.nombreAvoir}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.nombreAvoir && errors.nombreAvoir)}
                                    helperText={touched.nombreAvoir && errors.nombreAvoir}
                                />
                                {description.nombreAvoir && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.nombreAvoir}
                                    </Typography>
                                )}
                            </Box>

                            {/* Durée max paiement */}
                            <Box mb={2}>
                                <Typography>Durée max paiement (jours)</Typography>
                                <TextField
                                    fullWidth
                                    name="dureeMaxPaiement"
                                    value={values.dureeMaxPaiement}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.dureeMaxPaiement && errors.dureeMaxPaiement)}
                                    helperText={touched.dureeMaxPaiement && errors.dureeMaxPaiement}
                                />
                                {description.dureeMaxPaiement && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.dureeMaxPaiement}
                                    </Typography>
                                )}
                            </Box>

                            {/* Limite fin auto */}
                            <Box mb={2}>
                                <Typography>Limite fin auto</Typography>
                                <TextField
                                    fullWidth
                                    name="limiteFinAuto"
                                    value={values.limiteFinAuto}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.limiteFinAuto && errors.limiteFinAuto)}
                                    helperText={touched.limiteFinAuto && errors.limiteFinAuto}
                                />
                                {description.limiteFinAuto && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.limiteFinAuto}
                                    </Typography>
                                )}
                            </Box>

                            {/* Fin marge */}
                            <Box mb={2}>
                                <Typography>Fin marge (%)</Typography>
                                <TextField
                                    fullWidth
                                    name="finMarge"
                                    value={values.finMarge}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.finMarge && errors.finMarge)}
                                    helperText={touched.finMarge && errors.finMarge}
                                />
                                {description.finMarge && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.finMarge}
                                    </Typography>
                                )}
                            </Box>

                            {/* Marge ret */}
                            <Box mb={2}>
                                <Typography>Marge ret (%)</Typography>
                                <TextField
                                    fullWidth
                                    name="margeRet"
                                    value={values.margeRet}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.margeRet && errors.margeRet)}
                                    helperText={touched.margeRet && errors.margeRet}
                                />
                                {description.margeRet && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.margeRet}
                                    </Typography>
                                )}
                            </Box>

                            {/* Scanner path */}
                            <Box mb={2}>
                                <Typography>Scanner path</Typography>
                                <TextField
                                    fullWidth
                                    name="scannerPath"
                                    value={values.scannerPath}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.scannerPath && errors.scannerPath)}
                                    helperText={touched.scannerPath && errors.scannerPath}
                                    disabled
                                />
                                {description.scannerPath && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.scannerPath}
                                    </Typography>
                                )}
                            </Box>

                            {/* Nom fichier scanner */}
                            <Box mb={2}>
                                <Typography>Nom fichier scanner</Typography>
                                <TextField
                                    fullWidth
                                    name="nomFichierScanner"
                                    value={values.nomFichierScanner}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.nomFichierScanner && errors.nomFichierScanner)}
                                    helperText={touched.nomFichierScanner && errors.nomFichierScanner}
                                    disabled
                                />
                                {description.nomFichierScanner && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.nomFichierScanner}
                                    </Typography>
                                )}
                            </Box>

                            {/* Date acceptation remise */}
                            <Box mb={2}>
                                <Typography>Date acceptation remise</Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="dateAcceptationRemise"
                                    value={values.dateAcceptationRemise}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.dateAcceptationRemise && errors.dateAcceptationRemise)}
                                    helperText={touched.dateAcceptationRemise && errors.dateAcceptationRemise}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                {description.dateAcceptationRemise && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.dateAcceptationRemise}
                                    </Typography>
                                )}
                            </Box>

                            {/* Exigence littrage */}
                            <Box mb={2}>
                                <Typography>Exigence littrage</Typography>
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
                                    <MenuItem value="">Sélectionnez une option</MenuItem>
                                    <MenuItem value={true}>Oui</MenuItem>
                                    <MenuItem value={false}>Non</MenuItem>
                                </TextField>
                                {description.exigenceLittrage && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Note: {description.exigenceLittrage}
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

export default ConditionGenerale2;