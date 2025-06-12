import {Box, CircularProgress, IconButton, Typography, useTheme} from "@mui/material";
import { tokens } from "../../theme.js";
import {
    DownloadOutlined,
    People,
    Apartment,
    ShoppingCart,
    AttachMoney
} from "@mui/icons-material";

import DocRemiseChart from "../charts/DocRemiseCharts";
import DemFinCountChart from "../charts/DemFinCountChart.jsx";
import FunnelChart from "../charts/FunnelChart.jsx";
import TopAdherentsLineChart from "../charts/TopAdherentsLineChart.jsx";
import TopAdherentsList from "../charts/TopAdherenetList.jsx";
import {useEffect, useRef, useState} from "react";
import axios from "axios";

const Home = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const chartRef = useRef();


    const [countUser, setCountUser] = useState(0);
    const [countRoles, setCountRoles] = useState({});
    const [totalDocRemises, setTotalDocRemises] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const downloadSVGChart = () => {
        const svg = chartRef.current?.querySelector("svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "top-adherents-line-chart.svg";
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [userRes, rolesRes, docRes] = await Promise.all([
                    axios.get("http://localhost:8082/factoring/users/api/user/dashboard/count-users",{withCredentials:true}),
                    axios.get("http://localhost:8081/factoring/api/relations/dashboard/count-roles",{withCredentials:true}),
                    axios.get("http://localhost:8083/factoring/contrat/api/dashboard/total-doc-remises",{withCredentials:true}),
                ]);

                setCountUser(userRes.data);
                setCountRoles(rolesRes.data);
                setTotalDocRemises(docRes.data);
            } catch (err) {
                setError("Erreur lors du chargement des données du tableau de bord.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    console.log("Count User:", countUser);
    console.log("Count Roles:", countRoles);
    console.log("Total Doc Remises:", totalDocRemises);





    return (
        <Box p={3}>
            {/* Title */}
            <Typography variant="h4" gutterBottom>
                Tableau de bord
            </Typography>

            {/* Top KPIs */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap="20px"
                mt={2}
            >
                {/* KPI Card 1 */}
                <Box
                    gridColumn="span 3"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 100,
                    }}
                >
                    <Box>
                        <Typography variant="h6" color={colors.grey[100]}>
                            Utilisateurs
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                            {countUser || 0}
                        </Typography>
                    </Box>
                    <People sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
                </Box>

                {/* KPI Card 2 */}
                <Box
                    gridColumn="span 3"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 100,
                    }}
                >
                    <Box>
                        <Typography variant="h6" color={colors.grey[100]}>
                            Adherents
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                            {countRoles.nbAdherents || 0}
                        </Typography>
                    </Box>

                    <Apartment sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
                </Box>

                {/* KPI Card 3 */}
                <Box
                    gridColumn="span 3"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 100,
                    }}
                >
                    <Box>
                        <Typography variant="h6" color={colors.grey[100]}>
                            Acheteurs
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                            {countRoles.nbAcheteurs || 0}
                        </Typography>
                    </Box>
                    <ShoppingCart sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
                </Box>

                {/* KPI Card 4 */}
                <Box
                    gridColumn="span 3"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 100,
                    }}
                >
                    <Box>
                        <Typography variant="h6" color={colors.grey[100]}>
                            Montant Total
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                            {totalDocRemises || 0}
                        </Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
                </Box>
            </Box>

            {/* Middle Section: Line chart + List */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap="20px"
                mt={4}
                height="350px"
            >
                {/* Line Chart */}
                <Box
                    gridColumn="span 8"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                            Top Adhérents
                        </Typography>
                        <IconButton>
                            <DownloadOutlined onClick={downloadSVGChart}
                                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                            />
                        </IconButton>
                    </Box>
                    <Box height={"250px"} flexGrow={1}>
                        <TopAdherentsLineChart withLabel={false}  ref={chartRef} />
                    </Box>
                </Box>

                {/* List */}
                <Box
                    gridColumn="span 4"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h5" fontWeight="600" color={colors.grey[100]} mb={2}>
                        Top 5 des adhérents comptant le plus d&#39;acheteurs
                    </Typography>
                    <TopAdherentsList />
                </Box>
            </Box>

            {/* Bottom Section: 3 Charts */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap="20px"
                mt={4}
            >
                {/* Chart 1 */}
                <Box
                    gridColumn="span 4"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        height: 300,
                        minWidth: 350,
                    }}
                >
                    <Typography variant="h6" mb={1} color={colors.grey[100]}>
                        Documents Remis par Mois
                    </Typography>
                    <Box height="230px">
                        <DocRemiseChart withLabel={false} />
                    </Box>
                </Box>

                {/* Chart 2 */}
                <Box
                    gridColumn="span 4"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        height: 300,
                        minWidth: 350,
                    }}
                >
                    <Typography variant="h6" mb={1} color={colors.grey[100]}>
                        Demandes Finalisées
                    </Typography>
                    <Box height="230px">
                        <DemFinCountChart />
                    </Box>
                </Box>

                {/* Chart 3 */}
                <Box
                    gridColumn="span 4"
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: 2,
                        boxShadow: 3,
                        p: 2,
                        height: 300,
                        minWidth: 350,
                    }}
                >
                    <Typography variant="h6" mb={1} color={colors.grey[100]}>
                        Les Étapes du Contrat
                    </Typography>
                    <Box height="230px">
                        <FunnelChart />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
