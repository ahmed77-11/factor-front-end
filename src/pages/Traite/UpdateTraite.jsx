import {  
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header.jsx";
import { tokens } from "../../theme.js";
import { useState, useEffect } from "react";
import { getTraiteById, updateTraite } from "../../redux/traite/traiteSlice.js";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "@fullcalendar/core/index.js";


  
const validationSchema = yup.object().shape({
    factorDate: yup.string().required("Date factor requise"),
    numero: yup.string().required("Le numéro est requis"),
    tireEmisDate: yup.string().required("Date tire émis requise"),
    tireEmisLieu: yup.string().required("Lieu tire émis requis"),
    tireRib: yup.string().required("RIB requis"),
    tireNom: yup.string().required("Nom du tire requis"),
    adherFactorCode: yup.string().required("Code adhérent requis"),
    achetFactorCode: yup.string(),
    montant: yup.number().required("Le montant est requis"),
    devise: yup.object().required("La devise est requise"),
    echFirst: yup.string().required("Date 1ère échéance requise"),
});
  
const UpdateTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentTraite, loadingTraite, errorTraite } = useSelector((state) => state.traite);
    const { currentContrat } = useSelector((state) => state.contrat);

    const [initialValues, setInitialValues] = useState({
        factorDate: "",
        numero: "",
        tireEmisDate: "",
        tireEmisLieu: "",
        tireRib: "",
        tireNom: "",
        adherFactorCode: "",
        achetFactorCode: "",
        montant: "",
        deviseCode: "",
        echFirst: "",
    });
    

    useEffect(() => {
        if (id) {
            dispatch(getTraiteById(id));
        }
    }, []);

    useEffect(() => {
        if (currentTraite) {
            setInitialValues({
                factorDate:currentTraite.factorDate?.split("T")[0],
                numero: currentTraite.numero,
                tireEmisDate: currentTraite.tireEmisDate,
                tireEmisLieu: currentTraite.tireEmisLieu,
                tireRib: currentTraite.tireRib,
                tireNom: currentTraite.tireNom,
                adherFactorCode: currentTraite.adherFactorCode,
                achetFactorCode: currentTraite.achetFactorCode,
                montant: currentTraite.montant,
                devise: currentTraite.devise,  // Optional to show the existing value
                echFirst: currentTraite.echFirst,
            });
        }
    }, [currentTraite]);

    const handleFormSubmit = (values) => {
        
    };

    return (
        <Box m="20px" display="flex" flexDirection="column">
            {loadingTraite && <Typography>Chargement...</Typography>}
            <Header title="Traite" subtitle="Modifier une traite" />
            <Card sx={{ width: "100%", maxWidth: "1200px", boxShadow: 5, borderRadius: 3, p: 3, backgroundColor: `${colors.primary[900]}` }}>
                <CardContent>
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values)=>{
                            const payload = { 
                                ...values, 
                                devise: currentTraite?.devise,  // Getting devise from the contract
                                contrat: currentTraite?.contrat,
                                id:currentTraite?.id
                            };
                            console.log(payload)
                            dispatch(updateTraite(id, payload, navigate));
                        }}
                    >
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap="20px">
                                    {/* Field for factorDate */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">DATE FACTOR</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="factorDate"
                                            value={values.factorDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.factorDate && !!errors.factorDate}
                                            helperText={touched.factorDate && errors.factorDate}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>

                                    {/* Field for numero */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">NUMERO TRAITE</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="numero"
                                            value={values.numero}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.numero && !!errors.numero}
                                            helperText={touched.numero && errors.numero}
                                        />
                                    </Box>

                                    {/* Field for tireEmisDate */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">DATE TIRE EMIS</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="tireEmisDate"
                                            value={values.tireEmisDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisDate && !!errors.tireEmisDate}
                                            helperText={touched.tireEmisDate && errors.tireEmisDate}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>

                                    {/* Field for tireEmisLieu */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">LIEU TIRE EMIS</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="tireEmisLieu"
                                            value={values.tireEmisLieu}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireEmisLieu && !!errors.tireEmisLieu}
                                            helperText={touched.tireEmisLieu && errors.tireEmisLieu}
                                        />
                                    </Box>

                                    {/* Field for tireRib */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">RIB</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="tireRib"
                                            value={values.tireRib}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireRib && !!errors.tireRib}
                                            helperText={touched.tireRib && errors.tireRib}
                                        />
                                    </Box>

                                    {/* Field for tireNom */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">NOM TIRE</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="tireNom"
                                            value={values.tireNom}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.tireNom && !!errors.tireNom}
                                            helperText={touched.tireNom && errors.tireNom}
                                        />
                                    </Box>

                                    {/* Field for adherFactorCode */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">CODE ADHERENT</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="adherFactorCode"
                                            value={values.adherFactorCode}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.adherFactorCode && !!errors.adherFactorCode}
                                            helperText={touched.adherFactorCode && errors.adherFactorCode}
                                        />
                                    </Box>

                                    {/* Field for achetFactorCode */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">CODE ACHETEUR</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="text"
                                            name="achetFactorCode"
                                            value={values.achetFactorCode}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.achetFactorCode && !!errors.achetFactorCode}
                                            helperText={touched.achetFactorCode && errors.achetFactorCode}
                                        />
                                    </Box>

                                    {/* Field for montant */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">MONTANT</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="number"
                                            name="montant"
                                            value={values.montant}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.montant && !!errors.montant}
                                            helperText={touched.montant && errors.montant}
                                        />
                                    </Box>

                                    {/* Field for devise */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">DEVISE</Typography>
                                        <TextField
                                            fullWidth
                                            name="devise"
                                            value={currentTraite?.devise.dsg} // Disabled field showing devise related to the contract
                                            disabled
                                            error={!!touched.devise && !!errors.devise}
                                            helperText={touched.devise && errors.devise}
                                        >
                                        </TextField>
                                    </Box>

                                    {/* Field for echFirst */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">DATE 1ERE ECHEANCE</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="date"
                                            name="echFirst"
                                            value={values.echFirst}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!touched.echFirst && !!errors.echFirst}
                                            helperText={touched.echFirst && errors.echFirst}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>

                                    <Box display="flex" justifyContent="center" mt="10px">
                                        <Button type="submit" color="secondary" variant="contained" size="large" sx={{ borderRadius: 2 }}>
                                            Soumettre
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        )}
                    </Formik>

                    {errorTraite && <Typography color="error">{errorTraite}</Typography>}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateTraite;
