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
  FormControlLabel,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { createCustomer, updateCustomer, getCustomerById } from "../../../api/customer.api";

import { getAvatarUrl } from "../../../utils/imageUtils";


export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    picture: null,
    status: true,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCustomer = async () => {
    setFetching(true);
    try {
      const data = await getCustomerById(id);

      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          picture: null,
          status: data.status ?? true,
        });
        setExistingImage(data.picture || "");
      } else {
        showSnackbar("Customer not found", "error");
        setTimeout(() => navigate("/admin/customer"), 1200);
      }
    } catch {
      showSnackbar("Failed to fetch customer", "error");
    } finally {
      setFetching(false);
    }
  };



  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      picture: file,
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
      const payload = { ...formData };
      if (!payload.picture) {
        delete payload.picture;
      }

      if (id) {
        await updateCustomer(id, payload);
        showSnackbar("Customer updated successfully!");
      } else {
        await createCustomer(payload);
        showSnackbar("Customer created successfully!");
      }

      setTimeout(() => navigate("/admin/customer"), 900);
    } catch (error) {
      console.error(error);
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/customer");
  };

  const previewSrc =
    imagePreview || getAvatarUrl(existingImage, formData);


  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="md">
      <Box
        sx={{
          px: 4,
          pt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h5" fontWeight="bold">
          {id ? "EDIT CUSTOMER" : "ADD CUSTOMER"}
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
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: "2px dashed #d6d6d6",
                  borderRadius: 3,
                  minHeight: 280,
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
                    alt="Customer Preview"
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: "50%",
                      mb: 2,
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      backgroundColor: "#eef2f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}>
                    <PhotoCameraOutlinedIcon
                      sx={{ fontSize: 48, color: "#b0b8c4" }}
                    />
                  </Box>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2 }}>
                  {previewSrc ? "Change Photo" : "Select Photo"}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    fullWidth
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    fullWidth
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status}
                        onChange={handleInputChange}
                        name="status"
                        color="success"
                      />
                    }
                    label={formData.status ? "Active Account" : "Inactive Account"}
                  />
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
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim()
          }
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 700,
          }}>
          {loading ? "SAVING..." : id ? "UPDATE CUSTOMER" : "CREATE CUSTOMER"}
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
