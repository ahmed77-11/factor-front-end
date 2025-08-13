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
    Select,
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
import {fetchRelationsAsync, fetchRelationsFournAsync} from "../../redux/relations/relationsSlice.js";
import {useNavigate} from "react-router-dom";
import {addRib} from "../../redux/rib/ribSlice.js";

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
    contrat: null,
    role: "",
    adherentName: "",
    achetType: "",
    achetPmId: null,
    achetPpId: null,
    fournType: "",
    fournPmId: null,
    fournPpId: null,
    banqueCode: "",
    ribSuffix: "",
};

// Validation schema
const validationSchema = yup.object().shape({
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
    const navigate=useNavigate();

    const [selectedAdherentId, setSelectedAdherentId] = useState(null);
    const [selectedContratNo, setSelectedContratNo] = useState(null);
    const [roleValue, setRoleValue] = useState("");

    const { banques } = useBanque();
    const { contrats } = useSelector((state) => state.contrat);
    const { currentPM } = useSelector((state) => state.personneMorale);
    const { currentPP } = useSelector((state) => state.personnePhysique);
    const { relations,relationsFourns } = useSelector((state) => state.relations);
    const {loadingRib, errorRib} = useSelector((state) => state.rib);
    // Load contrats
    useEffect(() => {
        dispatch(fetchContratsSigner());
    }, [dispatch]);

    // Fetch relations only for acheteur role
    useEffect(() => {
        if (selectedAdherentId && roleValue === "acheteur") {
            dispatch(fetchRelationsAsync(selectedAdherentId));
        }
        if(selectedAdherentId && roleValue === "fournisseur") {
            dispatch(fetchRelationsFournAsync(selectedAdherentId));
        }
    }, [selectedAdherentId, roleValue, dispatch]);

    // Filter helpers
    const acheteurPmOptions = relations.filter(
        (r) => r.acheteurMorale !== null
    );
    const acheteurPpOptions = relations.filter(
        (r) => r.acheteurPhysique !== null
    );

    const fournisseurPmOptions = relationsFourns.filter(
        (r) => r.fournisseurMorale !== null
    );
    const fournisseurPpOptions = relationsFourns.filter(
        (r) => r.fournisseurPhysique !== null
    );
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
                            console.log(values.fournPmId)
                            const payload= {
                                ...values,
                                rib: fullRib,
                                achetPmId:values.achetPmId ? values.achetPmId?.acheteurMorale?.id : null,
                                achetPpId: values.achetPpId ? values.achetPpId?.acheteurPhysique?.id : null,
                                fournPmId: values.fournPmId ? values.fournPmId?.fournisseurMorale?.id : null,
                                fournPpId: values.fournPpId ? values.fournPpId?.fournisseurPhysique?.id : null,
                            }
                            console.log(payload)
                            dispatch(addRib(payload,navigate));
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
                            // Update adherent name
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            useEffect(() => {
                                if (selectedContratNo?.startsWith("RNE") && currentPM) {
                                    setFieldValue("adherentName", currentPM.raisonSocial || "");
                                }
                                if (selectedContratNo?.startsWith("PATENTE") && currentPP) {
                                    setFieldValue(
                                        "adherentName",
                                        (currentPP.nom || "") + " " + (currentPP.prenom || "")
                                    );
                                }
                            }, [currentPM, currentPP, selectedContratNo, setFieldValue]);

                            // Properly handle ribSuffix input
                            const handleRibSuffixChange = (e) => {
                                // Only allow numeric input and limit to 18 digits
                                const value = e.target.value.replace(/\D/g, "").slice(0, 18);
                                setFieldValue("ribSuffix", value);
                            };

                            return (
                                <form onSubmit={handleSubmit}>
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        {/* Contrat */}
                                        <FormControl
                                            fullWidth
                                            error={!!touched.contrat && !!errors.contrat}
                                        >
                                            <InputLabel id="contrat-label">Contrat</InputLabel>
                                            <Select
                                                labelId="contrat-label"
                                                name="contrat"
                                                value={values.contrat || ""}
                                                onChange={(e) => {
                                                    const contrat = e.target.value;
                                                    setFieldValue("contrat", contrat);

                                                    if (contrat) {
                                                        setSelectedAdherentId(contrat.adherent);
                                                        setSelectedContratNo(contrat.contratNo);
                                                        if (contrat.contratNo.startsWith("RNE")) {
                                                            dispatch(getPMById(contrat.adherent));
                                                        }
                                                        if (contrat.contratNo.startsWith("PATENTE")) {
                                                            dispatch(getPPById(contrat.adherent));
                                                        }
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Aucun</em>
                                                </MenuItem>
                                                {contrats.map((c) => (
                                                    <MenuItem key={c.id} value={c}>
                                                        {c.contratNo}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>
                                                {touched.contrat && errors.contrat}
                                            </FormHelperText>
                                        </FormControl>

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

                                        {/* Adhérent */}
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
                                                    <Autocomplete
                                                        options={acheteurPmOptions}
                                                        getOptionLabel={(o) => o.acheteurMorale.raisonSocial || ""}
                                                        value={values.achetPmId}
                                                        onChange={(e, v) => setFieldValue("achetPmId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Acheteur morale"
                                                                error={!!touched.achetPmId && !!errors.achetPmId}
                                                                helperText={touched.achetPmId && errors.achetPmId}
                                                            />
                                                        )}
                                                    />
                                                )}
                                                {values.achetType === "pp" && (
                                                    <Autocomplete
                                                        options={acheteurPpOptions}
                                                        getOptionLabel={(o) =>
                                                            o.acheteurPhysique.nom + " " + o.acheteurPhysique.prenom || ""
                                                        }
                                                        value={values.achetPpId}
                                                        onChange={(e, v) => setFieldValue("achetPpId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Acheteur physique"
                                                                error={!!touched.achetPpId && !!errors.achetPpId}
                                                                helperText={touched.achetPpId && errors.achetPpId}
                                                            />
                                                        )}
                                                    />
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
                                                    <Autocomplete
                                                        options={fournisseurPmOptions || []} // Add your fournisseur options here
                                                        getOptionLabel={(o) => o.fournisseurMorale.raisonSocial || ""}
                                                        value={values.fournPmId}
                                                        onChange={(e, v) => setFieldValue("fournPmId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Fournisseur morale"
                                                                error={!!touched.fournPmId && !!errors.fournPmId}
                                                                helperText={touched.fournPmId && errors.fournPmId}
                                                            />
                                                        )}
                                                    />
                                                )}
                                                {values.fournType === "pp" && (
                                                    <Autocomplete
                                                        options={fournisseurPpOptions || []} // Add your fournisseur options here
                                                        getOptionLabel={(o) => o.fournisseurPhysique.nom + " " + o.fournisseurPhysique.prenom || ""}
                                                        value={values.fournPpId}
                                                        onChange={(e, v) => setFieldValue("fournPpId", v)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Fournisseur physique"
                                                                error={!!touched.fournPpId && !!errors.fournPpId}
                                                                helperText={touched.fournPpId && errors.fournPpId}
                                                            />
                                                        )}
                                                    />
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
                                                onChange={handleRibSuffixChange}  // Use the custom handler
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