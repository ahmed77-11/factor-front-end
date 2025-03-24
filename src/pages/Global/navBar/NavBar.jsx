import {Box, IconButton, useTheme, InputBase} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { tokens } from "../../../theme.js";
import {toggleColorMode} from "../../../redux/mode/modeSlice.js";
import {useNavigate} from "react-router-dom";


const NavBar = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.mode.mode);
    const colors = tokens(theme.palette.mode);
    const navigate=useNavigate()

    const handleNavigate=()=>{
        navigate("/notification")
    }

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {/* SEARCH BAR */}
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
                <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
                <IconButton type="button" sx={{ p: 1 }}>
                    <SearchIcon />
                </IconButton>
            </Box>

            {/* ICONS */}
            <Box display="flex">
                <IconButton onClick={() => dispatch(toggleColorMode())}>
                    {mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>


                <IconButton onClick={handleNavigate}>

                    <NotificationsOutlinedIcon />

                </IconButton>

                <IconButton>
                    <SettingsOutlinedIcon />
                </IconButton>
                <IconButton>
                    <PersonOutlinedIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default NavBar;
