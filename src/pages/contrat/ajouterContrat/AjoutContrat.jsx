/* eslint-disable react/prop-types */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { nextStep, previousStep, setFormData } from "../../../redux/formSteperSlice/FormSlice.js";
import {
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    TextField,
    MenuItem,
    useTheme,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import Header from "../../../components/Header.jsx";
import ConditionGenerale1 from "./steps/ConditionGenerale1.jsx";
import ConditionGenerale2 from "./steps/ConditionGenerale2.jsx";
import ConditionGenerale3 from "./steps/ConditionGenerale3.jsx";
import ConditionParticulieres from "./steps/ConditionParticulieres.jsx";
import { getPM } from "../../../redux/personne/PersonneMoraleSlice.js";
import { tokens } from "../../../theme.js";
import {addContratAsync} from "../../../redux/contrat/ContratSlice.js";

const steps = [
    "Sélectionner la Personne Morale",
    "Conditions Générales 1",
    "Conditions Générales 2",
    "Conditions Générales 3",
    "Conditions Particulières",
];

const AjoutContrat = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const activeStep = useSelector((state) => state.form.step);
    const formData = useSelector((state) => state.form.formData);
    const { personneMorales, loading } = useSelector(
        (state) => state.personneMorale
    );
    const {loading:loadingContrat,error:errContrat} = useSelector((state) => state.contrat);
    // Reference for the form step (ConditionGenerale1)
    const conditionRef = useRef(null);

    // We expect the PM id to be stored in formData.pmIdFK.
    const selectedPMId = formData.pmIdFK || "";
    useEffect(() => {
        dispatch(getPM());
    }, [dispatch]);

    // When a PM is selected, update Redux with the flat PM data.
    const handlePMSelection = (e) => {
        const selectedId = Number(e.target.value);
        const selectedPM = personneMorales.find((pm) => pm.id === selectedId);
        if (selectedPM) {
            const { id, raisonSocial,email,typePieceIdentite,sigle,telNo,numeroPieceIdentite } = selectedPM;
            dispatch(setFormData({ raisonSocial,email,typePieceIdentite,sigle,telNo,numeroPieceIdentite, pmIdFK: id }));
        }
    };

    const handleCreateAdherent = () => {
        navigate("/ajouter-pm", { state: { returnTo: "/ajout-contrat" } });
    };

    const handleNext = async () => {
        // For step 1, validate the form before moving to next step.
        if (activeStep === 1 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            if (!valid) return;
        }
        if (activeStep === 2 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            if (!valid) return;
        }
        if (activeStep === 3 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            console.log('Step 3 submit valid:', valid);


            if (!valid) return;
        }
        if (activeStep === 4 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            if (!valid) return;

        }
        if(activeStep===5){
            handleSubmit();
        }

        dispatch(nextStep());
    };
    const handleSubmit = () => {
        console.log(formData); // Log the form data for debugging

        const parseField = (value, type) => {
            if (value === undefined || value === null) return null;

            switch (type) {
                case 'string':
                    return String(value);  // Ensure value is a string
                case 'number':
                    return isNaN(value) ? null : Number(value);  // Convert to number or return null if invalid
                case 'boolean':
                    return value === 'true' || value === true; // Convert to boolean
                case 'array':
                    return Array.isArray(value) ? value : [];  // Ensure it's an array
                case 'object':
                    return typeof value === 'object' && value !== null ? value : {};  // Ensure it's an object
                default:
                    return value;
            }
        };

        // Parse the form fields and set the values to the correct type
        const formFields = {
            devise: formData.devise,
            contratPrevChiffreTotal: parseField(formData.previsionChiffreTotal, 'number'),
            contratPrevChiffreLocal: parseField(formData.previsionChiffreLocal, 'number'),
            contratPrevChiffreExport: parseField(formData.previsionChiffreExport, 'number'),
            contratPrevNbrAchet: parseField(formData.nombreAcheteur, 'number'),
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

            commissions: Array.isArray(formData.commissions) ? formData.commissions.map(commission => ({
                // typeEvent: {
                //     id:parseField(commission?.TypeEvent, 'number')
                // } ,
                // typeDocRemise: { id: parseField(commission?.TypeDocRemise, 'number') },
                // typeComm: { id: parseField(commission?.TypeCommission, 'number') },
                typeEvent: commission.TypeEvent, // Entire object
                typeDocRemise: commission.TypeDocRemise, // Entire object
                typeComm: commission.TypeCommission, // Entire object
                periodicite: parseField(commission?.Periodicite, 'number'),
                commMinorant: parseField(commission?.Minorant, 'number'),
                commA: parseField(commission?.CommA, 'number'),
                commX: parseField(commission?.CommX, 'number'),
                commB: parseField(commission?.CommB, 'number'),
                commMajorant: parseField(commission?.Majorant, 'number'),
                validDateDeb: parseField(commission?.ValidDateDeb, 'string'),
                validDateFin: parseField(commission?.ValidDateFin, 'string'),
            })) : [],

            contratFonds: Array.isArray(formData.fondGaranti) ? formData.fondGaranti.map(fond => ({
                garantieTaux: parseField(fond?.TauxGarantie, 'number'),
                reserveTaux: parseField(fond?.TauxReserve, 'number'),
                typeDocRemiseId: fond.TypeDocRemise

            })) : [],

            docContrats: Array.isArray(formData.docContrats) ? formData.docContrats.map(doc => ({
                typeDocContrat:doc.typeDocContrat,
                docContratDelivDate: parseField(doc?.docContratDelivDate, 'string'),
                docContratExpireDate:parseField(doc?.docContratExpireDate, 'string'),
                docContratApprobationDate: parseField(doc?.docContratApprobationDate, 'string'),
                docContratEffetDate: parseField(doc?.docContratEffetDate, 'string'),
                docContratRelanceDate:parseField(doc?.docContratRelanceDate, 'string'),
                docContratScanPath: parseField(doc?.docContratScanPath, 'string'),
                docContratScanFileName: parseField(doc?.docContratScanFileName, 'string'),
            })) : [],






            tmm: parseField(formData.tmm, 'number'),
            contratTmm: parseField(formData.tmmText, 'number'),
            // contratResiliationTexte: parseField(formData.resiliation, 'string'),
            contratRevisionDate: parseField(formData.dateRevision, 'string'),
            // contratResiliationDate: parseField(formData.dateResiliation, 'string'),

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
        };

        // Log the parsed fields
        console.log("Parsed Form Fields:", formFields);

        // Dispatch the action after parsing the fields
        dispatch(addContratAsync(formFields, navigate));

    };



    // Render content for each step.
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box width="100%" maxWidth="500px" p={3}>
                        <Typography variant="h6">Sélectionner une Personne Morale</Typography>
                        <TextField
                            select
                            fullWidth
                            label="Choisissez une Personne Morale"
                            value={selectedPMId}
                            onChange={handlePMSelection}
                            margin="normal"
                        >
                            {loading ? (
                                <MenuItem value="">Chargement...</MenuItem>
                            ) : personneMorales.length === 0 ? (
                                <MenuItem value="">Aucune Personne Morale trouvée</MenuItem>
                            ) : (
                                personneMorales.map((pm) => (
                                    <MenuItem key={pm.id} value={pm.id}>
                                        {pm.raisonSocial} - {pm.typePieceIdentite?.dsg} {pm.numeroPieceIdentite}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>
                        {!selectedPMId && (
                            <Box mt={3} textAlign="center">
                                <Typography variant="body1">
                                    Aucune Personne Morale sélectionnée ?
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleCreateAdherent}
                                    sx={{ mt: 2 }}
                                >
                                    Créer une nouvelle Personne Morale
                                </Button>
                            </Box>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <ConditionGenerale1
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                    />
                );
            case 2:
                return (
                    <ConditionGenerale2
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                    />
                );
            case 3:
                return (
                    <ConditionGenerale3
                        ref={conditionRef}

                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}

                    />
                );
            case 4:
                return (
                    <ConditionParticulieres
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            <Header title="CRÉER UN CONTRAT" subtitle="Créer un nouveau contrat" />
            <Box sx={{ width: "100%", maxWidth: "800px", my: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel
                                StepIconComponent={(props) =>
                                    props.completed ? (
                                        <Check color="success" />
                                    ) : (
                                        <div>{props.icon}</div>
                                    )
                                }
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
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
                    disabled={activeStep === 0 && !selectedPMId}
                >
                    Suivant
                </Button>
            </Box>
        </Box>
    );
};

export default AjoutContrat;
