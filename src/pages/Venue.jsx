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
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";

import {
  getAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from "../api/venue.api";

function Venue() {
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "",
    contact_info: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const data = await getAllVenues();
      setVenues(data);
    } catch {
      showSnackbar("Failed to load venues", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      address: "",
      capacity: "",
      contact_info: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const updated = await updateVenue(editingId, formData);
        setVenues((prev) =>
          prev.map((v) => (v.venue_id === editingId ? updated : v)),
        );
        showSnackbar("Venue updated successfully!");
      } else {
        const created = await createVenue(formData);
        setVenues((prev) => [...prev, created]);
        showSnackbar("Venue added successfully!");
      }
      handleClose();
    } catch {
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (venue) => {
    setEditingId(venue.venue_id);
    setFormData({
      name: venue.name || "",
      address: venue.address || "",
      capacity: venue.capacity || "",
      contact_info: venue.contact_info || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteVenue(id);
      setVenues((prev) => prev.filter((v) => v.venue_id !== id));
      showSnackbar("Venue deleted successfully!");
    } catch {
      showSnackbar("Delete failed", "error");
    }
  };

  // 🔎 Search Filter Logic
  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Venue Management
      </Typography>

      {/* Search + Add Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}>
        <TextField
          placeholder="Search venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" onClick={handleOpen}>
          Add Venue
        </Button>
      </Box>

      {loading && venues.length === 0 ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue.venue_id}>
                  <TableCell>{venue.name}</TableCell>
                  <TableCell>{venue.address}</TableCell>
                  <TableCell>{venue.capacity || "—"}</TableCell>
                  <TableCell>{venue.contact_info || "—"}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(venue)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(venue.venue_id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVenues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No venues found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Update Venue" : "Add Venue"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            margin="normal"
            value={formData.address}
            onChange={handleInputChange}
          />
          <TextField
            label="Capacity"
            name="capacity"
            type="number"
            fullWidth
            margin="normal"
            value={formData.capacity}
            onChange={handleInputChange}
          />
          <TextField
            label="Contact Info"
            name="contact_info"
            fullWidth
            margin="normal"
            value={formData.contact_info}
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

      {/* Snackbar */}
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

export default Venue;
