// src/pages/Rib/AddRib.jsx
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    FormControl,
    FormHelperText,
    RadioGroup,
    FormControlLabel,
    Radio,
    InputLabel,
    useTheme,
    Autocomplete,
    MenuItem,
    Select, Grid,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useBanque } from "../../customeHooks/useBanque.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner, fetchContratsByAdherentAsync } from "../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";
import { fetchRelationsAsync, fetchRelationsFournAsync, fetchAdherentsAsync } from "../../redux/relations/relationsSlice.js";
import { useNavigate } from "react-router-dom";
import { addRib } from "../../redux/rib/ribSlice.js";

// RIB validation function (same as in AddTraite)
const validerRib = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, ""); // Keep only digits
    if (digits.length !== 20) return false;
    try {
        const base = BigInt(digits.slice(0, 18) + "00");
        const key = BigInt(digits.slice(18));
        return 97n - (base % 97n) === key;
    } catch (e) {
        return false;
    }
};

// Initial values
const initialValues = {
    // adherent-related
    adherentId: "",           // id of adherent (from fetchAdherentsAsync)
    adherFactorCode: "",      // factor/adherent code (for the first autocomplete)
    contrat: null,            // full contrat object
    role: "",
    adherentName: "",
    // acheteur / fournisseur
    achetType: "",
    achetPmId: null,
    achetPpId: null,
    fournType: "",
    fournPmId: null,
    fournPpId: null,
    // banque / rib
    banqueCode: "",
    ribSuffix: "",
};

// Validation schema
const validationSchema = yup.object().shape({
    adherentId: yup.mixed().required("Adhérent requis"),
    contrat: yup.object().required("Contrat requis"),
    role: yup.string().required("Le rôle est requis"),

    achetType: yup.string().when("role", {
        is: (role) => role === "acheteur",
        then: (schema) => schema.required("Type d'acheteur requis"),
        otherwise: (schema) => schema.notRequired()
    }),

    achetPmId: yup.mixed().when(["role", "achetType"], {
        is: (role, achetType) => role === "acheteur" && achetType === "pm",
        then: (schema) => schema.required("Sélection acheteur morale requise"),
        otherwise: (schema) => schema.notRequired()
    }),

    achetPpId: yup.mixed().when(["role", "achetType"], {
        is: (role, achetType) => role === "acheteur" && achetType === "pp",
        then: (schema) => schema.required("Sélection acheteur physique requise"),
        otherwise: (schema) => schema.notRequired()
    }),

    fournType: yup.string().when("role", {
        is: (role) => role === "fournisseur",
        then: (schema) => schema.required("Type de fournisseur requis"),
        otherwise: (schema) => schema.notRequired()
    }),

    fournPmId: yup.mixed().when(["role", "fournType"], {
        is: (role, fournType) => role === "fournisseur" && fournType === "pm",
        then: (schema) => schema.required("Sélection fournisseur morale requise"),
        otherwise: (schema) => schema.notRequired()
    }),

    fournPpId: yup.mixed().when(["role", "fournType"], {
        is: (role, fournType) => role === "fournisseur" && fournType === "pp",
        then: (schema) => schema.required("Sélection fournisseur physique requise"),
        otherwise: (schema) => schema.notRequired()
    }),

    banqueCode: yup.string().required("Banque requise"),
    ribSuffix: yup
        .string()
        .required("Le suffixe RIB est requis")
        .matches(/^\d{18}$/, "Le suffixe RIB doit contenir exactement 18 chiffres")
        .test("combined-valid-rib", "RIB invalide", function (suffix) {
            const { banqueCode } = this.parent;
            if (!banqueCode || suffix == null) return false;
            return validerRib(banqueCode + suffix);
        }),
});

const AddRib = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [selectedContratNo, setSelectedContratNo] = useState(null);
    const [roleValue, setRoleValue] = useState("");

    const { banques } = useBanque();
    const { contrats } = useSelector((state) => state.contrat);
    const { currentPM } = useSelector((state) => state.personneMorale);
    const { currentPP } = useSelector((state) => state.personnePhysique);
    const { relations, relationsFourns, adherents = [] } = useSelector((state) => state.relations);
    const { loadingRib, errorRib } = useSelector((state) => state.rib);

    // On mount: load initial lists
    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    // Build adherent options safely and normalize field name to `adherFactorCode`
    console.log(adherents.map((a) => (
        a.id,
        a.raisonSocial
    )));
    const adherentOptions = (adherents || []).map((a) => ({
        id: a.id,
        adherFactorCode: a.adherFactorCode ?? a.factorAdherCode ?? "",
        label:
            a.typePieceIdentite?.code === "RNE"
                ? `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite} - ${a.raisonSocial || ""}`
                : `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite}  - ${a.nom || ""} ${a.prenom || ""}`,
        raw: a,
    }));

    // When an adherent is selected, fetch its contrats and relations (when needed)
    useEffect(() => {
        if (selectedAdherentId) {
            dispatch(fetchContratsByAdherentAsync(selectedAdherentId));
            if (roleValue === "acheteur") {
                dispatch(fetchRelationsAsync(selectedAdherentId));
            }
            if (roleValue === "fournisseur") {
                dispatch(fetchRelationsFournAsync(selectedAdherentId));
            }
        }
    }, [selectedAdherentId, roleValue, dispatch]);

    // Filter relations helpers
    const acheteurPmOptions = (relations || []).filter((r) => r.acheteurMorale !== null);
    const acheteurPpOptions = (relations || []).filter((r) => r.acheteurPhysique !== null);
    const fournisseurPmOptions = (relationsFourns || []).filter((r) => r.fournisseurMorale !== null);
    const fournisseurPpOptions = (relationsFourns || []).filter((r) => r.fournisseurPhysique !== null);

    // Filter contrats to only those that belong to the selected adherent (defensive)
    const filteredContrats = (contrats || []).filter((c) => !selectedAdherentId || c.adherent === selectedAdherentId);

    return (
        <Box m="20px">
            <Header title="RIB" subtitle="Ajouter un RIB" />
            <Card
                sx={{
                    p: 3,
                    boxShadow: 5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[900],
                }}
            >
                <CardContent>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            // Construct full RIB from bank code + suffix
                            const fullRib = values.banqueCode + values.ribSuffix;
                            const payload = {
                                ...values,
                                rib: fullRib,
                                achetPmId: values.achetPmId ? values.achetPmId?.acheteurMorale?.id : null,
                                achetPpId: values.achetPpId ? values.achetPpId?.acheteurPhysique?.id : null,
                                fournPmId: values.fournPmId ? values.fournPmId?.fournisseurMorale?.id : null,
                                fournPpId: values.fournPpId ? values.fournPpId?.fournisseurPhysique?.id : null,
                                // Attach selected contrat id (if backend expects id instead of entire object)
                                contratId: values.contrat?.id ?? null,
                            };
                            dispatch(addRib(payload, navigate));
                        }}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                          }) => {
                            // Set adherentName when contrat selection changes (no dispatches here)
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            useEffect(() => {
                                if (selectedContratNo?.startsWith("RNE") && currentPM) {
                                    setFieldValue("adherentName", currentPM.raisonSocial || "");
                                } else if (selectedContratNo?.startsWith("PATENTE") && currentPP) {
                                    setFieldValue(
                                        "adherentName",
                                        `${currentPP.nom || ""} ${currentPP.prenom || ""}`.trim()
                                    );
                                }
                            }, [currentPM, currentPP, selectedContratNo, setFieldValue]);

                            // Auto-select single contrat when only one available for selected adherent
                            // dispatch getPM/getPP only when necessary (guarded to avoid repeated calls)
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            useEffect(() => {
                                if (filteredContrats.length === 1) {
                                    const single = filteredContrats[0];
                                    if (!values.contrat || values.contrat.id !== single.id) {
                                        setFieldValue("contrat", single);
                                        setSelectedContratNo(single.contratNo);

                                        if (single.contratNo?.startsWith("RNE")) {
                                            // only fetch PM if not already loaded or different
                                            if (!currentPM || currentPM?.id !== single.adherent) {
                                                dispatch(getPMById(single.adherent));
                                            }
                                        }
                                        if (single.contratNo?.startsWith("PATENTE")) {
                                            if (!currentPP || currentPP?.id !== single.adherent) {
                                                dispatch(getPPById(single.adherent));
                                            }
                                        }
                                    }
                                } else {
                                    // If the currently selected contrat is not part of the filtered list, clear it
                                    if (values.contrat && !filteredContrats.some(c => c.id === values.contrat.id)) {
                                        setFieldValue("contrat", null);
                                        setSelectedContratNo(null);
                                    }
                                }
                            }, [filteredContrats, values.contrat, setFieldValue, currentPM, currentPP, dispatch]);

                            // Properly handle ribSuffix input
                            const handleRibSuffixChange = (e) => {
                                // Only allow numeric input and limit to 18 digits
                                const value = e.target.value.replace(/\D/g, "").slice(0, 18);
                                setFieldValue("ribSuffix", value);
                            };

                            // Helper: sync adherent selection into form values
                            const applyAdherentSelection = (adherObj) => {
                                if (!adherObj) {
                                    setSelectedAdherentId(null);
                                    setFieldValue("adherentId", "");
                                    setFieldValue("adherFactorCode", "");
                                    // clear contrats list/value - fetch logic will handle
                                    setFieldValue("contrat", null);
                                    setSelectedContratNo(null);
                                    return;
                                }
                                setSelectedAdherentId(adherObj.id);
                                setFieldValue("adherentId", adherObj.id);
                                setFieldValue("adherFactorCode", adherObj.adherFactorCode || "");
                                // clear contrat so the contrat autocomplete is refreshed from filteredContrats
                                setFieldValue("contrat", null);
                                setSelectedContratNo(null);
                            };

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        {/* --- Three autocompletes in one line --- */}
                                        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                            {/* Autocomplete 1: AdherFactor Code */}
                                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={adherentOptions}
                                                    getOptionLabel={(o) => o?.adherFactorCode ?? ""}
                                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                                    value={adherentOptions.find((a) => a.id === values.adherentId) || null}
                                                    onChange={(e, v) => {
                                                        applyAdherentSelection(v);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="AdherFactor Code" fullWidth />
                                                    )}
                                                />
                                            </Box>

                                            {/* Autocomplete 2: Adherent Identity (RNE / PATENTE label) */}
                                            <Box sx={{ flex: 2, minWidth: 300 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={adherentOptions}
                                                    getOptionLabel={(o) => o?.label ?? ""}
                                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                                    value={adherentOptions.find((a) => a.id === values.adherentId) || null}
                                                    onChange={(e, v) => {
                                                        applyAdherentSelection(v);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Adhérent" fullWidth />
                                                    )}
                                                />
                                            </Box>

                                            {/* Autocomplete 3: Contrat No (filtered to selected adherent) */}
                                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                                <Autocomplete
                                                    size="small"
                                                    options={filteredContrats}
                                                    getOptionLabel={(o) => o?.contratNo ?? ""}
                                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                                    value={values.contrat || null}
                                                    onChange={(e, v) => {
                                                        if (!v) {
                                                            setFieldValue("contrat", null);
                                                            setSelectedContratNo(null);
                                                            return;
                                                        }

                                                        // set the contrat and the contratNo
                                                        setFieldValue("contrat", v);
                                                        setSelectedContratNo(v.contratNo);

                                                        // find related adherent from adherentOptions and set it (keeps autocompletes in sync)
                                                        const adher = adherentOptions.find(a => a.id === v.adherent);
                                                        if (adher) {
                                                            // apply but avoid unnecessary clears/re-fetch if same
                                                            if (values.adherentId !== adher.id) {
                                                                setSelectedAdherentId(adher.id);
                                                                setFieldValue("adherentId", adher.id);
                                                                setFieldValue("adherFactorCode", adher.adherFactorCode || "");
                                                            }
                                                        } else {
                                                            // if adherent is not found locally, set selectedAdherentId to contract.adherent
                                                            setSelectedAdherentId(v.adherent);
                                                            setFieldValue("adherentId", v.adherent);
                                                            setFieldValue("adherFactorCode", "");
                                                        }

                                                        // dispatch getPM/getPP only when needed (guarded)
                                                        if (v.contratNo?.startsWith("RNE")) {
                                                            if (!currentPM || currentPM?.id !== v.adherent) {
                                                                dispatch(getPMById(v.adherent));
                                                            }
                                                        } else if (v.contratNo?.startsWith("PATENTE")) {
                                                            if (!currentPP || currentPP?.id !== v.adherent) {
                                                                dispatch(getPPById(v.adherent));
                                                            }
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Contrat"
                                                            error={!!touched.contrat && !!errors.contrat}
                                                            helperText={touched.contrat && errors.contrat}
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Role */}
                                        <FormControl
                                            component="fieldset"
                                            error={!!touched.role && !!errors.role}
                                        >
                                            <Typography fontWeight="bold">Rôle du RIB</Typography>
                                            <RadioGroup
                                                row
                                                name="role"
                                                value={values.role}
                                                onChange={(e) => {
                                                    const newRole = e.target.value;
                                                    setFieldValue("role", newRole);
                                                    setRoleValue(newRole);
                                                    setFieldValue("achetType", "");
                                                    setFieldValue("achetPmId", null);
                                                    setFieldValue("achetPpId", null);
                                                    setFieldValue("fournType", "");
                                                    setFieldValue("fournPmId", null);
                                                    setFieldValue("fournPpId", null);
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="adherent"
                                                    control={<Radio />}
                                                    label="Adhérent"
                                                />
                                                <FormControlLabel
                                                    value="acheteur"
                                                    control={<Radio />}
                                                    label="Acheteur"
                                                />
                                                <FormControlLabel
                                                    value="fournisseur"
                                                    control={<Radio />}
                                                    label="Fournisseur"
                                                />
                                            </RadioGroup>
                                            <FormHelperText>
                                                {touched.role && errors.role}
                                            </FormHelperText>
                                        </FormControl>

                                        {/* Adhérent display name (disabled) */}
                                        {values.role === "adherent" && (
                                            <TextField
                                                label="Adhérent"
                                                fullWidth
                                                value={values.adherentName}
                                                disabled
                                            />
                                        )}

                                        {/* Acheteur */}
                                        {values.role === "acheteur" && (
                                            <>
                                                <FormControl
                                                    error={!!touched.achetType && !!errors.achetType}
                                                >
                                                    <Typography fontWeight="bold">
                                                        Type d'acheteur
                                                    </Typography>
                                                    <RadioGroup
                                                        row
                                                        name="achetType"
                                                        value={values.achetType}
                                                        onChange={(e) => {
                                                            setFieldValue("achetType", e.target.value);
                                                            setFieldValue("achetPmId", null);
                                                            setFieldValue("achetPpId", null);
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="pm"
                                                            control={<Radio />}
                                                            label="Personne morale"
                                                        />
                                                        <FormControlLabel
                                                            value="pp"
                                                            control={<Radio />}
                                                            label="Personne physique"
                                                        />
                                                    </RadioGroup>
                                                    <FormHelperText>
                                                        {touched.achetType && errors.achetType}
                                                    </FormHelperText>
                                                </FormControl>

                                                {values.achetType === "pm" && (
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={4}>
                                                    <Autocomplete
                                                        options={acheteurPmOptions}
                                                        getOptionLabel={(o) => o.acheteurMorale?.raisonSocial || ""}
                                                        value={values.achetPmId}
                                                        onChange={(e, v) => setFieldValue("achetPmId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Acheteur morale raison sociale"
                                                                error={!!touched.achetPmId && !!errors.achetPmId}
                                                                helperText={touched.achetPmId && errors.achetPmId}
                                                            />
                                                        )}
                                                    />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Autocomplete
                                                                options={acheteurPmOptions}
                                                                getOptionLabel={(o) => o.acheteurMorale?.typePieceIdentite?.dsg+ ""+o.acheteurMorale?.numeroPieceIdentite  || ""}
                                                                value={values.achetPmId}
                                                                onChange={(e, v) => setFieldValue("achetPmId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Acheteur morale identité"
                                                                        error={!!touched.achetPmId && !!errors.achetPmId}
                                                                        helperText={touched.achetPmId && errors.achetPmId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Autocomplete
                                                                options={acheteurPmOptions}
                                                                getOptionLabel={(o) => o.acheteurMorale?.factorAchetCode || ""}
                                                                value={values.achetPmId}
                                                                onChange={(e, v) => setFieldValue("achetPmId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Acheteur morale code"
                                                                        error={!!touched.achetPmId && !!errors.achetPmId}
                                                                        helperText={touched.achetPmId && errors.achetPmId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>


                                                    </Grid>
                                                )}
                                                {values.achetType === "pp" && (
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={4}>

                                                            <Autocomplete
                                                                options={acheteurPpOptions}
                                                                getOptionLabel={(o) =>
                                                                    (o.acheteurPhysique?.nom || "") + " " + (o.acheteurPhysique?.prenom || "")
                                                                }
                                                                value={values.achetPpId}
                                                                onChange={(e, v) => setFieldValue("achetPpId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Acheteur physique nom/prénom"
                                                                        error={!!touched.achetPpId && !!errors.achetPpId}
                                                                        helperText={touched.achetPpId && errors.achetPpId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>

                                                            <Autocomplete
                                                                options={acheteurPpOptions}
                                                                getOptionLabel={(o) => o.acheteurPhysique?.typePieceIdentite?.dsg+ ""+o.acheteurPhysique?.numeroPieceIdentite  || ""}

                                                                value={values.achetPpId}
                                                                onChange={(e, v) => setFieldValue("achetPpId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Acheteur physique identité"
                                                                        error={!!touched.achetPpId && !!errors.achetPpId}
                                                                        helperText={touched.achetPpId && errors.achetPpId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>

                                                        <Autocomplete
                                                            options={acheteurPpOptions}
                                                            getOptionLabel={(o) =>
                                                                (o.acheteurPhysique?.factorAchetCode || "")
                                                            }
                                                            value={values.achetPpId}
                                                            onChange={(e, v) => setFieldValue("achetPpId", v)}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Acheteur physique code"
                                                                    error={!!touched.achetPpId && !!errors.achetPpId}
                                                                    helperText={touched.achetPpId && errors.achetPpId}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>

                                                    </Grid>

                                                )}
                                            </>
                                        )}

                                        {/* Fournisseur */}
                                        {values.role === "fournisseur" && (
                                            <>

                                                <FormControl
                                                    error={!!touched.fournType && !!errors.fournType}
                                                >
                                                    <Typography fontWeight="bold">
                                                        Type de fournisseur
                                                    </Typography>
                                                    <RadioGroup
                                                        row
                                                        name="fournType"
                                                        value={values.fournType}
                                                        onChange={(e) => {
                                                            setFieldValue("fournType", e.target.value);
                                                            setFieldValue("fournPmId", null);
                                                            setFieldValue("fournPpId", null);
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="pm"
                                                            control={<Radio />}
                                                            label="Personne morale"
                                                        />
                                                        <FormControlLabel
                                                            value="pp"
                                                            control={<Radio />}
                                                            label="Personne physique"
                                                        />
                                                    </RadioGroup>
                                                    <FormHelperText>
                                                        {touched.fournType && errors.fournType}
                                                    </FormHelperText>
                                                </FormControl>

                                                {values.fournType === "pm" && (
                                                    <Grid container spacing={3}>
                                                       <Grid item xs={4}>

                                                    <Autocomplete
                                                        options={fournisseurPmOptions || []}
                                                        getOptionLabel={(o) => o.fournisseurMorale?.raisonSocial || ""}
                                                        value={values.fournPmId}
                                                        onChange={(e, v) => setFieldValue("fournPmId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Fournisseur morale raison sociale"
                                                                error={!!touched.fournPmId && !!errors.fournPmId}
                                                                helperText={touched.fournPmId && errors.fournPmId}
                                                            />
                                                        )}
                                                    />
                                                       </Grid>
                                                        <Grid item xs={4}>

                                                            <Autocomplete
                                                                options={fournisseurPpOptions || []}
                                                                getOptionLabel={(o) => (o.fournisseurMorale?.typePieceIdentite.dsg + o.fournisseurMorale?.numeroPieceIdentite || "")}
                                                                value={values.fournPmId}
                                                                onChange={(e, v) => setFieldValue("fournPmId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Fournisseur morale identité"
                                                                        error={!!touched.fournPmId && !!errors.fournPmId}
                                                                        helperText={touched.fournPmId && errors.fournPmId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>

                                                        <Autocomplete
                                                            options={fournisseurPmOptions || []}
                                                            getOptionLabel={(o) => o.fournisseurMorale?.factorFournCode || ""}
                                                            value={values.fournPmId}
                                                            onChange={(e, v) => setFieldValue("fournPmId", v)}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Fournisseur morale code"
                                                                    error={!!touched.fournPmId && !!errors.fournPmId}
                                                                    helperText={touched.fournPmId && errors.fournPmId}
                                                                />
                                                            )}
                                                        />
                                                        </Grid>
                                                    </Grid>


                                                )}
                                                {values.fournType === "pp" && (
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={4}>

                                                    <Autocomplete
                                                        options={fournisseurPpOptions || []}
                                                        getOptionLabel={(o) => (o.fournisseurPhysique?.nom || "") + " " + (o.fournisseurPhysique?.prenom || "")}
                                                        value={values.fournPpId}
                                                        onChange={(e, v) => setFieldValue("fournPpId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Fournisseur physique nom/prénom"
                                                                error={!!touched.fournPpId && !!errors.fournPpId}
                                                                helperText={touched.fournPpId && errors.fournPpId}
                                                            />
                                                        )}
                                                    />
                                                        </Grid>
                                                        <Grid item xs={4}>

                                                            <Autocomplete
                                                                options={fournisseurPpOptions || []}
                                                                getOptionLabel={(o) => (o.fournisseurPhysique?.typePieceIdentite.dsg || "") +""+ (o.fournisseurPhysique?.numeroPieceIdentite || "")}
                                                                value={values.fournPpId}
                                                                onChange={(e, v) => setFieldValue("fournPpId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Fournisseur physique identité"
                                                                        error={!!touched.fournPpId && !!errors.fournPpId}
                                                                        helperText={touched.fournPpId && errors.fournPpId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>

                                                            <Autocomplete
                                                                options={fournisseurPpOptions || []}
                                                                getOptionLabel={(o) => (o.fournisseurPhysique?.factorFournCode || "")}
                                                                value={values.fournPpId}
                                                                onChange={(e, v) => setFieldValue("fournPpId", v)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Fournisseur physique code"
                                                                        error={!!touched.fournPpId && !!errors.fournPpId}
                                                                        helperText={touched.fournPpId && errors.fournPpId}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>

                                                    </Grid>
                                                )}
                                            </>
                                        )}

                                        {/* Banque + RIB */}
                                        <Box display="flex" gap={2}>
                                            <FormControl
                                                sx={{ minWidth: 200 }}
                                                error={!!touched.banqueCode && !!errors.banqueCode}
                                            >
                                                <InputLabel id="banque-label">Banque</InputLabel>
                                                <Select
                                                    labelId="banque-label"
                                                    name="banqueCode"
                                                    value={values.banqueCode}
                                                    onChange={(e) => {
                                                        const prefix = e.target.value;
                                                        setFieldValue("banqueCode", prefix);
                                                        setFieldValue("ribSuffix", "");
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>Aucune</em>
                                                    </MenuItem>
                                                    {banques.map((b) => (
                                                        <MenuItem key={b.codeNum} value={b.codeNum}>
                                                            {b.dsg}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>
                                                    {touched.banqueCode && errors.banqueCode}
                                                </FormHelperText>
                                            </FormControl>

                                            {/* Corrected RIB Field */}
                                            <TextField
                                                label="RIB (20 chiffres)"
                                                name="ribSuffix"
                                                fullWidth
                                                value={values.ribSuffix}
                                                onChange={handleRibSuffixChange}
                                                onBlur={handleBlur}
                                                error={!!touched.ribSuffix && !!errors.ribSuffix}
                                                helperText={touched.ribSuffix && errors.ribSuffix}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Box
                                                            sx={{
                                                                px: "8px",
                                                                borderRight: "1px solid rgba(0,0,0,0.23)",
                                                                mr: "8px",
                                                                fontSize: "1rem",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {values.banqueCode || "--"}
                                                        </Box>
                                                    ),
                                                    inputMode: "numeric",
                                                }}
                                                placeholder="18 chiffres restants"
                                            />
                                        </Box>

                                        {/* Submit */}
                                        <Box textAlign="center" mt={2}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="secondary"
                                            >
                                                Ajouter le RIB
                                            </Button>
                                        </Box>
                                    </Box>
                                </form>
                            );
                        }}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddRib;
