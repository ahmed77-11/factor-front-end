// src/pages/Rib/ModifyRib.jsx
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
    InputLabel,
    useTheme,
    MenuItem,
    Select,
    CircularProgress,
    Alert,
    Grid,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useBanque } from "../../customeHooks/useBanque.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRibByIdAsync, updateRib } from "../../redux/rib/ribSlice.js";

// RIB validation function
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

// Validation schema
const validationSchema = yup.object().shape({
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

const ModifyRib = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // Get rib ID from URL params

    const [entityType, setEntityType] = useState("");
    const [entityName, setEntityName] = useState("");
    const [entityIdentity, setEntityIdentity] = useState("");
    const [entityCode, setEntityCode] = useState("");
    const [contratNo, setContratNo] = useState("");

    const { banques } = useBanque();
    const { currentPM, loadingPM } = useSelector((state) => state.personneMorale);
    const { currentPP, loadingPP } = useSelector((state) => state.personnePhysique);
    const { currentRib, loadingRib, errorRib } = useSelector((state) => state.rib);

    // Fetch rib by ID on mount
    useEffect(() => {
        if (id) {
            dispatch(fetchRibByIdAsync(id));
        }
    }, [id, dispatch]);

    // Set contratNo when currentRib is available
    useEffect(() => {
        if (currentRib) {
            setContratNo(currentRib.contrat?.contratNo || "");
        }
    }, [currentRib]);

    // Once rib is loaded, fetch entity data
    useEffect(() => {
        if (currentRib) {
            // Handle Acheteur
            if (currentRib.achetPpId) {
                setEntityType("Acheteur Physique");
                dispatch(getPPById(currentRib.achetPpId));
            }
            else if (currentRib.achetPmId) {
                setEntityType("Acheteur Morale");
                dispatch(getPMById(currentRib.achetPmId));
            }
            // Handle Fournisseur
            else if (currentRib.fournPpId) {
                setEntityType("Fournisseur Physique");
                dispatch(getPPById(currentRib.fournPpId));
            }
            else if (currentRib.fournPmId) {
                setEntityType("Fournisseur Morale");
                dispatch(getPMById(currentRib.fournPmId));
            }
            // Handle Adherent (fallback if all others are null)
            else {
                setEntityType("Adhérent");
                if (currentRib.contrat.contratNo.startsWith("RNE")) {
                    dispatch(getPMById(currentRib.contrat.adherent));
                } else if (currentRib.contrat.contratNo.startsWith("PATENTE")) {
                    dispatch(getPPById(currentRib.contrat.adherent));
                }
            }
        }
    }, [currentRib, dispatch]);

    // Update entity details when data is fetched
    useEffect(() => {
        if (currentRib) {
            // Handle PP (Acheteur or Fournisseur)
            if (currentRib.achetPpId || currentRib.fournPpId) {
                if (currentPP) {
                    setEntityName(`${currentPP.nom || ""} ${currentPP.prenom || ""}`);
                    setEntityIdentity(`${currentPP.typePieceIdentite?.dsg || ""}${currentPP.numeroPieceIdentite || ""}`);
                    setEntityCode(
                        currentRib.achetPpId
                            ? currentPP.factorAchetCode || ""
                            : currentPP.factorFournCode || ""
                    );
                }
            }
            // Handle PM (Acheteur or Fournisseur)
            else if (currentRib.achetPmId || currentRib.fournPmId) {
                if (currentPM) {
                    setEntityName(currentPM.raisonSocial || "");
                    setEntityIdentity(`${currentPM.typePieceIdentite?.dsg || ""}${currentPM.numeroPieceIdentite || ""}`);
                    setEntityCode(
                        currentRib.achetPmId
                            ? currentPM.factorAchetCode || ""
                            : currentPM.factorFournCode || ""
                    );
                }
            }
            // Handle Adherent
            else {
                if (currentRib.contrat.contratNo.startsWith("RNE") && currentPM) {
                    setEntityName(currentPM.raisonSocial || "");
                    setEntityIdentity(`${currentPM.typePieceIdentite?.dsg || ""}${currentPM.numeroPieceIdentite || ""}`);
                    setEntityCode(currentPM.factorAdherCode || "");
                } else if (currentRib.contrat.contratNo.startsWith("PATENTE") && currentPP) {
                    setEntityName(`${currentPP.nom || ""} ${currentPP.prenom || ""}`);
                    setEntityIdentity(`${currentPP.typePieceIdentite?.dsg || ""}${currentPP.numeroPieceIdentite || ""}`);
                    setEntityCode(currentPP.factorAdherCode || "");
                }
            }
        }
    }, [currentRib, currentPM, currentPP]);

    // Load contrats (not used but keeping for consistency)
    useEffect(() => {
        dispatch(fetchContratsSigner());
    }, [dispatch]);

    if (loadingRib && !currentRib) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!currentRib) {
        return (
            <Box m="20px">
                <Header title="RIB" subtitle="Modifier un RIB" />
                <Alert severity="error" sx={{ mt: 2 }}>
                    RIB introuvable
                </Alert>
            </Box>
        );
    }

    // Initialize form values from the fetched rib
    const initialValues = {
        id: currentRib.id,
        banqueCode: currentRib.rib.substring(0, 2),
        ribSuffix: currentRib.rib.substring(2),
    };

    return (
        <Box m="20px">
            <Header title="RIB" subtitle="Modifier un RIB" />
            {errorRib && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorRib}
                </Alert>
            )}
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

                            // Prepare payload
                            const payload = {
                                ...currentRib,
                                banqueCode: values.banqueCode,
                                ribSuffix: values.ribSuffix,
                                rib: fullRib,
                            };

                            dispatch(updateRib(id, payload, navigate));
                        }}
                        enableReinitialize
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                          }) => {
                            // Properly handle ribSuffix input
                            const handleRibSuffixChange = (e) => {
                                // Only allow numeric input and limit to 18 digits
                                const value = e.target.value.replace(/\D/g, "").slice(0, 18);
                                setFieldValue("ribSuffix", value);
                            };

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        {/* Entity Type Display */}
                                        <TextField
                                            label="Type d'entité"
                                            fullWidth
                                            value={entityType}
                                            disabled
                                        />

                                        {/* Contrat Number */}
                                        <TextField
                                            label="Contrat No"
                                            fullWidth
                                            value={contratNo}
                                            disabled
                                        />

                                        {/* Entity Details */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Nom"
                                                    fullWidth
                                                    value={entityName}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Identité"
                                                    fullWidth
                                                    value={entityIdentity}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Code"
                                                    fullWidth
                                                    value={entityCode}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>

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
                                                disabled={loadingRib || loadingPM || loadingPP}
                                            >
                                                {(loadingRib || loadingPM || loadingPP) ?
                                                    <CircularProgress size={24} /> :
                                                    "Modifier le RIB"
                                                }
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

export default ModifyRib;