import {Outlet} from "react-router";
import NavBar from "../navBar/NavBar.jsx";
import SideBarComponent from "../sideBar/SideBar.jsx";

// eslint-disable-next-line react/prop-types
const Dashboard = ({ isSidebar }) => {
    return (
        <div className="app" style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar Component */}
            <SideBarComponent isSidebar={isSidebar} />

            {/* Main Content Area */}
            <main className="content" style={{
                flexGrow: 1, // Ensures the content area takes the remaining space
                overflowY: "auto", // Makes the content scrollable
                height: "100vh" // Full viewport height
            }}>
                <NavBar isSidebar={isSidebar} />
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;
