import {useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Grid, IconButton,
    TextField, Typography,
    useTheme
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete as DeleteIcon } from "@mui/icons-material";
import Header from "../../../components/Header.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    addRelationAsync,
    fetchAcheteursAsync,
    fetchAdherentsAsync,
    fetchRelationsAsync
} from "../../../redux/relations/relationsSlice.js";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { localeText, tokens } from "../../../theme.js";
import DeletePopup from "../../../components/DeletePopup.jsx";

const validationSchema = Yup.object().shape({
    adherent: Yup.object().required('Adhérent requis'),
    acheteur: Yup.object().required('Acheteur requis'),
    delaiMaxPai: Yup.number()
        .min(0, 'Doit être positif')
        .required('Délai requis'),
    limiteAchat: Yup.number().min(0, 'Doit être positif').required('Limite requise'),
    limiteCouverture: Yup.number().min(0, 'Doit être positif').required('Limite requise'),
    effetDate: Yup.date().required('Date effet requise'),
    comiteRisqueTexte: Yup.string().required('Comite du Risque est requise'),
    comiteDerogTexte: Yup.string().required('Comite du Derogation est requise'),

    infoLibre: Yup.string().max(255, 'Max 255 caractères')
});

const AdherAchet = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adherents, acheteurs, relations,loading,error } = useSelector((state) => state.relations);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const formik = useFormik({
        initialValues: {
            adherent: null,
            acheteur: null,
            delaiMaxPai: 0,
            limiteAchat: 0,
            limiteCouverture: 0,
            effetDate: '',
            comiteRisqueTexte: '',
            comiteDerogTexte: '',
            infoLibre: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            const relationPayload = {
                ...values,
                adherentId: values.adherent.id,
                acheteurPhysiqueId: values.acheteur.nom ? values.acheteur.id : null,
                acheteurMoraleId: values.acheteur.raisonSocial ? values.acheteur.id : null
            };

            await dispatch(addRelationAsync(relationPayload));
            dispatch(fetchRelationsAsync(values.adherent.id));
            formik.setValues({
                ...formik.values,
                acheteur: null,
                delaiMaxPai: 0,
                limiteAchat: 0,
                limiteCouverture: 0,
                effetDate: '',
                comiteRisqueTexte: '',
                comiteDerogTexte: '',
                infoLibre: ''
            });
        }
    });

    useEffect(() => {
        dispatch(fetchAdherentsAsync());
        dispatch(fetchAcheteursAsync());
    }, [dispatch]);

    useEffect(() => {
        if (formik.values.adherent?.id) {
            dispatch(fetchRelationsAsync(formik.values.adherent.id));
        }
    }, [dispatch, formik.values.adherent]);

    const associatedAcheteurIds = useMemo(() => {
        const ids = new Set();
        if (formik.values.adherent?.id) {
            // Add null check for relations
            (relations || []).forEach(relation => {
                if (relation.acheteurPhysique) {
                    ids.add(relation.acheteurPhysique?.id);
                }
                if (relation.acheteurMorale) {  // Fixed property name
                    ids.add(relation.acheteurMorale?.id);
                }
            });
        }
        return ids;
    }, [relations, formik.values.adherent]);

    // Filter out already associated acheteurs
    // Add null checks for acheteurs
    const acheteursOptions = useMemo(() => {
        const pps = acheteurs?.pps || [];
        const pms = acheteurs?.pms || [];
        return [...pps, ...pms].filter(acheteur =>
            !associatedAcheteurIds.has(acheteur.id)
        );
    }, [acheteurs, associatedAcheteurIds]);
    console.log(acheteursOptions)

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const handleConfirmDelete = async () => {
        // await dispatch(deleteRelationAsync(selectedId));
        setOpenDelete(false);
        if (formik.values.adherent?.id) {
            dispatch(fetchRelationsAsync(formik.values.adherent.id));
        }
    };

    const columns = [
        {
            field: "pieceIdentite",
            headerName: "Pièce Identité",
            flex: 1,
            renderCell: (params) => {
                const acheteur = params.row.acheteurPhysique || params.row.acheteurMorale;
                return `${acheteur.typePieceIdentite?.dsg} ${acheteur.numeroPieceIdentite}`;
            }
        },
        {
            field: "nomRaisonSociale",
            headerName: "Nom/Raison Sociale",
            flex: 1,
            renderCell: (params) => {
                return params.row.acheteurPhysique
                    ? `${params.row.acheteurPhysique.nom} ${params.row.acheteurPhysique.prenom}`
                    : params.row.acheteurMorale.raisonSocial;
            }
        },
        {
            field: "adresse",
            headerName: "Adresse",
            flex: 1,
            renderCell: (params) => {
                const acheteur = params.row.acheteurPhysique || params.row.acheteurMorale;
                return acheteur.adresse;
            }
        },
        {
            field: "delaiMaxPai",
            headerName: "Délai Paiement (jours)",
            flex: 1,
        },
        {
            field: "limiteAchat",
            headerName: "Limite Achat",
            flex: 1,
        },
        {
            field: "limiteCouverture",
            headerName: "Limite Couverture",
            flex: 1,
        },
        {
            field: "effetDate",
            headerName: "Date Effet",
            flex: 1,
            renderCell: (params) => new Date(params.row.effetDate).toLocaleDateString()
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" width="100%">
                    <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Relations Adhérents Et Acheteurs" subtitle="Gestion des relations" />

            {/* Form Section */}
            <Card sx={{ mb: 3, p: 2, backgroundColor: colors.grey[900] }}>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={adherents}
                                value={formik.values.adherent}
                                onChange={(_, value) => formik.setFieldValue('adherent', value)}
                                getOptionLabel={(option) =>
                                    `${option.typePieceIdentite?.dsg || ''} ${option.numeroPieceIdentite} - ${option.raisonSocial}`
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Adhérent"
                                        error={formik.touched.adherent && !!formik.errors.adherent}
                                        helperText={formik.touched.adherent && formik.errors.adherent}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={acheteursOptions}
                                disabled={!formik.values.adherent?.id}
                                value={formik.values.acheteur}
                                onChange={(_, value) => formik.setFieldValue('acheteur', value)}
                                getOptionLabel={(option) => {
                                    if (option.nom) {
                                        return `${option.typePieceIdentite?.dsg} ${option.numeroPieceIdentite} - ${option.nom} ${option.prenom}`;
                                    }
                                    return `${option.typePieceIdentite?.dsg} ${option.numeroPieceIdentite} - ${option.raisonSocial}`;
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}

                                        label="Acheteur"
                                        error={formik.touched.acheteur && !!formik.errors.acheteur}
                                        helperText={formik.touched.acheteur && formik.errors.acheteur}
                                        disabled={!formik.values.adherent?.id}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Délai paiement (jours)"
                                name="delaiMaxPai"
                                value={formik.values.delaiMaxPai}
                                onChange={formik.handleChange}
                                error={formik.touched.delaiMaxPai && !!formik.errors.delaiMaxPai}
                                helperText={formik.touched.delaiMaxPai && formik.errors.delaiMaxPai}
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Limite achat"
                                name="limiteAchat"
                                value={formik.values.limiteAchat}
                                onChange={formik.handleChange}
                                error={formik.touched.limiteAchat && !!formik.errors.limiteAchat}
                                helperText={formik.touched.limiteAchat && formik.errors.limiteAchat}
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Limite couverture"
                                name="limiteCouverture"
                                value={formik.values.limiteCouverture}
                                onChange={formik.handleChange}
                                error={formik.touched.limiteCouverture && !!formik.errors.limiteCouverture}
                                helperText={formik.touched.limiteCouverture && formik.errors.limiteCouverture}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Comite Du Risque"
                                name="comiteRisqueTexte"
                                value={formik.values.comiteRisqueTexte}
                                onChange={formik.handleChange}
                                error={formik.touched.comiteRisqueTexte && !!formik.errors.comiteRisqueTexte}
                                helperText={formik.touched.comiteRisqueTexte && formik.errors.comiteRisqueTexte}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Comite Du Derogation"
                                name="comiteDerogTexte"
                                value={formik.values.comiteDerogTexte}
                                onChange={formik.handleChange}
                                error={formik.touched.comiteDerogTexte && !!formik.errors.comiteDerogTexte}
                                helperText={formik.touched.comiteDerogTexte && formik.errors.comiteDerogTexte}
                            />
                        </Grid>


                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date effet"
                                name="effetDate"
                                value={formik.values.effetDate || ''}
                                onChange={formik.handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={formik.touched.effetDate && !!formik.errors.effetDate}
                                helperText={formik.touched.effetDate && formik.errors.effetDate}
                            />
                        </Grid>

                        <Grid item xs={6} md={6}>
                            <TextField
                                fullWidth
                                type="text"
                                label="Info Libre"
                                name="infoLibre"
                                value={formik.values.infoLibre}
                                onChange={formik.handleChange}
                                error={formik.touched.infoLibre && !!formik.errors.infoLibre}
                                helperText={formik.touched.infoLibre && formik.errors.infoLibre}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{ height: '56px' }}
                                disabled={!formik.isValid || !formik.dirty}
                            >
                                Ajouter Relation
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Card>

            {/* Relations List */}
            <Card sx={{ p: 2, backgroundColor: colors.grey[900] }}>
                <Typography variant="h6" gutterBottom>
                    Liste des Relations
                </Typography>
                <Box
                    sx={{
                        height: 400,
                        "& .MuiDataGrid-root": { border: "none" },
                        "& .MuiDataGrid-cell": { borderBottom: "none" },
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: colors.blueAccent[700],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            backgroundColor: colors.blueAccent[700],
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.greenAccent[200]} !important`,
                        },
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${colors.grey[100]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        rows={relations || []}
                        columns={columns}
                        pageSizeOptions={[5, 10, 20]}
                        slots={{ toolbar: GridToolbar }}
                        checkboxSelection
                        disableRowSelectionOnClick
                        localeText={localeText}
                        getRowId={(row) => row.id}  // Add this to prevent key issues

                        loading={loading}
                    />
                </Box>
            </Card>

            <DeletePopup
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
            />
        </Box>
    );
};

export default AdherAchet;