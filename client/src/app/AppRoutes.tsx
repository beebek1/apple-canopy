import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ProtectedRoute, PublicRoute } from "./guards/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFound";

import Dashboard from "../modules/dashboard/DashboardPage";
import BlogList from "../modules/blogs/UserBlogList";
import BlogPage from "../modules/blogs/UserBlogPage";
import Orchards from "../modules/orchards/ImpactMap";
import AdminBlogList from "../modules/admin/AdminBlogList";
import BlogEditor from "../modules/admin/BlogEditor";

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/admin" element={<AdminBlogList />} />
        <Route path="/blogs/1" element={<BlogPage />} />
        <Route path="/blogs/admin/new" element={<BlogEditor />} />
        <Route path="/orchards" element={<Orchards />} />
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;