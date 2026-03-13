import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  createBooking,
  updateBooking,
  getAllBookings,
} from "../../../api/booking.api";
import { getAllEvents } from "../../../api/event.api";
import { getAllTickets } from "../../../api/ticket.api";
import { getAllUsers } from "../../../api/user.api";

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [formData, setFormData] = useState({
    user: "",
    event: "",
    ticket: "",
    quantity: "",
    total_amount: "",
    status: "pending",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDropdownData();
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [userData, eventData, ticketData] = await Promise.all([
        getAllUsers(),
        getAllEvents(),
        getAllTickets(),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setTickets(Array.isArray(ticketData) ? ticketData : []);
    } catch (error) {
      showSnackbar("Failed to load dropdown data", "error");
    }
  };

  const fetchBooking = async () => {
    setFetching(true);
    try {
      const bookings = await getAllBookings();
      const found = bookings.find((item) => item.id === parseInt(id));

      if (found) {
        setFormData({
          user: found.user?.id || "",
          event: found.event?.id || "",
          ticket: found.ticket?.id || "",
          quantity: found.quantity ?? "",
          total_amount: found.total_amount || "",
          status: found.status || "pending",
        });
      } else {
        showSnackbar("Booking not found", "error");
        setTimeout(() => navigate("/admin/bookings"), 1500);
      }
    } catch (error) {
      showSnackbar("Failed to fetch booking", "error");
    } finally {
      setFetching(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "user" ||
        name === "event" ||
        name === "ticket" ||
        name === "quantity"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        user: Number(formData.user),
        event: Number(formData.event),
        ticket: Number(formData.ticket),
        quantity: Number(formData.quantity),
        total_amount: formData.total_amount,
        status: formData.status,
      };

      if (id) {
        await updateBooking(id, payload);
        showSnackbar("Booking updated successfully!");
      } else {
        await createBooking(payload);
        showSnackbar("Booking added successfully!");
      }

      setTimeout(() => navigate("/admin/bookings"), 1000);
    } catch (error) {
      console.error(error);
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/bookings");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{id ? "Update Booking" : "Add Booking"}</DialogTitle>

      <DialogContent>
        {fetching ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              select
              label="User"
              name="user"
              fullWidth
              margin="normal"
              value={formData.user}
              onChange={handleInputChange}
              required>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Event"
              name="event"
              fullWidth
              margin="normal"
              value={formData.event}
              onChange={handleInputChange}
              required>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.event_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Ticket"
              name="ticket"
              fullWidth
              margin="normal"
              value={formData.ticket}
              onChange={handleInputChange}
              required>
              {tickets.map((ticket) => (
                <MenuItem key={ticket.id} value={ticket.id}>
                  {ticket.ticket_type} ({ticket.price})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              fullWidth
              margin="normal"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Total Amount"
              name="total_amount"
              fullWidth
              margin="normal"
              value={formData.total_amount}
              onChange={handleInputChange}
              required
            />

            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              margin="normal"
              value={formData.status}
              onChange={handleInputChange}
              required>
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="confirmed">confirmed</MenuItem>
              <MenuItem value="paid">paid</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            fetching ||
            !formData.user ||
            !formData.event ||
            !formData.ticket ||
            formData.quantity === "" ||
            !formData.total_amount ||
            !formData.status
          }>
          {loading ? "Saving..." : "Save"}
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
