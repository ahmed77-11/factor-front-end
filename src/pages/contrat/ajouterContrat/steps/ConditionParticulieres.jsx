/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import { forwardRef, useImperativeHandle } from "react";
import { Box, TextField, MenuItem, Typography, IconButton, Grid } from "@mui/material";
import { Formik, FieldArray } from "formik";
import * as yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useTypeCommission } from "../../../../customeHooks/useTypeCommission.jsx";
import { useTypeEvent } from "../../../../customeHooks/useTypeEvent.jsx";
import { useTypeDoc } from "../../../../customeHooks/useTypeDoc.jsx";

// Example data arrays for select fields
const periodicites = ["par mois", "par 4 mois", "par an"];

const ConditionsParticulieres = forwardRef(({ formData, updateData }, ref) => {
    console.log(formData)
    const { typeCommission, error: comErr, loading: comLoading } = useTypeCommission();
    const { typeEvent, loading: eveLoading, error: eveErr } = useTypeEvent();
    const { typeDoc, loading: docLoading, error: docErr } = useTypeDoc();

    // Set default initial values using formData or fallback values.
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
                TauxGarantie: "",
                TauxReserve: "",
            },
        ],
    };

    // Define a Yup validation schema with custom error messages.
    const validationSchema = yup.object({
        commissions: yup.array().of(
            yup.object({
                TypeEvent: yup.object().required("Type Evenement is required"),
                TypeDocRemise: yup.object().required("Type Document is required"),
                TypeCommission: yup.object().required("Type Commission is required"),
                Periodicite: yup.string().required("Periodicité is required"),
                Minorant: yup
                    .number()
                    .typeError("Minorant must be a number")
                    .required("Minorant is required"),
                Majorant: yup
                    .number()
                    .typeError("Majorant must be a number")
                    .required("Majorant is required"),
                ValidDateDeb: yup
                    .date()
                    .typeError("Valid From must be a valid date")
                    .required("Valid From date is required"),
                ValidDateFin: yup
                    .date()
                    .typeError("Valid To must be a valid date")
                    .required("Valid To date is required"),
                // Assuming these commission fields are required:
                CommA: yup.string().required("Commission A is required"),
                CommX: yup.string().required("Commission X is required"),
                CommB: yup.string().required("Commission B is required"),
            })
        ),
        fondGaranti: yup.array().of(
            yup.object({
                TauxGarantie: yup
                    .number()
                    .typeError("Taux de garantie must be a number")
                    .required("Taux de garantie is required"),
                TauxReserve: yup
                    .number()
                    .typeError("Taux de reserve must be a number")
                    .required("Taux de reserve is required"),
            })
        ),
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Particulières
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    console.log(values)
                    updateData(values)}}
                enableReinitialize
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
                  }) => {
                    // Expose a "submit" method to the parent component.
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            // Return true if there are no errors.
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    return (
                        <form onSubmit={handleSubmit}>
                            {/* Commissions Section */}
                            <FieldArray name="commissions">
                                {({ push, remove }) => (
                                    <Box mt={4}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <AttachMoneyIcon sx={{ mr: 1 }} />
                                            <Typography variant="h6">Commissions</Typography>
                                            <IconButton
                                                onClick={() =>
                                                    push({
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
                                                    })
                                                }
                                                color="success"
                                                sx={{ ml: 2 }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        {values.commissions.map((commission, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    border: "1px solid #ccc",
                                                    borderRadius: "8px",
                                                    padding: 4,
                                                    mb: 2,
                                                    position: "relative",
                                                }}
                                            >
                                                <IconButton
                                                    onClick={() => remove(index)}
                                                    color="error"
                                                    sx={{ position: "absolute", top: 5, right: 5 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            name={`commissions.${index}.TypeEvent`}
                                                            value={commission.TypeEvent?.id || ""} // Display the ID as the select value
                                                            onChange={(e) => {
                                                                const selectedId = e.target.value;
                                                                const selectedEvent = typeEvent.find((te) => te.id === selectedId);
                                                                setFieldValue(`commissions.${index}.TypeEvent`, selectedEvent);
                                                            }}
                                                            onBlur={handleBlur}
                                                            label="Type Evenement"
                                                            error={
                                                                touched?.commissions?.[index]?.TypeEvent &&
                                                                Boolean(errors?.commissions?.[index]?.TypeEvent)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.TypeEvent &&
                                                                errors?.commissions?.[index]?.TypeEvent
                                                            }
                                                        >
                                                            {eveLoading ? (
                                                                <MenuItem value="">Loading...</MenuItem>
                                                            ) : eveErr ? (
                                                                <MenuItem value="">Error loading options</MenuItem>
                                                            ) : (
                                                                typeEvent.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.dsg}
                                                                    </MenuItem>
                                                                ))
                                                            )}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            name={`commissions.${index}.TypeDocRemise`}
                                                            value={commission.TypeDocRemise?.id || ""}
                                                            onChange={(e) => {
                                                                const selectedId = e.target.value;
                                                                const selectedDoc = typeDoc.find((td) => td.id === selectedId);
                                                                setFieldValue(`commissions.${index}.TypeDocRemise`, selectedDoc);
                                                            }}
                                                            onBlur={handleBlur}
                                                            label="Type Document"
                                                            error={
                                                                touched?.commissions?.[index]?.TypeDocRemise &&
                                                                Boolean(errors?.commissions?.[index]?.TypeDocRemise)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.TypeDocRemise &&
                                                                errors?.commissions?.[index]?.TypeDocRemise
                                                            }
                                                        >
                                                            {docLoading ? (
                                                                <MenuItem value="">Loading...</MenuItem>
                                                            ) : docErr ? (
                                                                <MenuItem value="">Error loading options</MenuItem>
                                                            ) : (
                                                                typeDoc.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.dsg}
                                                                    </MenuItem>
                                                                ))
                                                            )}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            name={`commissions.${index}.TypeCommission`}
                                                            value={commission.TypeCommission?.id || ""}
                                                            onChange={(e) => {
                                                                const selectedId = e.target.value;
                                                                const selectedCommission = typeCommission.find((tc) => tc.id === selectedId);
                                                                setFieldValue(`commissions.${index}.TypeCommission`, selectedCommission);
                                                            }}
                                                            onBlur={handleBlur}
                                                            label="Type Commission"
                                                            error={
                                                                touched?.commissions?.[index]?.TypeCommission &&
                                                                Boolean(errors?.commissions?.[index]?.TypeCommission)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.TypeCommission &&
                                                                errors?.commissions?.[index]?.TypeCommission
                                                            }
                                                        >
                                                            {comLoading ? (
                                                                <MenuItem value="">Loading...</MenuItem>
                                                            ) : comErr ? (
                                                                <MenuItem value="">Error loading options</MenuItem>
                                                            ) : (
                                                                typeCommission.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.dsg}
                                                                    </MenuItem>
                                                                ))
                                                            )}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            name={`commissions.${index}.Periodicite`}
                                                            value={commission.Periodicite}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Periodicité"
                                                            error={
                                                                touched?.commissions?.[index]?.Periodicite &&
                                                                Boolean(errors?.commissions?.[index]?.Periodicite)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.Periodicite &&
                                                                errors?.commissions?.[index]?.Periodicite
                                                            }
                                                        >
                                                            {periodicites.map((option) => (
                                                                <MenuItem key={option} value={option}>
                                                                    {option}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.Minorant`}
                                                            value={commission.Minorant}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Minorant"
                                                            type="number"
                                                            error={
                                                                touched?.commissions?.[index]?.Minorant &&
                                                                Boolean(errors?.commissions?.[index]?.Minorant)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.Minorant &&
                                                                errors?.commissions?.[index]?.Minorant
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.Majorant`}
                                                            value={commission.Majorant}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Majorant"
                                                            type="number"
                                                            error={
                                                                touched?.commissions?.[index]?.Majorant &&
                                                                Boolean(errors?.commissions?.[index]?.Majorant)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.Majorant &&
                                                                errors?.commissions?.[index]?.Majorant
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.ValidDateDeb`}
                                                            value={commission.ValidDateDeb}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Valid From (Date)"
                                                            type="date"
                                                            InputLabelProps={{ shrink: true }}
                                                            error={
                                                                touched?.commissions?.[index]?.ValidDateDeb &&
                                                                Boolean(errors?.commissions?.[index]?.ValidDateDeb)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.ValidDateDeb &&
                                                                errors?.commissions?.[index]?.ValidDateDeb
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.ValidDateFin`}
                                                            value={commission.ValidDateFin}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Valid To (Date)"
                                                            type="date"
                                                            InputLabelProps={{ shrink: true }}
                                                            error={
                                                                touched?.commissions?.[index]?.ValidDateFin &&
                                                                Boolean(errors?.commissions?.[index]?.ValidDateFin)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.ValidDateFin &&
                                                                errors?.commissions?.[index]?.ValidDateFin
                                                            }
                                                        />
                                                    </Grid>
                                                    {/* If needed, you can add fields for CommA, CommX, and CommB here */}
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.CommA`}
                                                            value={commission.CommA}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Commission A"
                                                            type="number"
                                                            error={
                                                                touched?.commissions?.[index]?.CommA &&
                                                                Boolean(errors?.commissions?.[index]?.CommA)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.CommA &&
                                                                errors?.commissions?.[index]?.CommA
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.CommX`}
                                                            value={commission.CommX}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Commission X"
                                                            type="number"
                                                            error={
                                                                touched?.commissions?.[index]?.CommX &&
                                                                Boolean(errors?.commissions?.[index]?.CommX)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.CommX &&
                                                                errors?.commissions?.[index]?.CommX
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`commissions.${index}.CommB`}
                                                            value={commission.CommB}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Commission B"
                                                            type="number"
                                                            error={
                                                                touched?.commissions?.[index]?.CommB &&
                                                                Boolean(errors?.commissions?.[index]?.CommB)
                                                            }
                                                            helperText={
                                                                touched?.commissions?.[index]?.CommB &&
                                                                errors?.commissions?.[index]?.CommB
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </FieldArray>

                            {/* Frais de Financement Section */}
                            <FieldArray name="fondGaranti">
                                {({ push, remove }) => (
                                    <Box mt={4}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <CreditCardIcon sx={{ mr: 1 }} />
                                            <Typography variant="h6">Fonds de Garantie</Typography>
                                            <IconButton
                                                onClick={() =>
                                                    push({
                                                        TauxGarantie: "",
                                                        TauxReserve: "",
                                                    })
                                                }
                                                color="success"
                                                sx={{ ml: 2 }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        {values.fondGaranti.map((frais, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    border: "1px solid #ccc",
                                                    borderRadius: "8px",
                                                    padding: 4,
                                                    mb: 2,
                                                    position: "relative",
                                                }}
                                            >
                                                <IconButton
                                                    onClick={() => remove(index)}
                                                    color="error"
                                                    sx={{ position: "absolute", top: 12, right: 12 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`fondGaranti.${index}.TauxGarantie`}
                                                            value={frais.TauxGarantie}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Taux de garantie"
                                                            type="number"
                                                            error={
                                                                touched?.fondGaranti?.[index]?.TauxGarantie &&
                                                                Boolean(errors?.fondGaranti?.[index]?.TauxGarantie)
                                                            }
                                                            helperText={
                                                                touched?.fondGaranti?.[index]?.TauxGarantie &&
                                                                errors?.fondGaranti?.[index]?.TauxGarantie
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            name={`fondGaranti.${index}.TauxReserve`}
                                                            value={frais.TauxReserve}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            label="Taux de reserve"
                                                            type="number"
                                                            error={
                                                                touched?.fondGaranti?.[index]?.TauxReserve &&
                                                                Boolean(errors?.fondGaranti?.[index]?.TauxReserve)
                                                            }
                                                            helperText={
                                                                touched?.fondGaranti?.[index]?.TauxReserve &&
                                                                errors?.fondGaranti?.[index]?.TauxReserve
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </FieldArray>

                            {/* Fond Garanti Field */}

                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionsParticulieres;