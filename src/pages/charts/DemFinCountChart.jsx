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

  useEffect(() => {
    axios
      .get("http://localhost:8083/factoring/contrat/api/dashboard/count-by-status", {
        withCredentials: true,
      })
      .then((res) => {
        const mappedData = res.data.map((item) => {
          let color = "#8884d8"; // default fallback
          switch (item.id?.toUpperCase()) {
            case "REJETER":
              color = "#db4f4a"; // red
              break;
            case "EN_COURS":
              color = "#ffae00"; // yellow
              break;
            case "VALIDER":
              color = "#4cceac"; // green
              break;
          }
          return { ...item, color };
        });
        setData(mappedData);
      });
  }, []);

  const legends = withLabel
    ? [
        {
            anchor: 'top-left',
            direction: 'column',
            itemWidth: 100,
            itemHeight: 50,
            symbolSize: 30
        }
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
            arcLinkLabelsTextColor={colors.grey[100]} // ✅ arc link label lines
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={colors.grey[100]} // ✅ labels inside pie slices
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
                        fill: colors.grey[100], // ✅ legend labels
                    },
                },
                labels: {
                    text: {
                        fill: colors.grey[100], // ✅ inside pie labels
                    },
                },
                tooltip: {
                    container: {
                        backgroundColor: colors.primary[900], // ✅ Tooltip background color

                        color: colors.grey[100], // ✅ tooltip text color
                    },
                },
            }}
        />
    </Box>
  );
};

export default DemFinCountChart;
