import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { createEvent, updateEvent, getEventById } from "../../../api/events.api";
import { getAllCategories } from "../../../api/category.api";
import { getAllVenues } from "../../../api/venue.api";

import { getImageUrl } from "../../../utils/imageUtils";


export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

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
    image: null,
    status: "upcoming",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDropdownData();
    if (id) fetchEvent();
  }, [id]);



  const fetchDropdownData = async () => {
    try {
      const [categoryData, venueData] = await Promise.all([
        getAllCategories(),
        getAllVenues(),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setVenues(Array.isArray(venueData) ? venueData : []);
    } catch {
      showSnackbar("Failed to load categories or venues", "error");
    }
  };

  const fetchEvent = async () => {
    setFetching(true);
    try {
      const found = await getEventById(id);

      if (found) {
        // Handle nested category/venue objects from backend
        const categoryId = found.category_id || found.category?.id || "";
        const venueId = found.venue_id || found.venue?.venue_id || "";

        // Handle image as string or object
        const imagePath =
          typeof found.image === "string"
            ? found.image
            : found.image?.url || found.image?.path || "";

        setFormData({
          event_name: found.event_name || "",
          description: found.description || "",
          location: found.location || "",
          event_date: found.event_date || "",
          start_time: found.start_time || "",
          end_time: found.end_time || "",
          organizer: found.organizer || "",
          category_id: categoryId,
          venue_id: venueId,
          image: null,
          status: found.status || "upcoming",
        });
        setExistingImage(imagePath);
      } else {
        showSnackbar("Event not found", "error");
        setTimeout(() => navigate("/admin/events"), 1200);
      }
    } catch {
      showSnackbar("Failed to fetch event", "error");
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
        name === "category_id" || name === "venue_id"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        venue_id: Number(formData.venue_id),
      };

      if (!payload.image) {
        delete payload.image;
      }

      if (id) {
        await updateEvent(id, payload);
        showSnackbar("Event updated successfully!");
      } else {
        await createEvent(payload);
        showSnackbar("Event created successfully!");
      }

      setTimeout(() => navigate("/admin/events"), 900);
    } catch (error) {
      console.error(error);
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/events");
  };

  const previewSrc =
    imagePreview || (existingImage ? getImageUrl(existingImage) : "");


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
          {id ? "EDIT EVENT" : "ADD EVENT"}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 4, pb: 3 }}>
        {fetching ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  border: "2px dashed #d6d6d6",
                  borderRadius: 3,
                  minHeight: 330,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 2,
                  backgroundColor: "#fafafa",
                }}>
                {previewSrc ? (
                  <Box
                    component="img"
                    src={previewSrc}
                    alt="Event Preview"
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 3,
                      mb: 2,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      backgroundColor: "#eef2f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}>
                    <PhotoCameraOutlinedIcon
                      sx={{ fontSize: 52, color: "#b0b8c4" }}
                    />
                  </Box>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2 }}>
                  Select Photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Event Name"
                    name="event_name"
                    fullWidth
                    value={formData.event_name}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    name="location"
                    fullWidth
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organizer"
                    name="organizer"
                    fullWidth
                    value={formData.organizer}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Status"
                    name="status"
                    fullWidth
                    value={formData.status}
                    onChange={handleInputChange}>
                    <MenuItem value="upcoming">upcoming</MenuItem>
                    <MenuItem value="ongoing">ongoing</MenuItem>
                    <MenuItem value="completed">completed</MenuItem>
                    <MenuItem value="cancelled">cancelled</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Event Date"
                    name="event_date"
                    type="date"
                    fullWidth
                    value={formData.event_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Start Time"
                    name="start_time"
                    type="time"
                    fullWidth
                    value={formData.start_time}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="End Time"
                    name="end_time"
                    type="time"
                    fullWidth
                    value={formData.end_time}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Category"
                    name="category_id"
                    fullWidth
                    value={formData.category_id}
                    onChange={handleInputChange}>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.category_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Venue"
                    name="venue_id"
                    fullWidth
                    value={formData.venue_id}
                    onChange={handleInputChange}>
                    {venues.map((venue) => (
                      <MenuItem key={venue.venue_id} value={venue.venue_id}>
                        {venue.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button onClick={handleClose} sx={{ color: "#444", fontWeight: 600 }}>
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            fetching ||
            !formData.event_name.trim() ||
            !formData.event_date ||
            !formData.start_time ||
            !formData.end_time ||
            !formData.category_id ||
            !formData.venue_id
          }
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 700,
          }}>
          {loading ? "SAVING..." : id ? "UPDATE EVENT" : "CREATE EVENT"}
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
