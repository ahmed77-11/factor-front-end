import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {getFactureById, updateFacture} from "../../../redux/facture/FactureSlice.js";
import {useFormik} from "formik";
import {formatDate} from "../../../helpers/timeConvert.js";
import * as Yup from "yup";
import {getPMById} from "../../../redux/personne/PersonneMoraleSlice.js";
import {
    Box, Button,
    Card,
    CardContent, Checkbox,
    FormControl,
    Grid,
    InputLabel,
    MenuItem, Paper,
    Select, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField, Typography
} from "@mui/material";
import {fetchRelationsAsync} from "../../../redux/relations/relationsSlice.js";
import {useTypeDoc} from "../../../customeHooks/useTypeDoc.jsx";

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
            createDate: Yup.date().required('Date du document requise').max(new Date(), 'La date de creation ne peut pas être dans le futur'),
            montantBrut: Yup.number().min(0, 'Montant doit être positif').required('Montant requis'),
            echeanceFirst: Yup.date()
                .min(new Date(), 'La date d\'échéance ne peut pas être dans le passé')
                .required('Date d\'échéance requise'),
            boolAdmis: Yup.boolean(),
            boolLitige: Yup.boolean(),
            devise: Yup.mixed().required('Devise requise')
        })
    ).min(1, 'Au moins un document requis')
});

const EditFacture = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {currentFacture, loading, error} = useSelector(state => state.facture);
    const {relations} = useSelector(state => state.relations);
    const {currentPM} = useSelector(state => state.personneMorale);
    const {typeDoc} = useTypeDoc();
    const [formInitialized, setFormInitialized] = useState(false);
    const [validation1, setValidation1] = useState(false);
    const [validation2, setValidation2] = useState(false);

    useEffect(() => {
        // Fetch the facture data using the id
        dispatch(getFactureById(id));
    }, [dispatch, id]);

    // Fetch related data when the facture is loaded
    useEffect(() => {
        if (currentFacture?.contrat?.adherent) {
            dispatch(getPMById(currentFacture.contrat.adherent));
            dispatch(fetchRelationsAsync(currentFacture.contrat.adherent));
        }
    }, [currentFacture?.contrat?.adherent, dispatch]);

    // Initialize form with data when it's available
    useEffect(() => {
        if (currentFacture && !formInitialized && formik) {
            // Prepare docRemises with correct format
            const formattedDocRemises = currentFacture.docRemises?.map(doc => ({
                ...doc,
                // Format dates if they exist
                createDate: doc.createDate || formatDate(new Date()),
                echeanceFirst: doc.echeanceFirst || formatDate(new Date(Date.now() + 86400000)),
                // Ensure booleans are correct
                boolAdmis: doc.boolAdmis === true,
                boolLitige: doc.boolLitige === true,
                // Use correct references
                acheteurFactorCode: doc.acheteurFactorCode || "",
                typeDocRemise: doc.typeDocRemise || null,
                docRemiseNo: doc.docRemiseNo || "",
                montantBrut: doc.montantBrut || 0,
                devise: doc.devise || currentFacture.devise || null
            })) || [];

            // Set all form values
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
            boolAdmis: false,
            boolLitige: false,
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

            // Check if devise is set
            if (!values.devise) {
                formik.setFieldError('devise', 'La devise est requise');
                alert("La devise est requise pour le bordereau");
                return;
            }

            // Verify number of documents
            if (values.docRemises.length !== Number(values.bordRemiseNbrLigne)) {
                formik.setFieldError('bordRemiseNbrLigne', 'Nombre de lignes ≠ nombre de documents indiqué');
                return;
            }

            // Format dates for submission
            const formData = {
                ...values,
                id: currentFacture.id, // Make sure to include the id for update
                bordRemiseFactorDate1v: formatDate(values.bordRemiseFactorDate1v),
                bordRemiseFactorDate2v: formatDate(values.bordRemiseFactorDate2v),
                contrat: values.contrat,
                docRemises: values.docRemises.map((doc, index) => ({
                    ...doc,
                    id: doc.id, // Keep the original id if it exists
                    createDate: formatDate(doc.createDate),
                    echeanceFirst: formatDate(doc.echeanceFirst),
                    bordRemiseLigneNo: index + 1,
                    devise: doc.devise || values.devise,
                    contrat: values.contrat.id, // just send the id, not the whole object
                    bordRemiseId: currentFacture.id // Link to the parent
                }))
            };

            // Calculate total amounts
            const totalMontant = values.docRemises.reduce((sum, doc) => sum + Number(doc.montantBrut || 0), 0);
            const totalAdmis = values.docRemises.filter(d => d.boolAdmis).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
            const totalLitige = values.docRemises.filter(d => d.boolLitige).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);

            // Update the values for submission
            formData.bordRemiseMontantAdmis = totalAdmis;
            formData.bordRemiseMontantLitige = totalLitige;
            formData.bordRemiseMontantBrut = Number(formData.bordRemiseMontantBrut);

            // Check total amounts
            if (Math.abs(totalMontant - Number(formData.bordRemiseMontantBrut)) > 0.001) {
                formik.setFieldError('bordRemiseMontantBrut', 'Montant total ≠ somme des montants des documents');
                return;
            }

            console.log("Form submitted with values:", formData);
            dispatch(updateFacture(formData, navigate));
        }
    });

    // Calculate totals and remaining amount
    const totalMontant = formik.values.docRemises.reduce((sum, doc) => sum + Number(doc.montantBrut || 0), 0);
    const amountsMatch = Math.abs(totalMontant - Number(formik.values.bordRemiseMontantBrut)) <= 0.001;
    const remainingAmount = Number(formik.values.bordRemiseMontantBrut) - totalMontant;
    const totalAdmis = formik.values.docRemises.filter(d => d.boolAdmis).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);
    const totalLitige = formik.values.docRemises.filter(d => d.boolLitige).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);

    const updateDocument = (index, field, value) => {
        const updated = [...formik.values.docRemises];
        updated[index][field] = value;

        if (field === 'typeDocRemise') {
            formik.setFieldValue(`docRemises[${index}].typeDocRemise`, value);
        } else {
            formik.setFieldValue(`docRemises[${index}].${field}`, value);
        }

        if (field === 'boolAdmis' && value) {
            formik.setFieldValue(`docRemises[${index}].boolLitige`, false);
        } else if (field === 'boolLitige' && value) {
            formik.setFieldValue(`docRemises[${index}].boolAdmis`, false);
        }

        if (formik.values.devise) {
            formik.setFieldValue(`docRemises[${index}].devise`, formik.values.devise);
        }

        const newAdmis = formik.values.docRemises.filter((d, i) => {
            if (i === index && field === 'boolAdmis') return value;
            return d.boolAdmis;
        }).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);

        const newLitige = formik.values.docRemises.filter((d, i) => {
            if (i === index && field === 'boolLitige') return value;
            return d.boolLitige;
        }).reduce((sum, d) => sum + Number(d.montantBrut || 0), 0);

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
            <form onSubmit={formik.handleSubmit}>
                <Card sx={{mb: 3}}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Nom Adhérent"
                                    value={currentPM?.raisonSocial || ""}
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
                                    disabled={true}
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
                            <Grid item xs={1.5}>
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
                                    helperText={remainingAmount > 0 ?
                                        "Montant manquant" :
                                        "OK"}
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
                                <TableCell>Admis</TableCell>
                                <TableCell>Litige</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formik.values.docRemises.map((doc, index) => (
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
                                                        <MenuItem key={relIndex} value={acheteur.id}>
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
                                        <TextField
                                            fullWidth
                                            type="date"
                                            value={doc.echeanceFirst}
                                            onChange={(e) => updateDocument(index, "echeanceFirst", e.target.value)}
                                            sx={{width: '150px'}}
                                            InputLabelProps={{shrink: true}}
                                            error={formik.touched.docRemises?.[index]?.echeanceFirst && Boolean(formik.errors.docRemises?.[index]?.echeanceFirst)}
                                            helperText={formik.touched.docRemises?.[index]?.echeanceFirst && formik.errors.docRemises?.[index]?.echeanceFirst}
                                            inputProps={{min: formatDate(new Date())}}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={doc.boolAdmis}
                                            onChange={(e) => updateDocument(index, "boolAdmis", e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={doc.boolLitige}
                                            onChange={(e) => updateDocument(index, "boolLitige", e.target.checked)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box textAlign="center" mt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
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

export default EditFacture;