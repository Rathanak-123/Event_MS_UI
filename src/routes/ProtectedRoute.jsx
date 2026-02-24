// routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ← from earlier example

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or better: skeleton / spinner
  }

  if (!isAuthenticated) {
    // Optional: preserve the intended location so we can redirect back after login
    // return <Navigate to="/login" replace state={{ from: location }} />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
