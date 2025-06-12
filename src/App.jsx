import { useState } from 'react'
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMode } from "./redux/mode/modeSlice.js";
import { Route, Routes } from "react-router";
import Login from "./pages/login/login.jsx";
import ResetPassword from "./pages/resetPassword/resetPassword.jsx";
import ConfirmCode from "./pages/confirmCode/confirmCode.jsx";
import SendReset from "./pages/sendRest/SendReset.jsx";
import ChangePasswordFT from "./pages/changePasswordFirstTime/ChangePasswordFT.jsx";
import ProtectedRoute from "./pages/Global/ProtectedRoute.jsx";
import Dashboard from "./pages/Global/DashboardLayout/Dashboard.jsx";
import Home from "./pages/Home/Home.jsx";
import AddUser from "./pages/Global/userMangement/addUser/AddUser.jsx";
import AddPersonePhysique from "./pages/personePhysique/addPersonePhysique/AddPersonePhysique.jsx";
import AddPersonneMorale from "./pages/PersonneMorale/AddPersoneMoral/AddPersonneMorale.jsx";
import ListPp from "./pages/personePhysique/getAllPersonnePhysique/GetAllPersonnePhysique.jsx";
import ListPm from "./pages/PersonneMorale/getAllPersonneMorale/GetAllPersonneMorale.jsx";
import UpdatePP from "./pages/personePhysique/updatePP/UpdatePP.jsx";
import UpdatePM from "./pages/PersonneMorale/updatePM/UpdatePM.jsx";
import AjoutContrat from "./pages/contrat/ajouterContrat/AjoutContrat.jsx";
import NotificationPanel from "./components/NotificationPanel.jsx";
import UpdateContrat from "./pages/contrat/updateContrat/UpdateContrat.jsx";
import ValidValidateur from "./pages/contrat/validation/validationValidateur/ValidValidateur.jsx";
import ValidJuridique from "./pages/contrat/validation/validationJuridique/ValidJuridique.jsx";
import AdherAchet from "./pages/relations/adherAchat/AdherAchat.jsx";
import ListValider from "./pages/contrat/listContrat/listValider/ListValider.jsx";
import ListModification from "./pages/contrat/listContrat/listModification/ListModification.jsx";
import ListJuridique from "./pages/contrat/listContrat/listJuridique/ListJuridique.jsx";
import ListSigner from "./pages/contrat/listContrat/listSigner/ListSigner.jsx";
import SignerContrat from "./pages/contrat/signerContrat/SignerContrat.jsx";
import Facture from "./pages/facture/addFacture/Facture.jsx";
import EditBordereau from "./pages/facture/editFacture/EditFacture.jsx";
import ListNonValider from "./pages/facture/listFacture/ListNonValider.jsx";
import ListFValider from "./pages/facture/listFactureValider/ListValider.jsx";
import ValidateFacture from "./pages/facture/validateFacture.jsx";
import AddTraite from "./pages/Traite/AddTraite.jsx";
import UpdateTraite from "./pages/Traite/UpdateTraite.jsx";
import GetAllTraite from "./pages/Traite/GetAllTraite.jsx";
import AddDemFin from "./pages/DemFin/AddDemFin.jsx";
import UpdateDemFin from "./pages/DemFin/UpdateDemFin.jsx";
import GetAllDemFin from "./pages/DemFin/GetAllDemFin.jsx";
import Financement from "./pages/DemFin/Financement.jsx";
import AcceptDemFin from "./pages/DemFin/AcceptDemFin.jsx";
import NotFound from "./pages/Global/notFound/NotFound.jsx";
import ModifyProfile from "./pages/Global/userMangement/modifyProfile/ModifyProfile.jsx";
import Users from "./pages/Global/userMangement/all/Users.jsx";
import ModifyUser from "./pages/Global/userMangement/modify/ModifyUser.jsx";
import AddMobileUser from "./pages/Global/userMangement/addMobileUser/AddMobileUser.jsx";
import NewAddTraite from "./pages/Traite/newAddTraite.jsx";
import OcrAddTraite from "./pages/Traite/OcrAddTraite.jsx";
import DocRemiseDetailView from './pages/docRemiseView/DocRemiseDetailView.jsx';
import PieChartDetailedView from './pages/pieChart/PieChartDetailedView.jsx';
import FunnelChartDetailView from "./pages/funnelChartDetailView/FunnelChartDetailView.jsx";
import TopAdherentDetailView from "./pages/topAdherenDetailView/TopAdherentDetailView.jsx";
import Forbidden from "./pages/Global/forbidden/Forbidden.jsx";
import RolesBasedRoute from "./pages/Global/RolesBasedRoutes.jsx"; // Import the new component

function App() {
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);

    console.log(colorMode)

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Routes>
                {/* Public Routes*/}
                <Route path="/login" element={<Login/>}/>
                <Route path="/send-reset-code" element={<SendReset/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path="/confirm-code" element={<ConfirmCode/>}/>
                <Route path="/change-pass" element={<ChangePasswordFT/>}/>
                <Route path="/forbidden" element={<Forbidden/>}/>
                <Route path="*" element={<NotFound/>}/>

                {/* Private Routes*/}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<Dashboard isSidebar={isSidebar}/>}>
                        {/* Dashboard - accessible to all authenticated users */}
                        <Route path="/" element={<Home/>}/>

                        {/* Profile - accessible to all authenticated users */}
                        <Route path="/profile" element={<ModifyProfile/>}/>
                        <Route path="/notification" element={<NotificationPanel/>}/>

                        {/* Admin Only Routes */}
                        <Route path="/ajouter-utilisateur" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <AddUser/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/ajouter-utilisateur-mobile" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <AddMobileUser/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/users" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <Users/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-utilisateur/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <ModifyUser/>
                            </RolesBasedRoute>
                        }/>

                        {/* Tiers - Admin and Commercial */}
                        <Route path="/ajouter-pp" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <AddPersonePhysique/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/ajouter-pm" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <AddPersonneMorale/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/all-pp" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <ListPp/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/all-pm" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <ListPm/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-pp/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <UpdatePP/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-pm/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <UpdatePM/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/ajouter-acheteurs" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_COMERCIAL"]}>
                                <AdherAchet/>
                            </RolesBasedRoute>
                        }/>

                        {/* Contract Routes */}
                        <Route path="/ajouter-contrat" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_VALIDATEUR"]}>
                                <AjoutContrat/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/validation-juridique/:notificationId" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_JURIDIQUE"]}>
                                <ValidJuridique/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/validation-validateur/:notificationId" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_VALIDATEUR"]}>
                                <ValidValidateur/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/update-contrat/:notificationId" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_VALIDATEUR"]}>
                                <UpdateContrat/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/signer-contrat/:contratId" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SIGNATAIRE"]}>
                                <SignerContrat/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/list-contrats-valider" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_VALIDATEUR"]}>
                                <ListValider/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/list-contrats-juridique" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_JURIDIQUE"]}>
                                <ListJuridique/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/list-contrats-modifier" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_VALIDATEUR"]}>
                                <ListModification/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/list-contrats-signer" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SIGNATAIRE"]}>
                                <ListSigner/>
                            </RolesBasedRoute>
                        }/>

                        {/* Invoice/Facture Routes - Admin and Purchase */}
                        <Route path="/ajouter-facture" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <Facture/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-facture/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <EditBordereau/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/valider-facture/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <ValidateFacture/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/factures-non-valider" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <ListNonValider/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/factures" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <ListFValider/>
                            </RolesBasedRoute>
                        }/>

                        {/* Traite Routes - Admin and Purchase */}
                        <Route path="/ajouter-traite" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <AddTraite/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/extract-traite" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <NewAddTraite/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/ajouter-traite-extracter" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <OcrAddTraite/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-traite/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <UpdateTraite/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/all-traite" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_ACHAT"]}>
                                <GetAllTraite/>
                            </RolesBasedRoute>
                        }/>

                        {/* Financing Routes - Admin and Finance */}
                        <Route path="/ajouter-demFin" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]}>
                                <AddDemFin/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/modifier-demFin/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]}>
                                <UpdateDemFin/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/all-demFin" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]}>
                                <GetAllDemFin/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/financement" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]}>
                                <Financement/>
                            </RolesBasedRoute>
                        }/>
                        <Route path="/accept-demfin/:id" element={
                            <RolesBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_RES_FINANCEMENT"]}>
                                <AcceptDemFin/>
                            </RolesBasedRoute>
                        }/>

                        {/* Statistics Routes - Accessible to all authenticated users */}
                        <Route path="/chart-factures" element={<DocRemiseDetailView/>}/>
                        <Route path="/pie-demfin" element={<PieChartDetailedView/>}/>
                        <Route path="/funnel-contrat" element={<FunnelChartDetailView/>}/>
                        <Route path="/line-top-adhr" element={<TopAdherentDetailView/>}/>

                    </Route>
                </Route>
            </Routes>
        </ThemeProvider>
    )
}

export default App