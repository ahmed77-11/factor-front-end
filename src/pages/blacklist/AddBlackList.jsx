// src/pages/Blacklist/AddBlackList.jsx
import React from "react";
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Autocomplete,
    useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useTypePieceId } from "../../customeHooks/useTypePieceId.jsx";
import { useNationalite } from "../../customeHooks/useNationalite.jsx";
import { addBlackList } from "../../redux/blacklist/blackListSlice.js";
import {validateRNE} from "../../helpers/ValidationHelper.jsx";

const validationSchema = yup.object().shape({
    typePieceId: yup.object().nullable().required("Type de pièce requis"),
    pieceIdentiteNo: yup
        .string()
        .required("Numéro de pièce requis")
        .max(20)
        .test('type-based-validation', 'Numéro de pièce invalide', function (value) {
            const { typePieceId } = this.parent;
            if (!typePieceId) return true; // Skip validation if no type selected

            const typeDsg = typePieceId.dsg;

            if (typeDsg === 'RNE' || typeDsg === 'PATENTE') {
                const isValid = validateRNE(value);
                if (!isValid) {
                    return this.createError({
                        message: typeDsg === 'RNE' ? 'RNE invalide' : 'PATENTE invalide',
                    });
                }
                return true;
            } else if (typeDsg === 'CIN') {
                const isValid = /^\d{8}$/.test(value);
                if ((!isValid) && (value.length === 8)) {
                    return this.createError({ message: 'CIN invalide' });
                }else if (value.length !== 8) {
                    return this.createError({ message: 'CIN doit contenir 8 chiffres' });
                }else {
                    return true;
                }
            }

            return true; // No special validation for other types
        }),
    nom: yup.string().required("Nom requis").max(64),
    prenom: yup.string().required("Prénom requis").max(64),
    naissanceDate: yup.date().nullable(),
    naissanceLieu: yup.string().max(64),
    adresse: yup.string().max(64),
    nationalite: yup.object().nullable(),
    justif: yup.string().max(255),
    date: yup.date().nullable(),
    decision: yup.string().max(20),
    pubWebDate: yup.date().nullable(),
    majDate: yup.date().required("Date de mise à jour requise"),
    importDate: yup.date().required("Date d'import requise"),
});

const AddBlackList = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loadingBlackList, errorBlackList } = useSelector(
        (state) => state.blackList
    );

    const {
        typePieceId:typePieceList,
        loading: loadingTypes,
        error: errorTypes,
    } = useTypePieceId();

    const {
        nationalites,
        loading: loadingNats,
        error: errorNats,
    } = useNationalite();

    const initialValues = {
        typePieceId: null,
        pieceIdentiteNo: "",
        nom: "",
        prenom: "",
        naissanceDate: "",
        naissanceLieu: "",
        adresse: "",
        nationalite: null,
        justif: "",
        date: "",
        decision: "",
        pubWebDate: "",
        majDate: "",
        importDate: "",
    };

    const handleSubmit = (values) => {
        const payload = {
            typePieceId: values.typePieceId,
            pieceIdentiteNo: values.pieceIdentiteNo,
            nom: values.nom,
            prenom: values.prenom,
            naissanceDate: values.naissanceDate,
            naissanceLieu: values.naissanceLieu,
            adresse: values.adresse,
            nationalite: values.nationalite ?? null,
            justif: values.justif,
            date: values.date,
            decision: values.decision,
            pubWebDate: values.pubWebDate,
            majDate: values.majDate,
            importDate: values.importDate,
        };
        dispatch(addBlackList(payload, navigate));
    };

    return (
        <Box m="20px">
            <Header
                title="Blacklist"
                subtitle="Ajouter une personne à la liste noire"
            />
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
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
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
                                    {/* Type de pièce */}
                                    <Autocomplete
                                        options={typePieceList || []}
                                        getOptionLabel={(opt) => opt.dsg}
                                        value={values.typePieceId}
                                        onChange={(e, val) => setFieldValue("typePieceId", val)}
                                        disabled={loadingTypes || !!errorTypes}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Type de pièce"
                                                error={!!touched.typePieceId && !!errors.typePieceId}
                                                helperText={
                                                    loadingTypes
                                                        ? "Chargement des types…"
                                                        : errorTypes
                                                            ? "Erreur de chargement"
                                                            : touched.typePieceId && errors.typePieceId?.message
                                                }
                                            />
                                        )}
                                    />

                                    {/* Numéro de pièce */}
                                    <TextField
                                        name="pieceIdentiteNo"
                                        label="Numéro de pièce"
                                        value={values.pieceIdentiteNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={
                                            !!touched.pieceIdentiteNo && !!errors.pieceIdentiteNo
                                        }
                                        helperText={
                                            touched.pieceIdentiteNo && errors.pieceIdentiteNo
                                        }
                                    />

                                    {/* Nom / Prénom */}
                                    <TextField
                                        name="nom"
                                        label="Nom"
                                        value={values.nom}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.nom && !!errors.nom}
                                        helperText={touched.nom && errors.nom}
                                    />
                                    <TextField
                                        name="prenom"
                                        label="Prénom"
                                        value={values.prenom}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.prenom && !!errors.prenom}
                                        helperText={touched.prenom && errors.prenom}
                                    />

                                    {/* Date & Lieu de naissance */}
                                    <TextField
                                        name="naissanceDate"
                                        label="Date de naissance"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={values.naissanceDate}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        name="naissanceLieu"
                                        label="Lieu de naissance"
                                        value={values.naissanceLieu}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={
                                            !!touched.naissanceLieu && !!errors.naissanceLieu
                                        }
                                        helperText={touched.naissanceLieu && errors.naissanceLieu}
                                    />

                                    {/* Adresse */}
                                    <TextField
                                        name="adresse"
                                        label="Adresse"
                                        value={values.adresse}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.adresse && !!errors.adresse}
                                        helperText={touched.adresse && errors.adresse}
                                    />

                                    {/* Nationalité */}
                                    <Autocomplete
                                        options={nationalites}
                                        getOptionLabel={(opt) => opt.codeDsg}
                                        value={values.nationalite}
                                        onChange={(e, val) => setFieldValue("nationalite", val)}
                                        disabled={loadingNats || !!errorNats}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Nationalité"
                                                error={!!touched.nationalite && !!errors.nationalite}
                                                helperText={
                                                    loadingNats
                                                        ? "Chargement…"
                                                        : errorNats
                                                            ? "Erreur de chargement"
                                                            : touched.nationalite &&
                                                            errors.nationalite?.message
                                                }
                                            />
                                        )}
                                    />

                                    {/* Justification */}
                                    <TextField
                                        name="justif"
                                        label="Justification"
                                        multiline
                                        value={values.justif}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.justif && !!errors.justif}
                                        helperText={touched.justif && errors.justif}
                                    />

                                    {/* Décision & Dates */}
                                    <TextField
                                        name="date"
                                        label="Date de la décision"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={values.date}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        name="decision"
                                        label="Décision"
                                        value={values.decision}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!touched.decision && !!errors.decision}
                                        helperText={touched.decision && errors.decision}
                                    />
                                    <TextField
                                        name="pubWebDate"
                                        label="Date de publication web"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={values.pubWebDate}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        name="majDate"
                                        label="Date de mise à jour"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={values.majDate}
                                        onChange={handleChange}
                                        error={!!touched.majDate && !!errors.majDate}
                                        helperText={touched.majDate && errors.majDate}
                                    />
                                    <TextField
                                        name="importDate"
                                        label="Date d'import"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={values.importDate}
                                        onChange={handleChange}
                                        error={!!touched.importDate && !!errors.importDate}
                                        helperText={touched.importDate && errors.importDate}
                                    />

                                    {/* Submission */}
                                    {errorBlackList && (
                                        <Box color="error.main">{errorBlackList}</Box>
                                    )}
                                    <Box textAlign="center" mt={2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="secondary"
                                            disabled={loadingBlackList}
                                        >
                                            {loadingBlackList
                                                ? "Enregistrement…"
                                                : "Ajouter à la blacklist"}
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

export default AddBlackList;
