// /* eslint-disable react/prop-types */
// import  { useEffect, useState } from "react";
// import axios from "axios";
// import { ResponsiveLine } from "@nivo/line";
// import { Box, Typography } from "@mui/material";

// const DocRemiseChart = ({ adherentId }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     let url = "http://localhost:8083/factoring/contrat/api/dashboard/doc-remises-per-month";
//     if (adherentId) url += `?adherentId=${adherentId}`;

//     axios.get(url,{withCredentials:true,}).then((res) => {
//       setData([
//         {
//           id: "Factures",
//           data: res.data.map((item) => ({
//             x: item.month,
//             y: item.count,
//           })),
//         },
//       ]);
//     });
//   }, [adherentId]);

//   return (
//     <Box height="400px">
//       <Typography variant="h4" mb={2}>
//         Nombre de factures par mois
//       </Typography>
//       <ResponsiveLine
//         data={data}
//         margin={{ top: 30, right: 40, bottom: 60, left: 60 }}
//         xScale={{ type: "point" }}
//         yScale={{ type: "linear", min: 0 }}
//         axisBottom={{
//           legend: "Mois",
//           legendOffset: 36,
//           legendPosition: "middle",
//         }}
//         axisLeft={{
//           legend: "Factures",
//           legendOffset: -50,
//           legendPosition: "middle",
//         }}
//         colors={{ scheme: "category10" }}
//         pointSize={10}
//         useMesh={true}
//         enableSlices="x"
//       />
//     </Box>
//   );
// };

// export default DocRemiseChart;
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveBar } from "@nivo/bar";
import {Box, Typography, useTheme} from "@mui/material";
import {tokens} from "../../theme.js";

const DocRemiseChart = ({ adherentId,withLabel }) => {
  const [data, setData] = useState([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

  useEffect(() => {
    let url = "http://localhost:8083/factoring/contrat/api/dashboard/doc-remises-per-month";
    if (adherentId) url += `?adherentId=${adherentId}`;

    axios.get(url, { withCredentials: true }).then((res) => {
      // Transform data to Nivo Bar chart format
      // Nivo bar expects an array of objects like { month: "Jan", count: 10 }
        setData(
            res.data.map((item) => {
                const [year, month] = item.month.split("-");
                const date = new Date(`${item.month}-01`);
                const formatter = new Intl.DateTimeFormat("fr", { month: "long" });
                const monthName = formatter.format(date);
                return {
                    month: `${year}-${monthName}`, // e.g., "2025-mai"
                    factures: item.count,
                };
            })
        );
    });
  }, [adherentId]);

  return (
    <Box height="100%">
      <Typography variant="h4" mb={2}>
        Nombre de factures crées par mois
      </Typography>
        <ResponsiveBar
            data={data}
            keys={["factures"]}
            indexBy="month"
            margin={{ top: 20, right: 30, bottom: 70, left: 30 }}
            padding={0.1}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={{ scheme: 'set2' }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Mois",
                legendPosition: "middle",
                legendOffset: 40,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Factures",
                legendPosition: "middle",
                legendOffset: -50,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={"#ffffff"}
            role="application"
            ariaLabel="Bar chart showing number of factures per month"
            barAriaLabel={(e) =>
                `${e.id}: ${e.formattedValue} factures in month ${e.indexValue}`
            }
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
                            fontSize:withLabel? 13:10,

                            fill: colors.grey[100], // ✅ Axis tick text color
                        },
                    },
                    legend: {
                        text: {
                            fontSize:withLabel? 13:10,

                            fill: colors.grey[100], // ✅ Axis legend text color
                        },
                    },
                },
                labels: {
                    text: {
                        fill: colors.grey[100], // ✅ Bar label text color
                    },
                },
                tooltip: {
                    container: {
                        backgroundColor: colors.primary[900], // ✅ Tooltip background color
                        color: colors.grey[100], // ✅ Tooltip text color
                    },
                },
                legends: {
                    text: {
                        fontSize:withLabel? 13:10,

                        fill: colors.grey[100], // If you add legends in the future
                    },
                },
            }}
        />
    </Box>
  );
};

export default DocRemiseChart;
