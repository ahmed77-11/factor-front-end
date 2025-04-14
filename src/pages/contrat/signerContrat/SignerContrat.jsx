import {
    Box,
    Button,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    CircularProgress,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { tokens } from "../../../theme";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {fetchContratByIdAsync, signerContratAsync, updateContratAsync} from "../../../redux/contrat/ContratSlice";
import { getPMById } from "../../../redux/personne/PersonneMoraleSlice";
import { nextStep, previousStep, setFormData } from "../../../redux/formSteperSlice/FormSlice";
import ConditionGenerale1 from "./steps/ConditionGenerale1";
import ConditionGenerale2 from "./steps/ConditionGenerale2";
import ConditionGenerale3 from "./steps/ConditionGenerale3";
import ConditionParticulieres from "./steps/ConditionParticulieres";
import Header from "../../../components/Header";
import { Check } from "@mui/icons-material";
import { useCommision } from "../../../customeHooks/useCommision";
import { useContratFonds } from "../../../customeHooks/useContratFonds";

const steps = [
    "Sélectionner la Personne Morale",
    "Conditions Générales 1",
    "Conditions Générales 2",
    "Conditions Générales 3",
    "Conditions Particulaires",
];

const SignerContrat = () => {
    const { contratId } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeField, setActiveField] = useState(null);
    const [tempNote, setTempNote] = useState("");
    const [description, setDescription] = useState({});

    const activeStep = useSelector((state) => state.form.step);
    const formData = useSelector((state) => state.form.formData);
    const { currentContrat, loading: contratLoading } = useSelector((state) => state.contrat);
    const { currentPM, loading: loadingPM } = useSelector((state) => state.personneMorale);

    const { fetchCommission, commisions, loading: commLoading } = useCommision();
    const { fetchContratFonds, contratFonds, loading: fondsLoading } = useContratFonds();

    const conditionRef = useRef(null);

    // Fetch initial contract data
    useEffect(() => {
        dispatch(fetchContratByIdAsync(contratId));
    }, [contratId, dispatch]);

    // Fetch dependent data when contract loads
    useEffect(() => {
        const fetchDependentData = async () => {
            if (currentContrat?.adherent) {
                try {
                    await dispatch(getPMById(currentContrat.adherent));
                    await fetchCommission(contratId);
                    await fetchContratFonds(contratId);
                } catch (error) {
                    console.error("Error fetching dependent data:", error);
                }
            }
        };

        if (currentContrat) {
            fetchDependentData();
        }
    }, [currentContrat, dispatch, contratId]);

    const handleTaskEvent = (decision) => {
        const descriptionStr = JSON.stringify(description);
        navigate("/contrats");
    };

    const handleOpenNoteModal = (fieldName) => {
        setActiveField(fieldName);
        setTempNote(description[fieldName] || "");
    };

    const handleCloseNoteModal = () => {
        setActiveField(null);
        setTempNote("");
    };

    const handleSaveNote = () => {
        setDescription(prev => ({ ...prev, [activeField]: tempNote }));
        handleCloseNoteModal();
    };

    const handleNext = async () => {
        if (activeStep >= 1 && activeStep <= 4 && conditionRef.current) {
            const valid = await conditionRef.current.submit();
            if (!valid) return;
        }
        dispatch(nextStep());
    };

    const handleSubmit = (decision) => {
        // const updatedContrat = {
        //     ...currentContrat,
        //     ...formData,
        //     contratSigner: decision === "accept",    
        //     description: JSON.stringify(description)
        // };
        dispatch(signerContratAsync(contratId, navigate));
    };

    const renderStepContent = (step) => {
        // Show loading state for all dependent data
        if (contratLoading || loadingPM || commLoading || fondsLoading) {
            return (
                <Box display="flex" justifyContent="center" height="100vh">
                    <CircularProgress size={80} />
                    <Typography variant="h6" ml={2}>Chargement des données...</Typography>
                </Box>
            );
        }

        switch (step) {
            case 0:
                return (
                    <Box width="100%" maxWidth="500px" p={3}>
                        <Typography variant="h6">L&#39;Adhérent Associé au Contrat</Typography>
                        {currentPM ? (
                            <TextField
                                fullWidth
                                label="Personne Morale Sélectionnée"
                                value={`${currentPM.raisonSocial} - ${currentPM.numeroPieceIdentite}`}
                                margin="normal"
                                disabled
                            />
                        ) : (
                            <Box textAlign="center" p={2}>
                                <CircularProgress />
                                <Typography>Chargement des informations de l'adhérent...</Typography>
                            </Box>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <ConditionGenerale1
                        data={currentContrat}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                        handleOpenNoteModal={handleOpenNoteModal}
                        description={description}
                    />
                );
            case 2:
                return (
                    <ConditionGenerale2
                        data={currentContrat}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                        handleOpenNoteModal={handleOpenNoteModal}
                        description={description}
                    />
                );
            case 3:
                return (
                    <ConditionGenerale3
                        data={currentContrat}
                        ref={conditionRef}
                        formData={formData}
                        updateData={(data) => dispatch(setFormData(data))}
                        handleOpenNoteModal={handleOpenNoteModal}
                        description={description}
                    />
                );
            case 4:
                return (
                    <ConditionParticulieres
                        ref={conditionRef}
                        data={currentContrat}
                        formData={formData}
                        commissions={commisions || []}
                        contratFonds={contratFonds || []}
                        updateData={(data) => dispatch(setFormData(data))}
                        handleOpenNoteModal={handleOpenNoteModal}
                        description={description}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            <Header title="SIGNER LE CONTRAT" subtitle="Validation et signature finale" />

            <Box sx={{ width: "100%", my: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel
                                StepIconComponent={(props) => (
                                    props.completed
                                        ? <Check color="success" />
                                        : <div>{props.icon}</div>
                                )}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Dialog open={Boolean(activeField)} onClose={handleCloseNoteModal}>
                <DialogTitle>Ajouter une note pour {activeField}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Note"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNoteModal}>Annuler</Button>
                    <Button onClick={handleSaveNote} color="primary">Enregistrer</Button>
                </DialogActions>
            </Dialog>

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

                {activeStep < steps.length - 1 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ backgroundColor: colors.greenAccent[700] }}
                        onClick={handleNext}
                        disabled={contratLoading || loadingPM}
                    >
                        Suivant
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: colors.greenAccent[700] }}
                            onClick={() => handleSubmit()}
                        >
                            Signer
                        </Button>

                    </>
                )}
            </Box>
        </Box>
    );
};

export default SignerContrat;