import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { getAllCategories } from "../api/category.api";
import { getAllVenues } from "../api/venue.api";
import { getImageUrl } from "../utils/imageUtils";

const EventModal = ({ open, onClose, onSave, event = null }) => {
  const [formData, setFormData] = useState({
    event_name: "",
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
    organizer: "",
    status: "upcoming",
    category_id: "",
    venue_id: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cats, vns] = await Promise.all([
          getAllCategories(),
          getAllVenues(),
        ]);
        setCategories(cats);
        setVenues(vns);
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        event_name: event.event_name || "",
        location: event.location || "",
        event_date: event.event_date || "",
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        organizer: event.organizer || "",
        status: event.status || "upcoming",
        category_id: event.category_id || event.category?.id || "",
        venue_id: event.venue_id || event.venue?.id || "",
        description: event.description || "",
      });
      setImagePreview(event.image ? getImageUrl(event.image) : null);
      setImageFile(null);
    } else {
      setFormData({
        event_name: "",
        location: "",
        event_date: "",
        start_time: "",
        end_time: "",
        organizer: "",
        status: "upcoming",
        category_id: "",
        venue_id: "",
        description: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [event, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSubmit = { ...formData };
      if (imageFile) {
        dataToSubmit.image = imageFile;
      }
      await onSave(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Save event failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ m: 0, p: 3, fontWeight: 700, fontSize: "1.5rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {event ? "Edit Event" : "Create New Event"}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Event Date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <EventIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.category_name || cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Venue"
                  name="venue_id"
                  value={formData.venue_id}
                  onChange={handleChange}
                >
                  {venues.map((v) => (
                    <MenuItem key={v.venue_id || v.id} value={v.venue_id || v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location (Display Only)"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 4,
                p: 2,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "rgba(0,0,0,0.02)",
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {imagePreview ? (
                <Box sx={{ width: "100%", height: "100%", position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px" }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Change Image
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </Box>
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Upload event cover image
                  </Typography>
                  <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
                    Select Image
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.event_name}
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : event ? "Update Event" : "Create Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
