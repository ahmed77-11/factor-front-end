import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Typography, Box, Card, CardContent, Grid, Paper } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';

const FinancialDashboard = () => {
    const [lineData, setLineData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [adherents, setAdherents] = useState([]);
    const [totals, setTotals] = useState({ totalAmount: 0, transactions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8083/factoring/contrat/api/dashboard/adherent-monthly-montants', {
            withCredentials: true,
        })
            .then((response) => {
                const rawData = Array.isArray(response.data) ? response.data : [];

                if (rawData.length === 0) {
                    setLoading(false);
                    return;
                }

                // Process data for line chart (trends over time)
                const lineDataMap = new Map();
                rawData.forEach(item => {
                    if (!item.month || !item.adherentRs) return;

                    const month = item.month.slice(0, 7);
                    const adherentName = item.adherentRs;
                    const amount = Number(item.montant) || 0;

                    if (!lineDataMap.has(adherentName)) {
                        lineDataMap.set(adherentName, {
                            id: adherentName,
                            data: []
                        });
                    }

                    lineDataMap.get(adherentName).data.push({
                        x: month,
                        y: amount
                    });
                });

                // Sort each series by date
                Array.from(lineDataMap.values()).forEach(series => {
                    series.data.sort((a, b) => a.x.localeCompare(b.x));
                });

                setLineData(Array.from(lineDataMap.values()));

                // Process data for bar chart (total by adherent)
                const adherentTotals = new Map();
                rawData.forEach(item => {
                    if (!item.adherentRs) return;

                    const adherentName = item.adherentRs;
                    const amount = Number(item.montant) || 0;

                    const currentTotal = adherentTotals.get(adherentName) || 0;
                    adherentTotals.set(adherentName, currentTotal + amount);
                });

                const barChartData = Array.from(adherentTotals, ([adherent, total]) => ({
                    adherent,
                    total
                })).sort((a, b) => b.total - a.total);

                setBarData(barChartData);
                setAdherents(Array.from(adherentTotals.keys()));

                // Calculate totals
                const totalAmount = Array.from(adherentTotals.values()).reduce((sum, val) => sum + val, 0);
                setTotals({
                    totalAmount,
                    transactions: rawData.length
                });

                setLoading(false);
            })
            .catch((error) => {
                console.error('API error:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!lineData.length && !barData.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography variant="h6">Aucune donnée disponible pour le tableau de bord.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f7fa' }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#2c3e50', fontWeight: 'bold' }}>
                Tableau de Bord Financier
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <SummaryCard
                        title="Montant Total"
                        value={`${totals.totalAmount.toLocaleString()} €`}
                        color="#3498db"
                        icon="💰"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <SummaryCard
                        title="Transactions"
                        value={totals.transactions.toLocaleString()}
                        color="#2ecc71"
                        icon="📊"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <SummaryCard
                        title="Adhérents"
                        value={adherents.length}
                        color="#9b59b6"
                        icon="👥"
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Évolution Mensuelle par Adhérent">
                        <div style={{ height: '400px' }}>
                            <ResponsiveLine
                                data={lineData}
                                margin={{ top: 30, right: 110, bottom: 70, left: 60 }}
                                xScale={{ type: 'point' }}
                                yScale={{
                                    type: 'linear',
                                    min: 'auto',
                                    max: 'auto',
                                    stacked: false,
                                    reverse: false
                                }}
                                curve="monotoneX"
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: -45,
                                    legend: 'Mois',
                                    legendOffset: 50,
                                    legendPosition: 'middle'
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Montant (€)',
                                    legendOffset: -50,
                                    legendPosition: 'middle'
                                }}
                                pointSize={8}
                                pointColor={{ theme: 'background' }}
                                pointBorderWidth={2}
                                pointBorderColor={{ from: 'serieColor' }}
                                pointLabelYOffset={-12}
                                useMesh={true}
                                legends={[
                                    {
                                        anchor: 'bottom-right',
                                        direction: 'column',
                                        justify: false,
                                        translateX: 100,
                                        translateY: 0,
                                        itemsSpacing: 0,
                                        itemDirection: 'left-to-right',
                                        itemWidth: 80,
                                        itemHeight: 20,
                                        itemOpacity: 0.75,
                                        symbolSize: 12,
                                        symbolShape: 'circle',
                                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                        effects: [
                                            {
                                                on: 'hover',
                                                style: {
                                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                                    itemOpacity: 1
                                                }
                                            }
                                        ]
                                    }
                                ]}
                                colors={{ scheme: 'category10' }}
                                tooltip={({ point }) => (
                                    <Box sx={{
                                        backgroundColor: 'white',
                                        p: 1.5,
                                        borderRadius: '4px',
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{point.serieId}</Typography>
                                        <Typography variant="body2" sx={{ color: '#555' }}>{point.data.xFormatted}</Typography>
                                        <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', color: '#2c3e50' }}>
                                            {point.data.yFormatted} €
                                        </Typography>
                                    </Box>
                                )}
                            />
                        </div>
                    </ChartCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard title="Total par Adhérent">
                        <div style={{ height: '400px' }}>
                            <ResponsiveBar
                                data={barData}
                                keys={['total']}
                                indexBy="adherent"
                                margin={{ top: 30, right: 30, bottom: 70, left: 60 }}
                                padding={0.3}
                                layout="vertical"
                                valueScale={{ type: 'linear' }}
                                indexScale={{ type: 'band', round: true }}
                                colors={{ scheme: 'set3' }}
                                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: -45,
                                    legend: 'Adhérent',
                                    legendPosition: 'middle',
                                    legendOffset: 45
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Montant Total (€)',
                                    legendPosition: 'middle',
                                    legendOffset: -50
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                animate={true}
                                motionConfig="gentle"
                                tooltip={({ value, indexValue }) => (
                                    <Box sx={{
                                        backgroundColor: 'white',
                                        p: 1.5,
                                        borderRadius: '4px',
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{indexValue}</Typography>
                                        <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', color: '#2c3e50' }}>
                                            {value.toLocaleString()} €
                                        </Typography>
                                    </Box>
                                )}
                            />
                        </div>
                    </ChartCard>
                </Grid>
            </Grid>

            {/* Top Adherents Table */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <ChartCard title="Top Adhérents">
                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Adhérent</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Montant Total (€)</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Transactions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {barData.slice(0, 5).map((row, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.adherent}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{row.total.toLocaleString()}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            {Math.ceil(row.total / (totals.totalAmount / totals.transactions))}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>
        </Box>
    );
};

// Reusable Card Component for Charts
const ChartCard = ({ title, children }) => (
    <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>{title}</Typography>
            {children}
        </CardContent>
    </Card>
);

// Summary Card Component
const SummaryCard = ({ title, value, color, icon }) => (
    <Card sx={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        borderLeft: `4px solid ${color}`,
        height: '100%'
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                    backgroundColor: `${color}20`,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                }}>
                    <Typography variant="h4" sx={{ color }}>{icon}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ color: '#718096', fontWeight: 500 }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>{value}</Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export default FinancialDashboard;