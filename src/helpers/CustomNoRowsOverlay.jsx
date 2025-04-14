import { GridOverlay } from "@mui/x-data-grid";
import {Box} from "@mui/material";

const CustomNoRowsOverlay = () => (
    <GridOverlay>
        <Box sx={{ mt: 3, fontSize: 16 }}>
            Aucun contrat à valider.
        </Box>
    </GridOverlay>
);

export default CustomNoRowsOverlay;
