import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
  Snackbar,
  Alert,
  Typography,
  TablePagination,
} from "@mui/material";
import { Edit, Delete, Search, Visibility } from "@mui/icons-material";
import {
  getPaginatedCategories,
  deleteCategory,
} from "../../../api/category.api";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0); // MUI starts from 0
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCategories();
  }, [location.pathname, page, rowsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      fetchCategories(0, rowsPerPage, searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchCategories = async (
    customPage = page,
    customRowsPerPage = rowsPerPage,
    customSearch = searchTerm,
  ) => {
    setLoading(true);
    try {
      const data = await getPaginatedCategories({
        page: customPage + 1, // backend starts from 1
        limit: customRowsPerPage,
        sort_by: "id",
        sort_order: "asc",
        search: customSearch,
        filters: {},
      });

      setCategories(data?.items || data?.results || data?.data || []);
      setTotalRows(data?.total || data?.count || 0);
    } catch (error) {
      showSnackbar("Failed to load categories", "error");
      setCategories([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory(id);
      showSnackbar("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      showSnackbar("Delete failed", "error");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Category Management
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}>
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

        <Button variant="contained" onClick={() => navigate("add")}>
          Add Category
        </Button>
      </Box>

      {loading && categories.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.category_name}</TableCell>
                    <TableCell>{category.description || "—"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => navigate(`${category.id}`)}>
                        <Visibility color="info" />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`edit/${category.id}`)}>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(category.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {categories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRows}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      <Outlet />

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
    </Box>
  );
}
