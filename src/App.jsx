import { useState } from 'react'
import {CssBaseline, ThemeProvider} from "@mui/material";
import {useMode} from "./redux/mode/modeSlice.js";
import {useDispatch, useSelector} from "react-redux";
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
              {/* Private Routes*/}
              <Route element={<ProtectedRoute/>}>
                  <Route element={<Dashboard isSidebar={isSidebar}/>}>
                      <Route path={"/"} element={<Home/>}/>
                      <Route path={"/ajouter-utlisateur"} element={<AddUser/>}/>
                      <Route path={"/ajouter-pp"} element={<AddPersonePhysique/>}/>
                      <Route path={"/ajouter-pm"} element={<AddPersonneMorale/>}/>

                  </Route>
              </Route>
          </Routes>
      </ThemeProvider>
  )
}

export default App
