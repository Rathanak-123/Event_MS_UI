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
  createTicket,
  updateTicket,
  getAllTickets,
} from "../../../api/ticket.api";
import { getAllEvents } from "../../../api/events.api";

export default function EditTicket() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [events, setEvents] = useState([]);

  const [formData, setFormData] = useState({
    event_id: "",
    ticket_type: "VIP",
    price: "",
    quantity: "",
    sold: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchEvents();
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar("Failed to load events", "error");
    }
  };

  const fetchTicket = async () => {
    setFetching(true);
    try {
      const tickets = await getAllTickets();
      const found = tickets.find((item) => item.id === parseInt(id));

      if (found) {
        setFormData({
          event_id: found.event_id || "",
          ticket_type: found.ticket_type || "VIP",
          price: found.price || "",
          quantity: found.quantity ?? "",
          sold: found.sold ?? "",
        });
      } else {
        showSnackbar("Ticket not found", "error");
        setTimeout(() => navigate("/admin/tickets"), 1500);
      }
    } catch (error) {
      showSnackbar("Failed to fetch ticket", "error");
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
        name === "event_id" || name === "quantity" || name === "sold"
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
        ...formData,
        event_id: Number(formData.event_id),
        quantity: Number(formData.quantity),
        sold: Number(formData.sold),
      };

      if (id) {
        await updateTicket(id, payload);
        showSnackbar("Ticket updated successfully!");
      } else {
        await createTicket(payload);
        showSnackbar("Ticket added successfully!");
      }

      setTimeout(() => navigate("/admin/tickets"), 1000);
    } catch (error) {
      console.error(error);
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/tickets");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{id ? "Update Ticket" : "Add Ticket"}</DialogTitle>

      <DialogContent>
        {fetching ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              select
              label="Event"
              name="event_id"
              fullWidth
              margin="normal"
              value={formData.event_id}
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
              label="Ticket Type"
              name="ticket_type"
              fullWidth
              margin="normal"
              value={formData.ticket_type}
              onChange={handleInputChange}
              required>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
            </TextField>

            <TextField
              label="Price"
              name="price"
              fullWidth
              margin="normal"
              value={formData.price}
              onChange={handleInputChange}
              required
            />

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
              label="Sold"
              name="sold"
              type="number"
              fullWidth
              margin="normal"
              value={formData.sold}
              onChange={handleInputChange}
              required
            />
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
            !formData.event_id ||
            !formData.ticket_type ||
            formData.price === "" ||
            formData.quantity === "" ||
            formData.sold === ""
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
