import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getFactureById, updateFacture} from "../../redux/facture/FactureSlice.js";
import {useFormik} from "formik";
import {formatDate} from "../../helpers/timeConvert.js";
import * as Yup from "yup";
import {getPMById} from "../../redux/personne/PersonneMoraleSlice.js";
import {
    Alert,
    Autocomplete,
    Box, Button,
    Card,
    CardContent, Checkbox,
    FormControl,
    Grid, InputAdornment,
    InputLabel,
    MenuItem, Paper,
    Select, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField, Typography,
    useTheme
} from "@mui/material";
import {fetchRelationsAsync} from "../../redux/relations/relationsSlice.js";
import {useTypeDoc} from "../../customeHooks/useTypeDoc.jsx";
import {validerFacture} from "../../redux/facture/FactureSlice.js";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import {getPPById} from "../../redux/personne/PersonnePhysiqueSlice.js";

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
    docRemises: Yup.array().of(
        Yup.object().shape({
            acheteurFactorCode: Yup.string().required('Acheteur requis'),
            typeDocRemise: Yup.mixed().required('Type de document requis'),
            docRemiseNo: Yup.string().required('Numéro de document requis'),
            createDate: Yup.date().required('Date du document requise'),
            montantBrut: Yup.number().min(0, 'Montant doit être positif').required('Montant requis'),
            echeanceFirst: Yup.date()
                .min(new Date(), 'La date d\'échéance ne peut pas être dans le passé')
                .required('Date d\'échéance requise'),
            boolLitige: Yup.boolean(),
            devise: Yup.mixed().required('Devise requise')
        })
    ).min(1, 'Au moins un document requis')
});

const ValidateFacture = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme=useTheme();
    const colors = tokens(theme.palette.mode);
    const {currentFacture, loading, error} = useSelector(state => state.facture);
    const {relations} = useSelector(state => state.relations);
    const {currentPM} = useSelector(state => state.personneMorale);
    const {currentPP} = useSelector(state => state.personnePhysique);
    const {typeDoc} = useTypeDoc();
    const [formInitialized, setFormInitialized] = useState(false);
    const [validation1, setValidation1] = useState(false);
    const [validation2, setValidation2] = useState(false);

    useEffect(() => {
        dispatch(getFactureById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentFacture?.contrat?.adherent) {
            if(currentFacture?.contrat?.contratNo.startsWith("PATENTE")) {
                dispatch(getPPById(currentFacture.contrat.adherent));
            }
            if (currentFacture?.contrat?.contratNo.startsWith("RNE")) {
                dispatch(getPMById(currentFacture.contrat.adherent));
            }
            dispatch(fetchRelationsAsync(currentFacture.contrat.adherent));
        }
    }, [currentFacture?.contrat?.adherent, dispatch]);

    useEffect(() => {
        if (currentFacture && !formInitialized && formik) {
            const formattedDocRemises = currentFacture.docRemises?.map(doc => ({
                ...doc,
                createDate: doc.createDate || formatDate(new Date()),
                echeanceFirst: doc.echeanceFirst || formatDate(new Date(Date.now() + 86400000)),
                boolAdmis: !doc.boolLitige,
                boolLitige: doc.boolLitige || false,
                acheteurFactorCode: doc.acheteurFactorCode || "",
                typeDocRemise: doc.typeDocRemise || null,
                docRemiseNo: doc.docRemiseNo || "",
                montantBrut: doc.montantBrut || 0,
                devise: doc.devise || currentFacture.devise || null
            })) || [];

            formik.setValues({
                contrat: currentFacture.contrat || null,
                bordRemiseNo: currentFacture.bordRemiseNo || "0",
                bordRemiseFactorDate1v: formatDate(new Date(currentFacture.bordRemiseFactorDate1v)) || formatDate(new Date()),
                bordRemiseFactorDate2v: formatDate(new Date(currentFacture.bordRemiseFactorDate2v)) || formatDate(new Date()),
                bordRemiseNbrLigne: currentFacture.bordRemiseNbrLigne || 1,
                bordRemiseMontantBrut: currentFacture.bordRemiseMontantBrut || 0,
                bordRemiseMontantLitige: currentFacture.bordRemiseMontantLitige || 0,
                bordRemiseMontantAdmis: currentFacture.bordRemiseMontantAdmis || 0,
                bordRemiseNbrAchet: currentFacture.bordRemiseNbrAchet || 0,
                devise: currentFacture.devise || null,
                docRemises: formattedDocRemises.length > 0 ? formattedDocRemises : [createEmptyDocument(currentFacture.devise)]
            });
            setFormInitialized(true);
        }
    }, [currentFacture, formInitialized]);

    function createEmptyDocument(devise) {
        return {
            acheteurFactorCode: "",
            typeDocRemise: null,
            docRemiseNo: "",
            createDate: formatDate(new Date()),
            montantBrut: 0,
            echeanceFirst: formatDate(new Date(Date.now() + 86400000)),
            boolLitige: false,
            boolAdmis: true,
            devise: devise || null,
            bordRemiseLigneNo: 0
        };
    }

    const formik = useFormik({
        initialValues: {
            contrat: null,
            bordRemiseNo: "0",
            bordRemiseFactorDate1v: formatDate(new Date()),
            bordRemiseFactorDate2v: formatDate(new Date()),
            bordRemiseNbrLigne: 1,
            bordRemiseMontantBrut: 0,
            bordRemiseMontantLitige: 0,
            bordRemiseMontantAdmis: 0,
            bordRemiseNbrAchet: 0,
            devise: null,
            docRemises: [createEmptyDocument(null)],
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (!values.contrat) {
                alert("Veuillez sélectionner un contrat valide");
                return;
            }

            if (!values.devise) {
                formik.setFieldError('devise', 'La devise est requise');
                alert("La devise est requise pour le bordereau");
                return;
            }

            if (values.docRemises.length !== Number(values.bordRemiseNbrLigne)) {
                formik.setFieldError('bordRemiseNbrLigne', 'Nombre de lignes ≠ nombre de documents indiqué');
                return;
            }

            const formData = {
                ...values,
                id: currentFacture.id,
                bordRemiseFactorDate1v: formatDate(values.bordRemiseFactorDate1v),
                bordRemiseFactorDate2v: formatDate(values.bordRemiseFactorDate2v),
                contrat: values.contrat,
                docRemises: values.docRemises.map((doc, index) => ({
                    ...doc,
                    id: doc.id,
                    createDate: formatDate(doc.createDate),
                    echeanceFirst: formatDate(doc.echeanceFirst),
                    bordRemiseLigneNo: index + 1,
                    devise: doc.devise || values.devise,
                    contrat: values.contrat.id,
                    bordRemiseId: currentFacture.id,
                    boolAdmis: !doc.boolLitige
                }))
            };

            const totalMontant = values.docRemises.reduce((sum, doc) => sum + Number(doc.montantBrut || 0), 0);
            const totalLitige = values.docRemises.filter(d => d.boolLitige).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
            const totalAdmis = totalMontant - totalLitige;

            formData.bordRemiseMontantAdmis = totalAdmis;
            formData.bordRemiseMontantLitige = totalLitige;
            formData.bordRemiseMontantBrut = Number(formData.bordRemiseMontantBrut);

            if (Math.abs(totalMontant - Number(formData.bordRemiseMontantBrut)) > 0.001) {
                formik.setFieldError('bordRemiseMontantBrut', 'Montant total ≠ somme des montants des documents');
                return;
            }

            dispatch(validerFacture(formData, navigate));
        }
    });

    const totalMontant = formik.values.docRemises.reduce((sum, doc) => sum + Number(doc.montantBrut || 0), 0);
    const amountsMatch = Math.abs(totalMontant - Number(formik.values.bordRemiseMontantBrut)) <= 0.001;
    const remainingAmount = Number(formik.values.bordRemiseMontantBrut) - totalMontant;
    const totalLitige = formik.values.docRemises.filter(d => d.boolLitige).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
    const totalAdmis = totalMontant - totalLitige;

    const updateDocument = (index, field, value) => {
        const updated = [...formik.values.docRemises];

        if (field === 'boolLitige') {
            updated[index].boolLitige = value;
            updated[index].boolAdmis = !value;
        } else {
            updated[index][field] = value;
        }

        formik.setFieldValue(`docRemises[${index}]`, updated[index]);

        const newLitige = updated.filter(d => d.boolLitige).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
        const newAdmis = totalMontant - newLitige;

        formik.setFieldValue('bordRemiseMontantAdmis', newAdmis);
        formik.setFieldValue('bordRemiseMontantLitige', newLitige);
    };

    const handleNbDocsChange = (e) => {
        let newNbDocs = parseInt(e.target.value, 10) || 0;
        newNbDocs = Math.min(10, Math.max(0, newNbDocs));

        formik.setFieldValue('bordRemiseNbrLigne', newNbDocs);

        if (newNbDocs > formik.values.docRemises.length) {
            const newDocuments = [
                ...formik.values.docRemises,
                ...Array.from({length: newNbDocs - formik.values.docRemises.length},
                    (_, index) => ({
                        ...createEmptyDocument(formik.values.devise),
                        bordRemiseLigneNo: formik.values.docRemises.length + index + 1
                    }))
            ];
            formik.setFieldValue('docRemises', newDocuments);
        } else if (newNbDocs < formik.values.docRemises.length) {
            formik.setFieldValue('docRemises', formik.values.docRemises.slice(0, newNbDocs));
        }
    };

    const handleValidation = () => {
        setValidation1(true);
        formik.setFieldValue('bordRemiseFactorDate2v', formatDate(new Date()));
    };

    const validerParDeuxiemeAgent = () => {
        setValidation2(true);
    };

    if (loading) {
        return <Typography>Chargement...</Typography>;
    }

    if (error) {
        return <Typography color="error">Erreur: {error}</Typography>;
    }

    return (
        <Box p={4} maxWidth="1200px" margin="auto">
                    <Header title={"Bordreaux"} subtitle={"Valider Bordreaux"}/>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <form onSubmit={formik.handleSubmit}>
                {error && (
                    <Box  my={2}>
                        <Alert  severity="error" sx={{fontSize:"14px"}}>
                            {error || "Une erreur s'est produite lors de la création de la personne physique !"}
                        </Alert>
                    </Box>
                )}
                <Card sx={{mb: 3}}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Nom Adhérent"
                                    value={currentPM ?currentPM?.raisonSocial:currentPP?.nom + " "+currentPP?.prenom || ""}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Contrat n°"
                                    disabled
                                    value={formik.values.contrat?.contratNo || ""}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Devise"
                                    disabled
                                    value={formik.values.devise?.dsg || ""}
                                    error={formik.touched.devise && !formik.values.devise}
                                    helperText={formik.touched.devise && !formik.values.devise ? "Devise requise" : ""}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    disabled
                                    label="N° Bordereau"
                                    value={formik.values.bordRemiseNo}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} mt={2}>

                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date Création"
                                    InputLabelProps={{shrink: true}}
                                    name="bordRemiseFactorDate1v"
                                    value={formik.values.bordRemiseFactorDate1v}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseFactorDate1v && Boolean(formik.errors.bordRemiseFactorDate1v)}
                                    helperText={formik.touched.bordRemiseFactorDate1v && formik.errors.bordRemiseFactorDate1v}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date Validation"
                                    InputLabelProps={{shrink: true}}
                                    name="bordRemiseFactorDate2v"
                                    value={formik.values.bordRemiseFactorDate2v}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseFactorDate2v && Boolean(formik.errors.bordRemiseFactorDate2v)}
                                    helperText={formik.touched.bordRemiseFactorDate2v && formik.errors.bordRemiseFactorDate2v}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <TextField
                                    fullWidth
                                    disabled={true}
                                    type="number"
                                    label="Nb Docs"
                                    name="bordRemiseNbrLigne"
                                    value={formik.values.bordRemiseNbrLigne}
                                    onChange={handleNbDocsChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.bordRemiseNbrLigne && Boolean(formik.errors.bordRemiseNbrLigne)}
                                    helperText={formik.touched.bordRemiseNbrLigne && formik.errors.bordRemiseNbrLigne}
                                    inputProps={{
                                        min: 0,
                                        max: 10,
                                        step: 1
                                    }}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Montant Total"
                                    disabled={true}
                                    name="bordRemiseMontantBrut"
                                    value={formik.values.bordRemiseMontantBrut}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    inputProps={{
                                        min: 0,
                                        step: 0.01
                                    }}
                                    error={formik.touched.bordRemiseMontantBrut && Boolean(formik.errors.bordRemiseMontantBrut)}
                                    helperText={formik.touched.bordRemiseMontantBrut && formik.errors.bordRemiseMontantBrut}
                                />
                            </Grid>
                            <Grid item xs={1.7}>
                                <TextField
                                    fullWidth
                                    label="Reste à ajouter"
                                    value={remainingAmount.toFixed(2)}
                                    disabled
                                    InputProps={{
                                        readOnly: true,
                                        style: {
                                            color: remainingAmount > 0 ? 'red' : 'green',
                                            fontWeight: 'bold'
                                        }
                                    }}
                                    helperText={remainingAmount !== 0 ?
                                        "Montant manquant" :
                                        "Montant  atteint"
                                    }
                                    FormHelperTextProps={{
                                        style: {
                                            color: remainingAmount!== 0 ? colors.redAccent[400] : colors.greenAccent[500],
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',

                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField
                                    fullWidth
                                    label="Montant admis"
                                    value={totalAdmis.toFixed(2)}
                                    disabled
                                    InputProps={{readOnly: true}}
                                />
                            </Grid>
                            <Grid item xs={1.5}>
                                <TextField
                                    fullWidth
                                    label="Montant litiges"
                                    value={totalLitige.toFixed(2)}
                                    disabled
                                    InputProps={{readOnly: true}}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>


                <Typography
                variant="h4" // Smaller font size for both title and subtitle
                color={colors.grey[100]} // Single color for both
                fontWeight="bold"
                sx={{ marginBottom: "5px" }}
            >
                   Valider Facture
            </Typography>

                <TableContainer component={Paper} sx={{mb: 2}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{minWidth: "80px"}}>Ligne</TableCell>
                                <TableCell>Acheteur</TableCell>
                                <TableCell>Type Document</TableCell>
                                <TableCell>N° Document</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Montant</TableCell>
                                <TableCell>Échéance</TableCell>
                                <TableCell>Litige</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formik.values.docRemises.map((doc, index) => {
                                function calculateDays() {
                                    try {
                                        const startDate = new Date(formik.values.bordRemiseFactorDate1v);
                                        const endDate = new Date(doc.echeanceFirst);
                                        const diffTime = endDate - startDate;
                                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    } catch {
                                        return '';
                                    }
                                }
                                return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField value={index + 1} disabled size="medium"/>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth>
                                            <Select
                                                disabled={true}
                                                value={doc.acheteurFactorCode}
                                                onChange={(e) => updateDocument(index, "acheteurFactorCode", e.target.value)}
                                                sx={{width: '250px'}}
                                                error={formik.touched.docRemises?.[index]?.acheteurFactorCode && Boolean(formik.errors.docRemises?.[index]?.acheteurFactorCode)}
                                            >
                                                {relations?.map((relation, relIndex) => {
                                                    const acheteur = relation.acheteurPhysique || relation.acheteurMorale;
                                                    if (!acheteur) return null;

                                                    let label = '';
                                                    if (relation.acheteurPhysique) {
                                                        label = `${acheteur.nom} ${acheteur.prenom} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
                                                    } else if (relation.acheteurMorale) {
                                                        label = `${acheteur.raisonSocial} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
                                                    }

                                                    return (
                                                        <MenuItem key={relIndex} value={acheteur.factorAchetCode}>
                                                            {label}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                            {formik.touched.docRemises?.[index]?.acheteurFactorCode && formik.errors.docRemises?.[index]?.acheteurFactorCode && (
                                                <Typography color="error" variant="caption">
                                                    {formik.errors.docRemises[index].acheteurFactorCode}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth>
                                            <Select
                                                value={doc.typeDocRemise?.id || ""}
                                                onChange={(e) => {
                                                    const selectedType = typeDoc.find(t => t.id === e.target.value) || null;
                                                    updateDocument(index, "typeDocRemise", selectedType);
                                                }}
                                                sx={{width: '250px'}}
                                                error={formik.touched.docRemises?.[index]?.typeDocRemise && Boolean(formik.errors.docRemises?.[index]?.typeDocRemise)}
                                            >
                                                {typeDoc?.map(t => (
                                                    <MenuItem key={t.id} value={t.id}>{t.dsg}</MenuItem>
                                                ))}
                                            </Select>
                                            {formik.touched.docRemises?.[index]?.typeDocRemise && formik.errors.docRemises?.[index]?.typeDocRemise && (
                                                <Typography color="error" variant="caption">
                                                    {formik.errors.docRemises[index].typeDocRemise}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            value={doc.docRemiseNo}
                                            onChange={(e) => updateDocument(index, "docRemiseNo", e.target.value)}
                                            sx={{width: '120px'}}
                                            error={formik.touched.docRemises?.[index]?.docRemiseNo && Boolean(formik.errors.docRemises?.[index]?.docRemiseNo)}
                                            helperText={formik.touched.docRemises?.[index]?.docRemiseNo && formik.errors.docRemises?.[index]?.docRemiseNo}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            value={doc.createDate}
                                            onChange={(e) => updateDocument(index, "createDate", e.target.value)}
                                            sx={{width: '150px'}}
                                            InputLabelProps={{shrink: true}}
                                            error={formik.touched.docRemises?.[index]?.createDate && Boolean(formik.errors.docRemises?.[index]?.createDate)}
                                            helperText={formik.touched.docRemises?.[index]?.createDate && formik.errors.docRemises?.[index]?.createDate}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={doc.montantBrut}
                                            onChange={(e) => updateDocument(index, "montantBrut", e.target.value)}
                                            sx={{width: '120px'}}
                                            inputProps={{
                                                min: 0,
                                                step: 0.01
                                            }}
                                            error={formik.touched.docRemises?.[index]?.montantBrut && Boolean(formik.errors.docRemises?.[index]?.montantBrut)}
                                            helperText={formik.touched.docRemises?.[index]?.montantBrut && formik.errors.docRemises?.[index]?.montantBrut}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            freeSolo
                                            options={[90, 120, 180]}
                                            value={calculateDays()}
                                            onChange={(event, newValue) => {
                                                const days = parseInt(newValue, 10);
                                                if (!isNaN(days)) {
                                                    const startDate = new Date(formik.values.bordRemiseFactorDate1v);
                                                    const newDate = new Date(startDate);
                                                    newDate.setDate(startDate.getDate() + days);
                                                    updateDocument(index, "echeanceFirst", formatDate(newDate));
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Jours jusqu'à échéance"
                                                    error={formik.touched.docRemises?.[index]?.echeanceFirst && Boolean(formik.errors.docRemises?.[index]?.echeanceFirst)}
                                                    helperText={formik.touched.docRemises?.[index]?.echeanceFirst && formik.errors.docRemises?.[index]?.echeanceFirst}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {params.InputProps.endAdornment}
                                                                <InputAdornment position="end">jours</InputAdornment>
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={doc.boolLitige}
                                            onChange={(e) => updateDocument(index, "boolLitige", e.target.checked)}
                                        />
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box textAlign="center" mt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ px:2,py:1.5, backgroundColor: colors.greenAccent[600], color: "#ffffff" }}
                        disabled={!formik.values.contrat || !formik.values.devise || !amountsMatch}
                        onClick={validation1 ? undefined : handleValidation}
                    >
                        ✅ VALIDER
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default ValidateFacture;