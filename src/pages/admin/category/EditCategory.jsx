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
} from "@mui/material";
import {
  createCategory,
  updateCategory,
  getAllCategories,
} from "../../../api/category.api";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
  });

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
    setFetching(true);
    try {
      const categories = await getAllCategories();
      const category = categories.find((c) => c.id === parseInt(id));
      if (category) {
        setFormData({
          category_name: category.category_name || "",
          description: category.description || "",
        });
      } else {
        showSnackbar("Category not found", "error");
        setTimeout(() => navigate("/admin/categories"), 2000);
      }
    } catch (error) {
      showSnackbar("Failed to fetch category", "error");
    } finally {
      setFetching(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (id) {
        await updateCategory(id, formData);
        showSnackbar("Category updated successfully!");
      } else {
        await createCategory(formData);
        showSnackbar("Category added successfully!");
      }
      setTimeout(() => navigate("/admin/categories"), 1000);
    } catch (error) {
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/categories");
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{id ? "Update Category" : "Add Category"}</DialogTitle>
      <DialogContent>
        {fetching ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              label="Name"
              name="category_name"
              fullWidth
              margin="normal"
              value={formData.category_name}
              onChange={handleInputChange}
              required
              autoFocus
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
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
          disabled={loading || !formData.category_name.trim() || fetching}
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
