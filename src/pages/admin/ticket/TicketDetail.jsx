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
import { getAllTickets } from "../../../api/ticket.api";
import { getAllEvents } from "../../../api/events.api";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [events, setEvents] = useState([]);
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
      const [tickets, eventData] = await Promise.all([
        getAllTickets(),
        getAllEvents(),
      ]);

      const found = tickets.find((item) => item.id === parseInt(id));

      if (found) {
        setTicket(found);
        setEvents(Array.isArray(eventData) ? eventData : []);
      } else {
        showSnackbar("Ticket not found", "error");
        setTimeout(() => navigate("/admin/tickets"), 1500);
      }
    } catch (error) {
      showSnackbar("Failed to fetch ticket detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (eventId) => {
    const found = events.find((item) => item.id === eventId);
    return found?.event_name || `Event ID: ${eventId}`;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    navigate("/admin/tickets");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Ticket Details</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : ticket ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Event
            </Typography>
            <Typography variant="h6" gutterBottom>
              {getEventName(ticket.event_id)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Ticket Type
            </Typography>
            <Typography variant="body1">{ticket.ticket_type || "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Price
            </Typography>
            <Typography variant="body1">{ticket.price || "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Quantity
            </Typography>
            <Typography variant="body1">{ticket.quantity ?? "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Sold
            </Typography>
            <Typography variant="body1">{ticket.sold ?? "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Ticket ID
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ticket.id}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">No ticket found.</Typography>
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
