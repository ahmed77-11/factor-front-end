// src/pages/InVirem/CreateInVirem.jsx
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
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Grid,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";
import { addInVirem } from "../../redux/inVirem/inViremSlice.js";
import { useNavigate } from "react-router-dom";
import { fetchRelationsAsync } from "../../redux/relations/relationsSlice.js";
import {
  allAdherRibs,
  allAchetPmRibs,
  allAchetPpRibs,
} from "../../redux/rib/ribSlice.js";
import { fetchAdherentsAsync } from "../../redux/relations/relationsSlice.js";
import { useBanque } from "../../customeHooks/useBanque.jsx"; // for banque list

// RIB validation function (same as AddRib)
const validerRib = (value) => {
  if (!value) return false;
  const digits = value.replace(/\D/g, ""); // Keep only digits
  if (digits.length !== 20) return false;
  try {
    // algorithm used earlier: (97 - (base % 97)) === key
    const base = BigInt(digits.slice(0, 18) + "00");
    const key = BigInt(digits.slice(18));
    return 97n - (base % 97n) === key;
  } catch (e) {
    return false;
  }
};

const CreateInVirem = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedContrat, setSelectedContrat] = useState(null);
  const [adherentName, setAdherentName] = useState("");
  const [acheteurs, setAcheteurs] = useState([]);
  const [selectedAcheteur, setSelectedAcheteur] = useState(null);
  const [adherType, setAdherType] = useState("");
  const [selectedAdherentId, setSelectedAdherentId] = useState(null);

  // banques hook (same as in AddRib)
  const { banques } = useBanque();

  // Redux slices used (same as CreateInCheque)
  const { contrats } = useSelector((state) => state.contrat);
  const { currentPM } = useSelector((state) => state.personneMorale);
  const { currentPP } = useSelector((state) => state.personnePhysique);
  const { relations } = useSelector((state) => state.relations);
  const { loadingInVirem, errorInVirem } = useSelector(
      (state) => state.inVirem || {}
  );
  const { ribs, loadingRib } = useSelector((state) => state.rib || {});
  const { adherents = [] } = useSelector((state) => state.relations || {});

  // Load contracts and adherents on mount
  useEffect(() => {
    dispatch(fetchContratsSigner());
    dispatch(fetchAdherentsAsync());
  }, [dispatch]);

  // Build adherent options (factor code + label)
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

  // When contrat changes, fetch adherent details & relations
  useEffect(() => {
    if (selectedContrat) {
      const contrat = selectedContrat;
      if (contrat.contratNo && contrat.contratNo.startsWith("RNE")) {
        dispatch(getPMById(contrat.adherent));
        setAdherType("pm");
      } else if (contrat.contratNo && contrat.contratNo.startsWith("PATENTE")) {
        dispatch(getPPById(contrat.adherent));
        setAdherType("pp");
      }

      // Fetch relations for this adherent
      dispatch(fetchRelationsAsync(contrat.adherent));
    }
  }, [selectedContrat, dispatch]);

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
        setAdherentName(
            `${currentPP.nom || ""} ${currentPP.prenom || ""}`.trim()
        );
      } else {
        setAdherentName("");
      }
    } else {
      setAdherentName("");
    }
  }, [selectedContrat, currentPM, currentPP]);

  // Extract acheteurs from relations
  useEffect(() => {
    if (relations && relations.length > 0) {
      const acheteursList = relations
          .map((relation) => {
            if (relation.acheteurMorale) {
              return {
                id: relation.acheteurMorale.id,
                pieceId: `${relation.acheteurMorale.typePieceIdentite?.dsg}${relation.acheteurMorale.numeroPieceIdentite}`,
                name: relation.acheteurMorale.raisonSocial,
                type: "pm",
                factorAchetCode: relation.acheteurMorale?.factorAchetCode,
              };
            } else if (relation.acheteurPhysique) {
              return {
                id: relation.acheteurPhysique.id,
                pieceId: `${relation.acheteurPhysique.typePieceIdentite?.dsg}${relation.acheteurPhysique.numeroPieceIdentite}`,
                name: `${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`,
                type: "pp",
                factorAchetCode: relation.acheteurPhysique?.factorAchetCode,
              };
            }
            return null;
          })
          .filter(Boolean);

      setAcheteurs(acheteursList);
    } else {
      setAcheteurs([]);
    }
  }, [relations]);

  // Fetch RIBs depending on contract / acheteur selection (kept for other rib uses)
  useEffect(() => {
    if (!selectedContrat) return;

    if (selectedAcheteur) {
      if (selectedAcheteur.type === "pm") {
        dispatch(allAchetPmRibs(selectedContrat.id, selectedAcheteur.id));
      } else {
        dispatch(allAchetPpRibs(selectedContrat.id, selectedAcheteur.id));
      }
    } else {
      dispatch(allAdherRibs(selectedContrat.id));
    }
  }, [selectedContrat, selectedAcheteur, dispatch]);

  // Validation schema (factor bank + suffix uses same validation as AddRib)
  const validationSchema = yup.object().shape({
    contrat: yup.object().required("Contrat requis"),
    acheteurPresent: yup
        .boolean()
        .required("Sélectionnez si un acheteur est présent"),
    acheteur: yup.mixed().when("acheteurPresent", {
      is: true,
      then: (schema) => schema.required("Acheteur requis"),
      otherwise: (schema) => schema.notRequired(),
    }),
    dateEmission: yup
        .date()
        .typeError("Date invalide")
        .required("Date d'émission requise"),
    numeroEmission: yup
        .string()
        .max(20, "Numéro emission trop long")
        .required("Numéro d'émission requis"),
    tireurEmisNom: yup.string().required("Nom requis"),
    rib: yup.mixed().required("RIB requis"),
    montant: yup
        .number()
        .typeError("Montant invalide")
        .required("Montant requis")
        .positive("Montant doit être positif"),
    libelle: yup.string().required("Libellé requis"),
    infoLibre: yup.string().notRequired(),

    // factor bank + suffix validation - mirrored from AddRib:
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

  // Helper for applying adherent selection
  const applyAdherentSelection = (adherObj, setFieldValue) => {
    if (!adherObj) {
      setSelectedAdherentId(null);
      setFieldValue("contrat", null);
      setFieldValue("contrat", null);
      return;
    }
    setSelectedAdherentId(adherObj.id);
    setFieldValue("adherentId", adherObj.id);
    setFieldValue("adherFactorCode", adherObj.adherFactorCode || "");
    // reset contrat selection to be chosen from filteredContrats
    setFieldValue("contrat", null);
    setSelectedContrat(null);
  };

  return (
      <Box m="20px">
        <Header title="Virement Entrant" subtitle="Créer un nouveau virement entrant" />
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
                initialValues={{
                  contrat: null,
                  acheteurPresent: false,
                  acheteur: null,
                  // FIELDS ORDER you requested
                  dateEmission: "",
                  numeroEmission: "",
                  tireurEmisNom: "",
                  rib: null,
                  montant: "",
                  // devise is derived from contrat.devise
                  libelle: "",
                  infoLibre: "",
                  // factor RIB splitted like AddRib:
                  factorBanqueCode: "",
                  factorRibSuffix: "",
                  dateEmiseEncaissement: "",
                  fraisEncaissement: "",
                  dateValeur: "",
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  // Build factor RIB from bank code + suffix
                  const factorRibFull = values.factorBanqueCode + values.factorRibSuffix;

                  const payload = {
                    contrat: values.contrat,
                    acheteurPresent: values.acheteurPresent,
                    acheteurId: values.acheteurPresent ? values.acheteur.id : null,
                    acheteurType: values.acheteurPresent ? values.acheteur.type : null,

                    // adherent / acheteur codes
                    doFactorAdherCode:
                        adherType === "pm" ? currentPM?.factorAdherCode : currentPP?.factorAdherCode,
                    doFactorAchetCode: values.acheteurPresent ? values.acheteur.factorAchetCode : null,

                    // main virement fields
                    doEmisDate: values.dateEmission,
                    doEmisNo: values.numeroEmission,
                    doNom: values.tireurEmisNom,
                    doRib: values.rib ? values.rib.rib : null,
                    montant: Number(values.montant),
                    devise: values.contrat?.devise || null,
                    deviseCodeNum: values.contrat?.devise?.codeNum || null,

                    doLibelle: values.libelle,
                    doInfoLibre: values.infoLibre,

                    // encaissement
                    factorRib: factorRibFull || null,
                    encaisseDate: values.dateEmiseEncaissement || null,
                    encaisseFrais: values.fraisEncaissement ? Number(values.fraisEncaissement) : null,
                    encaisseValeurDate: values.dateValeur || null,
                  };


                  dispatch(addInVirem(payload, navigate));
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
                // When contrat is selected, keep selectedContrat in sync and fetch PM/PP
                const handleContratChange = (newContrat) => {
                  setFieldValue("contrat", newContrat);
                  setSelectedContrat(newContrat);
                  if (newContrat) {
                    setSelectedAdherentId(newContrat.adherent);
                  }
                  setFieldValue("acheteurPresent", false);
                  setFieldValue("acheteur", null);
                  setSelectedAcheteur(null);
                  setFieldValue("rib", null);

                  if (newContrat) {
                    if (newContrat.contratNo?.startsWith("RNE")) {
                      dispatch(getPMById(newContrat.adherent));
                      setAdherType("pm");
                    } else if (newContrat.contratNo?.startsWith("PATENTE")) {
                      dispatch(getPPById(newContrat.adherent));
                      setAdherType("pp");
                    }
                    dispatch(fetchRelationsAsync(newContrat.adherent));
                  }
                };

                // handle factor rib suffix input (only digits, max 18)
                const handleFactorRibSuffixChange = (e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 18);
                  setFieldValue("factorRibSuffix", value);
                };

                // Get decimal places based on currency
                const currencyCode = values.contrat?.devise?.codeAlpha || null;
                const decimalPlaces = currencyCode === "TND" ? 3 : (currencyCode === "EUR" || currencyCode === "USD") ? 2 : 0;

                return (
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        {/* Adherent selection - same layout as CreateInCheque */}
                        <Grid container item xs={12} spacing={2}>
                          <Grid item xs={4}>
                            <Autocomplete
                                options={adherentOptions}
                                getOptionLabel={(option) => option?.adherFactorCode || ""}
                                value={
                                    adherentOptions.find(
                                        (a) => a.id === selectedAdherentId
                                    ) || null
                                }
                                onChange={(e, newValue) => {
                                  applyAdherentSelection(newValue, setFieldValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code Factor"
                                        fullWidth
                                    />
                                )}
                            />
                          </Grid>

                          <Grid item xs={4}>
                            <Autocomplete
                                options={adherentOptions}
                                getOptionLabel={(option) => option?.label || ""}
                                value={
                                    adherentOptions.find(
                                        (a) => a.id === selectedAdherentId
                                    ) || null
                                }
                                onChange={(e, newValue) => {
                                  applyAdherentSelection(newValue, setFieldValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Identité Adhérent"
                                        fullWidth
                                    />
                                )}
                            />
                          </Grid>

                          <Grid item xs={4}>
                            <Autocomplete
                                options={filteredContrats}
                                getOptionLabel={(option) => option?.contratNo || ""}
                                value={values.contrat}
                                onChange={(e, newValue) => handleContratChange(newValue)}
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
                          </Grid>
                        </Grid>

                        {/* Devise preview (derived from selected contrat) */}
                        <Grid item xs={12}>
                          {values.contrat ? (
                              <TextField
                                  label="Devise"
                                  fullWidth
                                  value={values.contrat?.devise?.dsg || ""}
                                  disabled
                              />
                          ) : (
                              <Box />
                          )}
                        </Grid>

                        {/* Acheteur present (radio) & Acheteur select */}
                        <Grid item xs={6}>
                          <FormControl component="fieldset" fullWidth>
                            <Typography fontWeight="bold">Donneur d&#39;order du virement ?</Typography>
                            <RadioGroup
                                row
                                name="acheteurPresent"
                                value={values.acheteurPresent ? "true" : "false"}
                                onChange={(e) => {
                                  const booleanValue = e.target.value === "true";
                                  setFieldValue("acheteurPresent", booleanValue);
                                  setFieldValue("acheteur", null);
                                  setSelectedAcheteur(null);
                                  setFieldValue("rib", null);
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
                          {values.acheteurPresent ? (
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Autocomplete
                                      options={acheteurs}
                                      getOptionLabel={(option) => option?.name || ""}
                                      value={values.acheteur}
                                      onChange={(event, newValue) => {
                                        setFieldValue("acheteur", newValue);
                                        setSelectedAcheteur(newValue);
                                        setFieldValue("rib", null);
                                      }}
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
                                        setFieldValue("acheteur", newValue);
                                        setSelectedAcheteur(newValue);
                                        setFieldValue("rib", null);
                                      }}
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
                          ) : (
                              <Box />
                          )}
                        </Grid>

                        {/* 1) dateEmission -> numeroEmission */}
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

                        {/* 2) nom -> rib */}
                        <Grid item xs={6}>
                          <TextField
                              label="Donneur d'order"
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

                        {/* 3) montant -> devise */}
                        <Grid item xs={6}>
                          <TextField
                              label={`Montant (${decimalPlaces} décimales max)`}
                              fullWidth
                              type="number"
                              name="montant"
                              value={values.montant}
                              onChange={(e) => {
                                let inputValue = e.target.value;

                                // Restrict decimals according to currency
                                if (decimalPlaces === 0) {
                                  inputValue = inputValue.replace(/\..*/, ""); // no decimals
                                } else if (decimalPlaces > 0) {
                                  const regex = new RegExp(`^(\\d+)(\\.\\d{0,${decimalPlaces}})?$`);
                                  if (!regex.test(inputValue) && inputValue !== "") return; // reject invalid decimals
                                }

                                setFieldValue("montant", inputValue);
                              }}
                              onBlur={handleBlur}
                              error={!!touched.montant && !!errors.montant}
                              helperText={touched.montant && errors.montant}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          {/* Devise preview (readonly) */}
                          <TextField
                              label="Devise"
                              fullWidth
                              value={values.contrat?.devise?.dsg || ""}
                              disabled
                          />
                        </Grid>

                        {/* 4) libelle -> infoLibre */}
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

                        {/* 5) factorRib: BANK SELECT + SUFFIX (like AddRib) -> date emise a l'encaissement */}
                        <Grid item xs={3}>
                          <FormControl
                              fullWidth
                              error={!!touched.factorBanqueCode && !!errors.factorBanqueCode}
                          >
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
                                  <MenuItem key={b.codeNum} value={b.codeNum} >
                                    {b.codeAlpha}
                                  </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {touched.factorBanqueCode && errors.factorBanqueCode}
                            </FormHelperText>
                          </FormControl>
                        </Grid>

                        <Grid item xs={9}>
                          <TextField
                              label="RIB Factor (18 chiffres restants)"
                              name="factorRibSuffix"
                              fullWidth
                              value={values.factorRibSuffix}
                              onChange={handleFactorRibSuffixChange}
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

                        {/* 6) frais encaissement -> date valeur */}
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

                        {/* Submit */}
                        <Grid item xs={12}>
                          <Box textAlign="center" mt={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                disabled={loadingInVirem}
                            >
                              {loadingInVirem ? (
                                  <CircularProgress size={24} />
                              ) : (
                                  "Créer le virement"
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </form>
                );
              }}
            </Formik>
          </CardContent>
        </Card>
      </Box>
  );
};

export default CreateInVirem;