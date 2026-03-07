import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Search, Visibility } from "@mui/icons-material";

export default function CategoryList({
  categories,
  loading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onView,
  onAdd,
}) {
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) => {
        const name = category?.category_name || "";
        const description = category?.description || "";
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          placeholder="Search category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={onAdd}>
          Add Category
        </Button>
      </Box>

      {loading && categories.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.category_name}</TableCell>
                  <TableCell>{category.description || "—"}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => onView(category)}>
                      <Visibility color="info" />
                    </IconButton>
                    <IconButton onClick={() => onEdit(category)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(category.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
