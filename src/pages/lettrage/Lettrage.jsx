// src/pages/Traite/TraiteLettrage.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    useTheme,
    Paper,
    Divider,
    CircularProgress,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import { getTraiteById } from "../../redux/traite/traiteSlice.js";
import { getPMById, getPMByAchetCode } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById, getPPByAchetCode } from "../../redux/personne/PersonnePhysiqueSlice.js";
import { getAllDocsByContratAndAchetCode } from "../../redux/facture/factureSlice.js";
import { addInLettrage } from "../../redux/inLettrage/inLettrageSlice.js";

const TraiteLettrage = () => {
    const theme = useTheme();
    const palette = theme.palette;
    const dispatch = useDispatch();
    const { id: traiteId } = useParams();

    // redux state
    const { currentTraite } = useSelector((s) => s.traite || {});
    const currentPM = useSelector((s) => s.personneMorale?.currentPM);
    const currentPP = useSelector((s) => s.personnePhysique?.currentPP);
    const currentPPByAchetCode = useSelector((s) => s.personnePhysique?.currentPPByAchetCode);
    const currentPMByAchetCode = useSelector((s) => s.personneMorale?.currentPMByAchetCode);
    const { docs = [] } = useSelector((s) => s.facture || {});
    const inLettrageState = useSelector((s) => s.inLettrage || { loading: false, error: null });

    // local state
    const [adherentType, setAdherentType] = useState(null);
    const [adherentData, setAdherentData] = useState(null);
    const [acheteurData, setAcheteurData] = useState(null);

    // local editable rows (no automatic changes)
    const [localDocEdits, setLocalDocEdits] = useState({});
    const [savingDoc, setSavingDoc] = useState({});
    const [docErrors, setDocErrors] = useState({});

    // Traite C target (editable by user). Default from server enCours if provided
    const [traiteCTarget, setTraiteCTarget] = useState("");

    // UI helpers: snackbar and help dialog
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
    const [helpOpen, setHelpOpen] = useState(false);

    // filter for docs view
    // options: "all" | "dejaLettre" (restant == 0) | "semiLettre" (restant > 0 && montantLettre > 0) | "noLettre" (montantLettre == 0)
    const [docFilter, setDocFilter] = useState("all");

    // fetch traite on mount
    useEffect(() => {
        if (!traiteId) return;
        dispatch(getTraiteById(traiteId));
    }, [traiteId, dispatch]);

    // when currentTraite loaded -> fetch adherent, acheteur and docs
    useEffect(() => {
        if (!currentTraite) return;

        const contrat = currentTraite.contrat || currentTraite.contratObj || null;
        const contratNo = contrat?.contratNo || currentTraite?.contratNo || "";
        const contratId = contrat?.id || currentTraite?.contrat?.id || currentTraite?.contratId || null;
        const adherentId = contrat?.adherent || currentTraite?.contrat?.adherent || currentTraite?.adherent || null;

        if (contratNo && contratNo.toString().toUpperCase().startsWith("RNE")) {
            setAdherentType("pm");
            if (adherentId) dispatch(getPMById(adherentId));
        } else {
            setAdherentType("pp");
            if (adherentId) dispatch(getPPById(adherentId));
        }

        const achetCode =
            currentTraite?.achetFactorCode ||
            currentTraite?.acheteurFactorCode ||
            currentTraite?.achatFactorCode ||
            currentTraite?.acheteur?.factorAchetCode ||
            null;

        if (achetCode) {
            const upper = achetCode.toString().toUpperCase();
            if (upper.includes("PM")) dispatch(getPMByAchetCode(achetCode));
            else if (upper.includes("PP")) dispatch(getPPByAchetCode(achetCode));
            else {
                dispatch(getPPByAchetCode(achetCode));
                dispatch(getPMByAchetCode(achetCode));
            }
        }

        if (contratId) {
            dispatch(getAllDocsByContratAndAchetCode(contratId, achetCode ?? ""));
        }

        // initialize the Traite C target using any server-provided enCours (but do not change docs)
        const serverC = currentTraite?.enCours ?? currentTraite?.zInTraiteEnCours ?? 0;
        setTraiteCTarget(String(serverC ?? 0));
    }, [currentTraite, dispatch]);

    // map adherent data
    useEffect(() => {
        if (adherentType === "pm" && currentPM) setAdherentData(currentPM);
        else if (adherentType === "pp" && currentPP) setAdherentData(currentPP);
    }, [adherentType, currentPM, currentPP]);

    // map acheteur results
    useEffect(() => {
        if (currentPPByAchetCode) setAcheteurData(currentPPByAchetCode);
        else if (currentPMByAchetCode) setAcheteurData(currentPMByAchetCode);
        else if (currentTraite?.acheteur) setAcheteurData(currentTraite.acheteur);
    }, [currentPPByAchetCode, currentPMByAchetCode, currentTraite]);

    // initialize localDocEdits from docs but do NOT change values on user input automatically
    useEffect(() => {
        if (!docs || docs.length === 0) {
            setLocalDocEdits({});
            setDocErrors({});
            return;
        }
        const initial = {};
        docs.forEach((d) => {
            initial[d.id] = {
                restantALetter:
                    d.restantALetter ??
                    d.montantOuvert ??
                    d.restant ??
                    d.remaining ??
                    (d.montantAchete ? String(Number(d.montantAchete)) : "") ??
                    "",
                lettrageEnCours: "", // user will type this
                dejaLettre: d.dejaLettre ?? d.montantLettre ?? d.already ?? d.deja ?? "0",
                retenueSource: d.retenueSource ?? d.montantRetenueSource ?? "",
                achete: d.achete ?? d.montantAchete ?? "",
                numero: d.numero ?? d.docRemiseNo ?? "",
                type: d.type ?? d.typeDocRemise?.dsg ?? "",
                __raw: d,
            };
        });
        setLocalDocEdits(initial);
        setDocErrors({});
    }, [docs]);

    // When switching to dejaLettre filter: clear any En cours for fully-lettered docs and remove per-row errors for those rows.
    useEffect(() => {
        if (docFilter !== "dejaLettre") return;

        setLocalDocEdits((prev = {}) => {
            const copy = { ...prev };
            Object.keys(copy).forEach((id) => {
                const row = copy[id];
                const raw = row.__raw || {};
                const restant =
                    Number(row.restantALetter ?? raw.restant ?? raw.montantOuvert ?? raw.montant ?? 0);
                if (restant === 0) {
                    copy[id] = { ...row, lettrageEnCours: "" };
                }
            });
            return copy;
        });

        // Remove per-row errors (keep global _traite if present)
        setDocErrors((prev = {}) => {
            const copy = { ...(prev || {}) };
            Object.keys(copy).forEach((key) => {
                if (key !== "_traite") delete copy[key];
            });
            return copy;
        });
    }, [docFilter]);

    // helpers
    const formatAdherentName = (a) => {
        if (!a) return "";
        return a.raisonSocial ? a.raisonSocial : `${a.nom || ""} ${a.prenom || ""}`.trim();
    };
    const formatPieceId = (p) => {
        if (!p) return "";
        if (p.typePieceIdentite?.dsg || p.numeroPieceIdentite) {
            return `${p.typePieceIdentite?.dsg || ""}${p.numeroPieceIdentite || ""}`;
        }
        return p.numeroPieceIdentite ?? "";
    };

    const traiteA = Number(currentTraite?.montant ?? 0);
    const traiteD_fromServer = Number(currentTraite?.montantNonLettre ?? 0);

    // compute totals: sum of deja (B) and sum of local C entries (addedC)
    const totalB_fromDocs = useMemo(() => {
        return docs.reduce((acc, d) => acc + Number(d.dejaLettre ?? d.montantLettre ?? 0), 0);
    }, [docs]);

    const addedC = useMemo(() => {
        return Object.values(localDocEdits).reduce((acc, ed) => acc + Number(ed?.lettrageEnCours || 0), 0);
    }, [localDocEdits]);

    // filtered docs based on docFilter
    const filteredDocs = useMemo(() => {
        if (!docs || !docs.length) return [];
        return docs.filter((d) => {
            const restant = Number(d.restantALetter ?? d.montantOuvert ?? d.restant ?? 0);
            const montantLettre = Number(d.montantLettre ?? d.dejaLettre ?? 0);

            switch (docFilter) {
                case "dejaLettre":
                    return restant === 0;
                case "semiLettre":
                    return restant > 0 && montantLettre > 0;
                case "noLettre":
                    return montantLettre === 0;
                default:
                    return true;
            }
        });
    }, [docs, docFilter]);

    // Handler when user edits a per-doc En cours (C) field
    const onDocFieldChange = (docId, field, value) => {
        // update the one field for that doc only; do not auto-change others
        setLocalDocEdits((prev) => {
            const copy = { ...(prev || {}) };
            copy[docId] = { ...(copy[docId] || {}), [field]: value };
            return copy;
        });

        // live validation for that row: per-doc C <= Restant
        setDocErrors((prev) => {
            const cp = { ...(prev || {}) };
            const ed = (localDocEdits[docId] && { ...localDocEdits[docId], [field]: value }) || { [field]: value };
            const enCours = Number(ed.lettrageEnCours || 0);
            const restant = Number(ed.restantALetter || ed.__raw?.montantOuvert || 0);
            const rowErr = {};

            if (enCours < 0 || isNaN(enCours)) {
                rowErr.lettrageEnCours = "Montant invalide";
            } else if (enCours > restant) {
                rowErr.lettrageEnCours = "Ne peut pas être supérieur au Restant (6)";
            }

            // global check: sum(all lettrageEnCours) must be <= D (we show but still allow typing)
            const prospectiveSum = Object.entries({ ...(localDocEdits || {}), [docId]: { ...(localDocEdits[docId] || {}), [field]: value } })
                .reduce((acc, [, r]) => acc + Number(r.lettrageEnCours || 0), 0);
            if (prospectiveSum > traiteD_fromServer) {
                // set a global error placeholder under special key
                cp._traite = { total: `Total En cours (${prospectiveSum}) dépasse le Restant de la traite (${traiteD_fromServer})` };
            } else {
                if (cp._traite) delete cp._traite;
            }

            if (Object.keys(rowErr).length) cp[docId] = rowErr;
            else delete cp[docId];
            return cp;
        });
    };

    // Handler when user edits the Traite C target input
    // This does not mutate any docs; it just sets target and runs validation checks
    const onTraiteCTargetChange = (val) => {
        // accept empty or numeric strings
        setTraiteCTarget(val);

        const numeric = Number(val || 0);
        if (isNaN(numeric) || numeric < 0) {
            setDocErrors((p) => ({ ...(p || {}), _traite: { total: "Montant Traite C invalide" } }));
            setSnackbar({ open: true, message: "Montant Traite C invalide", severity: "error" });
            return;
        }
        // if numeric > D show an error
        setDocErrors((p) => {
            const copy = { ...(p || {}) };
            if (numeric > traiteD_fromServer) {
                copy._traite = { total: `Total C (${numeric}) dépasse le Restant de la traite (${traiteD_fromServer})` };
                setSnackbar({ open: true, message: `Total C (${numeric}) dépasse le Restant de la traite (${traiteD_fromServer})`, severity: "error" });
            } else {
                if (copy._traite) delete copy._traite;
            }
            return copy;
        });
    };

    // per-row save (one API call for that doc only)
    const handleSaveDoc = async (doc) => {
        const docId = doc.id;
        const ed = localDocEdits[docId] || {};
        const montant = Number(ed.lettrageEnCours || 0);

        // validate row
        const errors = {};
        if (!montant || montant <= 0) errors.lettrageEnCours = "Entrez un montant > 0";
        if (montant > Number(ed.restantALetter || doc.montantOuvert || 0)) errors.lettrageEnCours = "Ne peut pas être supérieur au Restant (6)";

        // global
        const totalCNow = Object.entries(localDocEdits).reduce((acc, [, r]) => acc + Number(r.lettrageEnCours || 0), 0);
        if (totalCNow > traiteD_fromServer) errors.total = `Total En cours (${totalCNow}) dépasse le Restant de la traite (${traiteD_fromServer})`;

        if (Object.keys(errors).length) {
            setDocErrors((p) => ({ ...(p || {}), [docId]: errors }));
            setSnackbar({ open: true, message: "Corrigez les erreurs avant d'enregistrer cette ligne.", severity: "error" });
            return;
        }

        // Calculate updated values for document and traite
        const updatedDocMontantLettre = (Number(doc.montantLettre || 0) + montant).toString();
        const updatedDocMontantOuvert = (Number(doc.montantOuvert || 0) - montant).toString();
        const updatedMontantRetuenueSource = 0

        const updatedTraiteMontantLettre = (Number(currentTraite.montantLettre || 0) + montant).toString();
        const updatedTraiteMontantNonLettre = (Number(currentTraite.montantNonLettre || 0) - montant).toString();

        const payload = {
            lettrageMontant: montant,
            lettrageDate: new Date().toISOString().slice(0, 10),
            docRemise: {
                ...doc,

                montantLettre: updatedDocMontantLettre,
                montantOuvert: updatedDocMontantOuvert
            },
            inTraite: {
                ...currentTraite,
                montantLettre: updatedTraiteMontantLettre,
                montantNonLettre: updatedTraiteMontantNonLettre
            },
            sysUser: "system",
        };

        try {
            setSavingDoc((s) => ({ ...(s || {}), [docId]: true }));
            await dispatch(addInLettrage(payload));

            // optimistic update for this row: deja += montant, restant -= montant, clear per-doc C
            setLocalDocEdits((prev) => {
                const copy = { ...(prev || {}) };
                const prevRow = copy[docId] || {};
                const prevDeja = Number(prevRow.dejaLettre || doc.dejaLettre || doc.montantLettre || 0);
                const newDeja = prevDeja + montant;
                const prevRestant = Number(prevRow.restantALetter || doc.montantOuvert || 0);
                const newRestant = prevRestant - montant;
                copy[docId] = {
                    ...prevRow,
                    dejaLettre: String(newDeja),
                    restantALetter: String(newRestant >= 0 ? newRestant : 0),
                    lettrageEnCours: "",
                };
                return copy;
            });

            // clear errors for row
            setDocErrors((p) => {
                const cp = { ...(p || {}) };
                delete cp[docId];
                return cp;
            });

            // reload server state for consistency
            const contratId = currentTraite?.contrat?.id || currentTraite?.contratId || null;
            const achetCode =
                currentTraite?.achetFactorCode ||
                currentTraite?.acheteurFactorCode ||
                currentTraite?.achatFactorCode ||
                currentTraite?.acheteur?.factorAchetCode ||
                null;
            if (contratId) dispatch(getAllDocsByContratAndAchetCode(contratId, achetCode ?? ""));
            dispatch(getTraiteById(traiteId));

            setSnackbar({ open: true, message: "Ligne enregistrée avec succès.", severity: "success" });
        } catch (err) {
            console.error(err);
            setDocErrors((p) => ({ ...(p || {}), [docId]: { api: "Erreur serveur lors de l'enregistrement" } }));
            setSnackbar({ open: true, message: "Erreur serveur lors de l'enregistrement", severity: "error" });
        } finally {
            setSavingDoc((s) => ({ ...(s || {}), [docId]: false }));
        }
    };

    // Submit all docs that have lettrageEnCours > 0
    const handleSubmitAll = async () => {
        // total check: addedC must equal traiteCTarget
        const target = Number(traiteCTarget || 0);
        const sum = addedC;

        if (Math.abs(sum - target) > 0.001) {
            setSnackbar({ open: true, message: `La somme des (5) Lettrage en cours (${sum}) doit être égale au C de la traite (${target}).`, severity: "error" });
            return;
        }

        // global limit
        if (sum > traiteD_fromServer) {
            setSnackbar({ open: true, message: `Total En cours (${sum}) dépasse le Restant de la traite (${traiteD_fromServer}).`, severity: "error" });
            return;
        }

        // collect docs to save
        const docsToSave = Object.entries(localDocEdits)
            .map(([id, row]) => ({ id: Number(id), montant: Number(row.lettrageEnCours || 0), row, doc: row.__raw }))
            .filter((r) => r.montant > 0);

        if (docsToSave.length === 0) {
            setSnackbar({ open: true, message: "Aucun lettrage à enregistrer.", severity: "info" });
            return;
        }

        // per-row validation before sending
        for (const item of docsToSave) {
            const r = item.row;
            const montant = item.montant;
            const restant = Number(r.restantALetter || r.__raw?.montantOuvert || 0);
            if (montant > restant) {
                setSnackbar({ open: true, message: `La ligne ${r.numero || item.id} a un montant En cours (${montant}) supérieur au Restant (${restant}).`, severity: "error" });
                return;
            }
        }

        try {
            // Calculate total amount for traite update
            const totalMontant = docsToSave.reduce((acc, item) => acc + item.montant, 0);

            // Calculate updated traite values
            const updatedTraiteMontantLettre = (Number(currentTraite.montantLettre || 0) + totalMontant).toString();
            const updatedTraiteMontantNonLettre = (Number(currentTraite.montantNonLettre || 0) - totalMontant).toString();

            // sequentially do one API call per doc
            for (const item of docsToSave) {
                // Calculate updated document values
                const updatedDocMontantLettre = (Number(item.doc.montantLettre || 0) + item.montant).toString();
                const updatedDocMontantOuvert = (Number(item.doc.montantOuvert || 0) - item.montant).toString();

                const payload = {
                    lettrageNo:`TR${currentTraite.numero}-DOC${item.doc.docRemiseNo}`,
                    lettrageMontant: item.montant,
                    lettrageDate: new Date().toISOString().slice(0, 10),
                    docRemise: {
                        ...item.doc,
                        montantLettre:Number( updatedDocMontantLettre),
                        montantOuvert:Number( updatedDocMontantOuvert)
                    },
                    inTraite: {
                        ...currentTraite,
                        montantLettre: Number(updatedTraiteMontantLettre),
                        montantNonLettre:Number( updatedTraiteMontantNonLettre)
                    },
                    sysUser: "system",
                };

                setSavingDoc((s) => ({ ...(s || {}), [item.id]: true }));
                await dispatch(addInLettrage(payload));

                // optimistic update of local doc row
                setLocalDocEdits((prev) => {
                    const copy = { ...(prev || {}) };
                    const prevRow = copy[item.id] || {};
                    const prevDeja = Number(prevRow.dejaLettre || prevRow.__raw?.dejaLettre || 0);
                    const newDeja = prevDeja + item.montant;
                    const prevRestant = Number(prevRow.restantALetter || prevRow.__raw?.montantOuvert || 0);
                    const newRestant = prevRestant - item.montant;
                    copy[item.id] = {
                        ...prevRow,
                        dejaLettre: String(newDeja),
                        restantALetter: String(newRestant >= 0 ? newRestant : 0),
                        lettrageEnCours: "",
                    };
                    return copy;
                });

                setDocErrors((p) => {
                    const cp = { ...(p || {}) };
                    delete cp[item.id];
                    return cp;
                });

                setSavingDoc((s) => ({ ...(s || {}), [item.id]: false }));
            }

            // re-fetch to sync server-side state
            const contratId = currentTraite?.contrat?.id || currentTraite?.contratId || null;
            const achetCode =
                currentTraite?.achetFactorCode ||
                currentTraite?.acheteurFactorCode ||
                currentTraite?.achatFactorCode ||
                currentTraite?.acheteur?.factorAchetCode ||
                null;
            if (contratId) dispatch(getAllDocsByContratAndAchetCode(contratId, achetCode ?? ""));
            dispatch(getTraiteById(traiteId));

            // reset Traite C target to 0 (or recalc if server has new value)
            setTraiteCTarget("0");
            setSnackbar({ open: true, message: "Lettrages enregistrés avec succès.", severity: "success" });
        } catch (err) {
            console.error("Erreur lors de l'enregistrement en masse", err);
            setSnackbar({ open: true, message: "Erreur lors de l'enregistrement. Voir console.", severity: "error" });
        } finally {
            setSavingDoc({});
        }
    };

    // column width hints (keeps fields readable)
    const colWidths = {
        restant: 120,
        enCours: 120,
        deja: 120,
        retenue: 120,
        achete: 120,
        numero: 120,
        type: 120,
    };

    const contratNo = currentTraite?.contrat?.contratNo ?? currentTraite?.contratNo ?? "";

    // snackbar close
    const handleCloseSnackbar = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbar((s) => ({ ...s, open: false }));
    };

    return (
        <Box m={2}>
            <Header title="Lettrage" subtitle="Interface de lettrage / référence des documents" />

            {/* TOP: adherent + acheteur same as before */}
            <Box mb={2}>
                <Paper sx={{ p: 2 }}>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Tooltip title="Afficher l'équation du lettrage">
                                <IconButton onClick={() => setHelpOpen(true)} size="small">
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} container spacing={1} alignItems="center">
                            <Grid item xs={1}><Typography fontWeight="bold">Adhérent</Typography></Grid>
                            <Grid item xs={3}><TextField label="Contrat" value={contratNo} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={2}><TextField label="Piece ID Adhérent" value={adherentData ? formatPieceId(adherentData) : ""} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={3}><TextField label="Factor Adhérent Code" value={adherentData?.adherFactorCode ?? adherentData?.factorAdherCode ?? ""} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={3}><TextField label="Dénomination" value={formatAdherentName(adherentData)} fullWidth size="small" disabled /></Grid>
                        </Grid>

                        <Grid item xs={12} container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Grid item xs={1}><Typography fontWeight="bold">Acheteur</Typography></Grid>
                            <Grid item xs={3}><TextField label="Acheteur (nom)" value={acheteurData ? (acheteurData.raisonSocial || `${acheteurData.nom || ""} ${acheteurData.prenom || ""}`.trim()) : ""} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={2}><TextField label="Piece ID Acheteur" value={acheteurData ? (acheteurData.typePieceIdentite?.dsg ? `${acheteurData.typePieceIdentite.dsg}${acheteurData.numeroPieceIdentite || ""}` : acheteurData.numeroPieceIdentite || "") : ""} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={3}><TextField label="Factor Acheteur Code" value={acheteurData?.factorAchetCode ?? acheteurData?.factorAcheteurCode ?? ""} fullWidth size="small" disabled /></Grid>
                            <Grid item xs={3}><TextField label="Dénomination Acheteur" value={acheteurData ? (acheteurData.raisonSocial || `${acheteurData.nom || ""} ${acheteurData.prenom || ""}`.trim()) : ""} fullWidth size="small" disabled /></Grid>
                        </Grid>

                        {/* Help icon (top-right of this paper) */}

                    </Grid>
                </Paper>
            </Box>

            {/* MAIN: left (traite) + right (docs) */}
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>Instrument de paiement proposé par l'acheteur</Typography>

                            <TextField label="Type" fullWidth margin="dense" value={currentTraite?.instrumentType ?? currentTraite?.typeInstrument ?? ""} disabled />
                            <TextField label="Numéro" fullWidth margin="dense" value={currentTraite?.numero ?? currentTraite?.numeroTraite ?? ""} disabled />
                            <TextField label="A = (B+C+D) Montant" fullWidth margin="dense" value={traiteA} disabled />
                            <TextField label="B = dont déjà lettré" fullWidth margin="dense" value={totalB_fromDocs} disabled />

                            {/* TRAITE C is now just a target — no automatic allocation */}
                            <TextField
                                label="C = En cours"
                                fullWidth
                                margin="dense"
                                value={traiteCTarget}
                                onChange={(e) => onTraiteCTargetChange(e.target.value)}
                                helperText={docErrors._traite ? docErrors._traite.total : `Somme actuelle des (5) lignes: ${addedC}`}
                                error={!!docErrors._traite}
                            />

                            <TextField label="D = Restant à lettrer" fullWidth margin="dense" value={traiteD_fromServer} disabled />
                            <Box mt={2} textAlign="center">
                                <Button variant="contained" color="primary" onClick={handleSubmitAll} disabled={docFilter === "dejaLettre"}>
                                    Soumettre tous les lettrages (C)
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* DOCS area: one line per doc; per-doc En cours editable */}
                <Grid item xs={9}>
                    <Paper sx={{ p: 1, maxHeight: "65vh", overflow: "auto" }}>
                        {/* Filter controls (top of docs) */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Documents de remise — Lettrage & Référencement (une ligne par document)</Typography>
                            <Box display="flex" gap={2} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel id="doc-filter-label">Filtrer les documents</InputLabel>
                                    <Select
                                        labelId="doc-filter-label"
                                        value={docFilter}
                                        label="Filtrer les documents"
                                        onChange={(e) => setDocFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">Tous</MenuItem>
                                        <MenuItem value="dejaLettre">Déjà lettré </MenuItem>
                                        <MenuItem value="semiLettre">Semi-lettré</MenuItem>
                                        <MenuItem value="noLettre">Non lettré</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Box sx={{ overflowX: "auto", width: "100%" }}>
                            <Box sx={{ display: "inline-block", minWidth: 980 }}>
                                <Box sx={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: palette.background.paper, pb: 1, pt: 0.5 }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item sx={{ minWidth: colWidths.restant }}><Typography variant="caption" fontWeight="bold">(6) Restant</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.enCours }}><Typography variant="caption" fontWeight="bold">(5) Lettrage en cours</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.deja }}><Typography variant="caption" fontWeight="bold">(4) Déjà lettré</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.retenue }}><Typography variant="caption" fontWeight="bold">(3) Retenue Source</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.achete }}><Typography variant="caption" fontWeight="bold">(2) Acheté</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.numero }}><Typography variant="caption" fontWeight="bold">Numéro</Typography></Grid>
                                        <Grid item sx={{ minWidth: colWidths.type }}><Typography variant="caption" fontWeight="bold">Type</Typography></Grid>
                                        <Grid item sx={{ minWidth: 140 }}><Typography variant="caption" fontWeight="bold">Actions</Typography></Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ mb: 1 }} />

                                {filteredDocs && filteredDocs.length ? filteredDocs.map((d) => {
                                    const ed = localDocEdits[d.id] || {};
                                    const rowErr = docErrors[d.id] || {};
                                    const isAffiche = !!d.affiche;

                                    // determine if En cours should be disabled for this row:
                                    // disabled if docFilter === 'dejaLettre' OR doc.affiche truthy
                                    const enCoursDisabled = !!d.affiche || docFilter === "dejaLettre" || d.montantOuvert===0;

                                    return (
                                        <Box key={d.id} sx={{ display: "flex", gap: 2, alignItems: "center", py: 1, borderBottom: `1px solid ${palette.divider}` }}>
                                            <TextField
                                                label="Restant"
                                                size="small"
                                                value={ed.restantALetter ?? d.restantALetter ?? d.montantOuvert ?? ""}
                                                disabled
                                                InputProps={{ sx: { minWidth: colWidths.restant } }}
                                            />

                                            <TextField
                                                label="En cours"
                                                size="small"
                                                type="number"
                                                value={ed.lettrageEnCours ?? ""}
                                                onChange={(e) => onDocFieldChange(d.id, "lettrageEnCours", e.target.value)}
                                                InputProps={{ sx: { minWidth: colWidths.enCours } }}
                                                error={!!rowErr.lettrageEnCours}
                                                helperText={rowErr.lettrageEnCours ?? ""}
                                                disabled={enCoursDisabled}
                                            />

                                            <TextField
                                                label="Déjà lettré"
                                                size="small"
                                                value={ed.dejaLettre ?? d.dejaLettre ?? d.montantLettre ?? "0"}
                                                disabled
                                                InputProps={{ sx: { minWidth: colWidths.deja } }}
                                            />

                                            <TextField
                                                label="Retenue Source"
                                                size="small"
                                                value={ed.retenueSource ?? d.retenueSource ?? ""}
                                                onChange={(e) => onDocFieldChange(d.id, "retenueSource", e.target.value)}
                                                disabled={isAffiche}
                                                InputProps={{ sx: { minWidth: colWidths.retenue } }}
                                            />

                                            <TextField
                                                label="Acheté"
                                                size="small"
                                                value={ed.achete ?? d.achete ?? d.montantAchete ?? ""}
                                                disabled
                                                InputProps={{ sx: { minWidth: colWidths.achete } }}
                                            />

                                            <TextField
                                                label="Numéro"
                                                size="small"
                                                value={ed.numero ?? d.numero ?? d.docRemiseNo ?? ""}
                                                disabled
                                                InputProps={{ sx: { minWidth: colWidths.numero } }}
                                            />

                                            <TextField
                                                label="Type"
                                                size="small"
                                                value={ed.type ?? d.type ?? d.typeDocRemise?.dsg ?? ""}
                                                disabled
                                                InputProps={{ sx: { minWidth: colWidths.type } }}
                                            />

                                            <Box sx={{ minWidth: 140, display: "flex", gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleSaveDoc(d)}
                                                    disabled={!!savingDoc[d.id] || inLettrageState.loading || enCoursDisabled}
                                                >
                                                    {savingDoc[d.id] || inLettrageState.loading ? <CircularProgress size={16} /> : "Enregistrer"}
                                                </Button>
                                                <Button variant="text" size="small" onClick={() => {
                                                    onDocFieldChange(d.id, "lettrageEnCours", "");
                                                    setDocErrors((p) => { const cp = { ...(p || {}) }; delete cp[d.id]; return cp;});
                                                }}>Annuler</Button>
                                            </Box>
                                        </Box>
                                    );
                                }) : (
                                    <Typography variant="body2">Aucun document trouvé pour ce contrat/acheteur.</Typography>
                                )}
                            </Box>
                        </Box>
                    </Paper>

                    {/* small summary area replicating SaisieBordereau logic: show sum vs target and a helper */}
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                        <Typography>Somme (5) lettrage en cours: <strong>{addedC}</strong></Typography>
                        <Typography>Traite C cible: <strong>{traiteCTarget || 0}</strong></Typography>
                        <Typography>D (Restant Traite): <strong>{traiteD_fromServer}</strong></Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Help dialog showing equations */}
            <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
                <DialogTitle>Aide: Formules de calcul</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Les formules utilisées pour le lettrage:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>A = (B + C + D)</strong></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>(2) = (4) + (5) + (6)</strong></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>C = SUM(5)</strong></Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Où:
                    </Typography>
                    <ul>
                        <li><Typography variant="caption">(A) Montant de la traite</Typography></li>
                        <li><Typography variant="caption">(B) Montant deja lettre de la traite</Typography></li>
                        <li><Typography variant="caption">(C) Montant En cours de lettrage de la traite</Typography></li>
                        <li><Typography variant="caption">(D) Montant Rester a lettre de la traite </Typography></li>
                        <li><Typography variant="caption">(2) Montant Acheté de la document</Typography></li>
                        <li><Typography variant="caption">(4) Déjà lettré de la document</Typography></li>
                        <li><Typography variant="caption">(5) En cours de lettrage de la document</Typography></li>
                        <li><Typography variant="caption">(6) Restant à lettrer de la document </Typography></li>
                    </ul>
                </DialogContent>
            </Dialog>

            {/* Snackbar for pop-up messages (replaces alert) */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TraiteLettrage;
