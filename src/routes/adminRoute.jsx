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
import BookingList from "../pages/admin/booking/BookingList";
import EditBooking from "../pages/admin/booking/EditBooking";
import BookingDetail from "../pages/admin/booking/BookingDetail";
import CustomerList from "../pages/admin/customer/CustomerList";
import EditCustomer from "../pages/admin/customer/EditCustomer";
import CustomerDetail from "../pages/admin/customer/CustomerDetail";

export default function AdminRouter({ dark, setDark }) {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path=""
          element={<AdminLayout dark={dark} setDark={setDark} />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* VENUE ROUTES */}
          <Route path="venue" element={<VenueList />}>
            <Route path="add" element={<EditVenue />} />
            <Route path="edit/:venue_id" element={<EditVenue />} />
            <Route path=":venue_id" element={<VenueDetail />} />
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

          {/* BOOKING ROUTES */}
          <Route path="bookings" element={<BookingList />}>
            <Route path="add" element={<EditBooking />} />
            <Route path="edit/:id" element={<EditBooking />} />
            <Route path=":id" element={<BookingDetail />} />
          </Route>

          {/* CUSTOMER ROUTES */}
      
          <Route path="customer" element={<CustomerList />}>
            <Route path="add" element={<EditCustomer />} />
            <Route path="edit/:id" element={<EditCustomer />} />
            <Route path=":id" element={<CustomerDetail />} />
          </Route>
        </Route>
      </Route>

      {/* Optional */}
      <Route path="*" element={<div>404 – Page not found</div>} />
    </Routes>
  );
}
