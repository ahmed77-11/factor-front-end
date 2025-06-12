import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const RolesBasedRoute = ({ children, allowedRoles = [], requireAll = false }) => {
    const { current } = useSelector(state => state.user);

    if (!current || !current.roles) {
        return <Navigate to="/login" replace />;
    }

    const userRoles = current.roles;

    // If no roles specified, allow access
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check role access
    const hasAccess = requireAll
        ? allowedRoles.every(role => userRoles.includes(role))
        : allowedRoles.some(role => userRoles.includes(role));

    if (!hasAccess) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
};

RolesBasedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    requireAll: PropTypes.bool
};

export default RolesBasedRoute;