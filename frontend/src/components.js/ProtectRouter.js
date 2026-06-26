import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';

const ProtectRouter = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading System...</div>;

    // Niba atari logged in, mujyane kuri login
    if (!user) return <Navigate to="/auth/login" replace />;

    // Reba niba role ihuje (ukoresheje toLowerCase kwirinda ikosa)
    const userRole = user.role?.toLowerCase();
    const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!isAllowed) {
        // Niba afite konti ariko atemerewe aha, mwereke Dashboard ye
        return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    return children;
};

export default ProtectRouter;