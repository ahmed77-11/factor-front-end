// /* eslint-disable no-unused-vars,react/prop-types,react/display-name */
// import { forwardRef, useEffect } from "react";
// import { Box, TextField, MenuItem, Typography } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import { Formik } from "formik";
// import * as yup from "yup";
// import { useTypeFactoring } from "../../../../../customeHooks/useTypeFactoring.jsx";
// import { useDispatch } from "react-redux";
// import { setFormData } from "../../../../../redux/formSteperSlice/FormSlice.js";
//
// const contratOptions = [
//     { label: "Contrat avec recours", value: true },
//     { label: "Contrat sans recours", value: false },
// ];
//
// const ConditionGenerale1 = forwardRef(({ formData, updateData, data }, ref) => {
//     const { typeFactorings, loading, error } = useTypeFactoring();
//     const dispatch = useDispatch();
//
//     const initialValues = {
//         NumContrat: formData?.NumContrat || data?.notificationContratId?.contratNo || "",
//         typeFactoring: formData?.typeFactoring || data?.notificationContratId?.typeFactoring || {},
//         typeContrat: formData?.typeContrat ?? data?.notificationContratId?.contratBoolRecours ?? null,
//         comiteRisque: formData?.comiteRisque || data?.notificationContratId?.contratComiteRisqueTexte || "",
//         comiteDerogation: formData?.comiteDerogation || data?.notificationContratId?.contratComiteDerogTexte || "",
//     };
//
//     const validationSchema = yup.object().shape({
//         NumContrat: yup.string().required("Le numéro de contrat est requis"),
//         typeFactoring: yup.object().required("Le type de factoring est requis"),
//         typeContrat: yup
//             .boolean()
//             .typeError("Le type de contrat est requis")
//             .required("Le type de contrat est requis"),
//         comiteRisque: yup.string().required("Le comité de risque est requis"),
//         comiteDerogation: yup.string().required("Le comité de dérogation est requis"),
//     });
//
//     return (
//         <Box width="100%" maxWidth="800px" p={3}>
//             <Typography variant="h6" mb={2}>
//                 Conditions Générales 1
//             </Typography>
//             <Formik
//                 initialValues={initialValues}
//                 validationSchema={validationSchema}
//                 enableReinitialize
//                 onSubmit={(values) => updateData(values)}
//             >
//                 {({ values, errors, touched, setFieldValue }) => {
//                     useEffect(() => {
//                         dispatch(setFormData(values));
//                     }, [values, dispatch]);
//
//                     return (
//                         <form>
//                             {/* Numéro de contrat */}
//                             <Box mb={2}>
//                                 <Typography>Numéro de contrat</Typography>
//                                 <Box position="relative">
//                                     <TextField
//                                         fullWidth
//                                         name="NumContrat"
//                                         value={values.NumContrat}
//                                         disabled
//                                         error={Boolean(touched.NumContrat && errors.NumContrat)}
//                                         helperText={touched.NumContrat && errors.NumContrat}
//                                     />
//                                     <Box sx={{
//                                         position: 'absolute',
//                                         right: 8,
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         color: 'action.active'
//                                     }}>
//                                         <EditIcon fontSize="small" />
//                                     </Box>
//                                 </Box>
//                             </Box>
//
//                             {/* Type de factoring */}
//                             <Box mb={2}>
//                                 <Typography>Type de factoring</Typography>
//                                 <Box position="relative">
//                                     <TextField
//                                         select
//                                         fullWidth
//                                         name="typeFactoring"
//                                         value={values.typeFactoring?.id || ""}
//                                         disabled
//                                         error={Boolean(touched.typeFactoring && errors.typeFactoring)}
//                                         helperText={touched.typeFactoring && errors.typeFactoring}
//                                     >
//                                         <MenuItem value="">Sélectionnez un type de factoring</MenuItem>
//                                         {loading ? (
//                                             <MenuItem disabled>Loading...</MenuItem>
//                                         ) : error ? (
//                                             <MenuItem disabled>Error loading options</MenuItem>
//                                         ) : (
//                                             typeFactorings.map((item) => (
//                                                 <MenuItem key={item.id} value={item.id}>
//                                                     {item.dsg}
//                                                 </MenuItem>
//                                             ))
//                                         )}
//                                     </TextField>
//                                     <Box sx={{
//                                         position: 'absolute',
//                                         right: 8,
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         color: 'action.active'
//                                     }}>
//                                         <EditIcon fontSize="small" />
//                                     </Box>
//                                 </Box>
//                             </Box>
//
//                             {/* Type de contrat */}
//                             <Box mb={2}>
//                                 <Typography>Type de contrat</Typography>
//                                 <Box position="relative">
//                                     <TextField
//                                         select
//                                         fullWidth
//                                         name="typeContrat"
//                                         value={values.typeContrat === null ? "" : values.typeContrat.toString()}
//                                         disabled
//                                         error={Boolean(touched.typeContrat && errors.typeContrat)}
//                                         helperText={touched.typeContrat && errors.typeContrat}
//                                     >
//                                         <MenuItem value="">Sélectionnez un type de contrat</MenuItem>
//                                         {contratOptions.map((option) => (
//                                             <MenuItem key={option.label} value={option.value.toString()}>
//                                                 {option.label}
//                                             </MenuItem>
//                                         ))}
//                                     </TextField>
//                                     <Box sx={{
//                                         position: 'absolute',
//                                         right: 8,
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         color: 'action.active'
//                                     }}>
//                                         <EditIcon fontSize="small" />
//                                     </Box>
//                                 </Box>
//                             </Box>
//
//                             {/* Comité de risque */}
//                             <Box mb={2}>
//                                 <Typography>Comité de risque</Typography>
//                                 <Box position="relative">
//                                     <TextField
//                                         fullWidth
//                                         name="comiteRisque"
//                                         value={values.comiteRisque}
//                                         disabled
//                                         error={Boolean(touched.comiteRisque && errors.comiteRisque)}
//                                         helperText={touched.comiteRisque && errors.comiteRisque}
//                                     />
//                                     <Box sx={{
//                                         position: 'absolute',
//                                         right: 8,
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         color: 'action.active'
//                                     }}>
//                                         <EditIcon fontSize="small" />
//                                     </Box>
//                                 </Box>
//                             </Box>
//
//                             {/* Comité de dérogation */}
//                             <Box mb={2}>
//                                 <Typography>Comité de dérogation</Typography>
//                                 <Box position="relative">
//                                     <TextField
//                                         fullWidth
//                                         name="comiteDerogation"
//                                         value={values.comiteDerogation}
//                                         disabled
//                                         error={Boolean(touched.comiteDerogation && errors.comiteDerogation)}
//                                         helperText={touched.comiteDerogation && errors.comiteDerogation}
//                                     />
//                                     <Box sx={{
//                                         position: 'absolute',
//                                         right: 8,
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         color: 'action.active'
//                                     }}>
//                                         <EditIcon fontSize="small" />
//                                     </Box>
//                                 </Box>
//                             </Box>
//                         </form>
//                     );
//                 }}
//             </Formik>
//         </Box>
//     );
// });
//
// export default ConditionGenerale1;
/* eslint-disable no-unused-vars,react/prop-types,react/display-name */
import { forwardRef, useEffect } from "react";
import { Box, TextField, MenuItem, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Formik } from "formik";
import * as yup from "yup";
import { useTypeFactoring } from "../../../../../customeHooks/useTypeFactoring.jsx";
import { useDispatch } from "react-redux";
import { setFormData } from "../../../../../redux/formSteperSlice/FormSlice.js";
import NotesDescription from "../../../../../helpers/NotesDescription.jsx";

const contratOptions = [
    { label: "Contrat avec recours", value: true },
    { label: "Contrat sans recours", value: false },
];

const ConditionGenerale1 = forwardRef(({ formData, updateData, data, handleOpenNoteModal, description }, ref) => {
    const { typeFactorings, loading, error } = useTypeFactoring();
    const dispatch = useDispatch();

    const initialValues = {
        NumContrat: formData?.NumContrat || data?.notificationContratId?.contratNo || "",
        typeFactoring: formData?.typeFactoring || data?.notificationContratId?.typeFactoring || {},
        typeContrat: formData?.typeContrat ?? data?.notificationContratId?.contratBoolRecours ?? null,
        comiteRisque: formData?.comiteRisque || data?.notificationContratId?.contratComiteRisqueTexte || "",
        comiteDerogation: formData?.comiteDerogation || data?.notificationContratId?.contratComiteDerogTexte || "",
    };

    const validationSchema = yup.object().shape({
        NumContrat: yup.string().required("Le numéro de contrat est requis"),
        typeFactoring: yup.object().required("Le type de factoring est requis"),
        typeContrat: yup
            .boolean()
            .typeError("Le type de contrat est requis")
            .required("Le type de contrat est requis"),
        comiteRisque: yup.string().required("Le comité de risque est requis"),
        comiteDerogation: yup.string().required("Le comité de dérogation est requis"),
    });

    return (
        <Box width="100%" maxWidth="800px" p={3}>
            <Typography variant="h6" mb={2}>
                Conditions Générales 1
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => updateData(values)}
            >
                {({ values, errors, touched, setFieldValue }) => {
                    useEffect(() => {
                        dispatch(setFormData(values));
                    }, [values, dispatch]);

                    return (
                        <form>
                            {/* Numéro de contrat */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Numéro de contrat</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('NumContrat')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="NumContrat"
                                    value={values.NumContrat}
                                    disabled
                                    error={Boolean(touched.NumContrat && errors.NumContrat)}
                                    helperText={touched.NumContrat && errors.NumContrat}
                                />
                                {description.NumContrat && (
                                    <NotesDescription msg={description.NumContrat}/>
                                )}
                            </Box>

                            {/* Type de factoring */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Type de factoring</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('typeFactoring')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeFactoring"
                                    value={values.typeFactoring?.id || ""}
                                    disabled
                                    error={Boolean(touched.typeFactoring && errors.typeFactoring)}
                                    helperText={touched.typeFactoring && errors.typeFactoring}
                                >
                                    <MenuItem value="">Sélectionnez un type de factoring</MenuItem>
                                    {loading ? (
                                        <MenuItem disabled>Loading...</MenuItem>
                                    ) : error ? (
                                        <MenuItem disabled>Error loading options</MenuItem>
                                    ) : (
                                        typeFactorings.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.dsg}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                                {description.typeFactoring && (
                                    <NotesDescription msg={description.typeFactoring}/>
                                )}
                            </Box>

                            {/* Type de contrat */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Type de contrat</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('typeContrat')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TextField
                                    select
                                    fullWidth
                                    name="typeContrat"
                                    value={values.typeContrat === null ? "" : values.typeContrat.toString()}
                                    disabled
                                    error={Boolean(touched.typeContrat && errors.typeContrat)}
                                    helperText={touched.typeContrat && errors.typeContrat}
                                >
                                    <MenuItem value="">Sélectionnez un type de contrat</MenuItem>
                                    {contratOptions.map((option) => (
                                        <MenuItem key={option.label} value={option.value.toString()}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {description.typeContrat && (
                                    <NotesDescription msg={description.typeContrat}/>
                                )}
                            </Box>

                            {/* Comité de risque */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Comité de risque</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('comiteRisque')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="comiteRisque"
                                    value={values.comiteRisque}
                                    disabled
                                    error={Boolean(touched.comiteRisque && errors.comiteRisque)}
                                    helperText={touched.comiteRisque && errors.comiteRisque}
                                />
                                {description.comiteRisque && (
                                    <NotesDescription msg={description.comiteRisque}/>
                                )}
                            </Box>

                            {/* Comité de dérogation */}
                            <Box mb={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography>Comité de dérogation</Typography>
                                    <IconButton
                                        onClick={() => handleOpenNoteModal('comiteDerogation')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="comiteDerogation"
                                    value={values.comiteDerogation}
                                    disabled
                                    error={Boolean(touched.comiteDerogation && errors.comiteDerogation)}
                                    helperText={touched.comiteDerogation && errors.comiteDerogation}
                                />
                                {description.comiteDerogation && (
                                    <NotesDescription msg={description.comiteDerogation}/>
                                )}
                            </Box>
                        </form>
                    );
                }}
            </Formik>
        </Box>
    );
});

export default ConditionGenerale1;