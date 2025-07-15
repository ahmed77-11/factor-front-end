import { useEffect, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    MenuItem,
    Select,
    FormControl,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Autocomplete,
    TableContainer,
    InputAdornment,
    useTheme,
    Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdherentsAsync, fetchRelationsAsync } from "../../../redux/relations/relationsSlice.js";
import { fetchContratsByAdherentAsync } from "../../../redux/contrat/ContratSlice.js";
import { addFacture, getNbFac } from "../../../redux/facture/FactureSlice.js";
import { useTypeDoc } from "../../../customeHooks/useTypeDoc.jsx";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../helpers/timeConvert.js";
import Header from "../../../components/Header.jsx";
import { tokens } from "../../../theme.js";

// Validation schema
const validationSchema = Yup.object().shape({
    bordRemiseNo: Yup.string().required('Numéro de bordereau requis'),
    bordRemiseFactorDate1v: Yup.date().required('Date du bordereau requise'),
    bordRemiseFactorDate2v: Yup.date().required('Date de validation requise'),
    bordRemiseNbrLigne: Yup.number()
        .min(0, 'Doit être entre 0 et 10')
        .max(10, 'Doit être entre 0 et 10')
        .required('Nombre de documents requis'),
    bordRemiseMontantBrut: Yup.number().min(0, 'Montant doit être positif').required('Montant total requis'),
    devise: Yup.mixed().required('Devise requise'),
    contrat: Yup.mixed().required('Contrat requis'),
    docRemises: Yup.array().of(
        Yup.object().shape({
            acheteurFactorCode: Yup.string().required('Acheteur requis'),
            typeDocRemise: Yup.mixed().required('Type de document requis'),
            docRemiseNo: Yup.string().required('Numéro de document requis'),
            createDate: Yup.date()
                .required('Date du document requise')
                .max(new Date(), 'La date de creation ne peut pas être dans le futur'),
            montantBrut: Yup.number().min(0, 'Montant doit être positif').required('Montant requis'),
            echeanceFirst: Yup.date()
                .min(new Date(), 'La date d\'échéance ne peut pas être dans le passé')
                .required('Date d\'échéance requise'),
            devise: Yup.mixed().required('Devise requise')
        })
    ).min(1, 'Au moins un document requis')
});

const SaisieBordereau = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typeDoc } = useTypeDoc();
    const { adherents, relations } = useSelector(state => state.relations);
    const { contrats } = useSelector(state => state.contrat);
    const { nbFac, loading, error } = useSelector(state => state.facture);
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [acheteurOptions, setAcheteurOptions] = useState([]);
    const [validation1, setValidation1] = useState(false);

    // Prepare acheteur options from relations
    useEffect(() => {
        if (!relations) return;
        const options = relations
            .map(rel => {
                const acheteur = rel.acheteurPhysique || rel.acheteurMorale;
                if (!acheteur) return null;
                const label = rel.acheteurPhysique
                    ? `${acheteur.nom} ${acheteur.prenom} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`
                    : `${acheteur.raisonSocial} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
                return { id: acheteur.id, label, acheteur };
            })
            .filter(Boolean);
        setAcheteurOptions(options);
    }, [relations]);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            bordRemiseNo: nbFac || 0,
            bordRemiseFactorDate1v: formatDate(new Date()),
            bordRemiseFactorDate2v: formatDate(new Date()),
            bordRemiseNbrLigne: 1,
            bordRemiseMontantBrut: 0,
            bordRemiseNbrAchet: relations?.length || 0,
            devise: null,
            contrat: null,
            docRemises: [createEmptyDocument(null)]
        },
        validationSchema,
        onSubmit: values => {
            const totalMontant = values.docRemises.reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
            if (Math.abs(totalMontant - Number(values.bordRemiseMontantBrut)) > 0.001) return;
            const formData = {
                ...values,
                bordRemiseFactorDate1v: formatDate(values.bordRemiseFactorDate1v),
                bordRemiseFactorDate2v: formatDate(values.bordRemiseFactorDate2v),
                docRemises: values.docRemises.map((doc, idx) => ({
                    ...doc,
                    bordRemiseLigneNo: idx + 1,
                    createDate: formatDate(doc.createDate),
                    echeanceFirst: formatDate(doc.echeanceFirst),
                    contrat: values.contrat,
                    devise: doc.devise || values.devise
                }))
            };
            console.log(formData)
            dispatch(addFacture(formData, navigate));
        }
    });

    // Load adherents & next facture number
    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(getNbFac());
    }, [dispatch]);

    // When nbFac updates
    useEffect(() => {
        if (nbFac) formik.setFieldValue('bordRemiseNo', nbFac);
    }, [nbFac]);

    // When contrats list changes: auto‑select if one
    useEffect(() => {
        if (!contrats) return;
        if (contrats.length === 1) {
            const c = contrats[0];
            formik.setFieldValue('contrat', c);
            formik.setFieldValue('devise', c.devise);
        } else {
            formik.setFieldValue('contrat', null);
            formik.setFieldValue('devise', null);
        }
    }, [contrats]);

    const handleAdherentChange = (_, newVal) => {
        setSelectedAdherent(newVal);
        if (newVal?.id) {
            dispatch(fetchContratsByAdherentAsync(newVal.id));
            dispatch(fetchRelationsAsync(newVal.id));
        } else {
            formik.resetForm();
        }
    };

    const handleAcheteurChange = (idx, newVal) => {
        formik.setFieldValue(`docRemises[${idx}].acheteurFactorCode`, newVal?.id || '');
    };

    function createEmptyDocument(dev) {
        return {
            acheteurFactorCode: "",
            typeDocRemise: null,
            docRemiseNo: "",
            createDate: formatDate(new Date()),
            montantBrut: 0,
            echeanceFirst: formatDate(new Date(Date.now() + 86400000)),
            devise: dev,
            bordRemiseLigneNo: 0
        };
    }

    const addedAmount = formik.values.docRemises.reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
    const targetAmount = Number(formik.values.bordRemiseMontantBrut);
    const isComplete = Math.abs(addedAmount - targetAmount) <= 0.001;

    const updateDocument = (idx, field, val) => {
        formik.setFieldValue(`docRemises[${idx}].${field}`, val);
        if (formik.values.devise) {
            formik.setFieldValue(`docRemises[${idx}].devise`, formik.values.devise);
        }
    };

    const handleNbDocsChange = e => {
        let n = parseInt(e.target.value, 10) || 0;
        n = Math.max(0, Math.min(10, n));
        formik.setFieldValue('bordRemiseNbrLigne', n);
        const docs = formik.values.docRemises;
        if (n > docs.length) {
            const add = Array.from({ length: n - docs.length }, () => createEmptyDocument(formik.values.devise));
            formik.setFieldValue('docRemises', [...docs, ...add]);
        } else {
            formik.setFieldValue('docRemises', docs.slice(0, n));
        }
    };

    const handleValidation = () => {
        setValidation1(true);
        formik.setFieldValue('bordRemiseFactorDate2v', formatDate(new Date()));
    };

    return (
        <Box p={4} maxWidth="1200px" margin="auto">
            <Header title="Bordereaux" subtitle="Ajouter Bordereau" />
            {loading && <div className="loader-overlay"><div className="loader" /></div>}
            <form onSubmit={formik.handleSubmit}>
                {error && (
                    <Box my={2}>
                        <Alert severity="error" sx={{ fontSize: '14px' }}>{error}</Alert>
                    </Box>
                )}

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Autocomplete
                                    options={adherents}
                                    getOptionLabel={opt => opt.raisonSocial? opt.raisonSocial : `${opt.nom} ${opt.prenom}`}
                                    value={selectedAdherent}
                                    onChange={handleAdherentChange}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label="Choisir un adhérent"
                                            error={!selectedAdherent && formik.submitCount > 0}
                                            helperText={!selectedAdherent && formik.submitCount > 0 ? 'Adhérent requis' : ''}
                                        />
                                    )}
                                    isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth label="Nom Adhérent"

                                           value={selectedAdherent?.raisonSocial ? selectedAdherent?.raisonSocial :selectedAdherent?.nom? `${selectedAdherent?.nom} ${selectedAdherent?.prenom}`: ''}
                                           disabled />
                            </Grid>

                            {Array.isArray(contrats) && contrats.length > 1 && (
                                <Grid item xs={3}>
                                    <FormControl fullWidth>
                                        <Select
                                            displayEmpty
                                            value={formik.values.contrat?.id || ''}
                                            onChange={e => {
                                                const sel = contrats.find(c => c.id === e.target.value);
                                                formik.setFieldValue('contrat', sel);
                                                formik.setFieldValue('devise', sel.devise);
                                                // propagate to documents
                                                formik.setFieldValue(
                                                    'docRemises',
                                                    formik.values.docRemises.map(d => ({ ...d, devise: sel.devise }))
                                                );
                                            }}
                                        >
                                            <MenuItem value="" disabled>Choisir un contrat</MenuItem>
                                            {contrats.map(c => (
                                                <MenuItem key={c.id} value={c.id}>{c.contratNo}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="N° Contrat"
                                    value={formik.values.contrat?.contratNo || ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Devise"
                                    value={formik.values.devise?.dsg || ''}
                                    disabled
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    disabled
                                    label="N° Bordereau"
                                    value={formik.values.bordRemiseNo}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date Création"
                                    InputLabelProps={{ shrink: true }}
                                    name="bordRemiseFactorDate1v"
                                    value={formik.values.bordRemiseFactorDate1v}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseFactorDate1v && Boolean(formik.errors.bordRemiseFactorDate1v)}
                                    helperText={formik.touched.bordRemiseFactorDate1v && formik.errors.bordRemiseFactorDate1v}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date Validation"
                                    InputLabelProps={{ shrink: true }}
                                    name="bordRemiseFactorDate2v"
                                    value={formik.values.bordRemiseFactorDate2v}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseFactorDate2v && Boolean(formik.errors.bordRemiseFactorDate2v)}
                                    helperText={formik.touched.bordRemiseFactorDate2v && formik.errors.bordRemiseFactorDate2v}
                                    disabled={validation1}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Nb Docs"
                                    name="bordRemiseNbrLigne"
                                    value={formik.values.bordRemiseNbrLigne}
                                    onChange={handleNbDocsChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseNbrLigne && Boolean(formik.errors.bordRemiseNbrLigne)}
                                    helperText={formik.touched.bordRemiseNbrLigne && formik.errors.bordRemiseNbrLigne}
                                    inputProps={{ min: 0, max: 10, step: 1 }}
                                    onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Montant Total"
                                    name="bordRemiseMontantBrut"
                                    value={formik.values.bordRemiseMontantBrut}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    error={formik.touched.bordRemiseMontantBrut && Boolean(formik.errors.bordRemiseMontantBrut)}
                                    helperText={formik.touched.bordRemiseMontantBrut && formik.errors.bordRemiseMontantBrut}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    label="Montant ajouté"
                                    value={addedAmount.toFixed(2)}
                                    disabled
                                    InputProps={{ readOnly: true, style: { color: isComplete ? 'green' : 'red', fontWeight: 'bold' } }}
                                    helperText={isComplete ? "Montant total atteint" : `Encore ${(targetAmount - addedAmount).toFixed(2)} à ajouter`}
                                    FormHelperTextProps={{ style: { color: isComplete ? colors.greenAccent[400] : colors.redAccent[500], fontWeight: 'bold', fontSize: '0.9rem' } }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" sx={{ mb: 1 }}>
                    Ajouter Facture
                </Typography>

                <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                        <TableHead><TableRow>
                            <TableCell>Ligne</TableCell>
                            <TableCell>Acheteur</TableCell>
                            <TableCell>Type Document</TableCell>
                            <TableCell>N° Document</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Montant</TableCell>
                            <TableCell>Échéance</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                            {formik.values.docRemises.map((doc, idx) => {
                                const calcDays = () => {
                                    const sd = new Date(formik.values.bordRemiseFactorDate1v);
                                    const ed = new Date(doc.echeanceFirst);
                                    return Math.ceil((ed - sd) / (1000 * 60 * 60 * 24));
                                };
                                return (
                                    <TableRow key={idx}>
                                        <TableCell><TextField value={idx + 1} disabled /></TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                options={acheteurOptions}
                                                getOptionLabel={o => o.label}
                                                value={acheteurOptions.find(o => o.id === doc.acheteurFactorCode) || null}
                                                onChange={(_, v) => handleAcheteurChange(idx, v)}
                                                renderInput={params => <TextField {...params} error={Boolean(formik.errors.docRemises?.[idx]?.acheteurFactorCode)} helperText={formik.errors.docRemises?.[idx]?.acheteurFactorCode} />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={doc.typeDocRemise || ''}
                                                    onChange={e => updateDocument(idx, 'typeDocRemise', e.target.value)}
                                                    error={Boolean(formik.errors.docRemises?.[idx]?.typeDocRemise)}
                                                >
                                                    {typeDoc.map(t => <MenuItem key={t.id} value={t}>{t.dsg}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <TextField value={doc.docRemiseNo} onChange={e => updateDocument(idx, 'docRemiseNo', e.target.value)} error={Boolean(formik.errors.docRemises?.[idx]?.docRemiseNo)} helperText={formik.errors.docRemises?.[idx]?.docRemiseNo} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField type="date" value={doc.createDate} onChange={e => updateDocument(idx, 'createDate', e.target.value)} error={Boolean(formik.errors.docRemises?.[idx]?.createDate)} helperText={formik.errors.docRemises?.[idx]?.createDate} InputLabelProps={{ shrink: true }} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField type="number" value={doc.montantBrut} onChange={e => updateDocument(idx, 'montantBrut', e.target.value)} error={Boolean(formik.errors.docRemises?.[idx]?.montantBrut)} helperText={formik.errors.docRemises?.[idx]?.montantBrut} InputProps={{ inputProps: { min: 0, step: 0.01 } }} />
                                        </TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                freeSolo
                                                options={[90, 120, 180]}
                                                value={calcDays()}
                                                onChange={(_, v) => {
                                                    const days = parseInt(v, 10);
                                                    if (!isNaN(days)) {
                                                        const base = new Date(formik.values.bordRemiseFactorDate1v);
                                                        base.setDate(base.getDate() + days);
                                                        updateDocument(idx, 'echeanceFirst', formatDate(base));
                                                    }
                                                }}
                                                renderInput={params => <TextField {...params} label="Jours échéance" InputAdornmentProps={{ position: 'end' }} helperText={formik.errors.docRemises?.[idx]?.echeanceFirst} error={Boolean(formik.errors.docRemises?.[idx]?.echeanceFirst)} />}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box textAlign="center" mt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ px: 2, py: 1.5, backgroundColor: colors.greenAccent[600] }}
                        disabled={!formik.values.contrat || !formik.values.devise || !isComplete}
                        onClick={!validation1 ? handleValidation : undefined}
                    >
                        Ajouter
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default SaisieBordereau;
