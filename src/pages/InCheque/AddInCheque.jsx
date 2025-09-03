// src/pages/InCheque/CreateInCheque.jsx
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
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
import { getPMById } from "../../redux/personne/PersonneMoraleSlice.js";
import { getPPById } from "../../redux/personne/PersonnePhysiqueSlice.js";
import { addInCheque } from "../../redux/inCheque/inChequeSlice.js";
import { useNavigate } from "react-router-dom";
import { fetchRelationsAsync } from "../../redux/relations/relationsSlice.js";
import {
    allAdherRibs,
    allAchetPmRibs,
    allAchetPpRibs,
} from "../../redux/rib/ribSlice.js";
import { fetchAdherentsAsync } from "../../redux/relations/relationsSlice.js";

// Validation schema
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
    factorDate: yup
        .date()
        .typeError("Date invalide")
        .required("Date de facture requise"),
    chequeNo: yup.string().max(7,"Numero Du Cheque doit comporter au maximum 7 caractères").required("Numéro de chèque requis"),
    tireurEmisDate: yup
        .date()
        .typeError("Date invalide")
        .required("Date d'émission requise"),
    tireurEmisLieu: yup.string().required("Lieu d'émission requis"),
    rib: yup.mixed().required("RIB requis"),
    tireurEmisNom: yup.string().required("Nom tireur requis"),
    montant: yup
        .number()
        .typeError("Montant invalide")
        .required("Montant requis")
        .positive("Montant doit être positif"),
});

// Function to convert amount to French words
const convertAmountToWords = (amount, currencyCode) => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const hundreds = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];

    let currencyUnit, currencySubUnit;
    if (currencyCode === 'TND') {
        currencyUnit = amount === 1 ? 'dinar' : 'dinars';
        currencySubUnit = 'millime';
    } else if (currencyCode === 'EUR' || currencyCode === 'USD') {
        currencyUnit = amount === 1 ? (currencyCode === 'EUR' ? 'euro' : 'dollar') : (currencyCode === 'EUR' ? 'euros' : 'dollars');
        currencySubUnit = currencyCode === 'EUR' ? 'cent' : 'centime';
    } else {
        currencyUnit = 'unité';
        currencySubUnit = 'sous-unité';
    }

    const integerPart = Math.floor(amount);
    const fractionalPart = Math.round(
        (amount - integerPart) * (currencyCode === 'TND' ? 1000 : 100)
    );

    const convertInteger = (num) => {
        if (num === 0) return 'zéro';
        if (num < 10) return units[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            if (ten === 7 || ten === 9) {
                return tens[ten - 1] + (unit === 1 ? ' et ' : '-') + teens[unit];
            }
            return tens[ten] + (unit > 0 ? '-' + units[unit] : '');
        }
        if (num < 1000) {
            const hundred = Math.floor(num / 100);
            const remainder = num % 100;
            return hundreds[hundred] + (remainder > 0 ? ' ' + convertInteger(remainder) : '');
        }
        if (num < 1000000) {
            const thousand = Math.floor(num / 1000);
            const remainder = num % 1000;
            return (thousand === 1 ? 'mille' : convertInteger(thousand) + ' mille') +
                (remainder > 0 ? ' ' + convertInteger(remainder) : '');
        }
        return 'montant trop élevé';
    };

    const convertFractional = (num) => {
        if (num === 0) return '';
        return convertInteger(num) + ' ' + (num === 1 ? currencySubUnit : currencySubUnit + 's');
    };

    const integerWords = convertInteger(integerPart);
    const fractionalWords = convertFractional(fractionalPart);

    return integerWords + ' ' + currencyUnit +
        (fractionalWords ? ' et ' + fractionalWords : '');
};

const CreateInCheque = () => {
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
    const [montantEnLettres, setMontantEnLettres] = useState("");

    const { contrats } = useSelector((state) => state.contrat);
    const { currentPM } = useSelector((state) => state.personneMorale);
    const { currentPP } = useSelector((state) => state.personnePhysique);
    const { relations } = useSelector((state) => state.relations);
    const { loadingInCheque, errorInCheque } = useSelector(
        (state) => state.inCheque
    );
    const { ribs, loadingRib } = useSelector((state) => state.rib || {});
    const { adherents = [] } = useSelector((state) => state.relations);

    // Load contracts and adherents on mount
    useEffect(() => {
        dispatch(fetchContratsSigner());
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

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

    // Filter contrats by selected adherent
    const filteredContrats = (contrats || []).filter(
        (c) => !selectedAdherentId || c.adherent === selectedAdherentId
    );

    // When contrat changes, fetch adherent details
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
                        console.log("Acheteur Morale:", relation.acheteurMorale);
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

    // Fetch RIBs depending on contract / acheteur selection
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

    // Apply adherent selection
    const applyAdherentSelection = (adherObj) => {
        if (!adherObj) {
            setSelectedAdherentId(null);
            setSelectedContrat(null);
            return;
        }
        setSelectedAdherentId(adherObj.id);
    };

    return (
        <Box m="20px">
            <Header title="Chèque Entrant" subtitle="Créer un nouveau chèque entrant" />
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
                            factorDate: "",
                            chequeNo: "",
                            tireurEmisDate: "",
                            tireurEmisLieu: "",
                            rib: null,
                            tireurEmisNom: "",
                            montant: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            const payload = {
                                contrat: values.contrat,
                                acheteurPresent: values.acheteurPresent,
                                acheteurId: values.acheteurPresent ? values.acheteur.id : null,
                                acheteurType: values.acheteurPresent  ? values.acheteur.type : null,
                                tireurFactorAdherCode:adherType === "pm" ? currentPM?.factorAdherCode : currentPP?.factorAdherCode,

                                tireurFactorAchetCode:values.acheteurPresent===true? values.acheteur.factorAchetCode : null,
                                factorDate: values.factorDate,
                                chequeNo: values.chequeNo,
                                tireurEmisDate: values.tireurEmisDate,
                                tireurEmisLieu: values.tireurEmisLieu,
                                tireurEmisRib: values.rib ? values.rib.rib : null,
                                tireurEmisNom: values.tireurEmisNom,
                                montant: Number(values.montant),
                                deviseId: values.contrat.devise.id,
                            };
                            dispatch(addInCheque(payload, navigate));
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
                            const currencyCode = values.contrat?.devise?.codeAlpha || null;
                            const decimalPlaces = currencyCode === "TND" ? 3 :(currencyCode==="EUR"|| currencyCode==="USD")?2:0;

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={2}>
                                        {/* Three autocompletes for adherent selection */}
                                        <Grid container item xs={12} spacing={2}>
                                            {/* Factor Code Autocomplete */}
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
                                                        applyAdherentSelection(newValue?.raw);
                                                        setFieldValue("contrat", null);
                                                        setSelectedContrat(null);
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

                                            {/* Identity Autocomplete */}
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
                                                        applyAdherentSelection(newValue?.raw);
                                                        setFieldValue("contrat", null);
                                                        setSelectedContrat(null);
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

                                            {/* Contrat Autocomplete */}
                                            <Grid item xs={4}>
                                                <Autocomplete
                                                    options={filteredContrats}
                                                    getOptionLabel={(option) => option?.contratNo || ""}
                                                    value={values.contrat}
                                                    onChange={(e, newValue) => {
                                                        setFieldValue("contrat", newValue);
                                                        setSelectedContrat(newValue);
                                                        if (newValue) {
                                                            setSelectedAdherentId(newValue.adherent);
                                                        }
                                                        setFieldValue("acheteurPresent", false);
                                                        setFieldValue("acheteur", null);
                                                        setSelectedAcheteur(null);
                                                        setFieldValue("rib", null);
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
                                            </Grid>
                                        </Grid>

                                        {/* Devise Field */}
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

                                        {/* Acheteur present (radio) & Acheteur select (pair) */}
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
                                                        setFieldValue("acheteur", null);
                                                        setSelectedAcheteur(null);
                                                        setFieldValue("rib", null);
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

                                        {/* factorDate & chequeNo (pair) */}
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Date de factor"
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

                                        {/* tireurEmisDate & tireurEmisLieu (pair) */}
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

                                        {/* RIB (autocomplete) & Nom tireur (pair) */}
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

                                        {/* montant & montant en lettres */}
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

                                                    if (values.contrat && inputValue) {
                                                        const amount = parseFloat(inputValue);
                                                        if (!isNaN(amount)) {
                                                            const amountInWords = convertAmountToWords(amount, currencyCode);
                                                            setMontantEnLettres(amountInWords);
                                                        } else {
                                                            setMontantEnLettres("");
                                                        }
                                                    } else {
                                                        setMontantEnLettres("");
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                                error={!!touched.montant && !!errors.montant}
                                                helperText={touched.montant && errors.montant}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Montant en lettres"
                                                fullWidth
                                                value={montantEnLettres}
                                                disabled
                                                multiline
                                                rows={2}
                                            />
                                        </Grid>

                                        {/* Submit - full width centered */}
                                        <Grid item xs={12}>
                                            <Box textAlign="center" mt={2}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="secondary"
                                                    disabled={loadingInCheque}
                                                >
                                                    {loadingInCheque ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        "Créer le chèque"
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

export default CreateInCheque;