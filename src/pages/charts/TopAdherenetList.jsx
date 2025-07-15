import  { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, useTheme } from "@mui/material";
import {tokens} from "../../theme.js";

const TopAdherentsList = () => {
    const [adherents, setAdherents] = useState([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode)

    useEffect(() => {
        axios
            .get("http://localhost:8081/factoring/api/relations/dashboard/top-adherents", {
                withCredentials: true,
            })
            .then((res) => setAdherents([]))
            .catch((err) => console.error("Error fetching top adherents", err));
    }, []);


    return (
        <Box
            gridColumn="span 4"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            overflow="auto"
            height={"100%"}
        >
            {/* Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                color={colors.grey[100]}
                p="15px"
            >
                <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                    Top 5 Adhérents
                </Typography>
            </Box>

            {/* List Items */}
            {adherents.slice(0, 5).map((adherent, i) => (
                <Box
                    key={`${adherent.adherentId}-${i}`}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderBottom={`4px solid ${colors.primary[500]}`}
                    p="15px"
                >
                    <Box>
                        <Typography
                            color={colors.primary[100]}
                            variant="h5"
                            fontWeight="600"
                        >
                            {adherent.adherentName}
                        </Typography>
                        {/*<Typography color={colors.grey[100]}>*/}
                        {/*    ID: {adherent.adherentId}*/}
                        {/*</Typography>*/}
                    </Box>

                    {/* Empty box just like in transactions example (you can add date or leave blank) */}
                    <Box color={colors.grey[100]}></Box>

                    <Box
                        color={colors.greenAccent[500]}
                        p="5px 10px"
                        borderRadius="4px"
                    >
                        {adherent.totalAcheteurs} acheteurs
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default TopAdherentsList;
