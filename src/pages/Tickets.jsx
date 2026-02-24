import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";

import {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../api/tickets.api";
import { getAllEvents } from "../api/events.api";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    event_id: "",
    ticket_type: "",
    price: "",
    quantity: "",
    sold: "0",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch {
      showSnackbar("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      showSnackbar("Failed to load events", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      event_id: "",
      ticket_type: "",
      price: "",
      quantity: "",
      sold: "0",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.event_id ||
      !formData.ticket_type ||
      !formData.price ||
      !formData.quantity
    ) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        event_id: Number(formData.event_id),
        ticket_type: formData.ticket_type,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        sold: Number(formData.sold) || 0,
      };

      if (editingId) {
        const updated = await updateTicket(editingId, payload);
        setTickets((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t)),
        );
        showSnackbar("Ticket updated successfully!");
      } else {
        const created = await createTicket(payload);
        setTickets((prev) => [...prev, created]);
        showSnackbar("Ticket added successfully!");
      }
      handleClose();
    } catch (error) {
      console.error(error.response?.data || error);
      showSnackbar(
        error.response?.data?.message || "Operation failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket) => {
    setEditingId(ticket.id);
    setFormData({
      event_id: ticket.event_id?.toString() || "",
      ticket_type: ticket.ticket_type || "",
      price: ticket.price?.toString() || "",
      quantity: ticket.quantity?.toString() || "",
      sold: ticket.sold?.toString() || "0",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      showSnackbar("Ticket deleted successfully!");
    } catch {
      showSnackbar("Delete failed", "error");
    }
  };

  const getEventName = (ticket) => {
    if (ticket.event?.event_name) {
      return ticket.event.event_name;
    }
    return ticketMap[ticket.event_id] || "N/A";
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      getEventName(ticket).toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Tickets Management
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          placeholder="Search ticket..."
          size="small"
          sx={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={handleOpen}>
          Add Ticket
        </Button>
      </Box>

      {loading && tickets.length === 0 ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Ticket Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Sold</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{getEventName(ticket)}</TableCell>
                  <TableCell>{ticket.ticket_type}</TableCell>
                  <TableCell>${ticket.price}</TableCell>
                  <TableCell>{ticket.quantity}</TableCell>
                  <TableCell>{ticket.sold}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(ticket)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(ticket.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Update Ticket" : "Add Ticket"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Event"
            name="event_id"
            fullWidth
            margin="normal"
            required
            value={formData.event_id}
            onChange={handleInputChange}>
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
            required
            value={formData.ticket_type}
            onChange={handleInputChange}>
            <MenuItem value="VIP">VIP</MenuItem>
            <MenuItem value="Premium">Premium</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Regular">Regular</MenuItem>
            <MenuItem value="Early Bird">Early Bird</MenuItem>
          </TextField>

          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            margin="normal"
            required
            value={formData.price}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            fullWidth
            margin="normal"
            required
            value={formData.quantity}
            onChange={handleInputChange}
          />

          <TextField
            label="Sold"
            name="sold"
            type="number"
            fullWidth
            margin="normal"
            value={formData.sold}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

export default Tickets;
