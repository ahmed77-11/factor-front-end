import { useEffect, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField, Button, Card, CardContent, Typography,
    Grid, MenuItem, Select, FormControl,
    Box, Table, TableBody, TableCell, TableHead,
    TableRow, Paper, Autocomplete, TableContainer, InputAdornment,
    useTheme, Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdherentsAsync, fetchRelationsAsync } from "../../../redux/relations/relationsSlice.js";
import { fetchContratByAdherentIdAsync } from "../../../redux/contrat/ContratSlice.js";
import { addFacture, getNbFac } from "../../../redux/facture/FactureSlice.js";
import { useTypeDoc } from "../../../customeHooks/useTypeDoc.jsx";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../helpers/timeConvert.js";
import Header from "../../../components/Header.jsx";
import { tokens } from "../../../theme.js";

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
            devise: Yup.mixed().required('Devise requise')
        })
    ).min(1, 'Au moins un document requis')
});

const SaisieBordereau = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme=useTheme();
    const colors=tokens(theme.palette.mode)
    const { typeDoc } = useTypeDoc();
    const { adherents, relations } = useSelector(state => state.relations);
    const { currentContrat } = useSelector(state => state.contrat);
    const { nbFac,loading,error } = useSelector(state => state.facture);
    const [validation1, setValidation1] = useState(false);
    const [validation2, setValidation2] = useState(false);
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [acheteurOptions, setAcheteurOptions] = useState([]);

    // Prepare acheteur options from relations
    useEffect(() => {
        if (relations) {
            const options = relations.map(relation => {
                const acheteur = relation.acheteurPhysique || relation.acheteurMorale;
                if (!acheteur) return null;

                let label = '';
                if (relation.acheteurPhysique) {
                    label = `${acheteur.nom} ${acheteur.prenom} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
                } else if (relation.acheteurMorale) {
                    label = `${acheteur.raisonSocial} - ${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
                }

                return {
                    id: acheteur.id,
                    label: label,
                    acheteur: acheteur
                };
            }).filter(option => option !== null);

            setAcheteurOptions(options);
        }
    }, [relations]);

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
                bordRemiseFactorDate1v: formatDate(values.bordRemiseFactorDate1v),
                bordRemiseFactorDate2v: formatDate(values.bordRemiseFactorDate2v),
                contrat: values.contrat,
                docRemises: values.docRemises.map((doc, index) => ({
                    ...doc,
                    createDate: formatDate(doc.createDate),
                    echeanceFirst: formatDate(doc.echeanceFirst),
                    bordRemiseLigneNo: index + 1,
                    devise: doc.devise || values.devise,
                    contrat: values.contrat
                }))
            };

            const totalMontant = values.docRemises.reduce((sum, doc) => sum + Number(doc.montantBrut || 0), 0);

            formData.bordRemiseMontantBrut = Number(formData.bordRemiseMontantBrut);

            if (Math.abs(totalMontant - Number(formData.bordRemiseMontantBrut)) > 0.001) {
                return;
            }

            console.log("Form submitted with values:", formData);
            dispatch(addFacture(formData, navigate));
        }
    });

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(getNbFac());
    }, [dispatch]);

    useEffect(() => {
        if (currentContrat) {
            formik.setFieldValue('contrat', currentContrat);
            if (currentContrat.devise) {
                formik.setFieldValue('devise', currentContrat.devise);
                formik.setFieldValue('docRemises',
                    formik.values.docRemises.map(doc => ({
                        ...doc,
                        devise: currentContrat.devise
                    }))
                );
            }
        }
    }, [currentContrat]);

    useEffect(() => {
        if (nbFac) {
            formik.setFieldValue('bordRemiseNo', nbFac);
        }
    }, [nbFac]);

    const handleAdherentChange = (event, newValue) => {
        setSelectedAdherent(newValue);
        if (newValue && newValue.id) {
            dispatch(fetchContratByAdherentIdAsync(newValue.id));
            dispatch(fetchRelationsAsync(newValue.id));
        } else {
            formik.setFieldValue('contrat', null);
            formik.setFieldValue('devise', null);
            setAcheteurOptions([]);
        }
    };

    const handleAcheteurChange = (index, newValue) => {
        formik.setFieldValue(`docRemises[${index}].acheteurFactorCode`, newValue?.id || "");
    };

    function createEmptyDocument(devise) {
        return {
            acheteurFactorCode: "",
            typeDocRemise: null,
            docRemiseNo: "",
            createDate: formatDate(new Date()),
            montantBrut: 0,
            echeanceFirst: formatDate(new Date(Date.now() + 86400000)),
            devise: devise || null,
            bordRemiseLigneNo: 0
        };
    }

    const addedAmount = formik.values.docRemises.reduce(
        (sum, doc) => sum + Number(doc.montantBrut || 0),
        0
    );

    const targetAmount = Number(formik.values.bordRemiseMontantBrut);
    const isComplete = Math.abs(addedAmount - targetAmount) <= 0.001;

    const updateDocument = (index, field, value) => {
        formik.setFieldValue(`docRemises[${index}].${field}`, value);

        if (formik.values.devise) {
            formik.setFieldValue(`docRemises[${index}].devise`, formik.values.devise);
        }
    };

    const handleNbDocsChange = (e) => {
        let newNbDocs = parseInt(e.target.value, 10) || 0;
        newNbDocs = Math.min(10, Math.max(0, newNbDocs));

        formik.setFieldValue('bordRemiseNbrLigne', newNbDocs);

        if (newNbDocs > formik.values.docRemises.length) {
            const newDocuments = [
                ...formik.values.docRemises,
                ...Array.from({ length: newNbDocs - formik.values.docRemises.length },
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



    return (
        <Box p={4} maxWidth="1200px" margin="auto">
            <Header title={"Bordreaux"} subtitle={"Ajouter Bordreaux"}/>
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
                <Card sx={{ mb: 3 }}>

                    <CardContent>

                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Autocomplete
                                    options={adherents}
                                    getOptionLabel={(option) => option.raisonSocial}
                                    value={selectedAdherent}
                                    onChange={handleAdherentChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Choisir un adhérent"
                                            error={!selectedAdherent && formik.submitCount > 0}
                                            helperText={!selectedAdherent && formik.submitCount > 0 ? "Adhérent requis" : ""}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Nom Adhérent"
                                    value={selectedAdherent?.raisonSocial || ""}
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
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    label="Montant ajouté"
                                    value={addedAmount.toFixed(2)}
                                    disabled
                                    InputProps={{
                                        readOnly: true,
                                        style: {
                                            color: isComplete ? 'green' : 'red',
                                            fontWeight: 'bold',
                                            // fontSize: "16px", // Smaller font size
                                        }
                                    }}
                                    helperText={isComplete ?
                                        "Montant total atteint" :
                                        `Encore ${ (targetAmount - addedAmount).toFixed(2) } à ajouter`}
                                    FormHelperTextProps={{
                                        style: {
                                            color: isComplete ? colors.greenAccent[400] : colors.redAccent[500],
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem', // Smaller font size
                                        }
                                    }}
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
                   Ajouter Facture
            </Typography>


                <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{minWidth:"80px"}}>Ligne</TableCell>
                                <TableCell>Acheteur</TableCell>
                                <TableCell>Type Document</TableCell>
                                <TableCell>N° Document</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Montant</TableCell>
                                <TableCell>Échéance</TableCell>
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
                                        <TextField value={index + 1} disabled size="medium" />
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            options={acheteurOptions}
                                            getOptionLabel={(option) => option.label}
                                            value={acheteurOptions.find(opt => opt.id === doc.acheteurFactorCode) || null}
                                            onChange={(event, newValue) => handleAcheteurChange(index, newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={formik.touched.docRemises?.[index]?.acheteurFactorCode && Boolean(formik.errors.docRemises?.[index]?.acheteurFactorCode)}
                                                    helperText={formik.touched.docRemises?.[index]?.acheteurFactorCode && formik.errors.docRemises?.[index]?.acheteurFactorCode}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            sx={{ width: 300 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth>
                                            <Select
                                                value={doc.typeDocRemise || ""}
                                                onChange={(e) => updateDocument(index, "typeDocRemise", e.target.value)}
                                                sx={{ width: '250px' }}
                                                error={formik.touched.docRemises?.[index]?.typeDocRemise && Boolean(formik.errors.docRemises?.[index]?.typeDocRemise)}
                                            >
                                                {typeDoc?.map(t => (
                                                    <MenuItem key={t.id} value={t}>{t.dsg}</MenuItem>
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
                                            sx={{ width: '120px' }}
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
                                            sx={{ width: '150px' }}
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
                                            sx={{ width: '120px' }}
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
                        disabled={!formik.values.contrat || !formik.values.devise || !isComplete}
                        onClick={validation1 ? undefined : handleValidation}
                    >
                        Ajotuer
                    </Button>
                </Box>

                
            </form>
        </Box>
    );
};

export default SaisieBordereau;