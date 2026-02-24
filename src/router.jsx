import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Users from "./pages/Users";
import UserRoles from "./pages/UserRoles";
import General from "./pages/General";
import Security from "./pages/Security";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Venue from "./pages/Venue";
import Category from "./pages/Categories";
import Tickets from "./pages/Tickets";

export default function Router({ dark, setDark }) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<DashboardLayout dark={dark} setDark={setDark} />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="users" element={<Users />} />
          <Route path="user-roles" element={<UserRoles />} />
          <Route path="veneu" element={<Venue />} />
          <Route path="categories" element={<Category />} />
          <Route path="tickets" element={<Tickets />} />

          <Route path="settings">
            <Route path="general" element={<General />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Route>
      </Route>

      {/* Optional */}
      <Route path="*" element={<div>404 – Page not found</div>} />
    </Routes>
  );
}
