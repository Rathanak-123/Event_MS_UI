import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function EditCategory({
  open,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  loading,
  editingId,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingId ? "Update Category" : "Add Category"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="category_name"
          fullWidth
          margin="normal"
          value={formData.category_name}
          onChange={handleInputChange}
          required
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !formData.category_name.trim()}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
