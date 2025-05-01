import {
    Box,
    IconButton,
    useTheme,
    Badge,
    Menu,
    MenuItem, Fade
} from "@mui/material";
import {
    LightModeOutlined as LightModeOutlinedIcon,
    DarkModeOutlined as DarkModeOutlinedIcon,
    NotificationsOutlined as NotificationsOutlinedIcon,
    PersonOutlined as PersonOutlinedIcon,
    SettingsOutlined as SettingsOutlinedIcon
} from "@mui/icons-material";
import { tokens } from "../../../theme.js";
import { toggleColorMode } from "../../../redux/mode/modeSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
const NavBar = ({ unreadCount }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.mode.mode);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleSettingsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangePassword = () => {
        handleClose();
        navigate("/change-password");
    };

    const handleLogout = () => {
        handleClose();
        navigate("/login");
    };

    const handleNavigate = () => {
        navigate("/notification");
    };

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {/* SEARCH BAR (currently unused) */}
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px" />

            {/* ICONS */}
            <Box display="flex">
                <IconButton onClick={() => dispatch(toggleColorMode())}>
                    {mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>

                <IconButton onClick={handleNavigate}>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                        <NotificationsOutlinedIcon />
                    </Badge>
                </IconButton>

                <IconButton onClick={handleSettingsClick}>
                    <SettingsOutlinedIcon
                        style={{
                            transform: open ? "rotate(20deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease-in-out",
                        }}
                    />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade} // ✅ Apply fade transition

                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>

                <IconButton>
                    <PersonOutlinedIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default NavBar;
