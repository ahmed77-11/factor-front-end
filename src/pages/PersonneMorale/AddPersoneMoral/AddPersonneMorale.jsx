    import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme, Alert} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import {useTypePieceId} from "../../../customeHooks/useTypePieceId.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {addPM} from "../../../redux/personne/PersonneMoraleSlice.js";
import {tokens} from "../../../theme.js";
import {validateRNE} from "../../../helpers/ValidationHelper.jsx";
import { useState } from "react";

// Only matriculeFiscal in Formik, other parts in local state
const initialValues = {
    numPieceIdentite: "",
    raisonSociale: "",
    sigle: "",
    adresse: "",
    ville: "",
    email: "",
    numTel: "",
    matriculeFiscal: "",
    typePieceId: "",
};

const validationSchema = yup.object().shape({
    numPieceIdentite: yup.string().when("typePieceId", (typePieceId, schema) => {
        if (!typePieceId) return schema.required("Le numéro de pièce d'identité est requis");
        return schema.required("Le numéro de pièce d'identité est requis")
            .test("rne-valid", "Numéro RNE non valide", value => validateRNE(value));
    }),
    raisonSociale: yup.string().required("La raison sociale est requise"),
    sigle: yup.string().required("Le sigle est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    ville: yup.string().required("La ville est requise"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    numTel: yup.string().required("Le numéro de téléphone est requis").matches(/^\d{8}$/, "Le numéro de téléphone doit comporter 8 chiffres"),
    matriculeFiscal: yup.string()
        .required("Matricule fiscal requis")
        .matches(/^[A-Za-z0-9]{8}\/[ABPFN]\/[MPC]\/[0-9]{3}$/, "Format invalide, doit être 8 caractères, '/', assujetti, '/', type personne, '/', 3 chiffres")
        .test("rne-valid", "Première partie RNE non valide", mf => {
            const part1 = mf?.split("/")[0];
            return validateRNE(part1);
        }),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
});

const AddPersonneMorale = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typePieceId: typePieceList, loading, error } = useTypePieceId();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {loadingPM,errorPM} = useSelector(state => state.personneMorale);

    // Local state for matricule parts
    const [mfPart1, setMfPart1] = useState("");
    const [mfTypeAssujetti, setMfTypeAssujetti] = useState("");
    const [mfTypePersonne, setMfTypePersonne] = useState("");
    const [mfPart4, setMfPart4] = useState("");

    const handleFormSubmit = (values, {resetForm}) => {
        const selectedType = typePieceList.find(item => item.id === Number(values.typePieceId));
        const payload = {
            numeroPieceIdentite: values.numPieceIdentite,
            raisonSocial: values.raisonSociale,
            sigle: values.sigle,
            adresse: values.adresse,
            ville: values.ville,
            email: values.email,
            telNo: values.numTel,
            matriculeFiscal: values.matriculeFiscal,
            typePieceIdentite: selectedType,
        };
        dispatch(addPM(payload, navigate));
        resetForm();
        setMfPart1(""); setMfTypeAssujetti(""); setMfTypePersonne(""); setMfPart4("");
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            {loadingPM && <div className="loader-overlay"><div className="loader"></div></div>}
            <Header title="Personnes Morale" subtitle="Créer une personne morale" />
            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3, backgroundColor: colors.primary[900] }}>
                <CardContent>
                    {errorPM && (<Box my={2}><Alert severity="error" sx={{fontSize:"14px"}}>{errorPM}</Alert></Box>)}
                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
                            <form onSubmit={handleSubmit}>
                                {/* Type piece identite select */}
                                <Box mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">TYPE PIECE IDENTITE</Typography>
                                    <TextField
                                        select fullWidth variant="outlined" name="typePieceId"
                                        value={values.typePieceId} onBlur={handleBlur} onChange={handleChange}
                                        error={!!touched.typePieceId && !!errors.typePieceId}
                                        helperText={touched.typePieceId && errors.typePieceId}
                                    >
                                        {loading ? (
                                            <MenuItem value="">Loading...</MenuItem>
                                        ) : error ? (
                                            <MenuItem value="">Error loading options</MenuItem>
                                        ) : (
                                            typePieceList.filter(item => item.pmTun).map(item => (
                                                <MenuItem key={item.id} value={item.id}>{item.dsg}</MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                </Box>

                                {/* Other standard fields */}
                                <Box display="flex" flexDirection="column" gap={2} mb={2}>
                                    {[
                                        {name: 'numPieceIdentite', label: 'Numéro Pièce Identité'},
                                        {name: 'raisonSociale', label: 'Raison Sociale'},
                                        {name: 'sigle', label: 'Sigle'},
                                        {name: 'adresse', label: 'Adresse'},
                                        {name: 'ville', label: 'Ville'},
                                        {name: 'email', label: 'Email'},
                                        {name: 'numTel', label: 'Numéro Téléphone'},
                                    ].map(field => (
                                        <Box key={field.name}>
                                            <Typography variant="subtitle1" fontWeight="bold">{field.label}</Typography>
                                            <TextField
                                                fullWidth variant="outlined" type={field.name === 'email' ? 'email' : 'text'}
                                                name={field.name} value={values[field.name]}
                                                onBlur={handleBlur} onChange={handleChange}
                                                error={!!touched[field.name] && !!errors[field.name]}
                                                helperText={touched[field.name] && errors[field.name]}
                                            />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Matricule Fiscal split into parts */}
                                <Box mb={2} display="flex" flexDirection="column" gap={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">Matricule Fiscal</Typography>
                                    <Box display="flex" gap={2} alignItems="center">
                                        <TextField
                                            label="8 caractères"
                                            value={mfPart1}
                                            onBlur={handleBlur}
                                            fullWidth={true}
                                            onChange={e => {
                                                setMfPart1(e.target.value);
                                                setFieldValue('matriculeFiscal', `${e.target.value}/${mfTypeAssujetti}/${mfTypePersonne}/${mfPart4}`);
                                            }}
                                            error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                        />
                                        <TextField select label="Assujetti" value={mfTypeAssujetti} onBlur={handleBlur} fullWidth={true} onChange={e => {
                                            setMfTypeAssujetti(e.target.value);
                                            setFieldValue('matriculeFiscal', `${mfPart1}/${e.target.value}/${mfTypePersonne}/${mfPart4}`);
                                        }}>
                                            {[{value: 'A', label: 'A : assujetti obligatoire'},
                                                {value: 'B', label: 'B : assujetti par option'},
                                                {value: 'P', label: 'P : assujetti partiel'},
                                                {value: 'F', label: 'F : assujetti forfaitaire'},
                                                {value: 'N', label: 'N : non assujetti'}]
                                                .map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </TextField>
                                        <TextField select label="Type Personne" fullWidth={true} value={mfTypePersonne} onBlur={handleBlur} onChange={e => {
                                            setMfTypePersonne(e.target.value);
                                            setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${e.target.value}/${mfPart4}`);
                                        }}>
                                            {[{value: 'M', label: 'M : personne morale'},
                                                // {value: 'P', label: 'P : personne physique profession libérale'},
                                                // {value: 'C', label: 'C : personne physique commerçante ou industrielle'}
                                                ]
                                                .map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            label="3 chiffres"
                                            value={mfPart4}
                                            fullWidth={true}
                                            onBlur={handleBlur}
                                            onChange={e => {
                                                setMfPart4(e.target.value);
                                                setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${mfTypePersonne}/${e.target.value}`);
                                            }}
                                            error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                            helperText={touched.matriculeFiscal && errors.matriculeFiscal}
                                        />
                                    </Box>
                                </Box>

                                <Box display="flex" justifyContent="center">
                                    <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2 }}>
                                        Créer une personne morale
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddPersonneMorale;
