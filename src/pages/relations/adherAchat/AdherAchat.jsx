import { useState } from "react";
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

const allAdherents = ["Adhérent 1", "Adhérent 2", "Adhérent 3"];
const allAcheteurs = ["Jean Dupont", "Marie Curie", "Albert Einstein", "Isaac Newton"];

const AdherAchet = () => {
    const [selectedAdherent, setSelectedAdherent] = useState(null);
    const [selectedAcheteur, setSelectedAcheteur] = useState(null);
    const [acheteursList, setAcheteursList] = useState([]);

    // Ajouter un acheteur à la liste
    const handleAddAcheteur = () => {
        if (selectedAcheteur) {
            setAcheteursList([...acheteursList, selectedAcheteur]);
            setSelectedAcheteur(null);
        }
    };

    // Supprimer un acheteur
    const handleRemoveAcheteur = (index) => {
        setAcheteursList(acheteursList.filter((_, i) => i !== index));
    };

    // Soumettre la liste des acheteurs
    const handleSubmit = () => {
        console.log("Adhérent sélectionné:", selectedAdherent);
        console.log("Liste des acheteurs:", acheteursList);
        alert("Données soumises avec succès !");
    };

    return (
        <Box width="100%" p={3} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
            <Header subtitle={"Ajouter des Acheteurs à l'adhérent"} title={"Les relations"} />
            <Grid container spacing={4} justifyContent="center">
                {/* Sélection de l'Adhérent & Acheteur */}
                <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="subtitle1" mb={1}>Sélectionner un Adhérent :</Typography>
                    <Autocomplete
                        options={allAdherents}
                        value={selectedAdherent}
                        disabled={selectedAdherent!==null}
                        onChange={(event, newValue) => setSelectedAdherent(newValue)}
                        renderInput={(params) => <TextField {...params} label="Adhérent" variant="outlined" fullWidth />}
                        sx={{ mb: 3, width: 400 }}
                    />
                    <Typography variant="subtitle1" mb={1}>Sélectionner un Acheteur :</Typography>
                    <Autocomplete
                        options={allAcheteurs}
                        value={selectedAcheteur}
                        onChange={(event, newValue) => setSelectedAcheteur(newValue)}
                        freeSolo
                        disabled={!selectedAdherent}
                        renderInput={(params) => <TextField {...params} label="Acheteur" variant="outlined" fullWidth />}
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
                                {acheteursList.map((acheteur, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{acheteur}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleRemoveAcheteur(index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box display="flex" justifyContent="center" width="100%" mt={2}>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="success"
                            sx={{ width: "50%" }}
                        >
                            Soumettre
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdherAchet;