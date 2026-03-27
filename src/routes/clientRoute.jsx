import { Routes, Route } from "react-router-dom";
import ClientLayout from "../layouts/ClientLayout";
import HomePage from "../pages/Client/HomePage";
import LoginPage from "../pages/Client/LoginPage";
import SignupPage from "../pages/Client/SignupPage";
import EventDetailPage from "../pages/Client/EventDetailPage";
import BookingPage from "../pages/Client/BookingPage";
import PaymentPage from "../pages/Client/PaymentPage";
import SuccessPage from "../pages/Client/SuccessPage";
import MyBookingsPage from "../pages/Client/MyBookingsPage";

export default function ClientRouter() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="" element={<HomePage />} />
        <Route path="event/:id" element={<EventDetailPage />} />
        <Route path="booking/:eventId" element={<BookingPage />} />
        <Route path="payment/:bookingId" element={<PaymentPage />} />
        <Route path="success" element={<SuccessPage />} />
        <Route path="my-bookings" element={<MyBookingsPage />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
    </Routes>
  );
}