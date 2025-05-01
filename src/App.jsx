import { useState } from 'react'
import {CssBaseline, ThemeProvider} from "@mui/material";
import {useMode} from "./redux/mode/modeSlice.js";
import {Route, Routes} from "react-router";
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


function App() {

    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);


    console.log(colorMode)


  return (
      <ThemeProvider theme={theme}>
          <CssBaseline/>
          <Routes>
              {/* Public Routes*/}
              <Route  path="/login" element={<Login/>}/>
              <Route path="/send-reset-code" element={<SendReset/>}/>
              <Route  path="/reset-password" element={<ResetPassword/>}/>
              <Route  path="/confirm-code" element={<ConfirmCode/>}/>
              <Route  path="/change-pass" element={<ChangePasswordFT/>}/>
              <Route path={"*"} element={<NotFound/>}/>
              {/* Private Routes*/}
              <Route element={<ProtectedRoute/>}>
                  <Route element={<Dashboard isSidebar={isSidebar}/>}>
                      <Route path={"/"} element={<Home/>}/>
                      <Route path={"/ajouter-utlisateur"} element={<AddUser/>}/>
                      <Route path={"/ajouter-pp"} element={<AddPersonePhysique/>}/>
                      <Route path={"/ajouter-pm"} element={<AddPersonneMorale/>}/>
                      <Route path={"/all-pp"} element={<ListPp/>}/>
                      <Route path={"/all-pm"} element={<ListPm/>}/>
                      <Route path={"/modifier-pp/:id"} element={<UpdatePP/>}/>
                      <Route path={"/modifier-pm/:id"} element={<UpdatePM/>}/>
                      <Route path={"/ajouter-contrat"} element={<AjoutContrat/>}/>
                      <Route path={`/validation-juridique/:notificationId`} element={<ValidJuridique/>}/>
                      <Route path={"/validation-validateur/:notificationId"} element={<ValidValidateur/>}/>
                      <Route path={"/notification"} element={<NotificationPanel/>}/>
                      <Route path={"/update-contrat/:notificationId"} element={<UpdateContrat/>}/>
                      <Route path={"/signer-contrat/:contratId"} element={<SignerContrat/>}/>

                      <Route path={"/ajouter-acheteurs"} element={<AdherAchet/>}/>
                      <Route path={"/list-contrats-valider"} element={<ListValider/>}/>
                      <Route path={"/list-contrats-juridique"} element={<ListJuridique/>}/>
                      <Route path={"/list-contrats-modifier"} element={<ListModification/>}/>
                      <Route path={"/list-contrats-signer"} element={<ListSigner/>}/>
                      <Route path={"/ajouter-facture"} element={<Facture/>}/>
                      <Route path="/modifier-facture/:id" element={<EditBordereau />} />
                      <Route path="/valider-facture/:id" element={<ValidateFacture />} />
                      <Route path={"/factures-non-valider"} element={<ListNonValider/>}/>s
                      <Route path={"/factures"} element={<ListFValider/>}/>
                      <Route path={"/ajouter-traite"} element={<AddTraite/>}/>
                      <Route path={"/modifier-traite/:id"} element={<UpdateTraite/>}/>
                      <Route path={"/all-traite"} element={<GetAllTraite/>}/>
                      <Route path={"/ajouter-demFin"} element={<AddDemFin/>}/>
                      <Route path={"/modifier-demFin/:id"} element={<UpdateDemFin/>}/>
                      <Route path={"/all-demFin"} element={<GetAllDemFin/>}/>
                      <Route path={"/financement"} element={<Financement/>}/>
                      <Route path={"/accept-demfin/:id"} element={<AcceptDemFin/>}/>

                  </Route>
              </Route>
          </Routes>
      </ThemeProvider>
  )
}

export default App
