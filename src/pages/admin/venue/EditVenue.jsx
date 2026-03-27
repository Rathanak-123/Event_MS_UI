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
  Box,
} from "@mui/material";
import {
  createVenue,
  updateVenue,
  getAllVenues,
} from "../../../api/venue.api";

export default function EditVenue() {
  const { venue_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "",
    contact_info: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (venue_id) {
      fetchVenue();
    }
  }, [venue_id]);

  const fetchVenue = async () => {
    setFetching(true);
    try {
      const venues = await getAllVenues();

      const venue = venues.find(
        (v) => v.venue_id === Number(venue_id)
      );

      if (venue) {
        setFormData({
          name: venue.name || "",
          address: venue.address || "",
          capacity: venue.capacity ?? "",
          contact_info: venue.contact_info || "",
        });
      } else {
        showSnackbar("Venue not found", "error");
        setTimeout(() => navigate("/admin/venue"), 1500);
      }
    } catch (error) {
      showSnackbar("Failed to fetch venue", "error");
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
      [name]: name === "capacity" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        venue_id: venue_id ? Number(venue_id) : 0,
      };

      if (venue_id) {
        await updateVenue(venue_id, payload); 
        showSnackbar("Venue updated successfully!");
      } else {
        await createVenue(payload);
        showSnackbar("Venue added successfully!");
      }

      setTimeout(() => navigate("/admin/venue"), 1000);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.detail || error.response?.data?.message || "Operation failed";
      showSnackbar(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/venue");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {venue_id ? "Update Venue" : "Add Venue"}
      </DialogTitle>

      <DialogContent>
        {fetching ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              label="Venue Name"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
            />

            <TextField
              label="Address"
              name="address"
              fullWidth
              margin="normal"
              value={formData.address}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Capacity"
              name="capacity"
              type="number"
              fullWidth
              margin="normal"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Contact Info"
              name="contact_info"
              fullWidth
              margin="normal"
              value={formData.contact_info}
              onChange={handleInputChange}
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
            !formData.name.trim() ||
            !formData.address.trim() ||
            !formData.capacity
          }
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}