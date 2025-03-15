import { useRef, useState } from "react";
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
    MenuOutlined,
    Person4Outlined,
    BusinessOutlined,
    BuildCircle,
    CheckOutlined,
    EditNoteOutlined,
    MapOutlined,
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
    const sidebarRef = useRef(null);

    const handleSubMenuOpen = () => {
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = 0;
        }
    };

    return (
        <Box
            sx={{
                "& .ps-sidebar-container": {
                    background: colors.primary[400],
                    color: colors.grey[100],
                    height: "100vh",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
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
                    paddingLeft: "10px",
                    "& .ps-submenu-content": {
                        backgroundColor: colors.blueAccent[900],
                        paddingLeft: "20px",
                        "& .ps-submenu-content": {
                            backgroundColor: colors.blueAccent[900],
                            paddingLeft: "20px",
                        }
                    },
                    "& .ps-menu-button": {
                        padding: "5px 15px",
                        "&:hover": {
                            color: `${colors.blueAccent[600]} !important`,
                        },
                    },
                },
            }}
        >
            <Sidebar ref={sidebarRef} collapsed={isCollapsed}>
                <Menu>
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlined /> : undefined}
                        style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
                    >
                        {!isCollapsed && (
                            <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                                <Typography variant="h3" color={colors.grey[100]}>MED-FACTOR</Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}><MenuOutlined /></IconButton>
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
                                <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>Jean Dupont</Typography>
                                <Typography variant="h5" color={colors.greenAccent[500]}>VP Administration</Typography>
                            </Box>
                        </Box>
                    )}

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Item title="Tableau de bord" to="/" icon={<HomeOutlined />} selected={selected} setSelected={setSelected} />

                        <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>Administration</Typography>
                        <SubMenu label="Gérer les utilisateurs" icon={<PeopleOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title="Ajouter un utilisateur" to="/ajouter-utlisateur" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Modifier un utilisateur" to="/modify-user" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les utilisateurs" to="/all-users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>

                        <SubMenu label="Refrentiel" icon={<MapOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <SubMenu label="ISO" icon={<MapOutlined />} style={{ marginLeft: "10px" }}>
                                <Item title="Nationalite" to="/nationalite" icon={<MapOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Devise" to="/devise" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                            </SubMenu>
                            <SubMenu label="National" icon={<BusinessOutlined />} style={{ marginLeft: "10px" }}>
                                <Item title="Institution Financière" to="/institution-financiere" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Profession" to="/profession" icon={<BuildCircle />} selected={selected} setSelected={setSelected} />
                                <Item title="Activité" to="/activite" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Type Personne Morale" to="/type-personne-morale" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Groupe" to="/groupe" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Forme Juridique" to="/forme-juridique" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Situation Judiciaire" to="/situation-judiciaire" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Type Piece D'identité" to="/type-piece-identite" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="TMM" to="/tmm" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                            </SubMenu>
                            <SubMenu label="Interne" icon={<BuildCircle />} style={{ marginLeft: "10px" }}>
                                <Item title="Type Factoring" to="/type-factoring" icon={<BuildCircle />} selected={selected} setSelected={setSelected} />
                                <Item title="Statut Contrat" to="/statut-contrat" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Statut Evenement" to="/statut-evenement" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Type Evenement" to="/type-evenement" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Type Commision" to="/type-commision" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                                <Item title="Document Contractuel" to="/document-contractuel" icon={<EditNoteOutlined />} selected={selected} setSelected={setSelected} />
                            </SubMenu>
                        </SubMenu>

                        <SubMenu label="Tiers" icon={<Person4Outlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title="Personne Physique" to="/all-pp" icon={<Person4Outlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Personne Morale" to="/all-pm" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Societe Mere Et Filiale" to="/societe-mere-filiale" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>

                        <SubMenu label="Contrat" icon={<EditOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title="Redaction contrat" to="/redaction-contrat" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Validation Juridique" to="/validation-juridique" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Signature Du Contrat" to="/signature-contrat" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />
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