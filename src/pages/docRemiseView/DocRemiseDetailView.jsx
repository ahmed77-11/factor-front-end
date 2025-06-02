import  { useState } from "react";
import { Box, Typography } from "@mui/material";
import AdherentAutocomplete from "../../components/AdherentAutoComplete.jsx";
import DocRemiseChart from "../charts/DocRemiseCharts.jsx";

const DocRemiseDetailView = () => {
  const [adherentId, setAdherentId] = useState("");

  return (
    <Box m={4} >
      <Typography variant="h3" gutterBottom>
        Détail des factures par adhérent
      </Typography>

      <AdherentAutocomplete value={adherentId} onChange={setAdherentId} />

      <Box mt={4} height='500px' width={"100%"}>
        <DocRemiseChart adherentId={adherentId} withLabel={true} />
      </Box>
    </Box>
  );
};

export default DocRemiseDetailView;
