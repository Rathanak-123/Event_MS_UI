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
import { getAllCategories } from "../../../api/category.api";

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const categories = await getAllCategories();
      const cat = categories.find((c) => c.id === parseInt(id));
      if (cat) {
        setCategory(cat);
      } else {
        showSnackbar("Category not found", "error");
        setTimeout(() => navigate("/admin/categories"), 2000);
      }
    } catch (error) {
      showSnackbar("Failed to fetch category detail", "error");
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
    navigate("/admin/categories");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Category Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : category ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Category Name
            </Typography>
            <Typography variant="h6" gutterBottom>
              {category.category_name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {category.description || "No description provided."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              Category ID
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {category.id}
            </Typography>
          </Box>
        ) : (
          <Typography color="error">No category found.</Typography>
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
