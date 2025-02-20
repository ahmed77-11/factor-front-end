import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
    HomeOutlined,
    PeopleOutlined,
    PersonAddOutlined,
    EditOutlined,
    ListOutlined,
    CalendarTodayOutlined,
    HelpOutlined,
    BarChartOutlined,
    PieChartOutlineOutlined,
    TimelineOutlined,
    MenuOutlined,
    MapOutlined,
    Person4Outlined, BuildCircle, Business, BusinessOutlined, DomainAdd, DomainAddOutlined, EditNoteOutlined,
} from "@mui/icons-material";
import { tokens } from "../../../theme.js";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <MenuItem
            active={selected === title}
            style={{ color: colors.grey[100] }}
            onClick={() => setSelected(title)}
            icon={icon}
            component={<Link to={to} />}
            sx={{
                "&:hover": {
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[900],
                },
            }}
        >
            <Typography>{title}</Typography>
        </MenuItem>
    );
};

const SideBarComponent = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Tableau de bord");

    return (
        <Box
            sx={{
                "& .ps-sidebar-container": {
                    background: colors.primary[400],
                    color: colors.grey[100],
                },
                "& .ps-menu-button ": {
                    padding: "5px 15px",
                    margin: "10px 0",
                    "&:hover ": {
                        backgroundColor: "transparent !important",
                        color: `${colors.blueAccent[500]} !important`,
                    },
                },
                "& .ps-menuitem-root .ps-active ": {
                    color: colors.blueAccent[500],
                },
                "& .ps-submenu-content": {
                    backgroundColor: colors.blueAccent[900],
                    "& .ps-menu-button": {
                        padding:"5px 25px",
                    }
                }
            }}
        >
            <Sidebar collapsed={isCollapsed}>
                <Menu>
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlined /> : undefined}
                        style={{
                            margin: "10px 0 20px 0",
                            color: colors.grey[100],
                        }}
                    >
                        {!isCollapsed && (
                            <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                                <Typography variant="h3" color={colors.grey[100]}>
                                     MED-FACTOR
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlined />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {!isCollapsed && (
                        <Box mb="25px">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <img
                                    alt="profil-utilisateur"
                                    width="100px"
                                    height="100px"
                                    src={"../../assets/user.png"}
                                    style={{ cursor: "pointer", borderRadius: "50%" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                                    Jean Dupont
                                </Typography>
                                <Typography variant="h5" color={colors.greenAccent[500]}>
                                    VP Administration
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Item title="Tableau de bord" to="/" icon={<HomeOutlined />} selected={selected} setSelected={setSelected} />

                        {/* Section Administration avec un menu déroulant */}
                        <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
                            Administration
                        </Typography>

                        <SubMenu label="Gérer les utilisateurs" icon={<PeopleOutlined />} style={{ color: colors.grey[100] }}>
                            <Item title="Ajouter un utilisateur" to="/ajouter-utlisateur" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un utilisateur" to="/modify-user" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les utilisateurs" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>


                        {/* Section Pages */}
                        <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
                            Les Indvidues
                        </Typography>
                        <SubMenu label="Gérer les Personne Physique" icon={<Person4Outlined />} style={{ color: colors.grey[100] }}>
                            <Item title="Ajouter un Personne Physique" to="/ajouter-pp" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un Personne Physique" to="/modify-user" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les Personnes Physique" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>
                        <SubMenu label="Gérer les Personne Morale" icon={<BusinessOutlined/>} style={{ color: colors.grey[100] }}>
                            <Item title="Ajouter un Personne Morale" to="/ajouter-pm" icon={<DomainAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un Personne Morale" to="/modify-user" icon={<EditNoteOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les Personnes Morale" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>
                        <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
                            Les Indvidues
                        </Typography>
                        <SubMenu label="Gérer les Personne Physique" icon={<Person4Outlined />} style={{ color: colors.grey[100] }}>
                            <Item title="Ajouter un Personne Physique" to="/ajouter-pm" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un Personne Physique" to="/modify-user" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les Personnes Physique" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>
                        <SubMenu label="Gérer les Personne Morale" icon={<BuildCircle />} style={{ color: colors.grey[100] }}>
                            <Item title="Ajouter un Personne Morale" to="/ajouter-pp" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un Personne Morale" to="/modify-user" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les Personnes Morale" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>

                    </Box>
                </Menu>
            </Sidebar>
        </Box>
    );
};

Item.propTypes = {
    title: PropTypes.string,
    to: PropTypes.string,
    icon: PropTypes.element,
    selected: PropTypes.string,
    setSelected: PropTypes.func,
};

export default SideBarComponent;
