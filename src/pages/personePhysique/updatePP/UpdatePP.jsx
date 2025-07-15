import { useState, useEffect } from "react";
import {Box, Button, TextField, Typography, Card, CardContent, MenuItem, useTheme, Alert} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../../components/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPPById, updatePP } from "../../../redux/personne/PersonnePhysiqueSlice.js";
import { tokens } from "../../../theme.js";
import { validateRNE } from "../../../helpers/ValidationHelper.jsx";

// Define all possible role options
const roleOptions = [
    "ACHETEUR",
    "FOURNISSEUR",
    "CONTACT"
];

const UpdatePP = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentPP, loadingPP, errorPP } = useSelector((state) => state.personnePhysique);

    // States for splitting matricule fiscal
    const [mfPart1, setMfPart1] = useState("");
    const [mfTypeAssujetti, setMfTypeAssujetti] = useState("");
    const [mfTypePersonne, setMfTypePersonne] = useState("");
    const [mfPart4, setMfPart4] = useState("");


    const [initialValues, setInitialValues] = useState({
        numeroPieceIdentite: "",
        nom: "",
        prenom: "",
        adresse: "",
        email: "",
        typePieceId: "",
        naissanceDate: "",
        indviduRoles: [],
        matriculeFiscal: ""
    });

    console.log(currentPP)
    // const patenteType = currentPP.typePieceIdentite.dsg === "PATENTE";

    // Fetch PP data
    useEffect(() => {
        if (id) {
            dispatch(getPPById(id));
        }
    }, [dispatch, id]);
    console.log(currentPP)

    // Update initial values when currentPP is fetched
    useEffect(() => {
        if (currentPP) {
            const mf = currentPP.matriculeFiscal || "";
            const [p1 = "", ass = "", pers = "", p4 = ""] = mf.split("/");
            setMfPart1(p1);
            setMfTypeAssujetti(ass);
            setMfTypePersonne(pers);
            setMfPart4(p4);

            setInitialValues({
                numeroPieceIdentite: currentPP.numeroPieceIdentite,
                nom: currentPP.nom,
                prenom: currentPP.prenom,
                adresse: currentPP.adresse,
                email:currentPP.email,
                typePieceId: currentPP.typePieceIdentite?.id || "",
                naissanceDate: currentPP.naissanceDate ? currentPP.naissanceDate.split("T")[0] : "",
                indviduRoles: currentPP.indviduRoles || [],
                matriculeFiscal: mf
            });
        }
    }, [currentPP]);

    function isPatenteType(typePieceId) {
        return typePieceId.code==="PATENTE"
    }

    const validationSchema = yup.object().shape({
        numeroPieceIdentite: yup.string().required("Le numéro de pièce d'identité est requis"),
        nom: yup.string().required("Le nom est requis"),
        prenom: yup.string().required("Le prénom est requis"),
        adresse: yup.string().required("L'adresse est requise"),
        email: yup.string().email("Format d'email invalide").required("L'email est requis"),
        typePieceId: yup.string().required("Le type de pièce d'identité est requis"),
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
        indviduRoles: yup.array()
            .min(1, "Au moins un rôle doit être sélectionné")
            .required("Les rôles sont requis"),
        matriculeFiscal: yup.string().when("typePieceId", {
            is: (val) => {
                // Assuming PATENTE typePieceId value has been set to "PATENTE" or equivalent string
                const typePiece = currentPP?.typePieceIdentite;
                return typePiece.code==="PATENTE";
            },
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

    });

    const handleFormSubmit = (values) => {
        console.log(values)
        const formattedValues = {
            ...values,
            naissanceDate: values.naissanceDate
                ? new Date(values.naissanceDate).toISOString().replace("Z", "+00:00")
                : null,
            matriculeFiscal: values.matriculeFiscal
        };

        dispatch(updatePP(id, formattedValues, navigate));
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingPP && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Header title="Personne Physique" subtitle="Modifier" />

            <Card sx={{
                width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3,
                backgroundColor: `${colors.primary[900]}`
            }}>
                <CardContent>
                    {errorPP && (
                        <Box  my={2}>
                            <Alert  severity="error" sx={{fontSize:"14px"}}>
                                {errorPP || "Une erreur s'est produite lors de la récupération des données."}
                            </Alert>
                        </Box>
                    )}
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* TYPE PIECE IDENTITE */}
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
                                            disabled
                                        >
                                            {currentPP?.typePieceIdentite ? (
                                                <MenuItem value={currentPP.typePieceIdentite.id}>
                                                    {currentPP.typePieceIdentite.dsg}
                                                </MenuItem>
                                            ) : (
                                                <MenuItem value="">Aucune donnée</MenuItem>
                                            )}
                                        </TextField>
                                    </Box>

                                    {/* ROLES */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            RÔLES
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected) => selected.join(', '),
                                            }}
                                            variant="outlined"
                                            name="indviduRoles"
                                            value={values.indviduRoles}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.indviduRoles && !!errors.indviduRoles}
                                            helperText={touched.indviduRoles && errors.indviduRoles}
                                        >
                                            {roleOptions.map((role) => (
                                                <MenuItem key={role} value={role}>
                                                    {role}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>

                                    {/* Numero Piece Identite (disabled) */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            NUMERO PIECE IDENTITE
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            placeholder="Numéro de pièce d'identité"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.numeroPieceIdentite}
                                            name="numeroPieceIdentite"
                                            error={!!touched.numeroPieceIdentite && !!errors.numeroPieceIdentite}
                                            helperText={touched.numeroPieceIdentite && errors.numeroPieceIdentite}
                                            disabled
                                        />
                                    </Box>

                                    {/* Date of Birth */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            DATE DE NAISSANCE
                                        </Typography>
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
                                    </Box>

                                    {/* Other Fields */}
                                    {['nom', 'prenom', 'adresse','email'].map((field) => (
                                        <Box key={field}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {field.toUpperCase()}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                type="text"
                                                placeholder={`Entrez ${field}`}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values[field]}
                                                name={field}
                                                error={!!touched[field] && !!errors[field]}
                                                helperText={touched[field] && errors[field]}
                                            />
                                        </Box>
                                    ))}

                                    {/* Matricule Fiscal */}
                                    {currentPP && currentPP.typePieceIdentite?.code === "PATENTE" && (
                                    <Box mb={2} display="flex" flexDirection="column" gap={1}>
                                        <Typography variant="subtitle1" fontWeight="bold">Matricule Fiscal</Typography>
                                        <Box display="flex" gap={2} alignItems="center" flexWrap="nowrap">
                                            <TextField
                                                label="8 caractères"
                                                value={mfPart1}
                                                onBlur={handleBlur}
                                                fullWidth
                                                onChange={e => {
                                                    setMfPart1(e.target.value);
                                                    setFieldValue('matriculeFiscal', `${e.target.value}/${mfTypeAssujetti}/${mfTypePersonne}/${mfPart4}`);
                                                }}
                                                error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                            />
                                            <TextField select label="Assujetti" value={mfTypeAssujetti}
                                                       onBlur={handleBlur}
                                                       fullWidth
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
                                                       fullWidth
                                                       onChange={e => {
                                                           setMfTypePersonne(e.target.value);
                                                           setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${e.target.value}/${mfPart4}`);
                                                       }}>
                                                {[
                                                { value: 'P', label: 'P : personne physique profession libérale' },
                                                { value: 'C', label: 'C : personne physique commerçante ou industrielle' },
                                                ].map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </TextField>
                                            <TextField
                                                label="3 chiffres"
                                                value={mfPart4}
                                                onBlur={handleBlur}
                                                fullWidth
                                                onChange={e => {
                                                    setMfPart4(e.target.value);
                                                    setFieldValue('matriculeFiscal', `${mfPart1}/${mfTypeAssujetti}/${mfTypePersonne}/${e.target.value}`);
                                                }}
                                                error={!!errors.matriculeFiscal && touched.matriculeFiscal}
                                                helperText={touched.matriculeFiscal && errors.matriculeFiscal}
                                            />
                                        </Box>
                                    </Box>
                                    )}

                                    {/* Submit button */}
                                    <Box display="flex" justifyContent="center" gap="10px" mt="10px">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            variant="contained"
                                            size="large"
                                            sx={{ borderRadius: 2, backgroundColor: colors.greenAccent[500], color: colors.grey[100] }}
                                        >
                                            Soumettre
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

export default UpdatePP;
