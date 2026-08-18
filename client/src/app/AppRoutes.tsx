import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ProtectedRoute, PublicRoute } from "./guards/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFound";

import Dashboard from "../modules/Dashboard/DashboardPage";

type JwtPayload = {
  role?: string;
  exp?: number;
};

const getRoleFromToken = (): string | null => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) return null;
    return decoded.role ?? null;
  } catch {
    return null;
  }
};

// Blocks specific roles from route tree
const DenyRolesRoute: React.FC<{ deniedRoles: string[]; redirectTo: string }> = ({
  deniedRoles,
  redirectTo,
}) => {
  const role = getRoleFromToken();
  if (role && deniedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
        <Route path="/ez" element={<Dashboard />} />
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;