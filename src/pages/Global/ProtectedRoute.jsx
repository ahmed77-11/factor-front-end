import {useSelector} from "react-redux";
import {Navigate, Outlet, Route} from "react-router";

const ProtectedRoute = () => {
    const {current} = useSelector(state => state.user);
    if(!current){
        return <Navigate to="/login"/>
    }
    if(current.forceChangePassword === true){
        return <Navigate to="/change-pass"/>
    }

    return <Outlet/>
};

export default ProtectedRoute;