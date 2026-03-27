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
import { getAllVenues } from "../../../api/venue.api";

export default function VenueDetail() {
  const { venue_id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const venues = await getAllVenues();
      const foundVenue = venues.find((v) => v.venue_id === parseInt(venue_id));

      if (foundVenue) {
        setVenue(foundVenue);
      } else {
        showSnackbar("Venue not found", "error");
        setTimeout(() => navigate("/admin/Venue"), 2000);
      }
    } catch (error) {
      showSnackbar("Failed to fetch venue detail", "error");
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

  const handleClose = () => {
    navigate("/admin/Venue");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Venue Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : venue ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Venue Name
            </Typography>
            <Typography variant="h6" gutterBottom>
              {venue.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1">
              {venue.address || "No address provided."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Capacity
            </Typography>
            <Typography variant="body1">
              {venue.capacity ?? "No capacity provided."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Contact Info
            </Typography>
            <Typography variant="body1">
              {venue.contact_info || "No contact info provided."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Venue ID
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {venue.venue_id}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">No venue found.</Typography>
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
