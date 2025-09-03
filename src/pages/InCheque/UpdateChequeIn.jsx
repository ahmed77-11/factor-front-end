// src/pages/InCheque/UpdateInCheque.jsx
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
    useTheme,
    Autocomplete,
    CircularProgress,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchInChequeByIdAsync,
    updateInChequeAsync,
} from "../../redux/inCheque/inChequeSlice.js";
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

// Validation schema - similar to create but without contrat requirement
const validationSchema = yup.object().shape({
    acheteurPresent: yup.boolean().required("Sélectionnez si un acheteur est présent"),
    acheteur: yup.mixed().when("acheteurPresent", {
        is: true,
        then: (schema) => schema.required("Acheteur requis"),
        otherwise: (schema) => schema.notRequired(),
    }),
    factorDate: yup.date().typeError("Date invalide").required("Date de facture requise"),
    chequeNo: yup.string().required("Numéro de chèque requis"),
    tireurEmisDate: yup.date().typeError("Date invalide").required("Date d'émission requise"),
    tireurEmisLieu: yup.string().required("Lieu d'émission requis"),
    rib: yup.mixed().required("RIB requis"),
    tireurEmisNom: yup.string().required("Nom tireur requis"),
    montant: yup.number().typeError("Montant invalide").required("Montant requis").positive("Montant doit être positif"),
});

const UpdateInCheque = () => {
    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentInCheque, loadingInCheque } = useSelector((state) => state.inCheque || {});
    // Use the exact state fields from your slices:
    const { currentPMByAchetCode } = useSelector((state) => state.personneMorale || {});
    const { currentPPByAchetCode } = useSelector((state) => state.personnePhysique || {});

    const [selectedContrat, setSelectedContrat] = useState(null);
    const [adherentName, setAdherentName] = useState("");
    const [acheteurs, setAcheteurs] = useState([]);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [adherType, setAdherType] = useState("");
    const { relations } = useSelector((state) => state.relations || {});
    const { ribs, loadingRib } = useSelector((state) => state.rib || {});
    const [initialValues, setInitialValues] = useState(null);
    const { adherents = [] } = useSelector((state) => state.relations || {});
    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [disableAcheteurSelect, setDisableAcheteurSelect] = useState(false);

    // Fetch cheque data and adherents on mount
    useEffect(() => {
        dispatch(fetchInChequeByIdAsync(id));
        dispatch(fetchAdherentsAsync());
    }, [dispatch, id]);

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

    // When currentInCheque changes, set up form and fetch acheteur by code if available
    useEffect(() => {
        if (currentInCheque) {
            setSelectedContrat(currentInCheque.contrat);
            setSelectedAdherentId(currentInCheque.contrat?.adherent);

            // Base initial values; acheteur will be set later if fetched by achat code or relations
            setInitialValues({
                acheteurPresent: Boolean(currentInCheque.tireurFactorAchetCode),
                acheteur: null,
                factorDate: currentInCheque.factorDate?.split("T")[0] || "",
                chequeNo: currentInCheque.chequeNo,
                tireurEmisDate: currentInCheque.tireurEmisDate?.split("T")[0] || "",
                tireurEmisLieu: currentInCheque.tireurEmisLieu || "",
                rib: currentInCheque.tireurEmisRib ? { rib: currentInCheque.tireurEmisRib } : null,
                tireurEmisNom: currentInCheque.tireurEmisNom || "",
                montant: currentInCheque.montant ?? "",
            });

            // Fetch adherent details (existing behavior)
            if (currentInCheque.contrat) {
                if (currentInCheque.contrat.contratNo?.startsWith("RNE")) {
                    dispatch(getPMById(currentInCheque.contrat.adherent));
                    setAdherType("pm");
                } else {
                    dispatch(getPPById(currentInCheque.contrat.adherent));
                    setAdherType("pp");
                }

                // Fetch relations for this adherent
                dispatch(fetchRelationsAsync(currentInCheque.contrat.adherent));
            }

            // If there's a tireurFactorAchetCode, fetch acheteur by that code using your thunks
            const code = currentInCheque.tireurFactorAchetCode;
            if (code) {
                if (/pp/i.test(code)) {
                    dispatch(getPPByAchetCode(code));
                } else if (/pm/i.test(code)) {
                    dispatch(getPMByAchetCode(code));
                } else {
                    // if format is not clear, try both (PM first then PP)
                    dispatch(getPMByAchetCode(code));
                    dispatch(getPPByAchetCode(code));
                }
            } else {
                // no code: keep selects enabled (acheteur may be chosen through relations)
                setDisableAcheteurSelect(false);
            }
        }
    }, [currentInCheque, dispatch]);

    // If a PP was loaded by achet code, set it into initialValues & disable selection
    useEffect(() => {
        if (currentPPByAchetCode && initialValues) {
            const pp = currentPPByAchetCode;
            const acheteurFromCode = {
                id: pp.id,
                pieceId: `${pp.typePieceIdentite?.dsg || ""}${pp.numeroPieceIdentite || ""}`,
                name: `${pp.nom || ""} ${pp.prenom || ""}`.trim(),
                type: "pp",
                factorAchetCode: pp.factorAchetCode,
            };
            setSelectedAcheteur(acheteurFromCode);
            setInitialValues((prev) => ({
                ...prev,
                acheteurPresent: true,
                acheteur: acheteurFromCode,
            }));
            setDisableAcheteurSelect(true);
        }
    }, [currentPPByAchetCode, initialValues]);

    // If a PM was loaded by achet code, set it into initialValues & disable selection
    useEffect(() => {
        if (currentPMByAchetCode && initialValues) {
            const pm = currentPMByAchetCode;
            const acheteurFromCode = {
                id: pm.id,
                pieceId: `${pm.typePieceIdentite?.dsg || ""}${pm.numeroPieceIdentite || ""}`,
                name: pm.raisonSocial || pm.nom || "",
                type: "pm",
                factorAchetCode: pm.factorAchetCode,
            };
            setSelectedAcheteur(acheteurFromCode);
            setInitialValues((prev) => ({
                ...prev,
                acheteurPresent: true,
                acheteur: acheteurFromCode,
            }));
            setDisableAcheteurSelect(true);
        }
    }, [currentPMByAchetCode, initialValues]);

    // Extract acheteurs from relations (existing behavior)
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
                        };
                    } else if (relation.acheteurPhysique) {
                        return {
                            id: relation.acheteurPhysique.id,
                            pieceId: `${relation.acheteurPhysique.typePieceIdentite?.dsg || ""}${relation.acheteurPhysique.numeroPieceIdentite || ""}`,
                            name: `${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`.trim(),
                            type: "pp",
                            factorAchetCode: relation.acheteurPhysique.factorAchetCode,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            setAcheteurs(acheteursList);

            // If there's a tireurFactorAchetCode but we didn't fetch via the achat-code endpoints
            // try to match from relations and lock it.
            if (currentInCheque?.tireurFactorAchetCode && initialValues && !selectedAcheteur) {
                const matchingAcheteur = acheteursList.find(
                    (a) => a.factorAchetCode === currentInCheque.tireurFactorAchetCode
                );
                if (matchingAcheteur) {
                    setInitialValues((prev) => ({
                        ...prev,
                        acheteurPresent: true,
                        acheteur: matchingAcheteur,
                    }));
                    setSelectedAcheteur(matchingAcheteur);
                    setDisableAcheteurSelect(true);
                }
            }
        }
    }, [relations, currentInCheque, initialValues, selectedAcheteur]);

    // Fetch RIBs when contract or selectedAcheteur changes
    useEffect(() => {
        if (!selectedContrat) return;

        if (initialValues?.acheteurPresent && selectedAcheteur) {
            if (selectedAcheteur.type === "pm") {
                dispatch(allAchetPmRibs(selectedContrat.id, selectedAcheteur.id));
            } else {
                dispatch(allAchetPpRibs(selectedContrat.id, selectedAcheteur.id));
            }
        } else {
            dispatch(allAdherRibs(selectedContrat.id));
        }
    }, [selectedContrat, selectedAcheteur, initialValues, dispatch]);

    // Update adherent name when details are fetched
    useEffect(() => {
        if (selectedContrat) {
            if (adherType === "pm" && selectedContrat.pm) {
                setAdherentName(selectedContrat.pm.raisonSocial || "");
            } else if (adherType === "pp" && selectedContrat.pp) {
                setAdherentName(
                    `${selectedContrat.pp.nom || ""} ${selectedContrat.pp.prenom || ""}`.trim()
                );
            } else {
                setAdherentName("");
            }
        } else {
            setAdherentName("");
        }
    }, [selectedContrat, adherType]);

    if (!initialValues || !currentInCheque) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box m="20px">
            <Header
                title="Modifier Chèque Entrant"
                subtitle={`Mise à jour du chèque #${currentInCheque.chequeNo}`}
            />

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
                            const payload = {
                                id: currentInCheque.id,
                                contrat: currentInCheque.contrat,
                                acheteurPresent: values.acheteurPresent,
                                acheteurId: values.acheteurPresent ? values.acheteur.id : null,
                                acheteurType: values.acheteurPresent ? values.acheteur.type : null,
                                tireurFactorAdherCode: !values.acheteurPresent
                                    ? (adherType === "pm"
                                        ? currentInCheque.contrat.pm?.factorAdherCode
                                        : currentInCheque.contrat.pp?.factorAdherCode)
                                    : null,
                                tireurFactorAchetCode: values.acheteurPresent ? values.acheteur.factorAchetCode : null,
                                factorDate: values.factorDate,
                                chequeNo: values.chequeNo,
                                tireurEmisDate: values.tireurEmisDate,
                                tireurEmisLieu: values.tireurEmisLieu,
                                tireurEmisRib: values.rib ? values.rib.rib : null,
                                tireurEmisNom: values.tireurEmisNom,
                                montant: Number(values.montant),
                                deviseId: currentInCheque.contrat.devise.id,
                                statusMoyPai: currentInCheque.statusMoyPai,
                            };

                            dispatch(updateInChequeAsync(id, payload, navigate));
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
                                    {/* Three autocompletes for adherent selection (disabled) */}
                                    <Grid container item xs={12} spacing={2}>
                                        {/* Factor Code Autocomplete */}
                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={adherentOptions}
                                                getOptionLabel={(option) => option?.adherFactorCode || ""}
                                                value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Code Factor" fullWidth />}
                                            />
                                        </Grid>

                                        {/* Identity Autocomplete */}
                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={adherentOptions}
                                                getOptionLabel={(option) => option?.label || ""}
                                                value={adherentOptions.find((a) => a.id === selectedAdherentId) || null}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Identité Adhérent" fullWidth />}
                                            />
                                        </Grid>

                                        {/* Contrat Autocomplete */}
                                        <Grid item xs={4}>
                                            <Autocomplete
                                                options={[currentInCheque.contrat]}
                                                getOptionLabel={(option) => option?.contratNo || ""}
                                                value={currentInCheque.contrat}
                                                disabled
                                                renderInput={(params) => <TextField {...params} label="Contrat" fullWidth />}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Devise Field */}
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Devise"
                                            fullWidth
                                            value={currentInCheque.contrat?.devise?.dsg || ""}
                                            disabled
                                        />
                                    </Grid>

                                    {/* Acheteur present (radio) & Acheteur select */}
                                    <Grid item xs={6}>
                                        <FormControl component="fieldset" fullWidth>
                                            <Typography fontWeight="bold">Tireur Du Chéque ?</Typography>
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
                                                        // when switching to true, if we have a selectedAcheteur (from code), prefill it
                                                        if (selectedAcheteur) {
                                                            setFieldValue("acheteur", selectedAcheteur);
                                                            setDisableAcheteurSelect(!!selectedAcheteur);
                                                        }
                                                    }
                                                }}
                                            >
                                                <FormControlLabel value="true" control={<Radio />} label="Acheteur" />
                                                <FormControlLabel value="false" control={<Radio />} label="Adherent" />
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

                                    {/* factorDate & chequeNo */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Date de facture"
                                            fullWidth
                                            type="date"
                                            name="factorDate"
                                            value={values.factorDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.factorDate && !!errors.factorDate}
                                            helperText={touched.factorDate && errors.factorDate}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Numéro de chèque"
                                            fullWidth
                                            name="chequeNo"
                                            value={values.chequeNo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.chequeNo && !!errors.chequeNo}
                                            helperText={touched.chequeNo && errors.chequeNo}
                                        />
                                    </Grid>

                                    {/* tireurEmisDate & tireurEmisLieu */}
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Date d'émission"
                                            fullWidth
                                            type="date"
                                            name="tireurEmisDate"
                                            value={values.tireurEmisDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireurEmisDate && !!errors.tireurEmisDate}
                                            helperText={touched.tireurEmisDate && errors.tireurEmisDate}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Lieu d'émission"
                                            fullWidth
                                            name="tireurEmisLieu"
                                            value={values.tireurEmisLieu}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireurEmisLieu && !!errors.tireurEmisLieu}
                                            helperText={touched.tireurEmisLieu && errors.tireurEmisLieu}
                                        />
                                    </Grid>

                                    {/* RIB (autocomplete) & Nom tireur */}
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

                                    {/* montant */}
                                    <Grid item xs={12}>
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

                                    {/* Submit button */}
                                    <Grid item xs={12}>
                                        <Box textAlign="center" mt={2}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="secondary"
                                                disabled={loadingInCheque}
                                                sx={{ mr: 2 }}
                                            >
                                                {loadingInCheque ? <CircularProgress size={24} /> : "Mettre à jour"}
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

export default UpdateInCheque;
