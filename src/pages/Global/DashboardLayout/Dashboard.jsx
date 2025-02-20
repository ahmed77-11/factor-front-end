import {Outlet} from "react-router";
import NavBar from "../navBar/NavBar.jsx";
import SideBarComponent from "../sideBar/SideBar.jsx";

// eslint-disable-next-line react/prop-types
const Dashboard = ({isSidebar}) => {
    return (
        <div className="app">
            <SideBarComponent isSidebar={isSidebar} />
            <main className="content">
                <NavBar isSidebar={isSidebar} />
                <Outlet/>
            </main>
        </div>
    );
};

export default Dashboard;