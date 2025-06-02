import { Box, Typography } from "@mui/material";
import TopAdherentsLineChart from "../charts/TopAdherentsLineChart.jsx";

const TopAdherentsDetailView = () => {
    return (
        <Box m={4}>
            <Typography variant="h3" gutterBottom>
                Détail des montants admis par adhérent
            </Typography>

            <Box mt={4} height="500px" width="100%">
                <TopAdherentsLineChart withLabel={true} />
            </Box>
        </Box>
    );
};

export default TopAdherentsDetailView;
