/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    Button,
    InputAdornment,
    Tooltip
} from "@mui/material";
import { Formik, FieldArray } from "formik";
import * as yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTypeCommission } from "../../../../customeHooks/useTypeCommission.jsx";
import { useTypeEvent } from "../../../../customeHooks/useTypeEvent.jsx";
import { useTypeDoc } from "../../../../customeHooks/useTypeDoc.jsx";
import {tokens} from "../../../../theme.js";
import {useTypeDocContrat} from "../../../../customeHooks/useTypeDocContrat.jsx";
import {uploadFile} from "../../../../helpers/saveFile.js";
import {DescriptionOutlined} from "@mui/icons-material";

const periodicites = ["par mois", "par 4 mois", "par an"];

const ConditionsParticulieres = forwardRef(({ formData, updateData }, ref) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typeCommission, error: comErr, loading: comLoading } = useTypeCommission();
    const { typeEvent, loading: eveLoading, error: eveErr } = useTypeEvent();
    const { typeDoc, loading: docLoading, error: docErr } = useTypeDoc();
    const {typeDocContrat,loading:tDocCLoading,error:tDocCErr}=useTypeDocContrat();

    const [fieldTouched, setFieldTouched] = useState({});

    const initialValues = {
        commissions: formData.commissions || [
            {
                TypeEvent: "",
                TypeDocRemise: "",
                TypeCommission: "",
                Periodicite: "",
                Minorant: "",
                CommA: "",
                CommX: "",
                CommB: "",
                Majorant: "",
                ValidDateDeb: "",
                ValidDateFin: "",
            },
        ],
        fondGaranti: formData.fondGaranti || [
            {
                TypeDocRemise:"",
                TauxGarantie: "",
                TauxReserve: "",
            },
        ],
        docContrats: formData.docContrats || [{
            typeDocContrat: null,
            docContratDelivDate: '',
            docContratExpireDate: '',
            docContratApprobationDate: '',
            docContratEffetDate: '',
            docContratRelanceDate: '',
            docContratScanPath: '',
            docContratScanFileName: ''
        }]
    };

    const validationSchema = yup.object({
        commissions: yup.array().of(
            yup.object({
                TypeEvent: yup.object().required("Type Evenement requis"),
                TypeDocRemise: yup
                    .object()
                    .nullable()
                    .test(
                        'is-required',
                        "Type Document requis",
                        function(value) {
                            const { TypeEvent } = this.parent;
                            if (!TypeEvent || !TypeEvent.boolContrat) {
                                return !!value;
                            }
                            return true;
                        }
                    ),
                TypeCommission: yup.object().required("Type Commission requis"),
                Periodicite: yup.string().required("Periodicité requise"),
                Minorant: yup.number().required("Minorant requis"),
                Majorant: yup.number()
                    .typeError("Doit être un nombre")
                    .required("Majorant requis")
                    .test(
                        'is-greater',
                        'Le majorant doit être supérieur au minorant',
                        function(value) {
                            const minorant = this.parent.Minorant || 0;
                            return value > minorant;
                        }
                    ),
                ValidDateDeb: yup.date().required("Date début requise"),
                ValidDateFin: yup.date().typeError("Invalid date"),
                CommA: yup.number().required("Commission A requise"),
                CommX: yup.number().required("Commission X requise"),
                CommB: yup.number().required("Commission B requise"),
            })
        ),
        fondGaranti: yup.array().of(
            yup.object({
                TypeDocRemise: yup.object().required("Type Document requis"),
                TauxGarantie: yup.number().required("Taux de garantie requis"),
                TauxReserve: yup.number().required("Taux de réserve requis"),
            })
        ),
        docContrats: yup.array().of(
            yup.object({
                typeDocContrat: yup.object().required("Type document requis"),
                docContratDelivDate: yup.date().required("Date livraison requise"),
                docContratExpireDate: yup.date().required("Date expiration requise"),
                docContratApprobationDate: yup.date().nullable(),
                docContratEffetDate: yup.date().nullable(),
                docContratRelanceDate: yup.date().nullable(),
                docContratScanPath: yup.string().required("Fichier requis"),
                docContratScanFileName: yup.string().required("Nom fichier requis")
            })
        ),
    });

    return (
        <Box width="100%" maxWidth="1400px" p={3}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => updateData(values)}
                enableReinitialize
                validateOnChange={false}
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      submitForm,
                      validateForm,
                      setFieldValue,
                      validateField,
                      setTouched,
                  }) => {
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    const isValueUsedInTable = (tableValues, fieldName, value, currentIndex) => {
                        if (!value || !value.id) return false;
                        return tableValues.some((item, idx) =>
                            idx !== currentIndex &&
                            item[fieldName]?.id === value.id
                        );
                    };

                    const handleEventChange = async (e, index) => {
                        const selected = typeEvent.find(te => te.id === e.target.value);
                        setFieldValue(`commissions.${index}.TypeEvent`, selected);

                        // Reset document when event changes
                        setFieldValue(`commissions.${index}.TypeDocRemise`, null);

                        // Mark document as touched to show errors if needed
                        const newTouched = { ...touched };
                        if (!newTouched.commissions) newTouched.commissions = [];
                        if (!newTouched.commissions[index]) newTouched.commissions[index] = {};
                        newTouched.commissions[index].TypeDocRemise = true;
                        setTouched(newTouched);

                        // Validate after state updates
                        setTimeout(() => {
                            validateField(`commissions.${index}.TypeDocRemise`);
                        }, 10);
                    };

                    const isDocumentRequired = (index) => {
                        const event = values.commissions[index]?.TypeEvent;
                        return !(event && event.boolContrat);
                    };

                    const shouldShowError = (index, field) => {
                        if (!touched.commissions?.[index]?.[field]) return false;

                        if (field === 'TypeDocRemise') {
                            return isDocumentRequired(index) && !values.commissions[index]?.TypeDocRemise;
                        }

                        return !!errors.commissions?.[index]?.[field];
                    };

                    return (
                        <form onSubmit={handleSubmit}>
                            {/* Commissions Table */}
                            <FieldArray name="commissions">
                                {({ push, remove }) => (
                                    <Box mt={4}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <AttachMoneyIcon sx={{ mr: 1 }} />
                                            <Typography variant="h6">Commissions</Typography>
                                            <IconButton
                                                onClick={() => push({
                                                    TypeEvent: "",
                                                    TypeDocRemise: "",
                                                    TypeCommission: "",
                                                    Periodicite: "",
                                                    Minorant: "",
                                                    CommA: "",
                                                    CommX: "",
                                                    CommB: "",
                                                    Majorant: "",
                                                    ValidDateDeb: "",
                                                    ValidDateFin: "",
                                                })}
                                                color="success"
                                                sx={{ ml: 2 }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>

                                        <TableContainer component={Paper} sx={{
                                            backgroundColor: colors.grey[700],
                                            overflowX: 'auto'
                                        }}>
                                            <Table sx={{ minWidth: 1200 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ minWidth: 180 }}>Type Événement</TableCell>
                                                        <TableCell sx={{ minWidth: 180 }}>Type Document</TableCell>
                                                        <TableCell sx={{ minWidth: 180 }}>Type Commission</TableCell>
                                                        <TableCell sx={{ minWidth: 120 }}>Périodicité</TableCell>
                                                        <TableCell sx={{ minWidth: 100 }}>Minorant</TableCell>
                                                        <TableCell sx={{ minWidth: 100 }}>Majorant</TableCell>
                                                        <TableCell sx={{ minWidth: 100 }}>Commission A</TableCell>
                                                        <TableCell sx={{ minWidth: 100 }}>Commission X</TableCell>
                                                        <TableCell sx={{ minWidth: 100 }}>Commission B</TableCell>
                                                        <TableCell sx={{ minWidth: 150 }}>Validité Début</TableCell>
                                                        <TableCell sx={{ minWidth: 150 }}>Validité Fin</TableCell>
                                                        <TableCell sx={{ minWidth: 80 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {values.commissions.map((commission, index) => (
                                                        <TableRow key={index}>
                                                            {/* Type Event */}
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    value={commission.TypeEvent?.id || ""}
                                                                    onChange={(e) => handleEventChange(e, index)}
                                                                    error={shouldShowError(index, 'TypeEvent')}
                                                                    helperText={shouldShowError(index, 'TypeEvent') && errors.commissions?.[index]?.TypeEvent}
                                                                    sx={{ minWidth: 180 }}
                                                                >
                                                                    {typeEvent
                                                                        .filter(item => {
                                                                            if (commission.TypeEvent?.id === item.id) return true;
                                                                            return !isValueUsedInTable(values.commissions, 'TypeEvent', item, index);
                                                                        })
                                                                        .map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.dsg}
                                                                            </MenuItem>
                                                                        ))}
                                                                </TextField>
                                                            </TableCell>

                                                            {/* Type Document */}
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    value={commission.TypeDocRemise?.id || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === "") {
                                                                            setFieldValue(`commissions.${index}.TypeDocRemise`, null);
                                                                        } else {
                                                                            const selected = typeDoc.find(td => td.id === value);
                                                                            setFieldValue(`commissions.${index}.TypeDocRemise`, selected);
                                                                        }
                                                                    }}
                                                                    onBlur={handleBlur}
                                                                    error={shouldShowError(index, 'TypeDocRemise')}
                                                                    helperText={shouldShowError(index, 'TypeDocRemise') && errors.commissions?.[index]?.TypeDocRemise}
                                                                    sx={{ minWidth: 180 }}
                                                                    InputProps={{
                                                                        startAdornment: !isDocumentRequired(index) && (
                                                                            <InputAdornment position="start">
                                                                                <Tooltip title="Optionnel">
                                                                                    <HelpOutlineIcon fontSize="small" color="info" />
                                                                                </Tooltip>
                                                                            </InputAdornment>
                                                                        ),
                                                                    }}
                                                                >
                                                                    {typeDoc
                                                                        .filter(item => {
                                                                            if (commission.TypeDocRemise?.id === item.id) return true;
                                                                            return !isValueUsedInTable(values.commissions, 'TypeDocRemise', item, index);
                                                                        })
                                                                        .map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.dsg}
                                                                            </MenuItem>
                                                                        ))}
                                                                </TextField>
                                                            </TableCell>

                                                            {/* Type Commission */}
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    value={commission.TypeCommission?.id || ""}
                                                                    onChange={(e) => {
                                                                        const selected = typeCommission.find(tc => tc.id === e.target.value);
                                                                        setFieldValue(`commissions.${index}.TypeCommission`, selected);
                                                                    }}
                                                                    error={shouldShowError(index, 'TypeCommission')}
                                                                    helperText={shouldShowError(index, 'TypeCommission') && errors.commissions?.[index]?.TypeCommission}
                                                                    sx={{ minWidth: 180 }}
                                                                >
                                                                    {typeCommission
                                                                        .filter(item => {
                                                                            if (commission.TypeCommission?.id === item.id) return true;
                                                                            return !isValueUsedInTable(values.commissions, 'TypeCommission', item, index);
                                                                        })
                                                                        .map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.dsg}
                                                                            </MenuItem>
                                                                        ))}
                                                                </TextField>
                                                            </TableCell>

                                                            {/* Periodicite */}
                                                            <TableCell>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    name={`commissions.${index}.Periodicite`}
                                                                    value={commission.Periodicite}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    error={shouldShowError(index, 'Periodicite')}
                                                                    helperText={shouldShowError(index, 'Periodicite') && errors.commissions?.[index]?.Periodicite}
                                                                    sx={{ minWidth: 120 }}
                                                                />
                                                            </TableCell>

                                                            {/* Numeric Fields */}
                                                            {['Minorant', 'Majorant', 'CommA', 'CommX', 'CommB'].map((field) => (
                                                                <TableCell key={field}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        type="number"
                                                                        name={`commissions.${index}.${field}`}
                                                                        value={commission[field]}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        error={shouldShowError(index, field)}
                                                                        helperText={shouldShowError(index, field) && errors.commissions?.[index]?.[field]}
                                                                        sx={{ minWidth: 100 }}
                                                                    />
                                                                </TableCell>
                                                            ))}

                                                            {/* Date Fields */}
                                                            {['ValidDateDeb', 'ValidDateFin'].map((field) => (
                                                                <TableCell key={field}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        type="date"
                                                                        name={`commissions.${index}.${field}`}
                                                                        value={commission[field]}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={shouldShowError(index, field)}
                                                                        helperText={shouldShowError(index, field) && errors.commissions?.[index]?.[field]}
                                                                        sx={{ minWidth: 150 }}
                                                                    />
                                                                </TableCell>
                                                            ))}

                                                            <TableCell>
                                                                <IconButton onClick={() => remove(index)} color="error">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </FieldArray>

                            {/* Fonds de Garantie Table */}
                            <FieldArray name="fondGaranti">
                                {({ push, remove }) => (
                                    <Box mt={4}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <CreditCardIcon sx={{ mr: 1 }} />
                                            <Typography variant="h6">Fonds de Garantie et Réserve</Typography>

                                            <IconButton
                                                onClick={() => push({ TypeDocRemise: "", TauxGarantie: "", TauxReserve: "" })}
                                                color="success"
                                                sx={{ ml: 2 }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>

                                        <TableContainer component={Paper} sx={{
                                            backgroundColor: colors.grey[700],
                                            overflowX: 'auto'
                                        }}>
                                            <Table sx={{ minWidth: 600 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ minWidth: 180 }}>Type Document</TableCell>
                                                        <TableCell sx={{ minWidth: 200 }}>Taux Fonds Garantie (%)</TableCell>
                                                        <TableCell sx={{ minWidth: 200 }}>Taux Fonds Réserve (%)</TableCell>
                                                        <TableCell sx={{ minWidth: 80 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {values.fondGaranti.map((frais, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    value={frais.TypeDocRemise?.id || ""}
                                                                    onChange={(e) => {
                                                                        const selected = typeDoc.find(td => td.id === e.target.value);
                                                                        setFieldValue(`fondGaranti.${index}.TypeDocRemise`, selected);
                                                                    }}
                                                                    error={touched.fondGaranti?.[index]?.TypeDocRemise && !!errors.fondGaranti?.[index]?.TypeDocRemise}
                                                                    sx={{ minWidth: 180 }}
                                                                >
                                                                    {typeDoc
                                                                        .filter(item => {
                                                                            if (frais.TypeDocRemise?.id === item.id) return true;
                                                                            return !isValueUsedInTable(values.fondGaranti, 'TypeDocRemise', item, index);
                                                                        })
                                                                        .map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.dsg}
                                                                            </MenuItem>
                                                                        ))}
                                                                </TextField>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    type="number"
                                                                    name={`fondGaranti.${index}.TauxGarantie`}
                                                                    value={frais.TauxGarantie}
                                                                    onChange={handleChange}
                                                                    error={touched.fondGaranti?.[index]?.TauxGarantie && !!errors.fondGaranti?.[index]?.TauxGarantie}
                                                                    sx={{ minWidth: 200 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    type="number"
                                                                    name={`fondGaranti.${index}.TauxReserve`}
                                                                    value={frais.TauxReserve}
                                                                    onChange={handleChange}
                                                                    error={touched.fondGaranti?.[index]?.TauxReserve && !!errors.fondGaranti?.[index]?.TauxReserve}
                                                                    sx={{ minWidth: 200 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <IconButton onClick={() => remove(index)} color="error">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </FieldArray>

                            {/* Documents Contrat Table */}
                            <FieldArray name="docContrats">
                                {({ push, remove }) => (
                                    <Box mt={4}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <DescriptionOutlined sx={{ mr: 1 }} />
                                            <Typography variant="h6">Documents du Contrat</Typography>
                                            <IconButton
                                                onClick={() => push({
                                                    typeDocContrat: null,
                                                    docContratDelivDate: '',
                                                    docContratExpireDate: '',
                                                    docContratApprobationDate: '',
                                                    docContratEffetDate: '',
                                                    docContratRelanceDate: '',
                                                    docContratScanPath: '',
                                                    docContratScanFileName: ''
                                                })}
                                                color="success"
                                                sx={{ ml: 2 }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>

                                        <TableContainer component={Paper} sx={{ backgroundColor: colors.grey[700] }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Type Document</TableCell>
                                                        <TableCell>Livraison</TableCell>
                                                        <TableCell>Expiration</TableCell>
                                                        <TableCell>Approbation</TableCell>
                                                        <TableCell>Effet</TableCell>
                                                        <TableCell>Relance</TableCell>
                                                        <TableCell>Fichier</TableCell>
                                                        <TableCell>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {values.docContrats.map((doc, index) => (
                                                        <TableRow key={index}>
                                                            {/* Type Document */}
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    size="small"
                                                                    value={doc.typeDocContrat?.id || ''}
                                                                    onChange={(e) => {
                                                                        const selected = typeDocContrat.find(t => t.id === e.target.value);
                                                                        setFieldValue(`docContrats.${index}.typeDocContrat`, selected);
                                                                    }}
                                                                >
                                                                    {typeDocContrat
                                                                        .filter(item => {
                                                                            if (doc.typeDocContrat?.id === item.id) return true;
                                                                            return !isValueUsedInTable(values.docContrats, 'typeDocContrat', item, index);
                                                                        })
                                                                        .map((item) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.dsg}
                                                                            </MenuItem>
                                                                        ))}
                                                                </TextField>
                                                            </TableCell>

                                                            {/* Dates */}
                                                            {['Deliv', 'Expire', 'Approbation', 'Effet', 'Relance'].map((field) => (
                                                                <TableCell key={field}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        type="date"
                                                                        name={`docContrats.${index}.docContrat${field}Date`}
                                                                        value={doc[`docContrat${field}Date`]}
                                                                        onChange={handleChange}
                                                                        InputLabelProps={{ shrink: true }}
                                                                    />
                                                                </TableCell>
                                                            ))}

                                                            {/* Fichier */}
                                                            <TableCell>
                                                                <Button
                                                                    variant="outlined"
                                                                    component="label"
                                                                    fullWidth
                                                                    size="small"
                                                                >
                                                                    Upload File
                                                                    <input
                                                                        type="file"
                                                                        hidden
                                                                        accept=".pdf,.doc,.docx"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                try {
                                                                                    const response = await uploadFile(file);
                                                                                    setFieldValue(`docContrats.${index}.docContratScanPath`, response.path);
                                                                                    setFieldValue(`docContrats.${index}.docContratScanFileName`, response.fileName);
                                                                                } catch (error) {
                                                                                    console.error("Upload failed:", error);
                                                                                }
                                                                            }
                                                                            e.target.value = null;
                                                                        }}
                                                                    />
                                                                </Button>
                                                                {doc.docContratScanFileName && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        size="small"
                                                                        sx={{ mt: 2 }}
                                                                        color="primary"
                                                                        href={`http://localhost:8083/factoring/contrat/uploads/${doc.docContratScanFileName}`}
                                                                        target="_blank"
                                                                    >
                                                                        Ouvrir Le Fichier
                                                                    </Button>
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                <IconButton onClick={() => remove(index)} color="error">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </FieldArray>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionsParticulieres;