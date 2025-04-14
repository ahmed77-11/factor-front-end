/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */


import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { Box, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../redux/formSteperSlice/FormSlice.js";
import NotesDescription from "../../../../helpers/NotesDescription.jsx";
import { useTmm } from "../../../../customeHooks/useTmm.jsx"; // Assuming useTmm is available

const iconStyle = {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'action.active'
};

const DisabledField = ({ children }) => (
    <Box position="relative">
        {children}
    </Box>
);

const ConditionGenerale3 = forwardRef(({ formData, updateData, data, handleOpenNoteModal, description }, ref) => {
    const dispatch = useDispatch();
    const { tmms, loading, error } = useTmm(); // Assuming tmms is fetched using useTmm hook

    const [currentTmm, setCurrentTmm] = useState(null);

    useEffect(() => {
        if (tmms.length > 0 && formData?.tmm) {
            const foundTmm = tmms.find(t => t.id.toString() === formData?.tmm);
            setCurrentTmm(foundTmm || null);
        }
    }, [tmms, formData?.tmm]);

    const initialValues = {
        tmm: formData?.tmm || data?.tmm?.toString() || "",
        tmmText: formData?.tmmText || data?.contratTmm?.toString() || "",
        resiliation: formData?.resiliation || data?.contratResiliationTexte || "",
        dateRevision: formData?.dateRevision || data?.contratRevisionDate?.split('T')[0] || "",
        dateResiliation: formData?.dateResiliation || data?.contratResiliationDate?.split('T')[0] || "",
    };

    const validationSchema = yup.object().shape({
        tmm: yup.string().required("Veuillez sélectionner une option pour TMM"),
        tmmText: yup.string()
            .matches(/^\d+([,.]\d{2})?$/, "Le nombre doit être un entier ou avoir exactement 2 décimales (virgule ou point)")
            .required("Champ requis"),
        resiliation: yup.string(),
        dateRevision: yup
            .date()
            .required("Veuillez entrer une date valide pour Date de révision"),
        dateResiliation: yup
            .date()
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 3
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => updateData(values)}
                enableReinitialize
            >
                {({
                      values,
                      errors,
                      touched,
                      handleSubmit,
                      submitForm,
                      validateForm,
                  }) => {
                    useEffect(() => {
                        dispatch(setFormData(values));
                    }, [values, dispatch]);

                    useImperativeHandle(ref, () => ({
                        async submit() {
                            await submitForm();
                            const formErrors = await validateForm();
                            return Object.keys(formErrors).length === 0;
                        },
                    }));

                    return (
                        <form onSubmit={handleSubmit}>
                            {/* TMM field */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>TMM Date</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('tmm')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        select
                                        fullWidth
                                        name="tmm"
                                        value={values.tmm}
                                        disabled
                                        error={Boolean(touched.tmm && errors.tmm)}
                                        helperText={touched.tmm && errors.tmm}
                                    >
                                        {tmms.map((tmm) => (
                                            <MenuItem key={tmm.id} value={tmm.id.toString()}>
                                                {tmm.aaaaMm} {/* Assuming `aaaaMm` is the field you want to display */}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </DisabledField>
                                {description.tmm && (
                                    <NotesDescription msg={description.tmm} />
                                )}
                            </Box>

                            {/* TMM Texte field */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>TMM</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('tmmText')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="tmmText"
                                        value={values.tmmText}
                                        disabled
                                        error={Boolean(touched.tmmText && errors.tmmText)}
                                        helperText={touched.tmmText && errors.tmmText}
                                    />
                                </DisabledField>
                                {description.tmmText && (
                                    <NotesDescription msg={description.tmmText} />
                                )}
                            </Box>

                            {/* Résiliation */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Résiliation</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('resiliation')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="resiliation"
                                        value={values.resiliation}
                                        disabled
                                        error={Boolean(touched.resiliation && errors.resiliation)}
                                        helperText={touched.resiliation && errors.resiliation}
                                    />
                                </DisabledField>
                                {description.resiliation && (
                                    <NotesDescription msg={description.resiliation} />
                                )}
                            </Box>

                            {/* Date révision */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Date révision</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('dateRevision')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="dateRevision"
                                        type="date"
                                        value={values.dateRevision}
                                        disabled
                                        error={Boolean(touched.dateRevision && errors.dateRevision)}
                                        helperText={touched.dateRevision && errors.dateRevision}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </DisabledField>
                                {description.dateRevision && (
                                    <NotesDescription msg={description.dateRevision} />
                                )}
                            </Box>

                            {/* Date résiliation */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Date résiliation</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('dateResiliation')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <DisabledField>
                                    <TextField
                                        fullWidth
                                        name="dateResiliation"
                                        type="date"
                                        value={values.dateResiliation}
                                        disabled
                                        error={Boolean(touched.dateResiliation && errors.dateResiliation)}
                                        helperText={touched.dateResiliation && errors.dateResiliation}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </DisabledField>
                                {description.dateResiliation && (
                                    <NotesDescription msg={description.dateResiliation} />
                                )}
                            </Box>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale3;
