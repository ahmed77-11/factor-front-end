import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme.js";
import PropTypes from "prop-types";
import { Link } from "react-router-dom"; // Import Link for routing

const Header = ({ title, subtitle }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box mb="30px">
            {/* Title and Subtitle with smaller font and same color */}
            <Typography
                variant="h5" // Smaller font size for both title and subtitle
                color={colors.grey[100]} // Single color for both
                fontWeight="bold"
                sx={{ marginBottom: "5px" }}
            >
                    {title}
                {/* Slash separator */}
                <span style={{ margin: "0 5px", color: colors.grey[400] }}>/</span>
                {/* Subtitle Link */}
                    {subtitle}
            </Typography>
        </Box>
    );
};

Header.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};

export default Header;
