// import { ResponsiveLine } from '@nivo/line';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import {Box, Typography, CircularProgress, useTheme} from '@mui/material';
// import {tokens} from "../../theme.js";
//
// const   TopAdherentsLineChart = ({withLabel}) => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//         const theme = useTheme();
//     const colors = tokens(theme.palette.mode);
//
//     const formatDate = (dateStr) => {
//         const date = new Date(dateStr);
//         if (isNaN(date)) return null;
//         return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
//     };
//
//     const formatDateForDisplay = (dateStr) => {
//         const date = new Date(dateStr);
//         if (isNaN(date)) return dateStr;
//         return date.toLocaleDateString('fr-FR', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//         });
//     };
//
//     useEffect(() => {
//         axios.get('http://localhost:8083/factoring/contrat/api/dashboard/adherent-monthly-montants', {
//             withCredentials: true
//         })
//             .then(response => {
//                 const rawData = response.data;
//
//                 const grouped = {};
//
//                 rawData.forEach(item => {
//                     if (
//                         item &&
//                         typeof item.adherentRs === 'string' &&
//                         item.month &&
//                         item.montant !== null &&
//                         !isNaN(item.montant)
//                     ) {
//                         const adherent = item.adherentRs;
//                         const dateKey = formatDate(item.month);
//                         const montant = Number(item.montant);
//
//                         if (!dateKey || isNaN(montant)) return;
//
//                         if (!grouped[adherent]) {
//                             grouped[adherent] = {};
//                         }
//
//                         // Group by date and sum amounts for the same date
//                         if (!grouped[adherent][dateKey]) {
//                             grouped[adherent][dateKey] = 0;
//                         }
//                         grouped[adherent][dateKey] += montant;
//                     }
//                 });
//
//                 const formattedData = Object.entries(grouped).map(([adherent, dateAmounts]) => {
//                     const points = Object.entries(dateAmounts).map(([date, totalAmount]) => ({
//                         x: date,
//                         y: totalAmount
//                     }));
//
//                     return {
//                         id: adherent,
//                         data: points
//                             .filter(p => p.x && !isNaN(p.y))
//                             .sort((a, b) => new Date(a.x) - new Date(b.x)) // Sort chronologically
//                     };
//                 });
//
//                 setData(formattedData);
//             })
//             .catch(error => {
//                 console.error('Error fetching data:', error);
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     }, []);
//
//     if (loading) return <CircularProgress />;
//     if (data.length === 0) return <Typography m={4}>Aucune donnée disponible.</Typography>;
//
//
//     const fontSize = withLabel ? 12 : 11;
//         const legendItems = withLabel
//             ? [{
//                 anchor: 'bottom-right',
//                 direction: 'column',
//                 translateX: 100,
//                 translateY: 0,
//
//                 itemWidth: 80,
//                 itemHeight: 20,
//                 itemOpacity: 0.75,
//                 symbolSize: 12,
//                 symbolShape: 'circle',
//                 effects: [
//                     {
//                         on: 'hover',
//                         style: {
//                             itemBackground: 'rgba(0, 0, 0, .03)',
//                             itemOpacity: 1
//                         }
//                     }
//                 ]
//             }]
//             : [{
//                 anchor: 'bottom-right',
//                 direction: 'column',
//                 translateX: 100,
//                 translateY: 0,
//
//                 itemWidth: 80,
//                 itemHeight: 20,
//                 itemOpacity: 0.75,
//                 symbolSize: 12,
//                 symbolShape: 'circle',
//                 effects: [
//                     {
//                         on: 'hover',
//                         style: {
//                             itemBackground: 'rgba(0, 0, 0, .03)',
//                             itemOpacity: 1
//                         }
//                     }
//                 ]
//             }];
//
//
//         return (
//             <Box m={1} height="100%"   >
//                 <Typography variant="h5" gutterBottom>
//                     Top Adhérents – Montant Facture Mensuel
//                 </Typography>
//                 <ResponsiveLine
//
//                     data={data}
//                     margin={{ top: 10, right: 120, bottom: 70, left: 70 }}
//
//                     xScale={{ type: 'point' }}
//                     yScale={{
//                         type: 'linear',
//                         min: 'auto',
//                         max: 'auto',
//                         stacked: false,
//                         reverse: false
//                     }}
//                     axisTop={null}
//                     axisRight={null}
//                     axisBottom={withLabel?{
//                         orient: 'bottom',
//                         tickSize: 5,
//                         tickPadding: 5,
//                         tickRotation: -45,
//                         legend: 'Mois',
//                         legendOffset: 100,
//                         legendPosition: 'middle',
//                         tickValues: 'every 1 month',
//                         tickTextColor: colors.grey[100]
//                     }:{}}
//                     axisLeft={withLabel?{
//                         orient: 'left',
//                         tickSize: 5,
//                         tickPadding: 5,
//                         tickRotation: 0,
//                         legend: 'Montant Admis',
//                         legendOffset: -66,
//                         legendPosition: 'middle',
//                         tickTextColor: colors.grey[100]
//                     }:{}}
//                     pointSize={10}
//                     pointColor={{ theme: 'background' }}
//                     pointBorderWidth={2}
//                     pointBorderColor={{ from: 'serieColor' }}
//                     pointLabelYOffset={-12}
//                     useMesh={true}
//                     enablePointLabel={withLabel}
//                     pointLabel={withLabel ? 'y' : null}
//                     legends={legendItems}
//                     colors={{ scheme: 'nivo' }}
//                     animate={true}
//                     motionStiffness={90}
//                     motionDamping={15}
//                     theme={{
//                         axis: {
//                             ticks: {
//                                 text: {
//                                     fill: colors.grey[100],
//                                     fontSize,
//                                 },
//                             },
//                             legend: {
//                                 text: {
//                                     fill: colors.grey[100],
//                                     fontSize: fontSize + 2,
//                                 },
//                             },
//                         },
//                         labels: {
//                             text: {
//                                 fill: colors.grey[100],
//                                 fontSize: fontSize + 1,
//                             },
//                         },
//                         legends: {
//                             text: {
//                                 fill: colors.grey[100],
//                                 fontSize,
//                             },
//                         },
//                         tooltip: {
//                             container: {
//                                 background: colors.primary[900],
//                                 color: colors.grey[100],
//                                 fontSize,
//                             },
//                         }
//                     }}
//                 />
//             </Box>
//     );
// };
//
// export default TopAdherentsLineChart;


import { ResponsiveLine } from '@nivo/line';
import {Box, Typography, useTheme} from '@mui/material';
import {tokens} from "../../theme.js";

// eslint-disable-next-line react/prop-types
const TopAdherentsLineChart = ({withLabel}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const data = [
        {
            id: "AHMED RS",
            data: [
                { x: "2024-11", y: 100000 },
                { x: "2024-12", y: 105000 },
                { x: "2025-01", y: 99000 },
                { x: "2025-02", y: 110000 },
                { x: "2025-03", y: 120000 },
                { x: "2025-04", y: 150013 },
                { x: "2025-05", y: 160000 },
                { x: "2025-06", y: 158000 },
                { x: "2025-07", y: 162000 },
                { x: "2025-08", y: 170000 }
            ]
        },
        {
            id: "MedFactor Corp",
            data: [
                { x: "2024-11", y: 112000 },
                { x: "2024-12", y: 117000 },
                { x: "2025-01", y: 119000 },
                { x: "2025-02", y: 121000 },
                { x: "2025-03", y: 115000 },
                { x: "2025-04", y: 116000 },
                { x: "2025-05", y: 119000 },
                { x: "2025-06", y: 123000 },
                { x: "2025-07", y: 125000 },
                { x: "2025-08", y: 130000 }
            ]
        },
        {
            id: "ahmed syrine",
            data: [
                { x: "2024-11", y: 5000 },
                { x: "2024-12", y: 4500 },
                { x: "2025-01", y: 7000 },
                { x: "2025-02", y: 7300 },
                { x: "2025-03", y: 8000 },
                { x: "2025-04", y: 3000 },
                { x: "2025-05", y: 8000 },
                { x: "2025-06", y: 100 },
                { x: "2025-07", y: 300 },
                { x: "2025-08", y: 500 }
            ]
        },
        {
            id: "raison social123",
            data: [
                { x: "2024-11", y: 6000 },
                { x: "2024-12", y: 6200 },
                { x: "2025-01", y: 6300 },
                { x: "2025-02", y: 6500 },
                { x: "2025-03", y: 6700 },
                { x: "2025-04", y: 6500 },
                { x: "2025-05", y: 7000 },
                { x: "2025-06", y: 7500 },
                { x: "2025-07", y: 7800 },
                { x: "2025-08", y: 8000 }
            ]
        },
        {
            id: "Tech Global",
            data: [
                { x: "2024-11", y: 18000 },
                { x: "2024-12", y: 20000 },
                { x: "2025-01", y: 21000 },
                { x: "2025-02", y: 23000 },
                { x: "2025-03", y: 25000 },
                { x: "2025-04", y: 20000 },
                { x: "2025-05", y: 21000 },
                { x: "2025-06", y: 25000 },
                { x: "2025-07", y: 26000 },
                { x: "2025-08", y: 27000 }
            ]
        },
        {
            id: "GreenFarm Ltd.",
            data: [
                { x: "2024-11", y: 4500 },
                { x: "2024-12", y: 5000 },
                { x: "2025-01", y: 5500 },
                { x: "2025-02", y: 6000 },
                { x: "2025-03", y: 6500 },
                { x: "2025-04", y: 5000 },
                { x: "2025-05", y: 8000 },
                { x: "2025-06", y: 6000 },
                { x: "2025-07", y: 7000 },
                { x: "2025-08", y: 7500 }
            ]
        }
    ];


    const fontSize = withLabel ? 12 : 11;
        const legendItems = withLabel
            ? [{
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 100,
                translateY: 0,

                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }]
            : [{
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 100,
                translateY: 0,

                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }];


        return (
            <Box m={1} height="100%"   >
                <Typography variant="h5" gutterBottom>
                    Top Adhérents – Montant Facture Mensuel
                </Typography>
                <ResponsiveLine

                    data={data}
                    margin={{ top: 20, right: 120, bottom: 70, left: 70 }}

                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={withLabel?{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Mois',
                        legendOffset: 100,
                        legendPosition: 'middle',
                        tickValues: 'every 1 month',
                        tickTextColor: colors.grey[100]
                    }:{}}
                    axisLeft={withLabel?{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Montant Admis',
                        legendOffset: -66,
                        legendPosition: 'middle',
                        tickTextColor: colors.grey[100]
                    }:{}}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    enablePointLabel={withLabel}
                    pointLabel={withLabel ? 'y' : null}
                    legends={legendItems}
                    colors={{ scheme: 'nivo' }}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: colors.grey[100],
                                    fontSize,
                                },
                            },
                            legend: {
                                text: {
                                    fill: colors.grey[100],
                                    fontSize: fontSize + 2,
                                },
                            },
                        },
                        labels: {
                            text: {
                                fill: colors.grey[100],
                                fontSize: fontSize + 1,
                            },
                        },
                        legends: {
                            text: {
                                fill: colors.grey[100],
                                fontSize,
                            },
                        },
                        tooltip: {
                            container: {
                                background: colors.primary[900],
                                color: colors.grey[100],
                                fontSize,
                            },
                        }
                    }}
                />
            </Box>
        );
    };

    export default TopAdherentsLineChart;
