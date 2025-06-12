import { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import FunnelChart from "../charts/FunnelChart.jsx";

const FunnelChartDetailView = () => {
    const [funnelData, setFunnelData] = useState([]);

    const stepDescriptions = {
        Validation: "Étape initiale de Validation du contrat.",
        Validation_Juridique: "Revue et validation par Validateur juridique.",
        Modification: "Modifications demandées sur le contrat.",
        Validé: "Contrat finalisé et validé.",
        Signé: "Contrat signé par le Signateur",
    };

    const colorMap = {
        Validation: "#a117fc",
        Validation_Juridique: "#45ffd0",
        Modification: "#03fbff",
        Validé: "#ffb3fe",
        Signé: "#FFA07A",
    };




    return (
        <Box m={6}>
            <Typography variant="h2" gutterBottom fontWeight="bold">
                Les Étapes de Création du Contrat
            </Typography>

            <Box display="flex" justifyContent="center" alignItems="flex-start" gap={8} mt={6}>
                <Paper elevation={4} sx={{ height: "520px", width: "50%", p: 2,mt :10   }}>
                    <FunnelChart withLabel={true} onDataLoaded={setFunnelData} />
                </Paper>

                <Box width="50%">
                    {/* Legend */}
                    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Légende
                        </Typography>
                        {Object.entries(colorMap).map(([label, color]) => (
                            <Box key={label} display="flex" alignItems="center" mb={1.5}>
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: color,
                                        mr: 2,
                                        borderRadius: "4px",
                                    }}
                                />
                                <Typography variant="body1" fontWeight="500">{label==="Validation_Juridique"?`${label.split("_")[0]} ${label.split("_")[1]}`:label}</Typography>
                            </Box>
                        ))}
                    </Paper>

                    {/* Step Descriptions */}
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Description des étapes
                        </Typography>
                        {Object.entries(stepDescriptions).map(([label, description]) => (
                            <Box key={label} mb={2}>
                                <Typography variant="h6" fontWeight="bold">
                                    {label==="Validation_Juridique"?`${label.split("_")[0]} ${label.split("_")[1]}`:label}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {description}
                                </Typography>
                            </Box>
                        ))}

                        {/* Optional Last Updated */}
                        <Box mt={4}>
                            <Typography variant="caption" color="text.secondary">
                                Données mises à jour le : {new Date().toLocaleDateString("fr-FR")}
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default FunnelChartDetailView;
