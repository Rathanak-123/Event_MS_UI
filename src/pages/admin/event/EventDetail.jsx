import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAllEvents } from "../../../api/events.api";
import { getAllCategories } from "../../../api/category.api";
import { getAllVenues } from "../../../api/venue.api";

const IMAGE_BASE_URL = "http://localhost:8000/";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const getImageSrc = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [events, categoryData, venueData] = await Promise.all([
        getAllEvents(),
        getAllCategories(),
        getAllVenues(),
      ]);

      const found = events.find((item) => item.id === parseInt(id));

      if (found) {
        setEvent(found);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setVenues(Array.isArray(venueData) ? venueData : []);
      } else {
        showSnackbar("Event not found", "error");
        setTimeout(() => navigate("/admin/events"), 1200);
      }
    } catch {
      showSnackbar("Failed to fetch event detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const found = categories.find((item) => item.id === categoryId);
    return found?.category_name || `ID: ${categoryId}`;
  };

  const getVenueName = (venueId) => {
    const found = venues.find((item) => item.venue_id === venueId);
    return found?.name || `Venue ID: ${venueId}`;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    navigate("/admin/events");
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="lg">
      <Box
        sx={{
          px: 4,
          pt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h5" fontWeight="bold">
          EVENT DETAIL
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 4, pb: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : event ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid #e3e3e3",
                  backgroundColor: "#fafafa",
                }}>
                {event.image ? (
                  <Box
                    component="img"
                    src={getImageSrc(event.image)}
                    alt={event.event_name}
                    sx={{
                      width: "100%",
                      height: 320,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 320,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}>
                    No Image
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" fontWeight="bold">
                  {event.event_name}
                </Typography>
                <Chip
                  label={event.status || "—"}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {event.description || "No description provided."}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {event.location || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Organizer
                  </Typography>
                  <Typography variant="body1">
                    {event.organizer || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event Date
                  </Typography>
                  <Typography variant="body1">
                    {event.event_date || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {event.start_time || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Time
                  </Typography>
                  <Typography variant="body1">
                    {event.end_time || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {getCategoryName(event.category_id)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Venue
                  </Typography>
                  <Typography variant="body1">
                    {getVenueName(event.venue_id)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Event ID
                  </Typography>
                  <Typography variant="body2">{event.id}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Typography color="error">No event found.</Typography>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ borderRadius: 2, px: 3 }}>
          CLOSE
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
