import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";

export default function CategoryDetail({ open, onClose, category }) {
  if (!category) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Category Details</DialogTitle>
      <DialogContent>
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

          {/* <Divider sx={{ my: 2 }} /> */}

          {/* <Typography variant="overline" color="text.secondary">
            Category ID
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category.id}
          </Typography> */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
