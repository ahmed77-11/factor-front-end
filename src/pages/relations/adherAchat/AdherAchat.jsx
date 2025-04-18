import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Autocomplete, TextField } from "@mui/material";
import Header from "../../../components/Header.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    addRelationAsync,
    fetchAcheteursAsync,
    fetchAdherentsAsync,
    fetchRelationsAsync
} from "../../../redux/relations/relationsSlice.js";

const AdherAchet = () => {
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [acheteursList, setAcheteursList] = useState([]);
    const dispatch = useDispatch();
    const { adherents, acheteurs,relations, loading, error } = useSelector((state) => state.relations);

    // When the component mounts, fetch adherents and acheteurs
    useEffect(() => {
        dispatch(fetchAdherentsAsync());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchAcheteursAsync());
    }, [dispatch]);

    useEffect(() => {
        if(selectedAdherent) {
            dispatch(fetchRelationsAsync(selectedAdherent.id));
        }
    }, [dispatch, selectedAdherent]);

    // Merge pps and pms from acheteurs payload if needed
    const acheteursOptions = acheteurs
        ? [...(acheteurs.pps || []), ...(acheteurs.pms || [])]
        : [];

    console.log(relations)

    // Ajouter un acheteur à la liste
    const handleAddAcheteur = async () => {
        if (!selectedAcheteur) return;

        // Dispatch addRelationAsync based on the acheteur type.
        if (selectedAcheteur.raisonSocial) {
            // It is a personne morale (pms)
            await dispatch(addRelationAsync(selectedAdherent.id, null, selectedAcheteur.id));
        } else if (selectedAcheteur.nom && selectedAcheteur.prenom) {
            // It is a personne physique (pps)
            await dispatch(addRelationAsync(selectedAdherent.id, selectedAcheteur.id, null));
        }

        // Clear the selectedAcheteur (and optionally add it to a local list if required)
        setSelectedAcheteur(null);

        // Re-fetch the relations for the selected adherent after adding new relation
        dispatch(fetchRelationsAsync(selectedAdherent.id));
    };

    // Supprimer un acheteur
    const handleRemoveAcheteur = (index) => {
        setAcheteursList(acheteursList.filter((_, i) => i !== index));
    };

    // Soumettre la liste des acheteurs

    return (
        <Box
            width="100%"
            p={3}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
        >
            <Header subtitle={"Ajouter des Acheteurs à l'adhérent"} title={"Les relations"} />
            <Grid container spacing={4} justifyContent="center">
                {/* Sélection de l'Adhérent & Acheteur */}
                <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="subtitle1" mb={1}>
                        Sélectionner un Adhérent :
                    </Typography>
                    <Autocomplete
                        options={adherents}
                        value={selectedAdherent}
                        disabled={selectedAdherent !== null}
                        onChange={(event, newValue) => setSelectedAdherent(newValue)}
                        // Adjust this getOptionLabel as needed for adherents if they have similar structure.
                        getOptionLabel={(option) =>
                            `${option.typePieceIdentite?.dsg || ""}${option.numeroPieceIdentite || ""} - ${option.raisonSocial || ""}`
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Adhérent" variant="outlined" fullWidth />
                        )}
                        sx={{ mb: 3, width: 400 }}
                    />
                    <Typography variant="subtitle1" mb={1}>
                        Sélectionner un Acheteur :
                    </Typography>
                    <Autocomplete
                        options={acheteursOptions}
                        value={selectedAcheteur}
                        onChange={(event, newValue) => setSelectedAcheteur(newValue)}
                        freeSolo={false}
                        disabled={!selectedAdherent}
                        getOptionLabel={(option) => {
                            // Build identity string from typePieceIdentite and numeroPieceIdentite
                            const identityStr = `${option.typePieceIdentite?.dsg || ""}${option.numeroPieceIdentite || ""}`;
                            // If it's a personne physique (pps), it should have a nom and prenom
                            if (option.nom && option.prenom) {
                                return `${identityStr} - ${option.nom} ${option.prenom}`;
                            }
                            // Else if it's a personne morale (pms) with raisonSocial
                            if (option.raisonSocial) {
                                return `${identityStr} - ${option.raisonSocial}`;
                            }
                            // Fallback to the identity string alone
                            return identityStr;
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Acheteur" variant="outlined" fullWidth />
                        )}
                        sx={{ mb: 3, width: 400 }}
                    />
                    <Button
                        onClick={handleAddAcheteur}
                        variant="contained"
                        color="primary"
                        disabled={!selectedAcheteur}
                    >
                        Ajouter Acheteur
                    </Button>
                </Grid>

                {/* Liste des Acheteurs */}
                {/*<Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">*/}
                {/*    <TableContainer component={Paper} sx={{ mt: 2 }}>*/}
                {/*        <Table>*/}
                {/*            <TableHead>*/}
                {/*                <TableRow>*/}
                {/*                    <TableCell>Nom de l'Acheteur</TableCell>*/}
                {/*                    <TableCell>Actions</TableCell>*/}
                {/*                </TableRow>*/}
                {/*            </TableHead>*/}
                {/*            <TableBody>*/}
                {/*                {relations.map((acheteur, index) => (*/}
                {/*                    <TableRow key={index}>*/}
                {/*                        <TableCell>*/}
                {/*                            {(() => {*/}
                {/*                                const identityStr = `${acheteur.typePieceIdentite?.dsg || ""}${acheteur.numeroPieceIdentite || ""}`;*/}
                {/*                                if (acheteur.nom && acheteur.prenom) {*/}
                {/*                                    return `${identityStr} - ${acheteur.nom} ${acheteur.prenom}`;*/}
                {/*                                }*/}
                {/*                                if (acheteur.raisonSocial) {*/}
                {/*                                    return `${identityStr} - ${acheteur.raisonSocial}`;*/}
                {/*                                }*/}
                {/*                                return identityStr;*/}
                {/*                            })()}*/}
                {/*                        </TableCell>*/}
                {/*                        <TableCell>*/}
                {/*                            <IconButton onClick={() => handleRemoveAcheteur(index)} color="error">*/}
                {/*                                <DeleteIcon />*/}
                {/*                            </IconButton>*/}
                {/*                        </TableCell>*/}
                {/*                    </TableRow>*/}
                {/*                ))}*/}
                {/*            </TableBody>*/}
                {/*        </Table>*/}
                {/*    </TableContainer>*/}
                {/*    <Box display="flex" justifyContent="center" width="100%" mt={2}>*/}
                {/*        <Button*/}
                {/*            onClick={handleSubmit}*/}
                {/*            variant="contained"*/}
                {/*            color="success"*/}
                {/*            sx={{ width: "50%" }}*/}
                {/*        >*/}
                {/*            Soumettre*/}
                {/*        </Button>*/}
                {/*    </Box>*/}
                {/*</Grid>*/}
                <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nom de l'Acheteur</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {relations.map((relation, index) => {
                                    let displayLabel = "";
                                    if (relation.acheteurMorale) {
                                        const identityStr = `${relation.acheteurMorale.typePieceIdentite?.dsg || ""}${relation.acheteurMorale.numeroPieceIdentite || ""}`;
                                        displayLabel = `${identityStr} - ${relation.acheteurMorale.raisonSocial}`;
                                    } else if (relation.acheteurPhysique) {
                                        const identityStr = `${relation.acheteurPhysique.typePieceIdentite?.dsg || ""}${relation.acheteurPhysique.numeroPieceIdentite || ""}`;
                                        displayLabel = `${identityStr} - ${relation.acheteurPhysique.nom} ${relation.acheteurPhysique.prenom}`;
                                    }
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{displayLabel}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleRemoveAcheteur(index)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </Grid>
            </Grid>
        </Box>
    );
};

export default AdherAchet;
