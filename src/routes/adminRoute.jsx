import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/admin/auth/Login";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Users from "../pages/Users";
import UserRoles from "../pages/UserRoles";
import Venue from "../pages/Venue";
import CategoryList from "../pages/admin/category/CategoryList";
import EditCategory from "../pages/admin/category/EditCategory";
import CategoryDetail from "../pages/admin/category/CategoryDetail";
import Tickets from "../pages/Tickets";
import General from "../pages/General";
import Security from "../pages/Security";

export default function AdminRouter({ dark, setDark }) {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="admin"
          element={<AdminLayout dark={dark} setDark={setDark} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="users" element={<Users />} />
          <Route path="user-roles" element={<UserRoles />} />
          <Route path="venue" element={<Venue />} />
          <Route path="categories" element={<CategoryList />}>
            <Route path="add" element={<EditCategory />} />
            <Route path="edit/:id" element={<EditCategory />} />
            <Route path=":id" element={<CategoryDetail />} />
          </Route>
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
