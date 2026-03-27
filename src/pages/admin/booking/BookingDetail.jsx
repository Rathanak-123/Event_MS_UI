import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { getAllBookings } from "../../../api/booking.api";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const bookings = await getAllBookings();
      const found = bookings.find((item) => item.id === parseInt(id));

      if (found) {
        setBooking(found);
      } else {
        showSnackbar("Booking not found", "error");
        setTimeout(() => navigate("/admin/bookings"), 1500);
      }
    } catch (error) {
      showSnackbar("Failed to fetch booking detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    navigate("/admin/bookings");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Booking Details</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : booking ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Customer
            </Typography>
            <Typography variant="h6" gutterBottom>
              {typeof booking.customer === 'object'
                ? (booking.customer?.email || booking.customer?.username || "—")
                : (booking.customer ? `Customer ID: ${booking.customer}` : "—")}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Customer Role
            </Typography>
            <Typography variant="body1">
              {typeof booking.customer === 'object'
                ? (booking.customer?.role?.display_name || booking.customer?.role?.name || "—")
                : "—"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Event
            </Typography>
            <Typography variant="body1">
              {typeof booking.event === 'object' ? (booking.event?.event_name || "—") : (booking.event ? `Event ID: ${booking.event}` : "—")}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Event Date
            </Typography>
            <Typography variant="body1">
              {typeof booking.event === 'object' ? (booking.event?.event_date || "—") : "—"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Ticket
            </Typography>
            <Typography variant="body1">
              {typeof booking.ticket === 'object' ? (booking.ticket?.ticket_type || "—") : (booking.ticket ? `Ticket ID: ${booking.ticket}` : "—")}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Ticket Price
            </Typography>
            <Typography variant="body1">
              {typeof booking.ticket === 'object' ? (booking.ticket?.price || "—") : "—"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Quantity
            </Typography>
            <Typography variant="body1">{booking.quantity ?? "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="body1">
              {booking.total_amount || "—"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">{booking.status || "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Booking Date
            </Typography>
            <Typography variant="body1">
              {booking.booking_date || "—"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Booking ID
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.id}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">No booking found.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
