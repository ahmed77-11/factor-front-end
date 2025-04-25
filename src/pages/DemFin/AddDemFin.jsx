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
      import { fetchContratsSigner } from "../../redux/contrat/ContratSlice.js";
      import { useNavigate } from "react-router-dom";
      import { addDemfinAsync } from "../../redux/demFin/demFinSlice.js";

      const initialValues = {
        contrat: null,
        adherEmisNo: "",
        adherEmisDate: "",
        adherRib: "",
        bankCode: "",
        ribSuffix: "",
        adherMontant: "",
        devise: null,
        adherLibelle: "",
        adherInfoLibre: "",
      };

      const validationSchema = yup.object().shape({
        contrat: yup.object().required("Le contrat est requis"),
        adherEmisNo: yup.string().required("Numéro de fin adhérent émis requis"),
        adherEmisDate: yup
          .date()
          .required("Date fin adhérent émis requise")
          .max(new Date(), "La date ne peut pas être dans le futur"),
        adherRib: yup.string().required("RIB fin adhérent requis"),
        adherMontant: yup.number().required("Le montant fin adhérent est requis"),
        devise: yup.object().required("La devise est requise"),
        adherLibelle: yup.string().required("Libellé requis"),
        adherInfoLibre: yup.string().optional(),
      });

      const AddDemFin = () => {
        const theme = useTheme();
        const colors = tokens(theme.palette.mode);
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const { contrats } = useSelector((state) => state.contrat);

        const inputFontSize = "1rem";
        const labelFontSize = "1.2rem";
        const helperFontSize = "0.9rem";

        const banques = [
          { code: "05", nom: "Banque de Tunisie" },
          { code: "10", nom: "STB" },
          { code: "08", nom: "BIAT" },
          { code: "07", nom: "Amen Bank" },
          { code: "11", nom: "UBCI" },
        ];

        useEffect(() => {
          dispatch(fetchContratsSigner());
        }, [dispatch]);

        const handleFormSubmit = (values, { resetForm }) => {
          console.log("📦 Données soumises :", values);
          dispatch(addDemfinAsync(values, navigate));
          resetForm();
        };

        return (
          <Box m="20px" display="flex" flexDirection="column">
            <Header
              title="Demande de financement"
              subtitle="Ajouter une demande de financement"
            />
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
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <Box display="flex" flexDirection="column" gap="20px">
                        {/* Contrat */}
                        <TextField
                          select
                          label="Numéro Contrat"
                          name="contrat"
                          fullWidth
                          value={values.contrat?.contratNo || ""}
                          onChange={(e) => {
                            const contratObj = contrats.find(
                              (c) => c.contratNo === e.target.value
                            );
                            setFieldValue("contrat", contratObj);
                            setFieldValue("devise", contratObj.devise);
                          }}
                          onBlur={handleBlur}
                          error={touched.contrat && !!errors.contrat}
                          helperText={touched.contrat && errors.contrat?.contratNo}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        >
                          {contrats.map((contrat) => (
                            <MenuItem key={contrat.id} value={contrat.contratNo}>
                              {contrat.contratNo}
                            </MenuItem>
                          ))}
                        </TextField>

                        {/* Emission No */}
                        <TextField
                          label="Fin Adhérent Emission Num"
                          name="adherEmisNo"
                          fullWidth
                          value={values.adherEmisNo}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.adherEmisNo && !!errors.adherEmisNo}
                          helperText={touched.adherEmisNo && errors.adherEmisNo}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        />

                        {/* Emission Date */}
                        <TextField
                          label="Date Fin Adhérent Emission"
                          type="date"
                          name="adherEmisDate"
                          fullWidth
                          value={values.adherEmisDate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.adherEmisDate && !!errors.adherEmisDate}
                          helperText={touched.adherEmisDate && errors.adherEmisDate}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        />

                        {/* Banque & RIB */}
                        <Box display="flex" gap={2}>
                          <TextField
                            select
                            label="Banque"
                            name="bankCode"
                            value={values.bankCode}
                            onChange={(e) => {
                              const selectedBank = banques.find(
                                (b) => b.code === e.target.value
                              );
                              const ribSuffix = values.ribSuffix || "";
                              setFieldValue("bankCode", selectedBank.code);
                              setFieldValue("adherRib", selectedBank.code + ribSuffix);
                            }}
                            onBlur={handleBlur}
                            error={!!touched.bankCode && !!errors.bankCode}
                            helperText={touched.bankCode && errors.bankCode}
                            sx={{ minWidth: "180px", flexShrink: 0 }}
                            InputProps={{ style: { fontSize: inputFontSize } }}
                            InputLabelProps={{
                              shrink: true,
                              style: { fontSize: labelFontSize },
                            }}
                            FormHelperTextProps={{
                              style: { fontSize: helperFontSize },
                            }}
                          >
                            {banques.map((bank) => (
                              <MenuItem key={bank.code} value={bank.code}>
                                {bank.nom}
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField
                            label="RIB Fin Adhérent"
                            name="ribSuffix"
                            fullWidth
                            value={values.ribSuffix || ""}
                            onChange={(e) => {
                              const suffix = e.target.value;
                              const bankCode = values.bankCode || "";
                              setFieldValue("ribSuffix", suffix);
                              setFieldValue("adherRib", bankCode + suffix);
                            }}
                            onBlur={handleBlur}
                            error={!!touched.ribSuffix && !!errors.adherRib}
                            helperText={touched.ribSuffix && errors.adherRib}
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
                              style: { fontSize: inputFontSize },
                            }}
                            InputLabelProps={{
                              shrink: true,
                              style: { fontSize: labelFontSize },
                            }}
                            FormHelperTextProps={{
                              style: { fontSize: helperFontSize },
                            }}
                          />
                        </Box>

                        {/* Montant */}
                        <TextField
                          label="Montant Fin Adhérent"
                          name="adherMontant"
                          fullWidth
                          value={values.adherMontant}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.adherMontant && !!errors.adherMontant}
                          helperText={touched.adherMontant && errors.adherMontant}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        />

                        {/* Devise (read-only, shows only dsg) */}
                        <TextField
                          label="Devise"
                          name="devise"
                          fullWidth
                          value={values.devise?.dsg || ""}
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
                          error={touched.devise && !!errors.devise}
                          helperText={touched.devise && errors.devise?.dsg}
                        />

                        {/* Libelle */}
                        <TextField
                          label="Libellé"
                          name="adherLibelle"
                          fullWidth
                          value={values.adherLibelle}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.adherLibelle && !!errors.adherLibelle}
                          helperText={touched.adherLibelle && errors.adherLibelle}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        />

                        {/* Info libre */}
                        <TextField
                          label="Info Libre"
                          name="adherInfoLibre"
                          fullWidth
                          value={values.adherInfoLibre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.adherInfoLibre && !!errors.adherInfoLibre}
                          helperText={touched.adherInfoLibre && errors.adherInfoLibre}
                          InputProps={{ style: { fontSize: inputFontSize } }}
                          InputLabelProps={{
                            shrink: true,
                            style: { fontSize: labelFontSize },
                          }}
                          FormHelperTextProps={{
                            style: { fontSize: helperFontSize },
                          }}
                        />

                        <Box display="flex" justifyContent="center" mt="10px">
                          <Button
                            type="submit"
                            color="secondary"
                            variant="contained"
                            size="large"
                          >
                            Ajouter une demande
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

      export default AddDemFin;
