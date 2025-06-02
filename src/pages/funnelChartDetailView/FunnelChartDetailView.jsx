import { useState } from "react";
import { Box, Typography } from "@mui/material";
import FunnelChart from "../charts/FunnelChart.jsx";

const FunnelChartDetailView = () => {
    const [funnelData, setFunnelData] = useState([]);

    const stepDescriptions = {
        Validation: "Étape initiale de vérification du contrat.",
        Juridique: "Revue et validation par l'équipe juridique.",
        Modification: "Modifications demandées sur le contrat.",
        Validé: "Contrat finalisé et validé.",
        Signé: "Contrat signé par toutes les parties.",
    };

    const colorMap = {
        Validation: "#a117fc",
        Juridique: "#45ffd0",
        Modification: "#03fbff",
        Validé: "#ffb3fe",
        Signé: "#FFA07A",
    };

    return (
        <Box m={4}>
            <Typography variant="h3" gutterBottom>
                Les Étapes de Création du Contrat
            </Typography>

            <Box display="flex" justifyContent="center" alignItems="flex-start" gap={6} mt={4}>
                <Box height="500px" width="50%">
                    <FunnelChart withLabel={true} onDataLoaded={setFunnelData} />
                </Box>

                <Box width="40%">
                    {/* Legend */}
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Légende
                        </Typography>
                        {Object.entries(colorMap).map(([label, color]) => (
                            <Box key={label} display="flex" alignItems="center" mb={1}>
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        backgroundColor: color,
                                        mr: 1,
                                        borderRadius: "4px",
                                    }}
                                />
                                <Typography>{label}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Step Descriptions */}
                    <Box mt={4}>
                        <Typography variant="h5" gutterBottom>
                            Description des étapes
                        </Typography>
                        {Object.entries(stepDescriptions).map(([label, description]) => (
                            <Box key={label} mb={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Optional Last Updated */}
                    <Box mt={3}>
                        <Typography variant="caption" color="text.secondary">
                            Données mises à jour le : {new Date().toLocaleDateString("fr-FR")}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default FunnelChartDetailView;
