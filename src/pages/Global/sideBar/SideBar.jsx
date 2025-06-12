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
    AppShortcutOutlined,
    DescriptionOutlined,
    TaskAltRounded,
    UnpublishedOutlined,
    CreditCardOutlined,
    FormatListNumberedOutlined,
    AutoFixHighOutlined,
    Money,
    MonetizationOn,
    RuleOutlined,
    ChecklistRtlOutlined,
    QueryStatsOutlined,
    BarChartOutlined,
    DonutLargeOutlined,
    FilterAltOutlined, StackedLineChartOutlined, InsertLinkOutlined,
} from "@mui/icons-material";
import { tokens } from "../../../theme.js";
import {useSelector} from "react-redux";
import {roleConverter} from "../../../helpers/roleConverter.js";

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
            <Box className="scrolling-title" sx={{
                width: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                position: 'relative',
                '& > .MuiTypography-root': {
                    display: 'inline-block',
                    paddingRight: '100%',
                    animation: 'scroll-left 7s linear infinite',
                },
                '@keyframes scroll-left': {
                    '0%': { transform: 'translateX(50%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }}>
                <Typography>{title}</Typography>
            </Box>


        </MenuItem>
    );
};

const SideBarComponent = () => {
    const {current}=useSelector(state=>state.user)
    console.log(current)
    const containAdmin=current?.roles?.some(role => role === "ROLE_ADMIN");
    console.log(current.roles)


    const hasRole = (roles, role) => roles?.includes(role);
    const hasAnyRole = (roles, allowedRoles) => allowedRoles.some(r => roles?.includes(r));
    
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
                    width: isCollapsed ? "80px" : "250px",
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

                                    src={current.profilePicture ?`http://localhost:8082/factoring/users${current.profilePicture}`:"../../assets/userImage.jpeg"}
                                    style={{ cursor: "pointer", borderRadius: "50%" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>{current?.firstName} {current?.lastName}</Typography>
                                <Typography variant="h5" color={colors.greenAccent[500]}>{roleConverter(containAdmin?"Administrateur": current.roles[current.roles.length-1])}</Typography>
                            </Box>
                        </Box>
                    )}


                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Item title="Tableau de bord" to="/" icon={<HomeOutlined />} selected={selected} setSelected={setSelected} />

                        {/*<Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>Administration</Typography>*/}
                        {
                           hasRole(current.roles, "ROLE_ADMIN") && (
                        <SubMenu label="Utilisateurs" icon={<PeopleOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title="Ajouter un utilisateur" to="/ajouter-utilisateur" icon={<PersonAddOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Ajouter Un Utilisateur Mobile"} to="/ajouter-utilisateur-mobile" icon={<AppShortcutOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Afficher tous les utilisateurs" to="/users" icon={<ListOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>)
                        }
                        <SubMenu label="referentiel" icon={<MapOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
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
                        {
                           hasAnyRole(current.roles, ["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]) &&(
                        <SubMenu label="Tiers" icon={<Person4Outlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title="Personne Physique" to="/all-pp" icon={<Person4Outlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Personne Morale" to="/all-pm" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Societe Mere Et Filiale" to="/societe-mere-filiale" icon={<BusinessOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title="Ajouter Acheteurs à Adherents" to="/ajouter-acheteurs" icon={<InsertLinkOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>)
                        }

                        {hasAnyRole(current.roles, ["ROLE_ADMIN", "ROLE_RES_JURIDIQUE","ROLE_VALIDATEUR","ROLE_SIGNATAIRE"]) && (
                        <SubMenu label="Contrat" icon={<EditOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            {hasAnyRole(current.roles,["ROLE_ADMIN","ROLE_VALIDATEUR"]) && (<Item title="Redaction contrat" to="/ajouter-contrat" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />)}
                            {hasAnyRole(current.roles,["ROLE_ADMIN","ROLE_VALIDATEUR"])&&( <Item title="Modification contrat" to="/list-contrats-modifier" icon={<EditOutlined />} selected={selected} setSelected={setSelected} />)}
                            {hasAnyRole(current.roles,["ROLE_ADMIN","ROLE_VALIDATEUR"])&&(  <Item title="Validation Validateur" to="/list-contrats-valider" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />)}
                            {hasAnyRole(current.roles,["ROLE_ADMIN","ROLE_RES_JURIDIQUE"])&&(    <Item title="Validation Juridique" to="/list-contrats-juridique" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />)}
                            {hasAnyRole(current.roles,["ROLE_ADMIN","ROLE_SIGNATAIRE"])&&(  <Item title="Signature Du Contrat" to="/list-contrats-signer" icon={<CheckOutlined />} selected={selected} setSelected={setSelected} />)}
                        </SubMenu>)}

                        {hasAnyRole(current.roles, ["ROLE_ADMIN", "ROLE_RES_ACHAT"]) && (
                        <SubMenu label="bordereaux" icon={<DescriptionOutlined/>} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title={"Liste Bordreaux"} to={"/factures"} icon={<TaskAltRounded  />} selected={selected} setSelected={setSelected} />
                            <Item title={"Liste Bordreaux non validées"} to={"/factures-non-valider"} icon={<UnpublishedOutlined  />} selected={selected} setSelected={setSelected} />
                        </SubMenu>)}
                        {hasAnyRole(current.roles, ["ROLE_ADMIN", "ROLE_RES_ACHAT"]) && (
                        <SubMenu label={"Traites"} icon={<CreditCardOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title={"Liste des Traites"} to={"/all-traite"} icon={<FormatListNumberedOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Extract Traite"} to={"/extract-traite"} icon={<AutoFixHighOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>)}
                        {hasAnyRole(current.roles, ["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]) && (
                        <SubMenu label={"Financement"} icon={<MonetizationOn />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title={"Gestion Financement"} to={"/financement"} icon={<Money />} selected={selected} setSelected={setSelected} />
                            <Item title={"Ajouter Demande Financement"} to={"/ajouter-demFin"} icon={<RuleOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Liste Demande Financement Validées"} to={"/all-demFin"} icon={<ChecklistRtlOutlined />} selected={selected} setSelected={setSelected} />
                        </SubMenu>)}
                        <SubMenu label={"Statistiques"} icon={<QueryStatsOutlined />} style={{ color: colors.grey[100] }} onClick={handleSubMenuOpen}>
                            <Item title={"Nombres de Factures Par Mois/Adhérent"} to={"/chart-factures"} icon={<BarChartOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Nombres de Demandes Financement/Status"} to={"/pie-demfin"} icon={<DonutLargeOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Nombres de Contrats/Etats"} to={"/funnel-contrat"} icon={<FilterAltOutlined />} selected={selected} setSelected={setSelected} />
                            <Item title={"Top Adherent Montant Factures/Mois"} to={"/line-top-adhr"} icon={<StackedLineChartOutlined />} selected={selected} setSelected={setSelected} />
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