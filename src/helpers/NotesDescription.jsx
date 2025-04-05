import {Typography, useTheme} from "@mui/material";
import {tokens} from "../theme.js";

// eslint-disable-next-line react/prop-types
const NotesDescription = ({msg}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Typography variant="caption"  sx={{mt: 0.5,ml:2,fontSize:"15px" ,color:colors.greenAccent[500]}}>
            {msg}
        </Typography>
    );
};

export default NotesDescription;