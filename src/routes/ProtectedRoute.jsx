import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Role-based access control
  const roleName = adminUser?.role?.name?.toLowerCase() || adminUser?.role?.toLowerCase() || '';
  const isAdmin = roleName === 'admin' || roleName === 'super admin' || adminUser?.is_superuser || adminUser?.is_staff;
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
