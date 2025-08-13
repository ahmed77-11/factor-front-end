import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    useTheme,
} from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import Header from '../../components/Header.jsx';
import { tokens } from '../../theme.js';
import { Autocomplete } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getPM
} from '../../redux/personne/PersonneMoraleSlice.js';
import {
    getMereFilialeById,
    updateMereFiliale,
} from '../../redux/MereFiliale/MereFilialeSlice.js';

// Helper to format ISO datetime to yyyy-MM-dd
const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    // If it's a Date object or string, extract first 10 chars
    return isoString.toString().substring(0, 10);
};

const validationSchema = yup.object().shape({
    filiale: yup.object().required('Sélection requise').nullable(),
    entryDate: yup.string().required("Date d'entrée requise"),
    expireDate: yup
        .string()
        .required("Date d'expiration requise")
        .test(
            'is-greater',
            "La date d'expiration doit être postérieure à la date d'entrée",
            function (value) {
                const { entryDate } = this.parent;
                if (!value || !entryDate) return true;
                return new Date(value) > new Date(entryDate);
            }
        ),
    infoLibre: yup.string().max(64, '64 caractères max'),
    factorTauxFin: yup
        .number()
        .typeError("Le taux doit être un nombre")
        .required("Taux requis")
        .min(0, "Taux ≥ 0")
        .test(
            "max-100",
            "Le taux doit être strictement inférieur à 100",
            (value) => value === undefined || value < 100
        )
        .test(
            "max-decimals",
            "Max 5 chiffres après la virgule",
            (value) => {
                if (value === undefined || value === null) return true;
                return /^\d+(\.\d{1,5})?$/.test(value.toString());
            }
        )
});

const UpdateMereFilialeForm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { personneMorales, loading: loadingPM } = useSelector(
        (state) => state.personneMorale
    );
    const { currentMereFiliale: currentRelation, loadingMereFiliale: loadingRelation } = useSelector(
        (state) => state.mereFiliale
    );

    const [initialValues, setInitialValues] = useState({
        filiale: null,
        mere: null,
        entryDate: '',
        expireDate: '',
        infoLibre: '',
        factorTauxFin: '',
    });

    useEffect(() => {
        dispatch(getPM());
        dispatch(getMereFilialeById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentRelation) {
            const filialeOpt = {
                id: currentRelation.filiale.id,
                label: currentRelation.filiale.raisonSocial || `${currentRelation.filiale.nom} ${currentRelation.filiale.prenom}`,
                object: currentRelation.filiale,
            };
            const mereOpt = {
                id: currentRelation.mere.id,
                label: currentRelation.mere.raisonSocial || `${currentRelation.mere.nom} ${currentRelation.mere.prenom}`,
                object: currentRelation.mere,
            };
            setInitialValues({
                filiale: filialeOpt,
                mere: mereOpt,
                entryDate: formatDateForInput(currentRelation.entryDate),
                expireDate: formatDateForInput(currentRelation.expireDate),
                infoLibre: currentRelation.infoLibre || '',
                factorTauxFin: String(currentRelation.factorTauxFin),
            });
        }
    }, [currentRelation]);

    const convertToAutocompleteOptions = (data) =>
        data.map((pm) => ({
            id: pm.id,
            label: pm.raisonSocial || `${pm.nom} ${pm.prenom}`,
            object: pm,
        }));

    const inputFontSize = '0.8rem';
    const labelFontSize = '0.9rem';
    const helperFontSize = '0.7rem';

    return (
        <Box m="20px">
            <Header title="Mère-Filiale" subtitle="Modifier une relation mère-filiale" />
            <Card
                sx={{
                    p: 3,
                    boxShadow: 5,
                    borderRadius: 3,
                    backgroundColor: colors.primary[900],
                }}
            >
                <CardContent>
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            const payload = {
                                id,
                                filiale: values.filiale.object,
                                mere: values.mere.object,
                                entryDate: values.entryDate,
                                expireDate: values.expireDate,
                                infoLibre: values.infoLibre,
                                factorTauxFin: parseFloat(values.factorTauxFin),
                            };
                            dispatch(updateMereFiliale(payload,id, navigate));
                        }}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              setFieldValue,
                          }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    <Box display="flex" gap="20px" flexWrap="wrap">
                                        <Box flex="1" minWidth="240px">
                                            <Typography fontWeight="bold" fontSize={labelFontSize} mb={1}>
                                                Mère
                                            </Typography>
                                            <Autocomplete
                                                options={convertToAutocompleteOptions(personneMorales || [])}
                                                getOptionLabel={(option) => option.label}
                                                value={values.mere}
                                                disabled
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        InputLabelProps={{ style: { fontSize: labelFontSize } }}
                                                        InputProps={{ ...params.InputProps, style: { fontSize: inputFontSize } }}
                                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        <Box flex="1" minWidth="240px">
                                            <Typography fontWeight="bold" fontSize={labelFontSize} mb={1}>
                                                Filiale
                                            </Typography>
                                            <Autocomplete
                                                options={
                                                    convertToAutocompleteOptions(
                                                        personneMorales?.filter(
                                                            (pm) => pm.id !== values.mere?.id
                                                        ) || []
                                                    )
                                                }
                                                getOptionLabel={(option) => option.label}
                                                value={values.filiale}
                                                onChange={(e, val) => setFieldValue('filiale', val)}
                                                disabled={loadingPM || loadingRelation}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        error={!!touched.filiale && !!errors.filiale}
                                                        helperText={touched.filiale && errors.filiale?.label}
                                                        InputLabelProps={{ style: { fontSize: labelFontSize } }}
                                                        InputProps={{ ...params.InputProps, style: { fontSize: inputFontSize } }}
                                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography fontWeight="bold" fontSize={labelFontSize}>
                                        Date entrée
                                    </Typography>
                                    <TextField
                                        label="Date d'entrée"
                                        name="entryDate"
                                        type="date"
                                        fullWidth
                                        value={values.entryDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.entryDate && !!errors.entryDate}
                                        helperText={touched.entryDate && errors.entryDate}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />
                                    <Typography fontWeight="bold" fontSize={labelFontSize}>
                                        Date expiration
                                    </Typography>
                                    <TextField
                                        label="Date d'expiration"
                                        name="expireDate"
                                        type="date"
                                        fullWidth
                                        value={values.expireDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.expireDate && !!errors.expireDate}
                                        helperText={touched.expireDate && errors.expireDate}
                                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />
                                    <Typography fontWeight="bold" fontSize={labelFontSize}>
                                        Info libre
                                    </Typography>
                                    <TextField
                                        label="Information libre"
                                        name="infoLibre"
                                        fullWidth
                                        value={values.infoLibre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.infoLibre && !!errors.infoLibre}
                                        helperText={touched.infoLibre && errors.infoLibre}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />
                                    <Typography fontWeight="bold" fontSize={labelFontSize}>
                                        Factor taux fin
                                    </Typography>
                                    <TextField
                                        label="Taux financier"
                                        name="factorTauxFin"
                                        fullWidth
                                        value={values.factorTauxFin}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.factorTauxFin && !!errors.factorTauxFin}
                                        helperText={touched.factorTauxFin && errors.factorTauxFin}
                                        InputProps={{ style: { fontSize: inputFontSize } }}
                                        InputLabelProps={{ style: { fontSize: labelFontSize } }}
                                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                                    />
                                    <Box display="flex" justifyContent="center" mt={2}>
                                        <Button type="submit" variant="contained" color="secondary">
                                            Mettre à jour
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateMereFilialeForm;
