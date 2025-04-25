import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    MenuItem,
    useTheme,
  } from "@mui/material";
  import { Formik } from "formik";
  import * as yup from "yup";
  import Header from "../../components/Header.jsx";
  import { tokens } from "../../theme.js";
  import { useEffect, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import {
    fetchAdherentsAsync,
    fetchAcheteursAsync,
    fetchAdherentsByAcheteur,
  } from "../../redux/relations/relationsSlice.js";
  import { fetchContratByAdherentIdAsync } from "../../redux/contrat/ContratSlice.js";
import { addTraite } from "../../redux/traite/traiteSlice.js";
import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

  
  
  const initialValues = {
    factorDate: "",
    numero: "",
    tireEmisDate: "",
    tireEmisLieu: "",
    bankCode: "",
    tireRib: "",
    tireNom: "",
    adherFactorCode: "",
    achetFactorCode: "",
    linkedAdherent: "",
    montant: "",
    devise: null,
    echFirst: "",
  };
  const validerRib = (value) => {
    console.log("RIB value:", value);
    if (!value) return true;
    value = value.replace(/[\s-]/g, '');
    if (value.length !== 20) return false;
    let strN = value.slice(0, value.length - 2) + '00';
    let strCheck = value.slice(value.length - 2);
    try {
      let big = BigInt(strN);
      let check = BigInt(97) - (big % BigInt(97));
      return BigInt(strCheck) === check;
    } catch (e) {
      return false;
    }
  };
  
  const banques = [
    { code: "01", nom: "Banque de Tunisie" },
    { code: "02", nom: "STB" },
    { code: "03", nom: "BIAT" },
    { code: "10", nom: "Amen Bank" },
    { code: "20", nom: "UBCI" },
  ];
  
  const dateField = (invalidMsg) =>
    yup
      .date()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .typeError(invalidMsg);
  
  const validationSchema = yup.object().shape({
    factorDate: dateField("Date factor invalide")
      .required("Date factor requise")
      .max(new Date(), "La date de factor ne peut pas être dans le futur"),
  
    numero: yup
      .string()
      .required("Le numéro est requis")
      .length(12, "Le numéro doit contenir exactement 12 caractères"),
  
    tireEmisDate: dateField("Date tire émis invalide")
      .required("Date tire émis requise")
      .max(new Date(), "La date tire émis ne peut pas être dans le futur")
      .when("factorDate", {
        is: (val) => val != null,
        then: (schema) =>
          schema.min(
            yup.ref("factorDate"),
            "La date tire émis doit être après la date de factor"
          ),
      }),
  
    tireEmisLieu: yup.string().required("Lieu tire émis requis"),
  
    tireRib: yup
      .string()
      .required("RIB requis")
      /*.test("is-valid-rib", "RIB invalide", validerRib)*/,
  
    tireNom: yup
      .string()
      .required("Nom du tire requis")
      .min(5, "Le nom doit contenir au moins 5 caractères"),
  
    bankCode: yup.string().required("Choisir une banque"),
  
    adherFactorCode: yup.string(),
    achetFactorCode: yup.string(),
    linkedAdherent: yup.string(),
  
    montant: yup
      .number()
      .typeError("Le montant doit être un nombre")
      .required("Le montant est requis"),
  
    devise: yup.string().required("La devise est requise"),
  
    echFirst: dateField("Date 1ère échéance invalide")
      .required("Date 1ère échéance requise")
      .min(new Date(), "La date d'échéance ne peut pas être dans le passé"),
  });
  
  
  const AddTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
  
    const [globalAdherents, setGlobalAdherents] = useState([]);
    const [submittedData, setSubmittedData] = useState(null);
    const [contratId, setContratId] = useState(null);
  
    const reduxAdherents = useSelector((state) => state.relations.adherents);
    const { acheteurs } = useSelector((state) => state.relations);
    const { currentContrat } = useSelector((state) => state.contrat);
    
  
    const inputFontSize = "1rem";
    const labelFontSize = "1.2rem";
    const helperFontSize = "0.9rem";

    const navigate = useNavigate();

  
    useEffect(() => {
      dispatch(fetchAdherentsAsync());
      dispatch(fetchAcheteursAsync());
    }, [dispatch]);
  
    useEffect(() => {
      if (reduxAdherents.length > 0 && globalAdherents.length === 0) {
        setGlobalAdherents(reduxAdherents);
      }
    }, [reduxAdherents, globalAdherents.length]);
   
  
    const getContratIdByAdherent = async (adhrId) => {
      if (adhrId) {
        dispatch(fetchContratByAdherentIdAsync(adhrId));
      }
    };
  
    const handleFormSubmit = (values, { resetForm }) => {
      const payload = { ...values, devise:currentContrat?.devise, contrat: currentContrat };
  
      console.log("📦 Données soumises :", payload);
      setSubmittedData(payload);
      dispatch(addTraite(payload))
    //   resetForm();
      setContratId(null);

      navigate("/all-traite");
    };

    
  
    const combinedAcheteurs =
      acheteurs && (acheteurs.pps || acheteurs.pms)
        ? [
            ...(acheteurs.pps || []),
            ...(acheteurs.pms || []),
          ]
        : [];
  
        
    return (
      <Box m="20px" display="flex" flexDirection="column">
        <Header title="Traite" subtitle="Ajouter une traite" />
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
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
              }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(() => {
                    if (currentContrat?.devise?.dsg) {
                      setFieldValue("devise", currentContrat.devise.dsg);
                    }
                  }, [currentContrat]);

              return(
                <form onSubmit={handleSubmit}>
                  <Box display="flex" flexDirection="column" gap="20px">
                  {currentContrat && currentContrat.id && (
                      <TextField
                        disabled={true}
                        fullWidth
                        variant="outlined"
                        label="Numéro de contrat"
                        value={currentContrat.contratNo}
                        InputProps={{
                          readOnly: true,
                          style: { fontSize: inputFontSize },
                        }}
                        InputLabelProps={{
                          shrink: true,
                          style: { fontSize: labelFontSize },
                        }}
                        FormHelperTextProps={{
                          style: { fontSize: helperFontSize },
                        }}
                        sx={{ mt: 1 }}
                      />
                    )}
                    <TextField
                      label="Date Factor"
                      type="date"
                      fullWidth
                      name="factorDate"
                      value={values.factorDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.factorDate && !!errors.factorDate}
                      helperText={touched.factorDate && errors.factorDate}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      label="Numéro Traite"
                      name="numero"
                      fullWidth
                      value={values.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.numero && !!errors.numero}
                      helperText={touched.numero && errors.numero}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      label="Date Tire Émis"
                      type="date"
                      fullWidth
                      name="tireEmisDate"
                      value={values.tireEmisDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.tireEmisDate && !!errors.tireEmisDate}
                      helperText={touched.tireEmisDate && errors.tireEmisDate}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      label="Lieu Tire Émis"
                      name="tireEmisLieu"
                      fullWidth
                      value={values.tireEmisLieu}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.tireEmisLieu && !!errors.tireEmisLieu}
                      helperText={touched.tireEmisLieu && errors.tireEmisLieu}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <Box display="flex" gap={2}>
  {/* Sélecteur Banque */}
  <TextField
    select
    label="Banque"
    name="bankCode"
    value={values.bankCode}
    onChange={(e) => {
      const selectedBank = banques.find((b) => b.code === e.target.value);
      const ribSuffix = values.ribSuffix || ""; // suffixe saisi
      setFieldValue("bankCode", selectedBank.code);
      setFieldValue("tireRib", selectedBank.code + ribSuffix);
    }}
    onBlur={handleBlur}
    error={!!touched.bankCode && !!errors.bankCode}
    helperText={touched.bankCode && errors.bankCode}
    sx={{ minWidth: "180px", flexShrink: 0 }}
    InputProps={{ style: { fontSize: inputFontSize } }}
    InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
    FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
  >
    {banques.map((bank) => (
      <MenuItem key={bank.code} value={bank.code}>
        {bank.nom}
      </MenuItem>
    ))}
  </TextField>

  {/* Champ RIB uniquement pour le suffixe, avec préfixe affiché */}
  <TextField
    label="RIB du Tire"
    name="ribSuffix"
    fullWidth
    value={values.ribSuffix || ""}
    onChange={(e) => {
      const suffix = e.target.value;
      setFieldValue("ribSuffix", suffix);
      const selectedBank = banques.find((b) => b.code === values.bankCode);
      const bankCode = selectedBank?.code || "";
      setFieldValue("tireRib", bankCode + suffix);
    }}
    onBlur={handleBlur}
    error={!!touched.ribSuffix && !!errors.tireRib}
    helperText={touched.ribSuffix && errors.tireRib}
    InputProps={{
      startAdornment: (
        <Box
          sx={{
            padding: "8px",
            borderRight: "1px solid #ccc",
            fontSize: inputFontSize,
            fontWeight: "bold",
          }}
        >
          {values.bankCode || ""}
        </Box>
      ),
      style: { fontSize: inputFontSize }
    }}
    InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
    FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
  />
</Box>


                    <TextField
                      label="Nom du Tire"
                      name="tireNom"
                      fullWidth
                      value={values.tireNom}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.tireNom && !!errors.tireNom}
                      helperText={touched.tireNom && errors.tireNom}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      select
                      label="Adhérent"
                      name="adherFactorCode"
                      fullWidth
                      value={values.adherFactorCode}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("achetFactorCode", "");
                        setFieldValue("linkedAdherent", "");
                        getContratIdByAdherent(e.target.value);
                      }}
                      onBlur={handleBlur}
                      error={!!touched.adherFactorCode && !!errors.adherFactorCode}
                      helperText={touched.adherFactorCode && errors.adherFactorCode}
                      disabled={!!values.achetFactorCode}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    >
                      {globalAdherents.map((adh) => (
                        <MenuItem key={adh.id} value={adh.id.toString()}>
                          {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                        </MenuItem>
                      ))}
                    </TextField>
  
                    <TextField
                      select
                      label="Acheteur"
                      name="achetFactorCode"
                      fullWidth
                      value={values.achetFactorCode}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("adherFactorCode", "");
                        setFieldValue("linkedAdherent", "");
                        dispatch(fetchAdherentsByAcheteur(e.target.value));
                      }}
                      onBlur={handleBlur}
                      error={!!touched.achetFactorCode && !!errors.achetFactorCode}
                      helperText={touched.achetFactorCode && errors.achetFactorCode}
                      disabled={!!values.adherFactorCode}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    >
                      {combinedAcheteurs.map((ach) => (
                        <MenuItem key={ach.id} value={ach.id.toString()}>
                          {ach.nom && ach.prenom
                            ? `${ach.nom} ${ach.prenom}`
                            : ach.raisonSocial}
                        </MenuItem>
                      ))}
                    </TextField>
  
                    {values.achetFactorCode && reduxAdherents.length > 0 && (
                      <TextField
                        select
                        label="Adhérent lié à l’acheteur"
                        name="linkedAdherent"
                        fullWidth
                        value={values.linkedAdherent}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("adherFactorCode", e.target.value);
                          getContratIdByAdherent(e.target.value);
                        }}
                        onBlur={handleBlur}
                        error={!!touched.linkedAdherent && !!errors.linkedAdherent}
                        helperText={touched.linkedAdherent && errors.linkedAdherent}
                        InputProps={{ style: { fontSize: inputFontSize } }}
                        InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                        FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                      >
                        {reduxAdherents.map((adh) => (
                          <MenuItem key={adh.id} value={adh.id.toString()}>
                            {adh.raisonSocial || `${adh.nom} ${adh.prenom}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
  
                    <TextField
                      label="Montant"
                      name="montant"
                      fullWidth
                      value={values.montant}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.montant && !!errors.montant}
                      helperText={touched.montant && errors.montant}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      disabled={true}
                      label="Devise"
                      name="devise"
                      fullWidth
                      value={ values.devise}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.devise && !!errors.devise}
                      helperText={touched.devise && errors.devise}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
                    <TextField
                      label="Échéance"
                      type="date"
                      fullWidth
                      name="echFirst"
                      value={values.echFirst}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.echFirst && !!errors.echFirst}
                      helperText={touched.echFirst && errors.echFirst}
                      InputProps={{ style: { fontSize: inputFontSize } }}
                      InputLabelProps={{ shrink: true, style: { fontSize: labelFontSize } }}
                      FormHelperTextProps={{ style: { fontSize: helperFontSize } }}
                    />
  
                    
  
                    <Box display="flex" justifyContent="center" mt="10px">
                      <Button
                        type="submit"
                        color="secondary"
                        variant="contained"
                        size="large"

                      >
                        Ajouter une traite
                      </Button>
                    </Box>
                  </Box>
                </form>
              )}}
            </Formik>
  
            
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  export default AddTraite;
  