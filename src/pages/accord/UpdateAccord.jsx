import {
    Alert,
    Box,
    Button,
    TextField,
    useTheme,
    Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useFormik } from "formik";
import * as yup from "yup";
import { fetchAccordById, updateAccord } from "../../redux/accord/accordSlice";
import { useDevise } from "../../customeHooks/useDevise";
import { useAssur } from "../../customeHooks/useAssur";

const validationSchema = yup.object({
    risqueRef: yup.string().required("Référence Risque requise"),
    risqueDate: yup.date().required("Date Risque requise"),
    factorRef: yup.string().required("Référence Factor requise"),
    factorDate: yup.date().required("Date Factor requise"),
    revisionRisqueRef: yup.string().required("Rév. risque requise"),
    debDate: yup.date().required("Date Début requise"),
    finDate: yup.date().required("Date Fin requise"),
    nbrJourPreavis: yup.number().required("Nombre de jours requis"),

    risqueMontant: yup.number().required("Montant risque requis"),
    factorMontant: yup.number().required("Montant factor requis"),
    assurMontant: yup.number().required("Montant assurance requis"),

    assurCode: yup.string().required("Code assurance requis"),
    accordAssurDate: yup.date().required("Date accord assurance requise"),
    accordAssurRef: yup.string().required("Réf. accord assurance requise"),
    deviseId: yup.string().required("Devise requise"),
});

const UpdateAccord = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const { currentAccord, errorAccord } = useSelector((state) => state.accord);
    const { devises, loading: loadingDevise, error: errorDevise } = useDevise();
    const { assurances, loading: loadingAssur, error: errorAssur } = useAssur();

    const [selectedDevise, setSelectedDevise] = useState(null);
    const [selectedAssur, setSelectedAssur] = useState(null);

    useEffect(() => {
        if (id) dispatch(fetchAccordById(id));
    }, [dispatch, id]);

    const formatDate = (dateStr) => (dateStr ? dateStr.slice(0, 10) : "");

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            risqueRef: currentAccord?.risqueRef || "",
            risqueDate: formatDate(currentAccord?.risqueDate),
            factorRef: currentAccord?.factorRef || "",
            factorDate: formatDate(currentAccord?.factorDate),
            revisionRisqueRef: currentAccord?.revisionRisqueRef || "",
            debDate: formatDate(currentAccord?.debDate),
            finDate: formatDate(currentAccord?.finDate),
            nbrJourPreavis: currentAccord?.nbrJourPreavis || 0,

            risqueMontant: currentAccord?.risqueMontant || 0,
            factorMontant: currentAccord?.factorMontant || 0,
            assurMontant: currentAccord?.assurMontant || 0,

            assurCode: currentAccord?.assurCode || "",
            accordAssurDate: formatDate(currentAccord?.accordAssurDate),
            accordAssurRef: currentAccord?.accordAssurRef || "",
            deviseId: currentAccord?.deviseId || "",

            enquete: currentAccord?.enquete || null,
        },
        validationSchema,
        onSubmit: (values) => {
            const data = {
                ...currentAccord,
                ...values,
            };
            dispatch(updateAccord(id, data, navigate));
        },
    });

    const renderPersonInfo = () => {
        const e = currentAccord?.enquete;
        if (!e) return { role: "-", type: "-", label: "-" };
        if (e.pmAdher) return { role: "Adhérent", type: "Morale", label: e.pmAdher.raisonSocial };
        if (e.ppAdher) return { role: "Adhérent", type: "Physique", label: `${e.ppAdher.nom} ${e.ppAdher.prenom}` };
        if (e.pmAchet) return { role: "Acheteur", type: "Morale", label: e.pmAchet.raisonSocial };
        if (e.ppAchet) return { role: "Acheteur", type: "Physique", label: `${e.ppAchet.nom} ${e.ppAchet.prenom}` };
        return { role: "-", type: "-", label: "-" };
    };

    const personInfo = renderPersonInfo();

    return (
        <Box m="20px">
            <Header title="Modifier Accord" subtitle="Modifier les informations de l'accord" />

            {errorAccord && (
                <Box mb={2}>
                    <Alert severity="error">{errorAccord}</Alert>
                </Box>
            )}
            {errorDevise && (
                <Box mb={2}>
                    <Alert severity="error">{errorDevise}</Alert>
                </Box>
            )}
            {errorAssur && (
                <Box mb={2}>
                    <Alert severity="error">{errorAssur}</Alert>
                </Box>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                    <TextField label="Référence Enquête" value={currentAccord?.enquete?.adherRef || "-"} fullWidth disabled />
                    <TextField label="Personne" value={personInfo.label} fullWidth disabled />
                    <TextField label="Rôle" value={personInfo.role} fullWidth disabled />
                    <TextField label="Type" value={personInfo.type} fullWidth disabled />

                    {/* Devise */}
                    {!loadingDevise && (
                        <Autocomplete
                            options={devises}
                            getOptionLabel={(opt) => opt?.dsg || ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={devises.find((d) => d.id === String(formik.values.deviseId)) || null}
                            onChange={(e, val) => {
                                formik.setFieldValue("deviseId", val?.id || "");
                                setSelectedDevise(val || null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Devise"
                                    fullWidth
                                    error={formik.touched.deviseId && Boolean(formik.errors.deviseId)}
                                    helperText={formik.touched.deviseId && formik.errors.deviseId}
                                />
                            )}
                        />
                    )}

                    {/* Accord Fields */}
                    <TextField label="Référence Risque" name="risqueRef" value={formik.values.risqueRef} onChange={formik.handleChange} fullWidth error={formik.touched.risqueRef && Boolean(formik.errors.risqueRef)} helperText={formik.touched.risqueRef && formik.errors.risqueRef} />
                    <TextField label="Date Risque" name="risqueDate" type="date" value={formik.values.risqueDate} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} error={formik.touched.risqueDate && Boolean(formik.errors.risqueDate)} helperText={formik.touched.risqueDate && formik.errors.risqueDate} />
                    <TextField label="Référence Factor" name="factorRef" value={formik.values.factorRef} onChange={formik.handleChange} fullWidth error={formik.touched.factorRef && Boolean(formik.errors.factorRef)} helperText={formik.touched.factorRef && formik.errors.factorRef} />
                    <TextField label="Date Factor" name="factorDate" type="date" value={formik.values.factorDate} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} error={formik.touched.factorDate && Boolean(formik.errors.factorDate)} helperText={formik.touched.factorDate && formik.errors.factorDate} />
                    <TextField label="Référence Révision Risque" name="revisionRisqueRef" value={formik.values.revisionRisqueRef} onChange={formik.handleChange} fullWidth error={formik.touched.revisionRisqueRef && Boolean(formik.errors.revisionRisqueRef)} helperText={formik.touched.revisionRisqueRef && formik.errors.revisionRisqueRef} />
                    <TextField label="Date Début" name="debDate" type="date" value={formik.values.debDate} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} error={formik.touched.debDate && Boolean(formik.errors.debDate)} helperText={formik.touched.debDate && formik.errors.debDate} />
                    <TextField label="Date Fin" name="finDate" type="date" value={formik.values.finDate} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} error={formik.touched.finDate && Boolean(formik.errors.finDate)} helperText={formik.touched.finDate && formik.errors.finDate} />
                    <TextField label="Nombre de jours de préavis" name="nbrJourPreavis" type="number" value={formik.values.nbrJourPreavis} onChange={formik.handleChange} fullWidth error={formik.touched.nbrJourPreavis && Boolean(formik.errors.nbrJourPreavis)} helperText={formik.touched.nbrJourPreavis && formik.errors.nbrJourPreavis} />

                    {/* Montants */}
                    <TextField label="Montant Risque" name="risqueMontant" type="number" value={formik.values.risqueMontant} onChange={formik.handleChange} fullWidth error={formik.touched.risqueMontant && Boolean(formik.errors.risqueMontant)} helperText={formik.touched.risqueMontant && formik.errors.risqueMontant} />
                    <TextField label="Montant Factor" name="factorMontant" type="number" value={formik.values.factorMontant} onChange={formik.handleChange} fullWidth error={formik.touched.factorMontant && Boolean(formik.errors.factorMontant)} helperText={formik.touched.factorMontant && formik.errors.factorMontant} />
                    <TextField label="Montant Assurance" name="assurMontant" type="number" value={formik.values.assurMontant} onChange={formik.handleChange} fullWidth error={formik.touched.assurMontant && Boolean(formik.errors.assurMontant)} helperText={formik.touched.assurMontant && formik.errors.assurMontant} />

                    {/* Assurance Autocomplete */}
                    {!loadingAssur && (
                        <Autocomplete
                            options={assurances}
                            getOptionLabel={(opt) => opt?.dsg || ""}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            value={assurances.find((a) => a.code === formik.values.assurCode) || null}
                            onChange={(e, val) => {
                                formik.setFieldValue("assurCode", val?.code || "");
                                setSelectedAssur(val || null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Code Assurance"
                                    fullWidth
                                    error={formik.touched.assurCode && Boolean(formik.errors.assurCode)}
                                    helperText={formik.touched.assurCode && formik.errors.assurCode}
                                />
                            )}
                        />
                    )}

                    <TextField label="Date Accord Assurance" name="accordAssurDate" type="date" value={formik.values.accordAssurDate} onChange={formik.handleChange} fullWidth InputLabelProps={{ shrink: true }} error={formik.touched.accordAssurDate && Boolean(formik.errors.accordAssurDate)} helperText={formik.touched.accordAssurDate && formik.errors.accordAssurDate} />
                    <TextField label="Référence Accord Assurance" name="accordAssurRef" value={formik.values.accordAssurRef} onChange={formik.handleChange} fullWidth error={formik.touched.accordAssurRef && Boolean(formik.errors.accordAssurRef)} helperText={formik.touched.accordAssurRef && formik.errors.accordAssurRef} />
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }}>
                        Enregistrer
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default UpdateAccord;
