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
  createAdminBooking,
  updateBooking,
  getAllBookings,
} from "../../../api/booking.api";
import { getAllEvents } from "../../../api/events.api";
import { getAllTickets } from "../../../api/ticket.api";
import { getAllCustomers } from "../../../api/customer.api";

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [formData, setFormData] = useState({
    customer: "",
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
      const [customerData, eventData, ticketData] = await Promise.all([
        getAllCustomers(),
        getAllEvents(),
        getAllTickets(),
      ]);

      setCustomers(Array.isArray(customerData) ? customerData : []);
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
          customer: typeof found.customer === 'object' ? found.customer?.id : found.customer || "",
          event: typeof found.event === 'object' ? found.event?.id : found.event || "",
          ticket: typeof found.ticket === 'object' ? found.ticket?.id : found.ticket || "",
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

    setFormData((prev) => {
      const parsedValue =
        name === "customer" || name === "event" || name === "ticket" || name === "quantity"
          ? value === ""
            ? ""
            : Number(value)
          : value;

      const newData = { ...prev, [name]: parsedValue };

      // When event changes, reset ticket & filter tickets by event
      if (name === "event") {
        newData.ticket = "";
        newData.total_amount = "";
        const eventTickets = tickets.filter(
          (t) => t.event === parsedValue || t.event?.id === parsedValue || t.event_id === parsedValue
        );

        // Auto-select ticket if only 1 exists for the event
        if (eventTickets.length === 1) {
          newData.ticket = eventTickets[0].id;
          const qtyToUse = newData.quantity || 1;
          if (!newData.quantity) newData.quantity = 1;
          newData.total_amount = String(eventTickets[0].price * qtyToUse);
        }
      }

      if (name === "ticket" || name === "quantity") {
        const selectedTicketId = name === "ticket" ? parsedValue : (newData.ticket !== undefined ? newData.ticket : prev.ticket);
        let selectedQty = name === "quantity" ? parsedValue : (newData.quantity !== undefined ? newData.quantity : prev.quantity);
        
        if (name === "ticket" && !selectedQty) {
            selectedQty = 1;
            newData.quantity = 1;
        }

        if (selectedTicketId && selectedQty) {
          const ticketObj = tickets.find((t) => t.id === selectedTicketId);
          if (ticketObj) {
            newData.total_amount = String(ticketObj.price * selectedQty);
          }
        }
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Build a robust payload bridging both naming conventions
      const payload = {
        customer: Number(formData.customer),
        event: Number(formData.event),
        ticket: Number(formData.ticket),
        quantity: Number(formData.quantity),
        total_amount: String(formData.total_amount || "0"),
        status: formData.status || "pending",
        
        // Also provide _id suffixed variants for DRF
        customer_id: Number(formData.customer),
        event_id: Number(formData.event),
        ticket_id: Number(formData.ticket),
      };

      if (id) {
        await updateBooking(id, payload);
        showSnackbar("Booking updated successfully!");
      } else {
        await createAdminBooking(payload);
        showSnackbar("Booking added successfully!");
      }

      setTimeout(() => navigate("/admin/bookings"), 1000);
    } catch (error) {
      console.error(error);
      
      let msg = error?.response?.data?.detail || error?.response?.data?.message;
      
      // Attempt to extract DRF field validation errors
      if (!msg && error?.response?.data && typeof error.response.data === "object") {
        const fields = Object.keys(error.response.data);
        if (fields.length > 0) {
          const firstFieldError = error.response.data[fields[0]];
          if (Array.isArray(firstFieldError) && typeof firstFieldError[0] === "string") {
            msg = `${fields[0]}: ${firstFieldError[0]}`;
          } else if (typeof firstFieldError === "string") {
            msg = `${fields[0]}: ${firstFieldError}`;
          }
        }
      }
      
      showSnackbar(msg || "Operation failed", "error");
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
              label="Customer"
              name="customer"
              fullWidth
              margin="normal"
              value={formData.customer}
              onChange={handleInputChange}
              required>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.email || c.username || c.name || `Customer ${c.id}`}
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
              disabled={!formData.event}
              helperText={!formData.event ? "Select an event first" : ""}
              required>
              {tickets
                .filter(
                  (t) =>
                    t.event === formData.event ||
                    t.event?.id === formData.event ||
                    t.event_id === formData.event
                )
                .map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    {ticket.ticket_type} (${ticket.price})
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
              inputProps={{ min: 1 }}
              required
            />

            {formData.total_amount && (
              <TextField
                label="Total Amount (auto-calculated)"
                name="total_amount"
                fullWidth
                margin="normal"
                value={formData.total_amount}
                InputProps={{ readOnly: true }}
              />
            )}

            {id && (
              <TextField
                select
                label="Status"
                name="status"
                fullWidth
                margin="normal"
                value={formData.status}
                onChange={handleInputChange}
                required>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            )}
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
            !formData.customer ||
            !formData.event ||
            !formData.ticket ||
            formData.quantity === "" ||
            (id && (!formData.total_amount || !formData.status))
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
