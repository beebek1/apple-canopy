import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUserApi } from "../../modules/admin/auth.api";
import Loading from "../../shared/components/Loading";

interface ProtectedRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = "/",
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUserApi();
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Loading/>
    );
  }

  if (!authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export { ProtectedRoute };
