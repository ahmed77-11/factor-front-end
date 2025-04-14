import { Box, Button, Step, StepLabel, Stepper, TextField, Typography, CircularProgress, useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {useEffect, useRef, useState} from "react";
import {addContratAsync, updateContratAsync} from "../../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../../redux/personne/PersonneMoraleSlice.js";
import { nextStep, previousStep, setFormData } from "../../../redux/formSteperSlice/FormSlice.js";
import ConditionGenerale1 from "../updateContrat/steps/ConditionGenerale1.jsx";
import ConditionGenerale2 from "../updateContrat/steps/ConditionGenerale2.jsx";
import ConditionGenerale3 from "../updateContrat/steps/ConditionGenerale3.jsx";
import ConditionParticulieres from "../updateContrat/steps/ConditionParticulieres.jsx";
import Header from "../../../components/Header.jsx";
import { Check } from "@mui/icons-material";
import { useNotification } from "../../../customeHooks/useNotification.jsx";
import {useCommision} from "../../../customeHooks/useCommision.jsx";
import {useContratFonds} from "../../../customeHooks/useContratFonds.jsx";
import {getNotesForStep} from "../../../helpers/getNotesForStep.js";
import {useContratDoc} from "../../../customeHooks/useContratDoc.jsx";

const steps = [
    "Sélectionner la Personne Morale",
    "Conditions Générales 1",
    "Conditions Générales 2",
    "Conditions Générales 3",
    "Conditions Particulaires",
];

const UpdateContrat = () => {
    const { notificationId } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const activeStep = useSelector((state) => state.form.step);
    const formData = useSelector((state) => state.form.formData);

    const { notification, findNotificationByNotes,  loading, notifErr: notifError } = useNotification();
    const { currentPM, loading: loadingPM } = useSelector((state) => state.personneMorale);
    const {fetchCommission, commisions, loading: commLoading} = useCommision();
    const {fetchContratFonds, contratFonds, loading: fondsLoading} = useContratFonds();
    const {fetchDocContrat, docContrat, loading: docLoading} = useContratDoc();

    const conditionRef = useRef(null);
    const [notes,setNotes] = useState("{}");





    const updateData = (data) => {
        console.log("///////",data)
        dispatch(setFormData(data))
    }
    useEffect(() => {
        const fetchData=async ()=>{

            if (notificationId) {
                await findNotificationByNotes(notificationId);

            }
        }

        fetchData()
    }, []);

    useEffect(() => {
            if (notification?.contrat) {
                console.log(notification.contrat)
                dispatch(getPMById(notification.contrat.adherent));
                fetchCommission(notification?.contrat.id)
                fetchContratFonds(notification?.contrat.id);
                fetchDocContrat(notification?.contrat.id);
            }
            if(notification?.notesContent){
                setNotes(JSON.parse(notification?.notesContent));
            }else{
                setNotes("{}");
            }

        // Safely check for notification and its contrat property

    }, [dispatch, notification]);

    useEffect(() => {
        if (currentPM) {
            handlePMSelection();
        }
    }, [currentPM]);



    console.log(commisions,contratFonds,docContrat)


    const handlePMSelection = () => {
        if (currentPM) {
            const { id, raisonSocial, email, typePieceIdentite, sigle, telNo, numeroPieceIdentite } = currentPM;
            dispatch(setFormData({
                raisonSocial,
                email,
                typePieceIdentite,
                sigle,
                telNo,
                numeroPieceIdentite,
                pmIdFK: id
            }));
        }
    };

    const handleNext = async () => {
        // For steps 1 through 4, validate the form before moving to the next step.
        if (activeStep >= 1 && activeStep <= 4 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            if (!valid) return;
        }




        const currentStepNotes=getNotesForStep(activeStep,notes);
        if(currentStepNotes.length> 0){
            alert("Vous devez d'abord valider les notes avant de passer à l'étape suivante.");
            return;
        }
        // If we're on the last step, submit the form and do not advance further.
        if (activeStep === 5) {
            handleSubmit();
            return;
        }

        dispatch(nextStep());
    };

    const handleSubmit = () => {
        console.log(formData); // Debug log

        const parseField = (value, type) => {
            if (value === undefined || value === null) return null;
            switch (type) {
                case 'string':
                    return String(value);
                case 'number':
                    return isNaN(value) ? null : Number(value);
                case 'boolean':
                    return value === 'true' || value === true;
                case 'array':
                    return Array.isArray(value) ? value : [];
                case 'object':
                    return typeof value === 'object' && value !== null ? value : {};
                default:
                    return value;
            }
        };

        console.log(notification)

        const formFields = {
            devise: formData.devise,
            contratPrevChiffreTotal: parseField(formData.previsionChiffreTotal, 'number'),
            contratPrevChiffreLocal: parseField(formData.previsionChiffreLocal, 'number'),
            contratPrevChiffreExport: parseField(formData.previsionChiffreExport, 'number'),
            contratPrevAchet: parseField(formData.nombreAcheteur, 'number'),
            contratPrevNbrRemise: parseField(formData.nombreRemise, 'number'),
            contratPrevNbrDocRemise: parseField(formData.nombreDocumentRemise, 'number'),
            contratTauxConcentration: parseField(formData.tauxConcentration, 'number'),
            contratPrevNbrAvoir: parseField(formData.nombreAvoir, 'number'),
            contratDelaiMaxPai: parseField(formData.dureeMaxPaiement, 'number'),
            contratLimiteFinAuto: parseField(formData.limiteFinAuto, 'number'),
            contratMargeFin: parseField(formData.finMarge, 'number'),
            contratMargeRet: parseField(formData.margeRet, 'number'),
            contratAcceptRemiseDate: parseField(formData.dateAcceptationRemise, 'string'),
            contratBoolLettrage: parseField(formData.exigenceLittrage, 'boolean'),

            // commissions: Array.isArray(formData.commissions)
            //     ? formData.commissions.map(commission => ({
            //         typeEvent: commission.TypeEvent,
            //         typeDocRemise: commission.TypeDocRemise,
            //         typeComm: commission.TypeCommission,
            //         periodicite: parseField(commission?.Periodicite, 'number'),
            //         commMinorant: parseField(commission?.Minorant, 'number'),
            //         commA: parseField(commission?.CommA, 'number'),
            //         commX: parseField(commission?.CommX, 'number'),
            //         commB: parseField(commission?.CommB, 'number'),
            //         commMajorant: parseField(commission?.Majorant, 'number'),
            //         validDateDeb: parseField(commission?.ValidDateDeb, 'string'),
            //         validDateFin: parseField(commission?.ValidDateFin, 'string'),
            //         contrat: { id: notification.contrat.id }  // Add contract reference
            //
            //     }))
            //     : [],
            // commissions:formData.commissions.map(commission => ({
            //             typeEvent: commission.TypeEvent,
            //             typeDocRemise: commission.TypeDocRemise,
            //             typeComm: commission.TypeCommission,
            //             periodicite: parseField(commission?.Periodicite, 'number'),
            //             commMinorant: parseField(commission?.Minorant, 'number'),
            //             commA: parseField(commission?.CommA, 'number'),
            //             commX: parseField(commission?.CommX, 'number'),
            //             commB: parseField(commission?.CommB, 'number'),
            //             commMajorant: parseField(commission?.Majorant, 'number'),
            //             validDateDeb: parseField(commission?.ValidDateDeb, 'string'),
            //             validDateFin: parseField(commission?.ValidDateFin, 'string'),
            //             contrat: { id: notification.contrat.id }  // Add contract reference
            //
            //         })),

            // contratFonds: Array.isArray(formData.fondGaranti)
            //     ? formData.fondGaranti.map(fond => ({
            //         garantieTaux: parseField(fond?.TauxGarantie, 'number'),
            //         reserveTaux: parseField(fond?.TauxReserve, 'number'),
            //         typeDocRemiseId: {id: 1},
            //         contrat: { id: notification.contrat.id }  // Add contract reference
            //
            //     }))
            //     : [],
            // contratFonds:formData.fondGaranti.map(fond => ({
            //             garantieTaux: parseField(fond?.TauxGarantie, 'number'),
            //             reserveTaux: parseField(fond?.TauxReserve, 'number'),
            //             typeDocRemiseId: {id: 1},
            //             contrat: { id: notification.contrat.id }  // Add contract reference
            //
            //         })),
            commissions:formData.commissions,
            contratFonds:formData.fondGaranti,
            docContrats:formData.docContrats,

            tmm: parseField(formData.tmm, 'number'),
            contratTmm: parseField(formData.tmmText, 'number'),
            contratResiliationTexte: parseField(formData.resiliation, 'string'),
            contratRevisionDate: parseField(formData.dateRevision, 'string'),
            contratResiliationDate: parseField(formData.dateResiliation, 'string'),

            typeFactoring: formData.typeFactoring || null,
            contratBoolRecours: formData.typeContrat !== undefined ? parseField(formData.typeContrat, 'boolean') : null,
            contratNo: parseField(formData.NumContrat, 'string'),
            contratComiteRisqueTexte: parseField(formData.comiteRisque, 'string'),
            contratComiteDerogTexte: parseField(formData.comiteDerogation, 'string'),
            adherentData: {
                raisonSocial: parseField(formData.raisonSocial, 'string'),
                email: parseField(formData.email, 'string'),
                typePieceIdentite: parseField(formData.typePieceIdentite?.dsg, 'string'),
                sigle: parseField(formData.sigle, 'string'),
                telNo: parseField(formData.telNo, 'string'),
                numeroPieceIdentite: parseField(formData.numeroPieceIdentite, 'string'),
            },
            adherent: parseField(formData.pmIdFK, 'number'),

            // Contract fields from the notification:
            id: notification.contrat.id, // Contract ID from the notification

            // New fields:
            contratEtape1RedacteurDate: notification?.contrat.contratEtape1RedacteurDate, // Step 1 Redactor Date
            contratEtape1RedacteurNom: notification?.contrat.contratEtape1RedacteurNom, // Step 1 Redactor Name
            // contratEtape2ValidateurDate: notification.contratEtape2ValidateurDate, // Step 2 Validater Date
            // contratEtape2ValidateurNom: notification.contratEtape2ValidateurNom, // Step 2 Validater Name
            // contratEtape3JuristeDate: notification.contratEtape3JuristeDate, // Step 3 Jurist Date
            // contratEtape3JuristeNom: notification.contratEtape3JuristeNom, // Step 3 Jurist Name
            // contratEtape4SignataireDate: notification.contratEtape4SignataireDate, // Step 4 Signatory Date
            // contratEtape4SignataireNom: notification.contratEtape4SignataireNom, // Step 4 Signatory Name
            // cautionPp: notification.cautionPp, // Caution PP
            // cautionPm: notification.cautionPm, // Caution PM
            // contratEtape5CautionNom: notification.contratEtape5CautionNom, // Step 5 Caution Name
            // contratEtape5CautionTypeCode: notification.contratEtape5CautionTypeCode, // Step 5 Caution Type Code
            // contratEtape5CautionTypeNo: notification.contratEtape5CautionTypeNo, // Step 5 Caution Type Number
            // contratEtape5CautionMontant: notification.contratEtape5CautionMontant, // Step 5 Caution Amount
            contratValider: notification?.contrat.contratValider, // Contract validated
            contratSigner: notification?.contrat.contratSigner, // Contract signed
        };

        console.log("Parsed Form Fields:", formFields);
        dispatch(updateContratAsync(formFields, navigate,notification.notification?.notificationTaskId));


        if (loading || loadingPM) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress/>
                </Box>
            );
        }
    }

    if (notifError) {
        return (
            <Box textAlign="center" p={4}>
                <Typography variant="h6" color="error">Erreur: {notifError}</Typography>
            </Box>
        );
    }
    console.log("///////",notes)

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box width="100%" maxWidth="500px" p={3}>
                        <Typography variant="h6">L&#39;Adhérent Associé au Contrat</Typography>
                        <TextField
                            fullWidth
                            label="Personne Morale Sélectionnée"
                            value={
                                currentPM
                                    ? `${currentPM?.raisonSocial} - ${currentPM?.typePieceIdentite?.dsg} ${currentPM?.numeroPieceIdentite}`
                                    : ""
                            }
                            margin="normal"
                            disabled
                        />

                    </Box>
                );
            case 1:
                return (
                    <ConditionGenerale1
                        data={notification}
                        description={notes}
                        updateNotes={setNotes}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}

                    />
                );
            case 2:
                return (
                    <ConditionGenerale2
                        data={notification}
                        description={notes}
                        updateNotes={setNotes}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                    />
                );
            case 3:
                return (
                    <ConditionGenerale3
                        data={notification}
                        description={notes}
                        updateNotes={setNotes}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                    />
                );
            case 4:
                return (
                    <>
                        {commLoading || fondsLoading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                                <Typography variant="h6" ml={2}>Loading financial data...</Typography>
                            </Box>
                        ) : (
                            <ConditionParticulieres
                                ref={conditionRef}
                                description={notes}
                                updateNotes={setNotes}
                                formData={formData}
                                commissions={commisions}
                                contratFonds={contratFonds}
                                docContrats={docContrat}
                                updateData={updateData}
                            />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            <Header title="MODIFIER UN CONTRAT" subtitle="Modifier un contrat existant" />
            <Box sx={{ width: "100%", maxWidth: "800px", my: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel
                                StepIconComponent={(props) =>
                                    props.completed ? <Check color="success" /> : <div>{props.icon}</div>
                                }
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            {(loading || loadingPM || commLoading || fondsLoading) && (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                    <Typography variant="h6" ml={2}>Loading contract data...</Typography>
                </Box>
            )}
            {renderStepContent(activeStep)}
            <Box display="flex" gap={2} mt={3}>
                <Button
                    variant="outlined"
                    sx={{ backgroundColor: colors.primary[900] }}
                    disabled={activeStep === 0}
                    onClick={() => dispatch(previousStep())}
                >
                    Retour
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ backgroundColor: colors.greenAccent[700] }}
                    onClick={handleNext}
                    disabled={loading || loadingPM}
                >
                    Suivant
                </Button>
            </Box>
        </Box>
    );
};

export default UpdateContrat;
