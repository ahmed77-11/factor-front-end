import {Outlet} from "react-router";
import NavBar from "../navBar/NavBar.jsx";
import SideBarComponent from "../sideBar/SideBar.jsx";
import {useCombinedNotifications} from "../../../customeHooks/useCombinedNotifications.jsx";
import {useSelector} from "react-redux";

// eslint-disable-next-line react/prop-types
const Dashboard = ({ isSidebar }) => {
    const {current}=useSelector((state => state.user))
    const { unreadCount } = useCombinedNotifications(current?.email || '');
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
                <NavBar unreadCount={unreadCount} isSidebar={isSidebar} />
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;
