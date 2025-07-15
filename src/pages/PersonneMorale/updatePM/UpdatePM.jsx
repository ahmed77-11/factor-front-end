import { useState, useEffect } from "react";
import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme, Alert} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPMById, updatePM } from "../../../redux/personne/PersonneMoraleSlice.js";
import { useTypePieceId } from "../../../customeHooks/useTypePieceId.jsx";
import { tokens } from "../../../theme.js";
import { validateRNE } from "../../../helpers/ValidationHelper.jsx";

const validationSchema = yup.object().shape({
    numeroPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
    raisonSocial: yup.string().required("La raison sociale est requise"),
    sigle: yup.string().required("Le sigle est requis"),
    adresse: yup.string().required("L'adresse est requise"),
    ville: yup.string().required("La ville est requise"),
    email: yup.string().email("Email invalide").required("L'email est requis"),
    telNo: yup.string()
        .required("Le numéro de téléphone est requis")
        .matches(/^\d{8}$/, "Le numéro de téléphone doit comporter 8 chiffres"),
    typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
    matriculeFiscal: yup.string()
        .required("Matricule fiscal requis")
        .matches(/^[A-Za-z0-9]{8}\/[ABPFN]\/[MPC]\/[0-9]{3}$/, "Format invalide: 8 chars/RNE, '/', assujetti, '/', type, '/', 3 chiffres")
        .test("rne-valid", "Première partie RNE non valide", mf => {
            const part1 = mf?.split("/")[0];
            return validateRNE(part1);
        }),
    indviduRoles: yup.array().min(1, "Au moins un rôle doit être sélectionné").required("Les rôles sont requis"),
});

const UpdatePM = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { typePieceId: typePieceList, loading: loadingTypes, error: errorTypes } = useTypePieceId();
    const { currentPM, loadingPM, errorPM } = useSelector(state => state.personneMorale);

    // Role options
    const roleOptions = ["ACHETEUR", "FOURNISSEUR", "CONTACT"];

    // Local matricule parts
    const [mfPart1, setMfPart1] = useState("");
    const [mfTypeAssujetti, setMfTypeAssujetti] = useState("");
    const [mfTypePersonne, setMfTypePersonne] = useState("");
    const [mfPart4, setMfPart4] = useState("");

    const [initialValues, setInitialValues] = useState({
        numeroPieceIdentite: "",
        raisonSocial: "",
        sigle: "",
        adresse: "",
        ville: "",
        email: "",
        telNo: "",
        typePieceId: "",
        matriculeFiscal: "",
        indviduRoles: []
    });

    // Fetch existing PM
    useEffect(() => {
        if (id) dispatch(getPMById(id));
    }, [dispatch, id]);

    // Populate form once data arrives
    useEffect(() => {
        if (currentPM) {
            const mf = currentPM.matriculeFiscal?.split("/") || ["", "", "", ""];
            setMfPart1(mf[0]);
            setMfTypeAssujetti(mf[1]);
            setMfTypePersonne(mf[2]);
            setMfPart4(mf[3]);
            setInitialValues({
                numeroPieceIdentite: currentPM.numeroPieceIdentite,
                raisonSocial: currentPM.raisonSocial,
                sigle: currentPM.sigle,
                adresse: currentPM.adresse,
                ville: currentPM.ville,
                email: currentPM.email,
                telNo: currentPM.telNo,
                typePieceId: currentPM.typePieceIdentite.id,
                matriculeFiscal: currentPM.matriculeFiscal,
                indviduRoles: currentPM.indviduRoles || []
            });
        }
    }, [currentPM]);

    const handleFormSubmit = (values) => {
        const selectedType = typePieceList.find(item => item.id === Number(values.typePieceId));
        const payload = {
            ...values,
            typePieceIdentite: selectedType
        };
        dispatch(updatePM(id, payload, navigate));
    };

    return (
        <Box m="20px" display="flex" flexDirection="column" alignItems="center">
            {loadingPM && <div className="loader-overlay"><div className="loader"></div></div>}
            <Header title="Personne Morale" subtitle="Modifier" />
            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3, backgroundColor: colors.primary[900] }}>
                <CardContent>
                    {errorPM && <Box mb={2}><Alert severity="error" sx={{fontSize:"14px"}}>{errorPM}</Alert></Box>}
                    <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                {/* TYPE PIECE IDENTITE */}
                                <Box mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">TYPE PIECE IDENTITE</Typography>
                                    <TextField select fullWidth name="typePieceId" value={values.typePieceId} onBlur={handleBlur} onChange={handleChange}
                                               error={!!touched.typePieceId && !!errors.typePieceId} helperText={touched.typePieceId && errors.typePieceId} disabled>
                                        {loadingTypes ? <MenuItem value="">Chargement...</MenuItem>
                                            : errorTypes ? <MenuItem value="">Erreur de chargement</MenuItem>
                                                : typePieceList.map(item => <MenuItem key={item.id} value={item.id}>{item.dsg}</MenuItem>)}
                                    </TextField>
                                </Box>

                                {/* Rôles multi-select */}
                                <Box mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">RÔLES</Typography>
                                    <TextField select fullWidth name="indviduRoles" value={values.indviduRoles}
                                               SelectProps={{ multiple: true, renderValue: sel => sel.join(', ') }}
                                               onChange={handleChange} onBlur={handleBlur}
                                               error={!!touched.indviduRoles && !!errors.indviduRoles} helperText={touched.indviduRoles && errors.indviduRoles}>
                                        {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                    </TextField>
                                </Box>

                                {/* Other fields */}
                                <Box display="flex" flexDirection="column" gap={2} mb={2}>
                                    {[
                                        {name: 'numeroPieceIdentite', label: 'Numéro Pièce Identité', disabled: true},
                                        {name: 'raisonSocial', label: 'Raison Sociale'},
                                        {name: 'sigle', label: 'Sigle'},
                                        {name: 'adresse', label: 'Adresse'},
                                        {name: 'ville', label: 'Ville'},
                                        {name: 'email', label: 'Email'},
                                        {name: 'telNo', label: 'Numéro Téléphone'},
                                    ].map(f => (
                                        <Box key={f.name}>
                                            <Typography variant="subtitle1" fontWeight="bold">{f.label}</Typography>
                                            <TextField fullWidth name={f.name} type={f.name === 'email' ? 'email' : 'text'}
                                                       value={values[f.name]} onBlur={handleBlur} onChange={handleChange}
                                                       error={!!touched[f.name] && !!errors[f.name]} helperText={touched[f.name] && errors[f.name]}
                                                       disabled={f.disabled || false} />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Matricule Fiscal */}
                                <Box mb={2} display="flex" flexDirection="column" gap={1} width="100%">
                                    <Typography variant="subtitle1" fontWeight="bold">MATRICULE FISCAL</Typography>
                                    <Box display="flex" gap={2}>
                                        <TextField label="8 caractères" value={mfPart1} fullWidth={true} onBlur={handleBlur}
                                                   onChange={e => { setMfPart1(e.target.value); setFieldValue('matriculeFiscal', `${e.target.value}/${mfTypeAssujetti}/${mfTypePersonne}/${mfPart4}`); }} />
                                        <TextField select label="Assujetti" value={mfTypeAssujetti} fullWidth={true} onBlur={handleBlur}
                                                   onChange={e => { setMfTypeAssujetti(e.target.value); setFieldValue('matriculeFiscal', `${mfPart1}/${e.target.value}/${mfTypePersonne}/${mfPart4}`); }}>
                                            {[{value:'A',label:'A : assujetti obligatoire'},{value:'B',label:'B : assujetti par option'},{value:'P',label:'P : assujetti partiel'},{value:'F',label:'F : assujetti forfaitaire'},{value:'N',label:'N : non assujetti'}]
                                                .map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </TextField>
                                        <TextField select label="Type Personne" value={mfTypePersonne} fullWidth={true} onBlur={handleBlur}
                                                   onChange={e => { setMfTypePersonne(e.target.value); setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${e.target.value}/${mfPart4}`); }}>
                                            {[{value:'M',label:'M : personne morale'},{value:'P',label:'P : personne physique libérale'},{value:'C',label:'C : personne physique commerçante ou industrielle'}]
                                                .map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </TextField>
                                        <TextField label="3 chiffres" value={mfPart4} fullWidth={true} onBlur={handleBlur}
                                                   onChange={e => { setMfPart4(e.target.value); setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${mfTypePersonne}/${e.target.value}`); }}
                                                   error={!!touched.matriculeFiscal && !!errors.matriculeFiscal}
                                                   helperText={touched.matriculeFiscal && errors.matriculeFiscal} />
                                    </Box>
                                </Box>

                                <Box display="flex" justifyContent="center">
                                    <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}>
                                        Soumettre
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

export default UpdatePM;
