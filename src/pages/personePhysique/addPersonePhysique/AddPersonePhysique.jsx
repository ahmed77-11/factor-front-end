

import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme, Alert} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import { useTypePieceId } from "../../../customeHooks/useTypePieceId.jsx";
import {useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addPP } from "../../../redux/personne/PersonnePhysiqueSlice.js";
import { tokens } from "../../../theme.js";
import {validateRNE} from "../../../helpers/ValidationHelper.jsx";

const initialValues = {
    numPieceIdentite: "",
    nom: "",
    prenom: "",
    adresse: "",
    Email: "",
    typePieceId: "",
    matriculeFiscal:"",
    naissanceDate: "",
};

const AddPersonnePhysique = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { typePieceId: typePieceList, loading, error } = useTypePieceId();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mfPart1, setMfPart1] = useState("");
    const [mfTypeAssujetti, setMfTypeAssujetti] = useState("");
    const [mfTypePersonne, setMfTypePersonne] = useState("");
    const [mfPart4, setMfPart4] = useState("");
    const { loadingPP, errorPP } = useSelector((state) => state.personnePhysique);

    // Get the type representing CIN from the fetched list.
    const cinType = typePieceList.find(item => item.dsg === "CIN");
    const patenteType = typePieceList.find(item => item.dsg === "PATENTE");

    const validationSchema = yup.object().shape({
        numPieceIdentite: yup.string().when("typePieceId", (selectedTypeId, schema) => {
            if (!selectedTypeId) {
                return schema.required("Le numéro de pièce d'identité est requis");
            }
            // If the selected type is CIN, validate that it has 8 digits.
            if (cinType && selectedTypeId.toString() === cinType.id.toString()) {
                return schema
                    .required("Le numéro de pièce d'identité est requis")
                    .matches(/^\d{8}$/, "Le numéro de CIN doit comporter 8 chiffres");
            }
            // If the selected type is PATENTE, validate that it has a valid RNE .
            if (patenteType && selectedTypeId.toString() === patenteType.id.toString()) {
                return schema
                    .required("Le numéro de pièce d'identité est requis")
                    .test("rne-valid", "Le numéro de patente doit être un RNE valide", (value) => validateRNE(value));
            }
            return schema.required("Le numéro de pièce d'identité est requis");
        }),
        nom: yup.string().required("Le nom est requis"),
        prenom: yup.string().required("Le prénom est requis"),
        Email: yup.string().email("Format d'email invalide").required("L'email est requis"),
        adresse: yup.string().required("L'adresse est requise"),
        typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
        matriculeFiscal: yup.mixed().when("typePieceId", {
            is: (typePieceId) => patenteType && typePieceId.toString() === patenteType.id.toString(),
            then: () =>
                yup
                    .string()
                    .required("Matricule fiscal requis")
                    .matches(
                        /^[A-Za-z0-9]{8}\/[ABPFN]\/[MPC]\/[0-9]{3}$/,
                        "Format invalide: 8 chars/RNE, '/', assujetti, '/', type, '/', 3 chiffres"
                    )
                    .test("rne-valid", "Première partie RNE non valide", (mf) => {
                        const part1 = mf?.split("/")[0];
                        return validateRNE(part1);
                    }),
            otherwise: () => yup.string().notRequired(),
        }),
        naissanceDate: yup.date()
            .required("La date de naissance est requise")
            .nullable()
            .max(new Date(), "La date de naissance ne peut pas être dans le futur")
            .test("age", "L'âge doit être d'au moins 18 ans", (value) => {
                if (!value) return false;
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const m = today.getMonth() - value.getMonth();
                return age > 18 || (age === 18 && m >= 0);
            }),
    });

    const handleFormSubmit = (values, { resetForm }) => {
        // Find the full object for the selected typePieceId.
        const selectedType = typePieceList.find(
            (item) => item.id === Number(values.typePieceId)
        );
        const payload = {
            numeroPieceIdentite: values.numPieceIdentite,
            nom: values.nom,
            prenom: values.prenom,
            adresse: values.adresse,
            email: values.Email,
            typePieceIdentite: selectedType,
            matriculeFiscal: values.matriculeFiscal,
            naissanceDate: values.naissanceDate,
        };
        console.log(payload)
        dispatch(addPP(payload, navigate));
        resetForm();
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingPP && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Header title="Personnes Physique" subtitle="Créer personne physique" />

            <Card
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    boxShadow: 5,
                    borderRadius: 3,
                    p: 3,
                    backgroundColor: `${colors.primary[900]}`,
                }}
            >
                <CardContent>
                    {errorPP && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {errorPP || "Une erreur s'est produite lors de la création de la personne physique !"}
                            </Alert>
                        </Box>
                    )}
                    <Formik
                        onSubmit={handleFormSubmit}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                    >
                        {({ values,
                              errors,
                              touched,
                              handleBlur,
                              handleChange,
                              handleSubmit,
                              setFieldValue
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        TYPE PIECE IDENTITE
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        variant="outlined"
                                        name="typePieceId"
                                        value={values.typePieceId}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        error={!!touched.typePieceId && !!errors.typePieceId}
                                        helperText={touched.typePieceId && errors.typePieceId}
                                    >
                                        {loading ? (
                                            <MenuItem value="">Loading...</MenuItem>
                                        ) : error ? (
                                            <MenuItem value="">Error loading options</MenuItem>
                                        ) : (
                                            typePieceList
                                                .filter((item) =>
                                                    Object.keys(item)
                                                        .filter((key) => key.startsWith('pp'))
                                                        .some((key) => item[key] === true)
                                                )
                                                .map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.dsg}
                                                </MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                </Box>

                                <Box display="flex" flexDirection="column" gap="20px">
                                    {Object.keys(initialValues)
                                        .filter((field) => field !== "typePieceId" && field !== "matriculeFiscal")
                                        .map((field) => (
                                            <Box key={field}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                                                </Typography>
                                                {field === "naissanceDate" ? (
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        type="date"
                                                        placeholder="Date de naissance"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        value={values.naissanceDate}
                                                        name="naissanceDate"
                                                        error={!!touched.naissanceDate && !!errors.naissanceDate}
                                                        helperText={touched.naissanceDate && errors.naissanceDate}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        type="text"
                                                        placeholder={`Entrez ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        value={values[field]}
                                                        name={field}
                                                        error={!!touched[field] && !!errors[field]}
                                                        helperText={touched[field] && errors[field]}
                                                    />
                                                )}
                                            </Box>
                                        ))}

                                    {values.typePieceId === patenteType?.id && (
                                        <Box mb={2} display="flex" flexDirection="column" gap={1}>

                                        <Typography variant="subtitle1" fontWeight="bold">Matricule Fiscal</Typography>
                                        <Box display="flex" gap={2} alignItems="center" flexWrap="nowrap">
                                            <TextField
                                                label="8 caractères"
                                                value={mfPart1}
                                                onBlur={handleBlur}
                                                fullWidth={true}
                                                onChange={e => {
                                                    setMfPart1(e.target.value);
                                                    console.log(errors)
                                                    setFieldValue('matriculeFiscal', `${e.target.value}/${mfTypeAssujetti}/${mfTypePersonne}/${mfPart4}`);
                                                }}
                                                error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                            />
                                            <TextField select label="Assujetti" value={mfTypeAssujetti}
                                                       onBlur={handleBlur}
                                                       fullWidth={true}

                                                       onChange={e => {
                                                           setMfTypeAssujetti(e.target.value);
                                                           setFieldValue('matriculeFiscal', `${mfPart1}/${e.target.value}/${mfTypePersonne}/${mfPart4}`);
                                                       }}>
                                                {[
                                                    { value: 'A', label: 'A : assujetti obligatoire' },
                                                    { value: 'B', label: 'B : assujetti par option' },
                                                    { value: 'P', label: 'P : assujetti partiel' },
                                                    { value: 'F', label: 'F : assujetti forfaitaire' },
                                                    { value: 'N', label: 'N : non assujetti' },
                                                ].map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </TextField>
                                            <TextField select label="Type Personne" value={mfTypePersonne}
                                                       onBlur={handleBlur}
                                                       fullWidth={true}

                                                       onChange={e => {
                                                           setMfTypePersonne(e.target.value);
                                                           setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${e.target.value}/${mfPart4}`);
                                                       }}>
                                                {[
                                                    // { value: 'M', label: 'M : personne morale' },
                                                    { value: 'P', label: 'P : personne physique profession libérale' },
                                                    { value: 'C', label: 'C : personne physique commerçante ou industrielle' },
                                                ].map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </TextField>
                                            <TextField
                                                label="3 chiffres"
                                                value={mfPart4}
                                                onBlur={handleBlur}
                                                fullWidth={true}

                                                onChange={e => {
                                                    setMfPart4(e.target.value);
                                                    console.log(values.matriculeFiscal)
                                                    setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${mfTypePersonne}/${e.target.value}`);
                                                }}
                                                error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                                helperText={touched.matriculeFiscal && errors.matriculeFiscal}
                                            />
                                        </Box>
                                    </Box>

                                        )}


                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Créer une personne physique
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

export default AddPersonnePhysique;
