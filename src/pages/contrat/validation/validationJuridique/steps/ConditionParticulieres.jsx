// /* eslint-disable react/prop-types */
// /* eslint-disable react/display-name */
//
// import { forwardRef, useImperativeHandle, useMemo, useRef, useEffect, useState } from "react";
// import {
//     Box, TextField, MenuItem, Typography, IconButton,
//     Table, TableBody, TableCell, TableContainer, TableHead,
//     TableRow, Paper
// } from "@mui/material";
// import { Formik, FieldArray } from "formik";
// import * as yup from "yup";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import SaveIcon from "@mui/icons-material/Save";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// import CreditCardIcon from "@mui/icons-material/CreditCard";
// import { useTypeCommission } from "../../../../../customeHooks/useTypeCommission.jsx";
// import { useTypeEvent } from "../../../../../customeHooks/useTypeEvent.jsx";
// import { useTypeDoc } from "../../../../../customeHooks/useTypeDoc.jsx";
//
// const ConditionsParticulieres = forwardRef(({ formData, updateData, commissions, contratFonds }, ref) => {
//     const formikRef = useRef();
//     const { typeCommission } = useTypeCommission();
//     const { typeEvent } = useTypeEvent();
//     const { typeDoc } = useTypeDoc();
//     const [editingRows, setEditingRows] = useState({
//         commissions: {},
//         fondGaranti: {}
//     });
//
//     const toggleEdit = (arrayName, index) => {
//         setEditingRows(prev => ({
//             ...prev,
//             [arrayName]: {
//                 ...prev[arrayName],
//                 [index]: !prev[arrayName][index]
//             }
//         }));
//     };
//
//     // Transform API data to form structure
//     const transformCommissionData = (data) => {
//         if (!data) return [];
//         return (Array.isArray(data) ? data : [data]).map(item => ({
//             commId: item?.commId,
//             TypeEvent: item.typeEvent || null,
//             TypeDocRemise: item.typeDocRemise || null,
//             TypeCommission: item.typeComm || null,
//             Periodicite: item.periodicite || "",
//             Minorant: item.commMinorant || "",
//             CommA: item.commA || "",
//             CommX: item.commX || "",
//             CommB: item.commB || "",
//             Majorant: item.commMajorant || "",
//             ValidDateDeb: item.validDateDeb?.split('T')[0] || "",
//             ValidDateFin: item.validDateFin?.split('T')[0] || ""
//         }));
//     };
//
//     const transformFondsData = (data) => {
//         if (!data) return [];
//         return (Array.isArray(data) ? data : [data]).map(item => ({
//             id: item?.id,
//             TauxGarantie: item.garantieTaux || "",
//             TauxReserve: item.reserveTaux || "",
//             typeDocRemiseId: item.typeDocRemiseId || 1
//         }));
//     };
//
//     // Memoized initial values
//     const initialValues = useMemo(() => ({
//         commissions: transformCommissionData(formData.commissions || commissions),
//         fondGaranti: transformFondsData(formData.fondGaranti || contratFonds)
//     }), [formData, commissions, contratFonds]);
//
//     // Validation schema
//     const validationSchema = useMemo(() => yup.object({
//         commissions: yup.array().of(yup.object({
//             TypeEvent: yup.object().required("Event type is required"),
//             TypeDocRemise: yup.object().required("Document type is required"),
//             TypeCommission: yup.object().required("Commission type is required"),
//             Periodicite: yup.string().required("Periodicity is required"),
//             Minorant: yup.number().required("Minimum is required").typeError("Must be a number"),
//             Majorant: yup.number().required("Maximum is required").typeError("Must be a number"),
//             ValidDateDeb: yup.date().required("Start date is required").typeError("Invalid date"),
//             ValidDateFin: yup.date().required("End date is required").typeError("Invalid date"),
//             CommA: yup.number().required("Commission A is required").typeError("Must be a number"),
//             CommX: yup.number().required("Commission X is required").typeError("Must be a number"),
//             CommB: yup.number().required("Commission B is required").typeError("Must be a number"),
//         })),
//         fondGaranti: yup.array().of(yup.object({
//             TauxGarantie: yup.number().required("Guarantee rate is required").typeError("Must be a number"),
//             TauxReserve: yup.number().required("Reserve rate is required").typeError("Must be a number"),
//         }))
//     }), []);
//
//     // Form submission handler
//     const handleSubmit = (values) => {
//         const transformedCommissions = values.commissions.map(commission => ({
//             typeEvent: { id: commission.TypeEvent.id },
//             typeDocRemise: { id: commission.TypeDocRemise.id },
//             typeComm: { id: commission.TypeCommission.id },
//             periodicite: commission.Periodicite,
//             commMinorant: Number(commission.Minorant),
//             commA: Number(commission.CommA),
//             commX: Number(commission.CommX),
//             commB: Number(commission.CommB),
//             commId: commission?.commId,
//             commMajorant: Number(commission.Majorant),
//             validDateDeb: commission.ValidDateDeb,
//             validDateFin: commission.ValidDateFin
//         }));
//
//         const transformedFonds = values.fondGaranti.map(fond => ({
//             id: fond?.id,
//             garantieTaux: Number(fond.TauxGarantie),
//             reserveTaux: Number(fond.TauxReserve),
//             typeDocRemiseId: { id: 1 }
//         }));
//
//         updateData({
//             ...formData,
//             commissions: transformedCommissions,
//             fondGaranti: transformedFonds
//         });
//     };
//
//     // Expose form submission to parent
//     useImperativeHandle(ref, () => ({
//         async submit() {
//             try {
//                 await formikRef.current.submitForm();
//                 const errors = await formikRef.current.validateForm();
//                 return Object.keys(errors).length === 0;
//             } catch (error) {
//                 console.error("Form submission error:", error);
//                 return false;
//             }
//         }
//     }));
//
//     return (
//         <Box width="100%" maxWidth="1100px" p={3}>
//             <Formik
//                 innerRef={formikRef}
//                 initialValues={initialValues}
//                 validationSchema={validationSchema}
//                 onSubmit={handleSubmit}
//                 enableReinitialize
//             >
//                 {({ values, errors, touched, handleChange, setFieldValue }) => (
//                     <>
//                         {/* Commissions Table */}
//                         <FieldArray name="commissions">
//                             {({ push, remove }) => (
//                                 <Box mt={4}>
//                                     <Box display="flex" alignItems="center" mb={2}>
//                                         <AttachMoneyIcon sx={{ mr: 1 }} />
//                                         <Typography variant="h6">Commissions</Typography>
//                                         <IconButton
//                                             onClick={() => {
//                                                 push({
//                                                     TypeEvent: null,
//                                                     TypeDocRemise: null,
//                                                     TypeCommission: null,
//                                                     Periodicite: "",
//                                                     Minorant: "",
//                                                     CommA: "",
//                                                     CommX: "",
//                                                     CommB: "",
//                                                     Majorant: "",
//                                                     ValidDateDeb: "",
//                                                     ValidDateFin: "",
//                                                 });
//                                                 // Set new row to edit mode
//                                                 setEditingRows(prev => ({
//                                                     ...prev,
//                                                     commissions: {
//                                                         ...prev.commissions,
//                                                         [values.commissions.length]: true
//                                                     }
//                                                 }));
//                                             }}
//                                             color="success"
//                                             sx={{ ml: 2 }}
//                                         >
//                                             <AddIcon />
//                                         </IconButton>
//                                     </Box>
//
//                                     <TableContainer component={Paper}>
//                                         <Table>
//                                             <TableHead>
//                                                 <TableRow>
//                                                     <TableCell>Type Événement</TableCell>
//                                                     <TableCell>Type Document</TableCell>
//                                                     <TableCell>Type Commission</TableCell>
//                                                     <TableCell>Périodicité</TableCell>
//                                                     <TableCell>Minorant</TableCell>
//                                                     <TableCell>Majorant</TableCell>
//                                                     <TableCell>Commission A</TableCell>
//                                                     <TableCell>Commission X</TableCell>
//                                                     <TableCell>Commission B</TableCell>
//                                                     <TableCell>Valid From</TableCell>
//                                                     <TableCell>Valid To</TableCell>
//                                                     <TableCell>Actions</TableCell>
//                                                 </TableRow>
//                                             </TableHead>
//                                             <TableBody>
//                                                 {values.commissions.map((commission, index) => (
//                                                     <TableRow key={index}>
//                                                         {/* Type Event */}
//                                                         <TableCell>
//                                                             <TextField
//                                                                 select
//                                                                 fullWidth
//                                                                 value={commission.TypeEvent?.id || ""}
//                                                                 onChange={(e) => {
//                                                                     const selected = typeEvent.find(te => te.id === e.target.value);
//                                                                     setFieldValue(`commissions.${index}.TypeEvent`, selected);
//                                                                 }}
//                                                                 error={touched.commissions?.[index]?.TypeEvent && !!errors.commissions?.[index]?.TypeEvent}
//                                                                 helperText={touched.commissions?.[index]?.TypeEvent && errors.commissions?.[index]?.TypeEvent?.message}
//                                                                 disabled={!editingRows.commissions[index]}
//                                                             >
//                                                                 <MenuItem value=""><em>Select Event</em></MenuItem>
//                                                                 {typeEvent?.map(item => (
//                                                                     <MenuItem key={item.id} value={item.id}>
//                                                                         {item.dsg}
//                                                                     </MenuItem>
//                                                                 ))}
//                                                             </TextField>
//                                                         </TableCell>
//
//                                                         {/* Type Document */}
//                                                         <TableCell>
//                                                             <TextField
//                                                                 select
//                                                                 fullWidth
//                                                                 value={commission.TypeDocRemise?.id || ""}
//                                                                 onChange={(e) => {
//                                                                     const selected = typeDoc.find(td => td.id === e.target.value);
//                                                                     setFieldValue(`commissions.${index}.TypeDocRemise`, selected);
//                                                                 }}
//                                                                 error={touched.commissions?.[index]?.TypeDocRemise && !!errors.commissions?.[index]?.TypeDocRemise}
//                                                                 helperText={touched.commissions?.[index]?.TypeDocRemise && errors.commissions?.[index]?.TypeDocRemise?.message}
//                                                                 disabled={!editingRows.commissions[index]}
//                                                             >
//                                                                 <MenuItem value=""><em>Select Document</em></MenuItem>
//                                                                 {typeDoc?.map(item => (
//                                                                     <MenuItem key={item.id} value={item.id}>
//                                                                         {item.dsg}
//                                                                     </MenuItem>
//                                                                 ))}
//                                                             </TextField>
//                                                         </TableCell>
//
//                                                         {/* Type Commission */}
//                                                         <TableCell>
//                                                             <TextField
//                                                                 select
//                                                                 fullWidth
//                                                                 value={commission.TypeCommission?.id || ""}
//                                                                 onChange={(e) => {
//                                                                     const selected = typeCommission.find(tc => tc.id === e.target.value);
//                                                                     setFieldValue(`commissions.${index}.TypeCommission`, selected);
//                                                                 }}
//                                                                 error={touched.commissions?.[index]?.TypeCommission && !!errors.commissions?.[index]?.TypeCommission}
//                                                                 helperText={touched.commissions?.[index]?.TypeCommission && errors.commissions?.[index]?.TypeCommission?.message}
//                                                                 disabled={!editingRows.commissions[index]}
//                                                             >
//                                                                 <MenuItem value=""><em>Select Commission</em></MenuItem>
//                                                                 {typeCommission?.map(item => (
//                                                                     <MenuItem key={item.id} value={item.id}>
//                                                                         {item.dsg}
//                                                                     </MenuItem>
//                                                                 ))}
//                                                             </TextField>
//                                                         </TableCell>
//
//                                                         {/* Periodicité */}
//                                                         <TableCell>
//                                                             <TextField
//                                                                 type={"number"}
//                                                                 fullWidth
//                                                                 name={`commissions.${index}.Periodicite`}
//                                                                 value={commission.Periodicite}
//                                                                 onChange={handleChange}
//                                                                 error={touched.commissions?.[index]?.Periodicite && !!errors.commissions?.[index]?.Periodicite}
//                                                                 helperText={touched.commissions?.[index]?.Periodicite && errors.commissions?.[index]?.Periodicite}
//                                                                 disabled={!editingRows.commissions[index]}
//                                                             />
//                                                         </TableCell>
//
//                                                         {/* Numeric Fields */}
//                                                         {['Minorant', 'Majorant', 'CommA', 'CommX', 'CommB'].map(field => (
//                                                             <TableCell key={field}>
//                                                                 <TextField
//                                                                     fullWidth
//                                                                     type="number"
//                                                                     name={`commissions.${index}.${field}`}
//                                                                     value={commission[field]}
//                                                                     onChange={handleChange}
//                                                                     error={touched.commissions?.[index]?.[field] && !!errors.commissions?.[index]?.[field]}
//                                                                     helperText={touched.commissions?.[index]?.[field] && errors.commissions?.[index]?.[field]}
//                                                                     disabled={!editingRows.commissions[index]}
//                                                                 />
//                                                             </TableCell>
//                                                         ))}
//
//                                                         {/* Date Fields */}
//                                                         {['ValidDateDeb', 'ValidDateFin'].map(field => (
//                                                             <TableCell key={field}>
//                                                                 <TextField
//                                                                     fullWidth
//                                                                     type="date"
//                                                                     name={`commissions.${index}.${field}`}
//                                                                     value={commission[field]}
//                                                                     onChange={handleChange}
//                                                                     InputLabelProps={{ shrink: true }}
//                                                                     error={touched.commissions?.[index]?.[field] && !!errors.commissions?.[index]?.[field]}
//                                                                     helperText={touched.commissions?.[index]?.[field] && errors.commissions?.[index]?.[field]}
//                                                                     disabled={!editingRows.commissions[index]}
//                                                                 />
//                                                             </TableCell>
//                                                         ))}
//
//                                                         <TableCell>
//                                                             <IconButton
//                                                                 onClick={() => toggleEdit('commissions', index)}
//                                                                 color={editingRows.commissions[index] ? "primary" : "default"}
//                                                                 aria-label={editingRows.commissions[index] ? "Save" : "Edit"}
//                                                             >
//                                                                 {editingRows.commissions[index] ? <SaveIcon /> : <EditIcon />}
//                                                             </IconButton>
//
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </TableContainer>
//                                 </Box>
//                             )}
//                         </FieldArray>
//
//                         {/* Fonds de Garantie Table */}
//                         <FieldArray name="fondGaranti">
//                             {({ push, remove }) => (
//                                 <Box mt={4}>
//                                     <Box display="flex" alignItems="center" mb={2}>
//                                         <CreditCardIcon sx={{ mr: 1 }} />
//                                         <Typography variant="h6">Fonds de Garantie</Typography>
//                                         <IconButton
//                                             onClick={() => {
//                                                 push({ TauxGarantie: "", TauxReserve: "" });
//                                                 // Set new row to edit mode
//                                                 setEditingRows(prev => ({
//                                                     ...prev,
//                                                     fondGaranti: {
//                                                         ...prev.fondGaranti,
//                                                         [values.fondGaranti.length]: true
//                                                     }
//                                                 }));
//                                             }}
//                                             color="success"
//                                             sx={{ ml: 2 }}
//                                             aria-label="Add guarantee fund"
//                                         >
//                                             <AddIcon />
//                                         </IconButton>
//                                     </Box>
//
//                                     <TableContainer component={Paper}>
//                                         <Table>
//                                             <TableHead>
//                                                 <TableRow>
//                                                     <TableCell>Taux Garantie (%)</TableCell>
//                                                     <TableCell>Taux Réserve (%)</TableCell>
//                                                     <TableCell>Actions</TableCell>
//                                                 </TableRow>
//                                             </TableHead>
//                                             <TableBody>
//                                                 {values.fondGaranti.map((frais, index) => (
//                                                     <TableRow key={index}>
//                                                         <TableCell>
//                                                             <TextField
//                                                                 fullWidth
//                                                                 type="number"
//                                                                 name={`fondGaranti.${index}.TauxGarantie`}
//                                                                 value={frais.TauxGarantie}
//                                                                 onChange={handleChange}
//                                                                 error={touched.fondGaranti?.[index]?.TauxGarantie && !!errors.fondGaranti?.[index]?.TauxGarantie}
//                                                                 helperText={touched.fondGaranti?.[index]?.TauxGarantie && errors.fondGaranti?.[index]?.TauxGarantie}
//                                                                 disabled={!editingRows.fondGaranti[index]}
//                                                             />
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             <TextField
//                                                                 fullWidth
//                                                                 type="number"
//                                                                 name={`fondGaranti.${index}.TauxReserve`}
//                                                                 value={frais.TauxReserve}
//                                                                 onChange={handleChange}
//                                                                 error={touched.fondGaranti?.[index]?.TauxReserve && !!errors.fondGaranti?.[index]?.TauxReserve}
//                                                                 helperText={touched.fondGaranti?.[index]?.TauxReserve && errors.fondGaranti?.[index]?.TauxReserve}
//                                                                 disabled={!editingRows.fondGaranti[index]}
//                                                             />
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             <IconButton
//                                                                 onClick={() => toggleEdit('fondGaranti', index)}
//                                                                 color={editingRows.fondGaranti[index] ? "primary" : "default"}
//                                                                 aria-label={editingRows.fondGaranti[index] ? "Save" : "Edit"}
//                                                             >
//                                                                 {editingRows.fondGaranti[index] ? <SaveIcon /> : <EditIcon />}
//                                                             </IconButton>
//
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </TableContainer>
//                                 </Box>
//                             )}
//                         </FieldArray>
//                     </>
//                 )}
//             </Formik>
//         </Box>
//     );
// });
//
// export default ConditionsParticulieres;
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import { forwardRef, useImperativeHandle, useMemo, useRef, useEffect, useState } from "react";
import {
    Box, TextField, MenuItem, Typography, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Tooltip, useTheme
} from "@mui/material";
import { Formik, FieldArray } from "formik";
import * as yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import NotesIcon from "@mui/icons-material/Notes";
import { useTypeCommission } from "../../../../../customeHooks/useTypeCommission.jsx";
import { useTypeEvent } from "../../../../../customeHooks/useTypeEvent.jsx";
import { useTypeDoc } from "../../../../../customeHooks/useTypeDoc.jsx";
import {tokens} from "../../../../../theme.js";

const ConditionsParticulieres = forwardRef(({
                                                formData,
                                                updateData,
                                                commissions,
                                                contratFonds,
                                                handleOpenNoteModal,
                                                description
                                            }, ref) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const formikRef = useRef();
    const { typeCommission } = useTypeCommission();
    const { typeEvent } = useTypeEvent();
    const { typeDoc } = useTypeDoc();
    const [editingRows, setEditingRows] = useState({
        commissions: {},
        fondGaranti: {}
    });

    const toggleEdit = (arrayName, index) => {
        setEditingRows(prev => ({
            ...prev,
            [arrayName]: {
                ...prev[arrayName],
                [index]: !prev[arrayName][index]
            }
        }));
    };

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
            typeDocRemiseId: item.typeDocRemiseId || 1
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
            Periodicite: yup.string(),
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
            typeEvent: { id: commission.TypeEvent.id },
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
            typeDocRemiseId: { id: 1 }
        }));

        updateData({
            ...formData,
            commissions: transformedCommissions,
            fondGaranti: transformedFonds
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
                                            onClick={() => {
                                                push({
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
                                                });
                                                // Set new row to edit mode
                                                setEditingRows(prev => ({
                                                    ...prev,
                                                    commissions: {
                                                        ...prev.commissions,
                                                        [values.commissions.length]: true
                                                    }
                                                }));
                                            }}
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
                                                    <TableCell>Notes</TableCell>
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
                                                                disabled={!editingRows.commissions[index]}
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
                                                                disabled={!editingRows.commissions[index]}
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
                                                                disabled={!editingRows.commissions[index]}
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
                                                                disabled={!editingRows.commissions[index]}
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
                                                                    disabled={!editingRows.commissions[index]}
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
                                                                    disabled={!editingRows.commissions[index]}
                                                                />
                                                            </TableCell>
                                                        ))}



                                                        <TableCell>
                                                            <Tooltip
                                                                title={description[`commissions_${index}`] || "Add note"}
                                                                arrow
                                                            >
                                                                <IconButton
                                                                    onClick={() => handleOpenNoteModal(`commissions_${index}`)}
                                                                    color={description[`commissions_${index}`] ? colors.greenAccent[700] : "default"}
                                                                >
                                                                    <NotesIcon />
                                                                </IconButton>

                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell>
                                                            {description[`commissions_${index}`] && (
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        ml: 1,
                                                                        maxWidth: '500px',
                                                                        whiteSpace: 'nowrap',
                                                                        wordWrap: 'nowrap',
                                                                        overflow: 'visible',
                                                                        display: '-webkit-box',
                                                                        WebkitBoxOrient: 'vertical',
                                                                    }}
                                                                >
                                                                    {description[`commissions_${index}`]}
                                                                </Typography>
                                                            )}
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
                                            onClick={() => {
                                                push({ TauxGarantie: "", TauxReserve: "" });
                                                // Set new row to edit mode
                                                setEditingRows(prev => ({
                                                    ...prev,
                                                    fondGaranti: {
                                                        ...prev.fondGaranti,
                                                        [values.fondGaranti.length]: true
                                                    }
                                                }));
                                            }}
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
                                                    <TableCell>Notes</TableCell>
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
                                                                disabled={!editingRows.fondGaranti[index]}
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
                                                                disabled={!editingRows.fondGaranti[index]}
                                                            />
                                                        </TableCell>

                                                        <TableCell>
                                                            <Tooltip
                                                                title={description[`fondGaranti_${index}`] || "Add note"}
                                                                arrow
                                                            >
                                                                <IconButton
                                                                    onClick={() => handleOpenNoteModal(`fondGaranti_${index}`)}
                                                                    color={description[`fondGaranti_${index}`] ? colors.greenAccent[700] : "default"}
                                                                >
                                                                    <NotesIcon />
                                                                </IconButton>

                                                            </Tooltip>

                                                        </TableCell>
                                                        <TableCell>
                                                            {description[`fondGaranti_${index}`] && (
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        ml: 1,
                                                                        maxWidth: '200px',
                                                                        whiteSpace: 'nowrap',
                                                                        wordWrap: 'nowrap',
                                                                        overflow: 'visible',
                                                                        display: '-webkit-box',
                                                                        WebkitBoxOrient: 'vertical',
                                                                    }}
                                                                >
                                                                    {description[`fondGaranti_${index}`]}
                                                                </Typography>
                                                            )
                                                            }
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