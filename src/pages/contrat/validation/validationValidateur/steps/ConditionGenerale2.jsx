/* eslint-disable no-unused-vars,react/prop-types,react/display-name */
import { forwardRef, useEffect } from "react";
import { Box, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Formik } from "formik";
import * as yup from "yup";
import { useDevise } from "../../../../../customeHooks/useDevise.jsx";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../../redux/formSteperSlice/FormSlice.js";
import NotesDescription from "../../../../../helpers/NotesDescription.jsx";

const DisabledField = ({ children }) => (
    <Box position="relative">
        {children}
    </Box>
);

const ConditionGenerale2 = forwardRef(({ formData, updateData, data, handleOpenNoteModal, description }, ref) => {
    const { devises, loading, error } = useDevise();
    const dispatch = useDispatch();

    const initialValues = {
        devise: formData?.devise || data?.notificationContratId?.devise || {},
        previsionChiffreTotal: formData?.previsionChiffreTotal || data?.notificationContratId?.contratPrevChiffreTotal?.toString() || "",
        previsionChiffreLocal: formData?.previsionChiffreLocal || data?.notificationContratId?.contratPrevChiffreLocal?.toString() || "",
        previsionChiffreExport: formData?.previsionChiffreExport || data?.notificationContratId?.contratPrevChiffreExport?.toString() || "",
        nombreAcheteur: formData?.nombreAcheteur || data?.notificationContratId?.contratPrevNbrAchet?.toString() || "",
        nombreRemise: formData?.nombreRemise || data?.notificationContratId?.contratPrevNbrRemise?.toString() || "",
        nombreFourn: formData?.nombreAcheteur || data?.notificationContratId?.contratPrevNbrFourn?.toString() || "",
        nombreAcheteurHorsComm: formData?.nombreAcheteur || data?.notificationContratId?.contratHorsCommNbrAchet?.toString() || "",
        nombreFournHorsComm: formData?.nombreAcheteur || data?.notificationContratId?.contratHorsCommNbrFourn?.toString() || "",
        nombreDocumentRemise: formData?.nombreDocumentRemise || data?.notificationContratId?.contratPrevNbrDocRemise?.toString() || "",
        tauxConcentration: formData?.tauxConcentration || data?.notificationContratId?.contratTauxConcentration?.toString() || "",
        nombreAvoir: formData?.nombreAvoir || data?.notificationContratId?.contratPrevNbrAvoir?.toString() || "",
        dureeMaxPaiement: formData?.dureeMaxPaiement || data?.notificationContratId?.contratDelaiMaxPai?.toString() || "",
        limiteFinAuto: formData?.limiteFinAuto || data?.notificationContratId?.contratLimiteFinAuto?.toString() || "",
        finMarge: formData?.finMarge || data?.notificationContratId?.contratMargeFin?.toString() || "",
        margeRet: formData?.margeRet || data?.notificationContratId?.contratMargeRet?.toString() || "",
        scannerPath: formData?.scannerPath || data?.notificationContratId?.contratScanPath || "",
        nomFichierScanner: formData?.nomFichierScanner || data?.notificationContratId?.contratScanFileName || "",
        dateAcceptationRemise: formData?.dateAcceptationRemise || data?.notificationContratId?.contratAcceptRemiseDate?.split('T')[0] || "",
        // exigenceLittrage: formData?.exigenceLittrage || data?.notificationContratId?.contratBoolLettrage?.toString() || "",
    };

    const validationSchema = yup.object().shape({
        devise: yup.object().required("La devise est requise"),
        previsionChiffreTotal: yup.string().required("Le chiffre total prévisionnel est requis"),
        previsionChiffreLocal: yup.string().required("Le chiffre local prévisionnel est requis"),
        previsionChiffreExport: yup.string().required("Le chiffre export prévisionnel est requis"),
        nombreAcheteur: yup.string().required("Le nombre d'acheteur est requis"),
        nombreAcheteurHorsComm: yup.string().required("Champ requis"),
        nombreFourn: yup.string().required("Champ requis"),
        nombreFournHorsComm: yup.string().required("Champ requis"),
        nombreRemise: yup.string().required("Le nombre de remise est requis"),
        nombreDocumentRemise: yup.string().required("Le nombre de document de remise est requis"),
        tauxConcentration: yup.string().required("Le taux de concentration est requis"),
        nombreAvoir: yup.string().required("Le nombre d'avoir est requis"),
        dureeMaxPaiement: yup.string().required("La durée maximale de paiement est requise"),
        limiteFinAuto: yup.string().required("La limite fin auto est requise"),
        finMarge: yup.string().required("La fin de marge est requise"),
        margeRet: yup.string().required("La marge ret est requise"),
        scannerPath: yup.string(),
        nomFichierScanner: yup.string(),
        dateAcceptationRemise: yup.string().required("La date d'acceptation de remise est requise"),
        // exigenceLittrage: yup.string().required("L'exigence de littrage est requise"),
    });

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
                {({ values, errors, touched }) => {
                    useEffect(() => {
                        dispatch(setFormData(values));
                    }, [values, dispatch]);

                    return (
                        <form>
                            {/* Devise */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Devise</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('devise')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        select
                                        fullWidth
                                        name="devise"
                                        value={values.devise?.id || ""}
                                        disabled
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
                                </DisabledField>
                                {description.devise && (
                                    <NotesDescription msg={description.devise}/>
                                )}
                            </Box>

                            {/* Prévision chiffre total */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Prévision chiffre total</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('previsionChiffreTotal')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="previsionChiffreTotal"
                                        value={values.previsionChiffreTotal}
                                        disabled
                                        error={Boolean(touched.previsionChiffreTotal && errors.previsionChiffreTotal)}
                                        helperText={touched.previsionChiffreTotal && errors.previsionChiffreTotal}
                                    />
                                </DisabledField>
                                {description.previsionChiffreTotal && (
                                    <NotesDescription msg={description.previsionChiffreTotal}/>


                                )}
                            </Box>

                            {/* Prévision chiffre local */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Prévision chiffre local</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('previsionChiffreLocal')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="previsionChiffreLocal"
                                        value={values.previsionChiffreLocal}
                                        disabled
                                        error={Boolean(touched.previsionChiffreLocal && errors.previsionChiffreLocal)}
                                        helperText={touched.previsionChiffreLocal && errors.previsionChiffreLocal}
                                    />
                                </DisabledField>
                                {description.previsionChiffreLocal && (
                                    <NotesDescription msg={description.previsionChiffreLocal}/>
                                )}
                            </Box>

                            {/* Prévision chiffre export */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Prévision chiffre export</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('previsionChiffreExport')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="previsionChiffreExport"
                                        value={values.previsionChiffreExport}
                                        disabled
                                        error={Boolean(touched.previsionChiffreExport && errors.previsionChiffreExport)}
                                        helperText={touched.previsionChiffreExport && errors.previsionChiffreExport}
                                    />
                                </DisabledField>
                                {description.previsionChiffreExport && (
                                    <NotesDescription msg={description.previsionChiffreExport}/>
                                )}
                            </Box>

                            {/* Nombre acheteur */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre acheteur</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreAcheteur')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreAcheteur"
                                        value={values.nombreAcheteur}
                                        disabled
                                        error={Boolean(touched.nombreAcheteur && errors.nombreAcheteur)}
                                        helperText={touched.nombreAcheteur && errors.nombreAcheteur}
                                    />
                                </DisabledField>
                                {description.nombreAcheteur && (
                                    <NotesDescription msg={description.nombreAcheteur}/>
                                )}
                            </Box>
                            {/* Nombre Acheteur Hors Comm */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre acheteur Hors Commission</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreAcheteurHorsComm')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreAcheteurHorsComm"
                                        value={values.nombreAcheteurHorsComm}
                                        disabled
                                        error={Boolean(touched.nombreAcheteurHorsComm && errors.nombreAcheteurHorsComm)}
                                        helperText={touched.nombreAcheteurHorsComm && errors.nombreAcheteurHorsComm}
                                    />
                                </DisabledField>
                                {description.nombreAcheteurHorsComm && (
                                    <NotesDescription msg={description.nombreAcheteurHorsComm}/>
                                )}
                            </Box>

                            {/* Nombre Fourn */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre Fournisseur</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreFourn')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreFourn"
                                        value={values.nombreFourn}
                                        disabled
                                        error={Boolean(touched.nombreFourn && errors.nombreFourn)}
                                        helperText={touched.nombreFourn && errors.nombreFourn}
                                    />
                                </DisabledField>
                                {description.nombreFourn && (
                                    <NotesDescription msg={description.nombreFourn}/>
                                )}
                            </Box>

                            {/* Nombre Fourn hors comm */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre Fournisseur Hors Commission</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreFournHorsComm')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreFournHorsComm"
                                        value={values.nombreFourn}
                                        disabled
                                        error={Boolean(touched.nombreFournHorsComm && errors.nombreFournHorsComm)}
                                        helperText={touched.nombreFournHorsComm && errors.nombreFournHorsComm}
                                    />
                                </DisabledField>
                                {description.nombreFournHorsComm && (
                                    <NotesDescription msg={description.nombreFournHorsComm}/>
                                )}
                            </Box>

                            {/* Nombre remise */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre remise</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreRemise')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreRemise"
                                        value={values.nombreRemise}
                                        disabled
                                        error={Boolean(touched.nombreRemise && errors.nombreRemise)}
                                        helperText={touched.nombreRemise && errors.nombreRemise}
                                    />
                                </DisabledField>
                                {description.nombreRemise && (
                                    <NotesDescription msg={description.nombreRemise}/>
                                )}
                            </Box>

                            {/* Nombre document remise */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre document remise</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreDocumentRemise')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreDocumentRemise"
                                        value={values.nombreDocumentRemise}
                                        disabled
                                        error={Boolean(touched.nombreDocumentRemise && errors.nombreDocumentRemise)}
                                        helperText={touched.nombreDocumentRemise && errors.nombreDocumentRemise}
                                    />
                                </DisabledField>
                                {description.nombreDocumentRemise && (
                                    <NotesDescription msg={description.nombreDocumentRemise}/>
                                )}
                            </Box>

                            {/* Taux concentration */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Taux concentration</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('tauxConcentration')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="tauxConcentration"
                                        value={values.tauxConcentration}
                                        disabled
                                        error={Boolean(touched.tauxConcentration && errors.tauxConcentration)}
                                        helperText={touched.tauxConcentration && errors.tauxConcentration}
                                    />
                                </DisabledField>
                                {description.tauxConcentration && (
                                    <NotesDescription msg={description.tauxConcentration}/>
                                )}
                            </Box>

                            {/* Nombre avoir */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nombre avoir</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nombreAvoir')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nombreAvoir"
                                        value={values.nombreAvoir}
                                        disabled
                                        error={Boolean(touched.nombreAvoir && errors.nombreAvoir)}
                                        helperText={touched.nombreAvoir && errors.nombreAvoir}
                                    />
                                </DisabledField>
                                {description.nombreAvoir && (
                                    <NotesDescription msg={description.nombreAvoir}/>
                                )}
                            </Box>

                            {/* Durée max paiement */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Durée max paiement (jours)</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('dureeMaxPaiement')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="dureeMaxPaiement"
                                        value={values.dureeMaxPaiement}
                                        disabled
                                        error={Boolean(touched.dureeMaxPaiement && errors.dureeMaxPaiement)}
                                        helperText={touched.dureeMaxPaiement && errors.dureeMaxPaiement}
                                    />
                                </DisabledField>
                                {description.dureeMaxPaiement && (
                                    <NotesDescription msg={description.dureeMaxPaiement}/>
                                )}
                            </Box>

                            {/* Limite fin auto */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Limite fin auto</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('limiteFinAuto')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="limiteFinAuto"
                                        value={values.limiteFinAuto}
                                        disabled
                                        error={Boolean(touched.limiteFinAuto && errors.limiteFinAuto)}
                                        helperText={touched.limiteFinAuto && errors.limiteFinAuto}
                                    />
                                </DisabledField>
                                {description.limiteFinAuto && (
                                    <NotesDescription msg={description.limiteFinAuto}/>
                                )}
                            </Box>

                            {/* Fin marge */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography> marge De Financement (%)</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('finMarge')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="finMarge"
                                        value={values.finMarge}
                                        disabled
                                        error={Boolean(touched.finMarge && errors.finMarge)}
                                        helperText={touched.finMarge && errors.finMarge}
                                    />
                                </DisabledField>
                                {description.finMarge && (
                                    <NotesDescription msg={description.finMarge}/>
                                )}
                            </Box>

                            {/* Marge ret */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Marge Intéret du retard (%)</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('margeRet')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="margeRet"
                                        value={values.margeRet}
                                        disabled
                                        error={Boolean(touched.margeRet && errors.margeRet)}
                                        helperText={touched.margeRet && errors.margeRet}
                                    />
                                </DisabledField>
                                {description.margeRet && (
                                    <NotesDescription msg={description.margeRet}/>
                                )}
                            </Box>

                            {/* Scanner path */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Scanner path</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('scannerPath')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="scannerPath"
                                        value={values.scannerPath}
                                        disabled
                                        error={Boolean(touched.scannerPath && errors.scannerPath)}
                                        helperText={touched.scannerPath && errors.scannerPath}
                                    />
                                </DisabledField>
                                {description.scannerPath && (
                                    <NotesDescription msg={description.scannerPath}/>
                                )}
                            </Box>

                            {/* Nom fichier scanner */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Nom fichier scanner</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('nomFichierScanner')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="nomFichierScanner"
                                        value={values.nomFichierScanner}
                                        disabled
                                        error={Boolean(touched.nomFichierScanner && errors.nomFichierScanner)}
                                        helperText={touched.nomFichierScanner && errors.nomFichierScanner}
                                    />
                                </DisabledField>
                                {description.nomFichierScanner && (
                                    <NotesDescription msg={description.nomFichierScanner}/>
                                )}
                            </Box>

                            {/* Date acceptation remise */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Date acceptation remise</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('dateAcceptationRemise')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        name="dateAcceptationRemise"
                                        value={values.dateAcceptationRemise}
                                        disabled
                                        error={Boolean(touched.dateAcceptationRemise && errors.dateAcceptationRemise)}
                                        helperText={touched.dateAcceptationRemise && errors.dateAcceptationRemise}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </DisabledField>
                                {description.dateAcceptationRemise && (
                                    <NotesDescription msg={description.dateAcceptationRemise}/>
                                )}
                            </Box>

                            {/* Exigence littrage */}
                            {/*<Box mb={2}>*/}
                            {/*    <Box display="flex" alignItems="center" justifyContent="space-between">*/}
                            {/*        <Typography>Exigence littrage</Typography>*/}
                            {/*        <IconButton*/}
                            {/*            onClick={() => handleOpenNoteModal('exigenceLittrage')}*/}
                            {/*            size="small"*/}
                            {/*            sx={{ ml: 1 }}*/}
                            {/*        >*/}
                            {/*            <EditIcon fontSize="small" />*/}
                            {/*        </IconButton>*/}
                            {/*    </Box>*/}
                            {/*    <DisabledField>*/}
                            {/*        <TextField*/}
                            {/*            select*/}
                            {/*            fullWidth*/}
                            {/*            name="exigenceLittrage"*/}
                            {/*            value={values.exigenceLittrage}*/}
                            {/*            disabled*/}
                            {/*            error={Boolean(touched.exigenceLittrage && errors.exigenceLittrage)}*/}
                            {/*            helperText={touched.exigenceLittrage && errors.exigenceLittrage}*/}
                            {/*        >*/}
                            {/*            <MenuItem value="">Sélectionnez une option</MenuItem>*/}
                            {/*            <MenuItem value="true">Oui</MenuItem>*/}
                            {/*            <MenuItem value="false">Non</MenuItem>*/}
                            {/*        </TextField>*/}
                            {/*    </DisabledField>*/}
                            {/*    {description.exigenceLittrage && (*/}
                            {/*        <NotesDescription msg={description.exigenceLittrage}/>*/}
                            {/*    )}*/}
                            {/*</Box>*/}
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale2;