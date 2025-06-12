/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveFunnel } from "@nivo/funnel";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme.js";

const FunnelChart = ({ withLabel = false, onDataLoaded }) => {
    const [data, setData] = useState([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const getLabelFr = (code) => {
        switch (code) {
            case "SVV":
                return "Validation";
            case "SVJ":
                return "Validation_Juridique";
            case "SM":
                return "Modification";
            case "SV":
                return "Validé";
            case "SS":
                return "Signé";
            default:
                return code;
        }
    };

    useEffect(() => {
        axios
            .get("http://localhost:8083/factoring/contrat/api/dashboard/funnel-steps", {
                withCredentials: true,
            })
            .then((res) => {
                const transformed = res.data
                    .filter((step) => step.count > 0)
                    .map((step) => ({
                        id: getLabelFr(step.code),
                        value: step.count,
                        label: getLabelFr(step.code),
                    }));

                if (Array.isArray(transformed) && transformed.length >= 2) {
                    setData(transformed);
                    if (onDataLoaded) onDataLoaded(transformed); // Send data to parent
                }
            })
            .catch((err) => {
                console.error("Error fetching funnel data", err);
            });
    }, []);

    const colorMap = {
        Validation: '#a117fc',
        Validation_Juridique: '#45ffd0',
        Modification: '#03fbff',
        Validé: '#ffb3fe',
        Signé: '#FFA07A',
    };

    return (
        <Box height="100%">
            <Typography variant="h4" mb={2}>
                État d’avancement des contrats
            </Typography>

            {data.length > 0 ? (
                <ResponsiveFunnel
                    data={data}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    spacing={0}
                    valueScale={{ type: "linear" }}
                    shapeBlending={0.3}
                    valueFormat=">-," // Thousand separator
                    colors={(d) => colorMap[d.id] || "#CCCCCC"}
                    borderWidth={20}
                    labelColor={{ from: "color", modifiers: [["darker", 3]] }}
                    theme={{
                        labels: {
                            text: {
                                fontSize: withLabel ? 14 : 11,
                                fill: colors.grey[100],
                            },
                        },
                        tooltip: {
                            container: {
                                background: colors.primary[900],
                                color: colors.grey[100],
                                fontSize: withLabel ? 14 : 12,
                            },
                        },
                    }}
                    role="application"
                    ariaLabel="Entonnoir d’état de contrat"
                />
            ) : (
                <Typography variant="body1" color="warning.main">
                    Pas assez de données pour afficher l’entonnoir.
                </Typography>
            )}
        </Box>
    );
};

export default FunnelChart;
