/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { ResponsivePie } from "@nivo/pie";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

const DemFinCountChart = ({ withLabel }) => {
    const [data, setData] = useState([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Map raw status ID to display label and color
    const statusMap = {
        REJETER: { label: "Rejetée", color: "#db4f4a" },
        EN_COURS: { label: "En cours", color: "#ffae00" },
        VALIDER: { label: "Validée", color: "#4cceac" },
    };

    useEffect(() => {
        axios
            .get("http://localhost:8083/factoring/contrat/api/dashboard/count-by-status", {
                withCredentials: true,
            })
            .then((res) => {
                const mappedData = res.data.map((item) => {
                    const status = statusMap[item.id?.toUpperCase()] || {
                        label: item.id,
                        color: "#8884d8",
                    };
                    return {
                        id: status.label,
                        label: status.label,
                        value: item.value,
                        color: status.color,
                    };
                });
                setData(mappedData);
            });
    }, []);

    const legends = withLabel
        ? [
            {
                anchor: "top-left",
                direction: "column",
                itemWidth: 100,
                itemHeight: 50,
                symbolSize: 30,
            },
        ]
        : [];

    return (
        <Box height="100%">
            <Typography variant="h4" mb={2}>
                Statut des Demandes de Financement
            </Typography>
            <ResponsivePie
                data={data}
                margin={{ top: 40, right: 20, bottom: 40, left: 20 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={(d) => d.data.color}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={colors.grey[100]}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={colors.grey[100]}
                legends={legends}
                theme={{
                    axis: {
                        domain: {
                            line: {
                                stroke: colors.grey[100],
                            },
                        },
                        ticks: {
                            line: {
                                stroke: colors.grey[100],
                            },
                            text: {
                                fill: colors.grey[100],
                            },
                        },
                        legend: {
                            text: {
                                fill: colors.grey[100],
                            },
                        },
                    },
                    legends: {
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                    labels: {
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                    tooltip: {
                        container: {
                            backgroundColor: colors.primary[900],
                            color: colors.grey[100],
                        },
                    },
                }}
            />
        </Box>
    );
};

export default DemFinCountChart;
