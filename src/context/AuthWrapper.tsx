import React from "react";
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import routes from "../routes";
import Layout from "../components/layout/Layout";
import { useAuth } from "./AuthContext";

const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const routing = useRoutes(routes);

  if (loading) {
    return null;
  }

  if (!user) {
    return routing;
  }

  const authPages = [
    "/",
    "/signin",
    "/signup",
    "/signup-email",
    "/confirm",
    "/reset-password",
    "/legal",
    "/about",
  ];
  if (authPages.includes(location.pathname)) {
    return <Navigate to="/home" />;
  }

  return <Layout>{routing}</Layout>;
};

export default AuthWrapper;
