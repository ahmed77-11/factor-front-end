import React from "react";
import { useTheme, Box, Typography, Button } from "@mui/material";
import { tokens } from "../../../theme.js";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            bgcolor={colors.primary[400]}
            color={colors.grey[100]}
            textAlign="center"
        >
            <Typography variant="h1" fontWeight="bold" mb={2}>
                404
            </Typography>
            <Typography variant="h5" mb={3}>
                Oups ! La page que vous cherchez n&#39;existe pas.
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/")}
            >
                Retour à l&#39;accueil
            </Button>
        </Box>
    );
};

export default NotFound;
