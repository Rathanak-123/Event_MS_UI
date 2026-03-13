import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/admin/auth/Login";
import Dashboard from "../pages/Dashboard";
import EventList from "../pages/admin/event/EventList";
import EditEvent from "../pages/admin/event/EditEvent";
import EventDetail from "../pages/admin/event/EventDetail";
import VenueList from "../pages/admin/venue/VenueList";
import EditVenue from "../pages/admin/venue/EditVenue";
import VenueDetail from "../pages/admin/venue/VenueDetail";
import TicketList from "../pages/admin/ticket/TicketList";
import EditTicket from "../pages/admin/ticket/EditTicket";
import TicketDetail from "../pages/admin/ticket/TicketDetail";
import CategoryList from "../pages/admin/category/CategoryList";
import EditCategory from "../pages/admin/category/EditCategory";
import CategoryDetail from "../pages/admin/category/CategoryDetail";

export default function AdminRouter({ dark, setDark }) {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="admin"
          element={<AdminLayout dark={dark} setDark={setDark} />}>
          {/* VENUE ROUTES */}
          <Route path="venue" element={<VenueList />}>
            <Route path="add" element={<EditVenue />} />
            <Route path="edit/:id" element={<EditVenue />} />
            <Route path=":id" element={<VenueDetail />} />
          </Route>

          <Route path="events" element={<EventList />}>
            <Route path="add" element={<EditEvent />} />
            <Route path="edit/:id" element={<EditEvent />} />
            <Route path=":id" element={<EventDetail />} />
          </Route>

          <Route path="tickets" element={<TicketList />}>
            <Route path="add" element={<EditTicket />} />
            <Route path="edit/:id" element={<EditTicket />} />
            <Route path=":id" element={<TicketDetail />} />
          </Route>

          {/* CATEGORY ROUTES */}
          <Route path="categories" element={<CategoryList />}>
            <Route path="add" element={<EditCategory />} />
            <Route path="edit/:id" element={<EditCategory />} />
            <Route path=":id" element={<CategoryDetail />} />
          </Route>
        </Route>
      </Route>

      {/* Optional */}
      <Route path="*" element={<div>404 – Page not found</div>} />
    </Routes>
  );
}
