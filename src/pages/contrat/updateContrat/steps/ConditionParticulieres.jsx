/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import { forwardRef, useImperativeHandle, useMemo, useRef, useEffect } from "react";
import {
    Box, TextField, MenuItem, Typography, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper
} from "@mui/material";
import { Formik, FieldArray } from "formik";
import * as yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useTypeCommission } from "../../../../customeHooks/useTypeCommission.jsx";
import { useTypeEvent } from "../../../../customeHooks/useTypeEvent.jsx";
import { useTypeDoc } from "../../../../customeHooks/useTypeDoc.jsx";


const ConditionsParticulieres = forwardRef(({ formData, updateData, commissions, contratFonds }, ref) => {
    const formikRef = useRef();
    const { typeCommission } = useTypeCommission();
    const { typeEvent } = useTypeEvent();
    const { typeDoc } = useTypeDoc();

    // Transform API data to form structure
    const transformCommissionData = (data) => {
        if (!data) return [];
        return (Array.isArray(data) ? data : [data]).map(item => ({
            commId: item?.commId,
            TypeEvent: item.typeEvent || null,
            TypeDocRemise: item.typeDocRemise || null,
            TypeCommission: item.typeComm || null,
            Periodicite: item.periodicite || "",
            Minorant: item.commMinorant || "",
            CommA: item.commA || "",
            CommX: item.commX || "",
            CommB: item.commB || "",
            Majorant: item.commMajorant || "",
            ValidDateDeb: item.validDateDeb?.split('T')[0] || "",
            ValidDateFin: item.validDateFin?.split('T')[0] || ""
        }));
    };

    const transformFondsData = (data) => {
        if (!data) return [];
        return (Array.isArray(data) ? data : [data]).map(item => ({
            id: item?.id,
            TauxGarantie: item.garantieTaux || "",
            TauxReserve: item.reserveTaux || "",
            typeDocRemiseId: item.typeDocRemiseId || 1 // Keep full object

        }));
    };

    // Memoized initial values
    const initialValues = useMemo(() => ({
        commissions: transformCommissionData(formData.commissions || commissions),
        fondGaranti: transformFondsData(formData.fondGaranti || contratFonds)
    }), [formData, commissions, contratFonds]);

    // Validation schema
    const validationSchema = useMemo(() => yup.object({
        commissions: yup.array().of(yup.object({
            TypeEvent: yup.object().required("Event type is required"),
            TypeDocRemise: yup.object().required("Document type is required"),
            TypeCommission: yup.object().required("Commission type is required"),
            Periodicite: yup.string().required("Periodicity is required"),
            Minorant: yup.number().required("Minimum is required").typeError("Must be a number"),
            Majorant: yup.number().required("Maximum is required").typeError("Must be a number"),
            ValidDateDeb: yup.date().required("Start date is required").typeError("Invalid date"),
            ValidDateFin: yup.date().required("End date is required").typeError("Invalid date"),
            CommA: yup.number().required("Commission A is required").typeError("Must be a number"),
            CommX: yup.number().required("Commission X is required").typeError("Must be a number"),
            CommB: yup.number().required("Commission B is required").typeError("Must be a number"),
        })),
        fondGaranti: yup.array().of(yup.object({
            TauxGarantie: yup.number().required("Guarantee rate is required").typeError("Must be a number"),
            TauxReserve: yup.number().required("Reserve rate is required").typeError("Must be a number"),
        }))
    }), []);

    // Form submission handler
    const handleSubmit = (values) => {
        const transformedCommissions = values.commissions.map(commission => ({
            typeEvent: { id: commission.TypeEvent.id }, // Send as object
            typeDocRemise: { id: commission.TypeDocRemise.id },
            typeComm: { id: commission.TypeCommission.id },
            periodicite: commission.Periodicite,
            commMinorant: Number(commission.Minorant),
            commA: Number(commission.CommA),
            commX: Number(commission.CommX),
            commB: Number(commission.CommB),
            commId: commission?.commId,
            commMajorant: Number(commission.Majorant),
            validDateDeb: commission.ValidDateDeb,
            validDateFin: commission.ValidDateFin
        }));


        const transformedFonds = values.fondGaranti.map(fond => ({
            id: fond?.id,
            garantieTaux: Number(fond.TauxGarantie),
            reserveTaux: Number(fond.TauxReserve),
            typeDocRemiseId: { id: 1 } // Send as object
        }));

        console.log("Transformed commissions:", transformedCommissions);
        console.log("Transformed fonds:", transformedFonds);
        updateData({
            ...formData,
            commissions: transformedCommissions,
            fondGaranti:transformedFonds
        });
    };

    // Expose form submission to parent
    useImperativeHandle(ref, () => ({
        async submit() {
            try {
                await formikRef.current.submitForm();
                const errors = await formikRef.current.validateForm();
                return Object.keys(errors).length === 0;
            } catch (error) {
                console.error("Form submission error:", error);
                return false;
            }
        }
    }));

    return (
        <Box width="100%" maxWidth="1100px" p={3}>
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, setFieldValue }) => (
                    <>
                        {/* Commissions Table */}
                        <FieldArray name="commissions">
                            {({ push, remove }) => (
                                <Box mt={4}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <AttachMoneyIcon sx={{ mr: 1 }} />
                                        <Typography variant="h6">Commissions</Typography>
                                        <IconButton
                                            onClick={() => push({
                                                TypeEvent: null,
                                                TypeDocRemise: null,
                                                TypeCommission: null,
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

                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Type Événement</TableCell>
                                                    <TableCell>Type Document</TableCell>
                                                    <TableCell>Type Commission</TableCell>
                                                    <TableCell>Périodicité</TableCell>
                                                    <TableCell>Minorant</TableCell>
                                                    <TableCell>Majorant</TableCell>
                                                    <TableCell>Commission A</TableCell>
                                                    <TableCell>Commission X</TableCell>
                                                    <TableCell>Commission B</TableCell>
                                                    <TableCell>Valid From</TableCell>
                                                    <TableCell>Valid To</TableCell>
                                                    <TableCell>Actions</TableCell>
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
                                                                value={commission.TypeEvent?.id || ""}
                                                                onChange={(e) => {
                                                                    const selected = typeEvent.find(te => te.id === e.target.value);
                                                                    setFieldValue(`commissions.${index}.TypeEvent`, selected);
                                                                }}
                                                                error={touched.commissions?.[index]?.TypeEvent && !!errors.commissions?.[index]?.TypeEvent}
                                                                helperText={touched.commissions?.[index]?.TypeEvent && errors.commissions?.[index]?.TypeEvent?.message}
                                                            >
                                                                <MenuItem value=""><em>Select Event</em></MenuItem>
                                                                {typeEvent?.map(item => (
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
                                                                value={commission.TypeDocRemise?.id || ""}
                                                                onChange={(e) => {
                                                                    const selected = typeDoc.find(td => td.id === e.target.value);
                                                                    setFieldValue(`commissions.${index}.TypeDocRemise`, selected);
                                                                }}
                                                                error={touched.commissions?.[index]?.TypeDocRemise && !!errors.commissions?.[index]?.TypeDocRemise}
                                                                helperText={touched.commissions?.[index]?.TypeDocRemise && errors.commissions?.[index]?.TypeDocRemise?.message}
                                                            >
                                                                <MenuItem value=""><em>Select Document</em></MenuItem>
                                                                {typeDoc?.map(item => (
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
                                                                value={commission.TypeCommission?.id || ""}
                                                                onChange={(e) => {
                                                                    const selected = typeCommission.find(tc => tc.id === e.target.value);
                                                                    setFieldValue(`commissions.${index}.TypeCommission`, selected);
                                                                }}
                                                                error={touched.commissions?.[index]?.TypeCommission && !!errors.commissions?.[index]?.TypeCommission}
                                                                helperText={touched.commissions?.[index]?.TypeCommission && errors.commissions?.[index]?.TypeCommission?.message}
                                                            >
                                                                <MenuItem value=""><em>Select Commission</em></MenuItem>
                                                                {typeCommission?.map(item => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.dsg}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </TableCell>

                                                        {/* Periodicité */}
                                                        <TableCell>
                                                            <TextField
                                                                type={"number"}
                                                                fullWidth
                                                                name={`commissions.${index}.Periodicite`}
                                                                value={commission.Periodicite}
                                                                onChange={handleChange}
                                                                error={touched.commissions?.[index]?.Periodicite && !!errors.commissions?.[index]?.Periodicite}
                                                                helperText={touched.commissions?.[index]?.Periodicite && errors.commissions?.[index]?.Periodicite}
                                                            />
                                                        </TableCell>

                                                        {/* Numeric Fields */}
                                                        {['Minorant', 'Majorant', 'CommA', 'CommX', 'CommB'].map(field => (
                                                            <TableCell key={field}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    name={`commissions.${index}.${field}`}
                                                                    value={commission[field]}
                                                                    onChange={handleChange}
                                                                    error={touched.commissions?.[index]?.[field] && !!errors.commissions?.[index]?.[field]}
                                                                    helperText={touched.commissions?.[index]?.[field] && errors.commissions?.[index]?.[field]}
                                                                />
                                                            </TableCell>
                                                        ))}

                                                        {/* Date Fields */}
                                                        {['ValidDateDeb', 'ValidDateFin'].map(field => (
                                                            <TableCell key={field}>
                                                                <TextField
                                                                    fullWidth
                                                                    type="date"
                                                                    name={`commissions.${index}.${field}`}
                                                                    value={commission[field]}
                                                                    onChange={handleChange}
                                                                    InputLabelProps={{ shrink: true }}
                                                                    error={touched.commissions?.[index]?.[field] && !!errors.commissions?.[index]?.[field]}
                                                                    helperText={touched.commissions?.[index]?.[field] && errors.commissions?.[index]?.[field]}
                                                                />
                                                            </TableCell>
                                                        ))}

                                                        <TableCell>
                                                            <IconButton
                                                                onClick={() => remove(index)}
                                                                color="error"
                                                                aria-label="Delete commission"
                                                            >
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
                                        <Typography variant="h6">Fonds de Garantie</Typography>
                                        <IconButton
                                            onClick={() => push({ TauxGarantie: "", TauxReserve: "" })}
                                            color="success"
                                            sx={{ ml: 2 }}
                                            aria-label="Add guarantee fund"
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Taux Garantie (%)</TableCell>
                                                    <TableCell>Taux Réserve (%)</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {values.fondGaranti.map((frais, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <TextField
                                                                fullWidth
                                                                type="number"
                                                                name={`fondGaranti.${index}.TauxGarantie`}
                                                                value={frais.TauxGarantie}
                                                                onChange={handleChange}
                                                                error={touched.fondGaranti?.[index]?.TauxGarantie && !!errors.fondGaranti?.[index]?.TauxGarantie}
                                                                helperText={touched.fondGaranti?.[index]?.TauxGarantie && errors.fondGaranti?.[index]?.TauxGarantie}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                fullWidth
                                                                type="number"
                                                                name={`fondGaranti.${index}.TauxReserve`}
                                                                value={frais.TauxReserve}
                                                                onChange={handleChange}
                                                                error={touched.fondGaranti?.[index]?.TauxReserve && !!errors.fondGaranti?.[index]?.TauxReserve}
                                                                helperText={touched.fondGaranti?.[index]?.TauxReserve && errors.fondGaranti?.[index]?.TauxReserve}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                onClick={() => remove(index)}
                                                                color="error"
                                                                aria-label="Delete guarantee fund"
                                                            >
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
                    </>
                )}
            </Formik>
        </Box>
    );
});

export default ConditionsParticulieres;