import { useState, useEffect, useMemo } from "react";
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
  getAllEvents,
  createEvents,
  updateEvents,
  deleteEvents,
} from "../api/events.api";
import { getAllCategories } from "../api/category.api";
import { getAllVenues } from "../api/venue.api";

function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
    organizer: "",
    category_id: "",
    venue_id: "",
    status: "planned",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Fixed: Maps for fast lookup (no more undefined errors)
  const categoryMap = useMemo(
    () =>
      categories.reduce((acc, cat) => {
        acc[cat.id] = cat.category_name;
        return acc;
      }, {}),
    [categories],
  );

  const venueMap = useMemo(
    () =>
      venues.reduce((acc, venue) => {
        acc[venue.venue_id] = venue.name;
        return acc;
      }, {}),
    [venues],
  );

  useEffect(() => {
    fetchEvents();
    fetchDropdowns();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      showSnackbar("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const catData = await getAllCategories();
      const venueData = await getAllVenues();
      setCategories(catData);
      setVenues(venueData);
    } catch {
      showSnackbar("Failed to load dropdown data", "error");
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
      event_name: "",
      description: "",
      location: "",
      event_date: "",
      start_time: "",
      end_time: "",
      organizer: "",
      category_id: "",
      venue_id: "",
      status: "planned",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.event_name ||
      !formData.location ||
      !formData.category_id ||
      !formData.venue_id ||
      !formData.organizer
    ) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        venue_id: Number(formData.venue_id),
      };

      if (editingId) {
        const updated = await updateEvents(editingId, payload);
        setEvents((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e)),
        );
        showSnackbar("Event updated successfully!");
      } else {
        const created = await createEvents(payload);
        setEvents((prev) => [...prev, created]);
        showSnackbar("Event added successfully!");
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

  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      event_name: event.event_name || "",
      description: event.description || "",
      location: event.location || "",
      event_date: event.event_date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      organizer: event.organizer || "",
      category_id: event.category_id || "",
      venue_id: event.venue_id || "",
      status: event.status || "planned",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteEvents(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showSnackbar("Event deleted successfully!");
    } catch {
      showSnackbar("Delete failed", "error");
    }
  };

  const getCategoryName = (event) => {
    if (event.category?.category_name) {
      return event.category.category_name;
    }
    return categoryMap[event.category_id] || "N/A";
  };

  const getVenueName = (event) => {
    if (event.venue?.name) {
      return event.venue.name;
    }
    return venueMap[event.venue_id] || "N/A";
  };

  const filteredEvents = events.filter(
    (event) =>
      event.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Events Management
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          placeholder="Search event..."
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
          Add Event
        </Button>
      </Box>

      {loading && events.length === 0 ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  {" "}
                  {/* ✅ Fixed - no whitespace text node */}
                  <TableCell>{event.event_name}</TableCell>
                  <TableCell>{event.event_date}</TableCell>
                  <TableCell>{event.start_time}</TableCell>
                  <TableCell>{event.end_time}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{getCategoryName(event)}</TableCell>
                  <TableCell>{getVenueName(event)}</TableCell>
                  <TableCell>{event.status}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(event)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(event.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Update Event" : "Add Event"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Event Name"
            name="event_name"
            fullWidth
            margin="normal"
            required
            value={formData.event_name}
            onChange={handleInputChange}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            label="Location"
            name="location"
            fullWidth
            margin="normal"
            required
            value={formData.location}
            onChange={handleInputChange}
          />
          <TextField
            label="Organizer"
            name="organizer"
            fullWidth
            margin="normal"
            required
            value={formData.organizer}
            onChange={handleInputChange}
          />

          <TextField
            label="Event Date"
            type="date"
            name="event_date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            value={formData.event_date}
            onChange={handleInputChange}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              name="start_time"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              value={formData.start_time}
              onChange={handleInputChange}
            />
            <TextField
              label="End Time"
              type="time"
              name="end_time"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              value={formData.end_time}
              onChange={handleInputChange}
            />
          </Box>

          <TextField
            select
            label="Category"
            name="category_id"
            fullWidth
            margin="normal"
            required
            value={formData.category_id}
            onChange={handleInputChange}>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.category_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Venue"
            name="venue_id"
            fullWidth
            margin="normal"
            required
            value={formData.venue_id}
            onChange={handleInputChange}>
            {venues.map((venue) => (
              <MenuItem key={venue.venue_id} value={venue.venue_id}>
                {venue.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            name="status"
            fullWidth
            margin="normal"
            value={formData.status}
            onChange={handleInputChange}>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="ongoing">Ongoing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
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

export default Events;
