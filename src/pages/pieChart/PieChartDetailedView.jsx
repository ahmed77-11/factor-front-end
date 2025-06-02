import { Box, Typography } from "@mui/material";
import DemFinCountChart from "../charts/DemFinCountChart.jsx";

const PieChartDetailedView = () => {

  return (
    <Box m={4} >
      <Typography variant="h3" gutterBottom>
          Demandes Finalisées
      </Typography>


      <Box mt={4} height='500px' width={"100%"}>
        <DemFinCountChart  withLabel={true} />
      </Box>
    </Box>
  );
};

export default PieChartDetailedView;
