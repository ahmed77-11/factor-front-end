// src/pages/Prorog/AddProrog.jsx
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Autocomplete,
    useTheme,
    Grid,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Redux actions used in CreateInCheque and the new flows
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { fetchAdherentsAsync, fetchRelationsAsync } from "../../redux/relations/relationsSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";

// Actions for docs and inLettrages
import { getAllDocsByContratId } from "../../redux/facture/factureSlice.js";
import { addInLettragesByDocRemiseId } from "../../redux/inLettrage/inLettrageSlice.js";
import {addProrogAsync} from "../../redux/prorog/prorogSlice.js";

const initialValues = {
    contrat: null,
    adherent: null,
    adherFactor: null,
    docRemise: null,
    traite: null,
    adherEmisDate: "",
    adherEmisNo: "",
    adherDemEch: "",
    adherLibelle: "",
    adherInfoLibre: "",
};

const validationSchema = yup.object().shape({
    contrat: yup.object().required("Contrat requis"),
    adherent: yup.object().nullable(),
    adherFactor: yup.object().required("AdherFactor requis"),
    docRemise: yup.object().required("DocRemise requis"),
    traite: yup.object().nullable(),
    adherEmisDate: yup.string().required("Date émission requise"),
    adherEmisNo: yup.string().required("Numéro émission requis"),
    // adherDemEch intentionally optional here (it's a demande échéance date),
    // add a rule if you'd like to make it required:
    adherDemEch: yup
        .date()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .typeError("Date invalide")
        .required("Date de demande d'échéance requise")
        .test(
            "is-future",
            "La date doit être strictement supérieure à maintenant",
            (value) => {
                if (!value) return false; // required will handle message if empty
                return value.getTime() > Date.now();
            }
        ),
});

const AddProrog = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Local UI state
    const [traitesOptions, setTraitesOptions] = useState([]);
    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [adherType, setAdherType] = useState("");
    const [adherentName, setAdherentName] = useState("");

    // Redux selectors
    const { contrats = [] } = useSelector((state) => state.contrat || {});
    const { currentPM } = useSelector((state) => state.personneMorale || {});
    const { currentPP } = useSelector((state) => state.personnePhysique || {});
    const { relations = [], adherents = [] } = useSelector((state) => state.relations || {});
    const { docs = [], loading: loadingDocs } = useSelector((state) => state.facture || {});
    const { inLettrages = [], loading: loadingInLettrages } = useSelector((state) => state.inLettrage || {});

    // Load contracts and adherents on mount
    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    // Build adherent options (same format as CreateInCheque)
    const adherentOptions = (adherents || []).map((a) => ({
        id: a.id,
        adherFactorCode: a.adherFactorCode ?? a.factorAdherCode ?? "",
        label:
            a.typePieceIdentite?.code === "RNE"
                ? `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite} - ${a.raisonSocial || ""}`
                : `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite}  - ${a.nom || ""} ${a.prenom || ""}`,
        raw: a,
    }));

    // Filter contrats by selected adherent
    const filteredContrats = (contrats || []).filter(
        (c) => !selectedAdherentId || c.adherent === selectedAdherentId
    );

    // When contrat changes, fetch adherent details and relations (same flow as CreateInCheque)
    useEffect(() => {
        if (selectedContrat) {
            const contrat = selectedContrat;
            if (contrat.contratNo && contrat.contratNo.startsWith("RNE")) {
                dispatch(getPMById(contrat.adherent));
                setAdherType("pm");
            } else if (contrat.contratNo && contrat.contratNo.startsWith("PATENTE")) {
                dispatch(getPPById(contrat.adherent));
                setAdherType("pp");
            } else {
                setAdherType("");
            }

            // fetch relations for this adherent (if needed)
            // dispatch(fetchRelationsAsync(contrat.adherent));

            // fetch docs for the selected contract (important new step)
            dispatch(getAllDocsByContratId(contrat.id));
            console.log(docs);
        } else {
            // reset docs related UI state when no contract selected
            setTraitesOptions([]);
        }
    }, [selectedContrat, dispatch]); // intentionally not depending on docs to avoid infinite loops

    // Update adherent name when details are fetched
    useEffect(() => {
        if (selectedContrat) {
            if (
                selectedContrat.contratNo &&
                selectedContrat.contratNo.startsWith("RNE") &&
                currentPM
            ) {
                setAdherentName(currentPM.raisonSocial || "");
            } else if (
                selectedContrat.contratNo &&
                selectedContrat.contratNo.startsWith("PATENTE") &&
                currentPP
            ) {
                setAdherentName(`${currentPP.nom || ""} ${currentPP.prenom || ""}`.trim());
            } else {
                setAdherentName("");
            }
        } else {
            setAdherentName("");
        }
    }, [selectedContrat, currentPM, currentPP]);

    // When user selects a DocRemise we'll dispatch the inLettrage fetch
    const handleDocRemiseSelect = (doc, setFieldValue) => {
        setFieldValue("docRemise", doc);
        // reset previously selected traite
        setFieldValue("traite", null);
        setTraitesOptions([]);
        if (doc && doc.id) {
            dispatch(addInLettragesByDocRemiseId(doc.id));
        }
    };

    // When inLettrages change (result of addInLettragesByDocRemiseId),
    // extract unique inTraite objects, dedupe by id, and use them as traitesOptions
    useEffect(() => {
        if (inLettrages && inLettrages.length > 0) {
            const extracted = inLettrages
                .map((il) => il.inTraite)
                .filter(Boolean);

            // dedupe by id
            const uniqueMap = {};
            const uniqueList = [];
            extracted.forEach((t) => {
                if (!t) return;
                const key = t.id ?? JSON.stringify(t); // fallback
                if (!uniqueMap[key]) {
                    uniqueMap[key] = true;
                    uniqueList.push(t);
                }
            });

            setTraitesOptions(uniqueList);
        } else {
            setTraitesOptions([]);
        }
    }, [inLettrages]);

    // Apply adherent selection from either factor code or identity autocomplete
    const applyAdherentSelection = (adherObj) => {
        if (!adherObj) {
            setSelectedAdherentId(null);
            setSelectedContrat(null);
            return;
        }
        setSelectedAdherentId(adherObj.id);
        setSelectedContrat(null);
    };

    const handleFormSubmit = (values, { resetForm }) => {
        console.log("📦 Données Prorog :", values);
        // TODO: dispatch(addProrogAsync(values, navigate));
        resetForm();
        // reset local selections
        setSelectedAdherentId(null);
        setSelectedContrat(null);
        setAdherentName("");
        setAdherType("");
        setTraitesOptions([]);
        console.log(values)
        dispatch(addProrogAsync(values));
        navigate("/list-prorog");
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            <Header title="Prorogation" subtitle="Demande d'une prorogation" />
            <Card
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    boxShadow: 5,
                    borderRadius: 3,
                    p: 3,
                    backgroundColor: `${colors.primary[900]}`,
                }}
            >
                <CardContent>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                          }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* 🔹 Ligne 1 : AdherFactor - Adhérent - Contrat */}
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        <Autocomplete
                                            size="small"
                                            options={adherentOptions}
                                            getOptionLabel={(o) => o?.adherFactorCode ?? ""}
                                            value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                            onChange={(_, v) => {
                                                setFieldValue("adherFactor", v);
                                                applyAdherentSelection(v?.raw);
                                                setFieldValue("contrat", null);
                                                setSelectedContrat(null);
                                                setFieldValue("docRemise", null);
                                                setFieldValue("traite", null);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="AdherFactor Code"
                                                    fullWidth
                                                    error={touched.adherFactor && !!errors.adherFactor}
                                                    helperText={touched.adherFactor && errors.adherFactor}
                                                />
                                            )}
                                            sx={{ flex: 1, minWidth: 220 }}
                                        />

                                        <Autocomplete
                                            size="small"
                                            options={adherentOptions}
                                            getOptionLabel={(o) => o?.label ?? ""}
                                            value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                            onChange={(_, v) => {
                                                setFieldValue("adherent", v);
                                                applyAdherentSelection(v?.raw);
                                                setFieldValue("contrat", null);
                                                setSelectedContrat(null);
                                                setFieldValue("docRemise", null);
                                                setFieldValue("traite", null);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Adhérent"
                                                    fullWidth
                                                    error={touched.adherent && !!errors.adherent}
                                                    helperText={touched.adherent && errors.adherent}
                                                />
                                            )}
                                            sx={{ flex: 2, minWidth: 300 }}
                                        />

                                        <Autocomplete
                                            size="small"
                                            options={filteredContrats}
                                            getOptionLabel={(o) => o?.contratNo ?? ""}
                                            value={values.contrat}
                                            onChange={(_, newValue) => {
                                                setFieldValue("contrat", newValue);
                                                setSelectedContrat(newValue);
                                                if (newValue) {
                                                    setSelectedAdherentId(newValue.adherent);
                                                }
                                                // reset downstreams
                                                setFieldValue("docRemise", null);
                                                setFieldValue("traite", null);
                                                setTraitesOptions([]);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Contrat"
                                                    fullWidth
                                                    error={touched.contrat && !!errors.contrat}
                                                    helperText={touched.contrat && errors.contrat}
                                                />
                                            )}
                                            sx={{ flex: 1, minWidth: 220 }}
                                        />
                                    </Box>

                                    {/* optional selected adherent info */}

                                    {/* 🔹 Ligne 2 : DocRemise & Traite */}
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        <Autocomplete
                                            size="small"
                                            options={docs || []}
                                            getOptionLabel={(o) => o?.docRemiseNo ?? ""}
                                            value={values.docRemise}
                                            onChange={(_, v) => handleDocRemiseSelect(v, setFieldValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="DocRemise"
                                                    fullWidth
                                                    error={touched.docRemise && !!errors.docRemise}
                                                    helperText={touched.docRemise && errors.docRemise}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingDocs ? <CircularProgress size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            sx={{ flex: 1, minWidth: 220 }}
                                            disabled={!values.contrat}
                                        />

                                        <Autocomplete
                                            size="small"
                                            options={traitesOptions}
                                            getOptionLabel={(o) => o ? `${o.numero ?? ""} ${o.tireNom ?? ""}`.trim() : ""}
                                            value={values.traite}
                                            onChange={(_, v) => setFieldValue("traite", v)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Traite"
                                                    fullWidth
                                                    error={touched.traite && !!errors.traite}
                                                    helperText={touched.traite && errors.traite}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingInLettrages ? <CircularProgress size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            sx={{ flex: 1, minWidth: 220 }}
                                            disabled={traitesOptions.length === 0}
                                        />
                                    </Box>

                                    {/* 🔹 Champs de Prorog (2 per line) */}
                                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <TextField
                                            label="Adher Emis Date"
                                            name="adherEmisDate"
                                            type="date"
                                            value={values.adherEmisDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.adherEmisDate && !!errors.adherEmisDate}
                                            helperText={touched.adherEmisDate && errors.adherEmisDate}
                                            InputLabelProps={{ shrink: true }}
                                        />

                                        <TextField
                                            label="Adher Emis No"
                                            name="adherEmisNo"
                                            value={values.adherEmisNo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.adherEmisNo && !!errors.adherEmisNo}
                                            helperText={touched.adherEmisNo && errors.adherEmisNo}
                                        />

                                        <TextField
                                            label="Demande échéance Date"
                                            name="adherDemEch"
                                            type="date"
                                            value={values.adherDemEch}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.adherDemEch && !!errors.adherDemEch}
                                            helperText={touched.adherDemEch && errors.adherDemEch}
                                            InputLabelProps={{ shrink: true }}
                                        />

                                        <TextField
                                            label="Adher Libelle"
                                            name="adherLibelle"
                                            value={values.adherLibelle}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />

                                        <TextField
                                            label="Adher Info Libre"
                                            name="adherInfoLibre"
                                            value={values.adherInfoLibre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            sx={{ gridColumn: "1 / -1" }}
                                        />
                                    </Box>

                                    {/* 🔹 Submit */}
                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button type="submit" color="secondary" variant="contained" size="large">
                                            Ajouter Prorogation
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddProrog;
