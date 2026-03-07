import { useState, useEffect } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/category.api";
import CategoryList from "./CategoryList";
import EditCategory from "./EditCategory";
import CategoryDetail from "./CategoryDetail";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar("Failed to load categories", "error");
      setCategories([]);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ category_name: "", description: "" });
    setOpenEdit(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      category_name: category.category_name || "",
      description: category.description || "",
    });
    setOpenEdit(true);
  };

  const handleOpenDetail = (category) => {
    setSelectedCategory(category);
    setOpenDetail(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const updated = await updateCategory(editingId, formData);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
        showSnackbar("Category updated successfully!");
      } else {
        const created = await createCategory(formData);
        setCategories((prev) => [...prev, created]);
        showSnackbar("Category added successfully!");
      }
      setOpenEdit(false);
    } catch (error) {
      showSnackbar("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showSnackbar("Category deleted successfully!");
    } catch (error) {
      showSnackbar("Delete failed", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Category Management
      </Typography>

      <CategoryList
        categories={categories}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onView={handleOpenDetail}
        onAdd={handleOpenAdd}
      />

      <EditCategory
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        loading={loading}
        editingId={editingId}
      />

      <CategoryDetail
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        category={selectedCategory}
      />

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
    </Box>
  );
}
