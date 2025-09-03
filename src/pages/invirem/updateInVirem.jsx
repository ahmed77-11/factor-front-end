// src/pages/InVirem/UpdateInVirem.jsx
import { useEffect, useState, useRef } from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    FormControl,
    FormHelperText,
    useTheme,
    Autocomplete,
    CircularProgress,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchInViremByIdAsync,
    updateInViremAsync,
} from "../../redux/inVirem/inViremSlice.js";
import {
    getPMById,
    getPMByAchetCode,
} from "../../redux/personne/PersonneMoraleSlice.js";
import {
    getPPById,
    getPPByAchetCode,
} from "../../redux/personne/PersonnePhysiqueSlice.js";
import { fetchRelationsAsync, fetchAdherentsAsync } from "../../redux/relations/relationsSlice.js";
import {
    allAdherRibs,
    allAchetPmRibs,
    allAchetPpRibs,
} from "../../redux/rib/ribSlice.js";
import { useBanque } from "../../customeHooks/useBanque.jsx";

// RIB validation helper (same logic used across forms)
const validerRib = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 20) return false;
    try {
        const base = BigInt(digits.slice(0, 18) + "00");
        const key = BigInt(digits.slice(18));
        return 97n - (base % 97n) === key;
    } catch (e) {
        return false;
    }
};

// Validation schema (mirrors CreateInVirem but adapted for update — contrat is read-only here)
const validationSchema = yup.object().shape({
    acheteurPresent: yup.boolean().required("Sélectionnez si un acheteur est présent"),
    acheteur: yup.mixed().when("acheteurPresent", {
        is: true,
        then: (schema) => schema.required("Acheteur requis"),
        otherwise: (schema) => schema.notRequired(),
    }),
    dateEmission: yup.date().typeError("Date invalide").required("Date d'émission requise"),
    numeroEmission: yup.string().max(20, "Numéro emission trop long").required("Numéro d'émission requis"),
    tireurEmisNom: yup.string().required("Nom requis"),
    rib: yup.mixed().required("RIB requis"),
    montant: yup.number().typeError("Montant invalide").required("Montant requis").positive("Montant doit être positif"),
    libelle: yup.string().required("Libellé requis"),
    infoLibre: yup.string().notRequired(),
    // factor RIB fields (same check as AddRib)
    factorBanqueCode: yup.string().required("Banque factor requise"),
    factorRibSuffix: yup
        .string()
        .required("Le suffixe RIB factor est requis")
        .matches(/^\d{18}$/, "Le suffixe RIB doit contenir exactement 18 chiffres")
        .test("combined-valid-rib-factor", "RIB factor invalide", function (suffix) {
            const { factorBanqueCode } = this.parent;
            if (!factorBanqueCode || suffix == null) return false;
            return validerRib(factorBanqueCode + suffix);
        }),
    dateEmiseEncaissement: yup.date().nullable().notRequired(),
    fraisEncaissement: yup.number().nullable().notRequired(),
    dateValeur: yup.date().nullable().notRequired(),
});

const UpdateInVirem = () => {
    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // redux selectors
    const { currentInVirem, loadingInVirem } = useSelector((state) => state.inVirem || {});
    const { currentPMByAchetCode } = useSelector((state) => state.personneMorale || {});
    const { currentPPByAchetCode } = useSelector((state) => state.personnePhysique || {});
    const { ribs, loadingRib } = useSelector((state) => state.rib || {});
    const { currentPM, currentPP } = useSelector((state) => state.personneMorale || {});
    const { adherents = [], relations } = useSelector((state) => state.relations || {});
    const { banques } = useBanque();

    // local state
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [adherType, setAdherType] = useState("");
    const [acheteurs, setAcheteurs] = useState([]);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [initialValues, setInitialValues] = useState(null);
    const [disableAcheteurSelect, setDisableAcheteurSelect] = useState(false);

    // guard to ensure we only map currentInVirem -> initialValues when the loaded id changes
    const lastLoadedIdRef = useRef(null);

    // Build adherent options
    const adherentOptions = (adherents || []).map((a) => ({
        id: a.id,
        adherFactorCode: a.adherFactorCode ?? a.factorAdherCode ?? "",
        label:
            a.typePieceIdentite?.code === "RNE"
                ? `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite} - ${a.raisonSocial || ""}`
                : `${a.typePieceIdentite?.dsg || ""}${a.numeroPieceIdentite}  - ${a.nom || ""} ${a.prenom || ""}`,
        raw: a,
    }));

    // fetch data on mount
    useEffect(() => {
        dispatch(fetchInViremByIdAsync(id));
        dispatch(fetchAdherentsAsync());
    }, [dispatch, id]);

    // When currentInVirem changes we populate initialValues (guarded by lastLoadedIdRef to avoid repeated setState)
    useEffect(() => {
        if (!currentInVirem) return;
        if (lastLoadedIdRef.current === currentInVirem.id) return; // already applied

        lastLoadedIdRef.current = currentInVirem.id;

        // derive factorRib parts if present (factorRib expected to be full 20 digits)
        const factorRibFull = currentInVirem.factorRib || currentInVirem.factorRibFull || "";
        let factorBanqueCode = "";
        let factorRibSuffix = "";
        if (factorRibFull && typeof factorRibFull === "string") {
            if (factorRibFull.length === 20) {
                factorBanqueCode = factorRibFull.slice(0, 2);
                factorRibSuffix = factorRibFull.slice(2);
            } else if (factorRibFull.length > 2) {
                factorBanqueCode = factorRibFull.slice(0, factorRibFull.length - 18);
                factorRibSuffix = factorRibFull.slice(-18);
            }
        }

        // helper to make date inputs yyyy-mm-dd
        const toDateInput = (val) => {
            if (!val) return "";
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) return "";
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        };

        setSelectedContrat(currentInVirem.contrat || null);
        setSelectedAdherentId(currentInVirem.contrat?.adherent ?? null);

        setInitialValues({
            contrat: currentInVirem.contrat || null,
            acheteurPresent: Boolean(currentInVirem.doFactorAchetCode || currentInVirem.tireurFactorAchetCode),
            acheteur: null, // we'll try to fill from code/relations below
            dateEmission: toDateInput(currentInVirem.doEmisDate || currentInVirem.factorDate),
            numeroEmission: currentInVirem.doEmisNo || currentInVirem.viremNo || "",
            tireurEmisNom: currentInVirem.doNom || currentInVirem.tireurEmisNom || "",
            rib: currentInVirem.doRib ? { rib: currentInVirem.doRib } : (currentInVirem.tireurEmisRib ? { rib: currentInVirem.tireurEmisRib } : null),
            montant: currentInVirem.montant ?? "",
            libelle: currentInVirem.doLibelle || currentInVirem.libelle || "",
            infoLibre: currentInVirem.doInfoLibre || currentInVirem.infoLibre || "",
            factorBanqueCode: factorBanqueCode || "",
            factorRibSuffix: factorRibSuffix || "",
            dateEmiseEncaissement: toDateInput(currentInVirem.encaisseDate || currentInVirem.encaisseDemDate),
            fraisEncaissement: currentInVirem.encaisseFrais || currentInVirem.encaisseInsfinFrais || "",
            dateValeur: toDateInput(currentInVirem.encaisseValeurDate || currentInVirem.dateValeur || currentInVirem.encaisseValeurDate),
        });

        // fetch PM/PP for contrat adherent and relations
        if (currentInVirem.contrat) {
            if (currentInVirem.contrat.contratNo?.startsWith("RNE")) {
                dispatch(getPMById(currentInVirem.contrat.adherent));
                setAdherType("pm");
            } else if (currentInVirem.contrat.contratNo?.startsWith("PATENTE")) {
                dispatch(getPPById(currentInVirem.contrat.adherent));
                setAdherType("pp");
            } else {
                dispatch(getPMById(currentInVirem.contrat.adherent));
                dispatch(getPPById(currentInVirem.contrat.adherent));
            }
            dispatch(fetchRelationsAsync(currentInVirem.contrat.adherent));
        }

        // If there is an acheteur code on the saved object, try fetch by code using thunks
        const code = currentInVirem.doFactorAchetCode || currentInVirem.tireurFactorAchetCode || null;
        if (code) {
            // try both; one of these will populate currentPMByAchetCode or currentPPByAchetCode
            dispatch(getPMByAchetCode(code));
            dispatch(getPPByAchetCode(code));
        } else {
            setDisableAcheteurSelect(false);
        }
    }, [currentInVirem, dispatch]);

    // If a PM was loaded by achet-code, lock selection into form initialValues
    useEffect(() => {
        if (!currentPMByAchetCode || !initialValues) return;
        const pm = currentPMByAchetCode;
        const acheteurFromCode = {
            id: pm.id,
            pieceId: `${pm.typePieceIdentite?.dsg || ""}${pm.numeroPieceIdentite || ""}`,
            name: pm.raisonSocial || pm.nom || "",
            type: "pm",
            factorAchetCode: pm.factorAchetCode,
            raw: pm,
        };
        setSelectedAcheteur(acheteurFromCode);
        setInitialValues((prev) => (prev ? ({ ...prev, acheteurPresent: true, acheteur: acheteurFromCode }) : prev));
        setDisableAcheteurSelect(true);
    }, [currentPMByAchetCode, initialValues]);

    // If a PP was loaded by achet-code, lock selection into form initialValues
    useEffect(() => {
        if (!currentPPByAchetCode || !initialValues) return;
        const pp = currentPPByAchetCode;
        const acheteurFromCode = {
            id: pp.id,
            pieceId: `${pp.typePieceIdentite?.dsg || ""}${pp.numeroPieceIdentite || ""}`,
            name: `${pp.nom || ""} ${pp.prenom || ""}`.trim(),
            type: "pp",
            factorAchetCode: pp.factorAchetCode,
            raw: pp,
        };
        setSelectedAcheteur(acheteurFromCode);
        setInitialValues((prev) => (prev ? ({ ...prev, acheteurPresent: true, acheteur: acheteurFromCode }) : prev));
        setDisableAcheteurSelect(true);
    }, [currentPPByAchetCode, initialValues]);

    // Build acheteurs from relations (same as other forms)
    useEffect(() => {
        if (relations && relations.length > 0) {
            const acheteursList = relations
                .map((relation) => {
                    if (relation.acheteurMorale) {
                        return {
                            id: relation.acheteurMorale.id,
                            pieceId: `${relation.acheteurMorale.typePieceIdentite?.dsg || ""}${relation.acheteurMorale.numeroPieceIdentite || ""}`,
                            name: relation.acheteurMorale.raisonSocial,
                            type: "pm",
                            factorAchetCode: relation.acheteurMorale.factorAchetCode,
                            raw: relation.acheteurMorale,
                        };
                    } else if (relation.acheteurPhysique) {
                        return {
                            id: relation.acheteurPhysique.id,
                            pieceId: `${relation.acheteurPhysique.typePieceIdentite?.dsg || ""}${relation.acheteurPhysique.numeroPieceIdentite || ""}`,
                            name: `${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`.trim(),
                            type: "pp",
                            factorAchetCode: relation.acheteurPhysique.factorAchetCode,
                            raw: relation.acheteurPhysique,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            setAcheteurs(acheteursList);

            // If the saved object had doFactorAchetCode and we didn't fetch by code earlier,
            // try to match local relations list and lock selection.
            if (initialValues && currentInVirem && (currentInVirem.doFactorAchetCode || currentInVirem.tireurFactorAchetCode) && !selectedAcheteur) {
                const codeToFind = currentInVirem.doFactorAchetCode || currentInVirem.tireurFactorAchetCode;
                const match = acheteursList.find((a) => a.factorAchetCode === codeToFind);
                if (match) {
                    setSelectedAcheteur(match);
                    setInitialValues((prev) => (prev ? ({ ...prev, acheteurPresent: true, acheteur: match }) : prev));
                    setDisableAcheteurSelect(true);
                }
            }
        }
    }, [relations, currentInVirem, initialValues, selectedAcheteur]);

    // Fix: fetch ribs for adherent / acheteur selection changes (depend on primitive IDs only)
    useEffect(() => {
        const contratId = selectedContrat?.id || currentInVirem?.contrat?.id;
        if (!contratId) return;

        const achetId = selectedAcheteur?.id;
        const achetType = selectedAcheteur?.type;
        const acheteurPresentFlag = Boolean(initialValues?.acheteurPresent);

        if (acheteurPresentFlag && achetId) {
            if (achetType === "pm") {
                dispatch(allAchetPmRibs(contratId, achetId));
            } else {
                dispatch(allAchetPpRibs(contratId, achetId));
            }
        } else {
            dispatch(allAdherRibs(contratId));
        }
    }, [
        selectedContrat?.id,
        currentInVirem?.contrat?.id,
        selectedAcheteur?.id,
        selectedAcheteur?.type,
        initialValues?.acheteurPresent,
        dispatch,
    ]);

    if (!initialValues || !currentInVirem) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress />
            </Box>
        );
    }

    // helper to handle factorRib suffix input
    const handleFactorRibSuffixChangeLocal = (setFieldValue, e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 18);
        setFieldValue("factorRibSuffix", value);
    };

    return (
        <Box m="20px">
            <Header title="Modifier Virement Entrant" subtitle={`Mise à jour du virement #${currentInVirem.doEmisNo || currentInVirem.viremNo || currentInVirem.id}`} />

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
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            // compose factorRib
                            const factorRibFull = values.factorBanqueCode + values.factorRibSuffix;

                            // CRITICAL: ensure we always send statusMoyPai as an object with id
                            // Backend JPA expects the StatusMoyPai relation (not null). Use currentInVirem's status if present.
                            // const statusMoyPaiObject = currentInVirem?.statusMoyPai
                            //     ? { id: currentInVirem.statusMoyPai.id }
                            //     : (currentInVirem?.xStatutMoyPaiIdFk ? { id: currentInVirem.xStatutMoyPaiIdFk } : null);

                            // If status is still null and your DB requires it, you might choose a default id here:
                            // e.g. const statusMoyPaiObject = statusMoyPaiObject || { id: DEFAULT_STATUS_ID };
                            // Replace DEFAULT_STATUS_ID with the appropriate existing status id in your DB.

                            const payload = {
                                id: currentInVirem.id,
                                contrat: currentInVirem.contrat,
                                // adherent / acheteur codes
                                doFactorAdherCode: adherType === "pm" ? currentPM?.factorAdherCode : currentPP?.factorAdherCode,
                                doFactorAchetCode: values.acheteurPresent ? values.acheteur?.factorAchetCode : null,

                                // core fields
                                doEmisDate: values.dateEmission,
                                doEmisNo: values.numeroEmission,
                                doNom: values.tireurEmisNom,
                                doRib: values.rib ? values.rib.rib : null,
                                montant: Number(values.montant),
                                devise: currentInVirem.contrat?.devise || values.contrat?.devise || null,
                                deviseCodeNum: currentInVirem.contrat?.devise?.codeNum || values.contrat?.devise?.codeNum || null,

                                doLibelle: values.libelle,
                                doInfoLibre: values.infoLibre,

                                // encaissement fields
                                factorRib: factorRibFull || null,
                                encaisseDate: values.dateEmiseEncaissement || null,
                                encaisseFrais: values.fraisEncaissement ? Number(values.fraisEncaissement) : null,
                                encaisseValeurDate: values.dateValeur || null,

                                // ensure a non-null status relation is sent (object with id)
                                statutMoyPai: currentInVirem.statutMoyPai,

                                // Keep other system fields as-is on server side; controller sets sys fields.
                            };

                            // if status is missing and DB requires it, it's safer to detect early and log:
                            if (!payload.statutMoyPai) {
                                console.warn("Update payload has no statusstMoyPai: backend may reject the update. Consider providing a default ID.");
                            }

                            dispatch(updateInViremAsync(id, payload, navigate));
                            navigate("/in-virems")
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
                          }) => (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    {/* Adherent/contrat (disabled) */}
                                    <Grid container item xs={12} spacing={2}>
                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={adherentOptions}
                                                getOptionLabel={(option) => option?.adherFactorCode || ""}
                                                value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Code Factor" fullWidth />}
                                            />
                                        </Grid>

                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={adherentOptions}
                                                getOptionLabel={(option) => option?.label || ""}
                                                value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Identité Adhérent" fullWidth />}
                                            />
                                        </Grid>

                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={[currentInVirem.contrat]}
                                                getOptionLabel={(option) => option?.contratNo || ""}
                                                value={currentInVirem.contrat}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Contrat" fullWidth />}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Devise (readonly) */}
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Devise"
                                            fullWidth
                                            value={currentInVirem.contrat?.devise?.dsg || ""}
                                            disabled
                                        />
                                    </Grid>

                                    {/* Acheteur present (radio) & acheteur selects */}
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset" fullWidth>
                                            <Typography fontWeight="bold">Donner d&#39;order du virement ?</Typography>
                                            <RadioGroup
                                                row
                                                name="acheteurPresent"
                                                value={values.acheteurPresent ? "true" : "false"}
                                                onChange={(e) => {
                                                    const booleanValue = e.target.value === "true";
                                                    setFieldValue("acheteurPresent", booleanValue);
                                                    if (!booleanValue) {
                                                        setFieldValue("acheteur", null);
                                                        setSelectedAcheteur(null);
                                                        setFieldValue("rib", null);
                                                        setDisableAcheteurSelect(false);
                                                    } else {
                                                        if (selectedAcheteur) {
                                                            setFieldValue("acheteur", selectedAcheteur);
                                                            setDisableAcheteurSelect(!!selectedAcheteur);
                                                        }
                                                    }
                                                }}
                                            >
                                                <FormControlLabel value="true" control={<Radio />} label="Acheteur" />
                                                <FormControlLabel value="false" control={<Radio />} label="Adhérent" />
                                            </RadioGroup>
                                            <FormHelperText error={!!touched.acheteurPresent && !!errors.acheteurPresent}>
                                                {touched.acheteurPresent && errors.acheteurPresent}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={6}>
                                        {values.acheteurPresent && (
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Autocomplete
                                                        options={acheteurs}
                                                        getOptionLabel={(option) => option?.name || ""}
                                                        value={values.acheteur}
                                                        onChange={(event, newValue) => {
                                                            if (disableAcheteurSelect) return;
                                                            setFieldValue("acheteur", newValue);
                                                            setSelectedAcheteur(newValue);
                                                            setFieldValue("rib", null);
                                                        }}
                                                        disabled={disableAcheteurSelect}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Acheteur"
                                                                error={!!touched.acheteur && !!errors.acheteur}
                                                                helperText={touched.acheteur && errors.acheteur}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Autocomplete
                                                        options={acheteurs}
                                                        getOptionLabel={(option) => option?.pieceId || ""}
                                                        value={values.acheteur}
                                                        onChange={(event, newValue) => {
                                                            if (disableAcheteurSelect) return;
                                                            setFieldValue("acheteur", newValue);
                                                            setSelectedAcheteur(newValue);
                                                            setFieldValue("rib", null);
                                                        }}
                                                        disabled={disableAcheteurSelect}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Identité Acheteur"
                                                                error={!!touched.acheteur && !!errors.acheteur}
                                                                helperText={touched.acheteur && errors.acheteur}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {/* dateEmission / numeroEmission */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Date d'émission"
                                            fullWidth
                                            type="date"
                                            name="dateEmission"
                                            value={values.dateEmission}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.dateEmission && !!errors.dateEmission}
                                            helperText={touched.dateEmission && errors.dateEmission}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Numéro d'émission"
                                            fullWidth
                                            name="numeroEmission"
                                            value={values.numeroEmission}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.numeroEmission && !!errors.numeroEmission}
                                            helperText={touched.numeroEmission && errors.numeroEmission}
                                        />
                                    </Grid>

                                    {/* nom / rib */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Nom tireur"
                                            fullWidth
                                            name="tireurEmisNom"
                                            value={values.tireurEmisNom}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireurEmisNom && !!errors.tireurEmisNom}
                                            helperText={touched.tireurEmisNom && errors.tireurEmisNom}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Autocomplete
                                            options={ribs || []}
                                            getOptionLabel={(option) => option?.rib || ""}
                                            loading={loadingRib}
                                            value={values.rib}
                                            onChange={(event, newValue) => {
                                                setFieldValue("rib", newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="RIB"
                                                    fullWidth
                                                    error={!!touched.rib && !!errors.rib}
                                                    helperText={touched.rib && errors.rib}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingRib ? <CircularProgress size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* montant / devise */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Montant"
                                            fullWidth
                                            type="number"
                                            name="montant"
                                            value={values.montant}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.montant && !!errors.montant}
                                            helperText={touched.montant && errors.montant}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Devise"
                                            fullWidth
                                            value={currentInVirem.contrat?.devise?.dsg || values.contrat?.devise?.dsg || ""}
                                            disabled
                                        />
                                    </Grid>

                                    {/* libelle / infoLibre */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Libellé"
                                            fullWidth
                                            name="libelle"
                                            value={values.libelle}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.libelle && !!errors.libelle}
                                            helperText={touched.libelle && errors.libelle}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Info libre"
                                            fullWidth
                                            name="infoLibre"
                                            value={values.infoLibre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.infoLibre && !!errors.infoLibre}
                                            helperText={touched.infoLibre && errors.infoLibre}
                                        />
                                    </Grid>

                                    {/* factorRib bank select + suffix */}
                                    <Grid item xs={6}>
                                        <FormControl fullWidth error={!!touched.factorBanqueCode && !!errors.factorBanqueCode}>
                                            <InputLabel id="factor-banque-label">Banque (Factor)</InputLabel>
                                            <Select
                                                labelId="factor-banque-label"
                                                name="factorBanqueCode"
                                                value={values.factorBanqueCode}
                                                onChange={(e) => {
                                                    const prefix = e.target.value;
                                                    setFieldValue("factorBanqueCode", prefix);
                                                    setFieldValue("factorRibSuffix", "");
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
                                            <FormHelperText>{touched.factorBanqueCode && errors.factorBanqueCode}</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            label="RIB Factor (18 chiffres restants)"
                                            name="factorRibSuffix"
                                            fullWidth
                                            value={values.factorRibSuffix}
                                            onChange={(e) => handleFactorRibSuffixChangeLocal(setFieldValue, e)}
                                            onBlur={handleBlur}
                                            error={!!touched.factorRibSuffix && !!errors.factorRibSuffix}
                                            helperText={touched.factorRibSuffix && errors.factorRibSuffix}
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
                                                        {values.factorBanqueCode || "--"}
                                                    </Box>
                                                ),
                                                inputMode: "numeric",
                                            }}
                                            placeholder="18 chiffres restants"
                                        />
                                    </Grid>

                                    {/* frais encaissement / date valeur */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Frais d'encaissement"
                                            fullWidth
                                            type="number"
                                            name="fraisEncaissement"
                                            value={values.fraisEncaissement}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.fraisEncaissement && !!errors.fraisEncaissement}
                                            helperText={touched.fraisEncaissement && errors.fraisEncaissement}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            label="Date valeur"
                                            fullWidth
                                            type="date"
                                            name="dateValeur"
                                            value={values.dateValeur}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>

                                    {/* submit */}
                                    <Grid item xs={12}>
                                        <Box textAlign="center" mt={2}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="secondary"
                                                disabled={loadingInVirem}
                                                sx={{ mr: 2 }}
                                            >
                                                {loadingInVirem ? <CircularProgress size={24} /> : "Mettre à jour"}
                                            </Button>
                                            <Button variant="outlined" color="error" onClick={() => navigate(-1)}>
                                                Annuler
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateInVirem;
