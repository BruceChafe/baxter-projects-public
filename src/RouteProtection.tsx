import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredProject?: string;
}

const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredRole,
  requiredProject,
}) => {
  const { user, accessContext, loading } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
        <Typography ml={2}>🔐 Waiting on authentication...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const hasDealergroupId = user.user_metadata?.dealergroup_id;
  if (hasDealergroupId && accessContext === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
        <Typography ml={2}>🔐 Loading access permissions...</Typography>
      </Box>
    );
  }

  if (hasDealergroupId && !accessContext?.active && !["/reactivate", "/admin/upgrade", "/onboarding"].includes(pathname)) {
    return <Navigate to="/reactivate" replace />;
  }

  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredProject && !accessContext?.active) {
    return <Navigate to="/reactivate" replace />;
  }

  return <>{children}</>;
};

export default RouteProtection;