import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";
import { Search, Visibility, Edit, Delete, Refresh } from "@mui/icons-material";
import { getPaginatedCustomers, deleteCustomer } from "../../../api/customer.api";

import { getImageUrl } from "../../../utils/imageUtils";


export default function CustomerList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };



  const fetchCustomers = async (
    customPage = page,
    customRowsPerPage = rowsPerPage,
    customSearch = searchTerm,
    customSortBy = sortBy,
    customSortOrder = sortOrder,
  ) => {
    setLoading(true);
    try {
      const data = await getPaginatedCustomers({
        page: customPage + 1,
        limit: customRowsPerPage,
        sort_by: customSortBy,
        sort_order: customSortOrder,
        search: customSearch,
        filters: {},
      });

      const items = Array.isArray(data) ? data : (data?.items || data?.results || data?.data || []);
      const total =
        data?.total || data?.count || data?.total_items || (Array.isArray(data) ? data.length : items.length) || 0;

      setCustomers(Array.isArray(items) ? items : []);
      setTotalRows(total);
    } catch (error) {
      console.error(error);
      setCustomers([]);
      setTotalRows(0);
      setCustomers([]);
      setTotalRows(0);
      showSnackbar(t("admin_common.load_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [location.pathname, page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    setSearchTerm(searchInput);
    fetchCustomers(0, rowsPerPage, searchInput, sortBy, sortOrder);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setSortBy("first_name");
    setSortOrder("asc");
    setPage(0);
    fetchCustomers(0, rowsPerPage, "", "first_name", "asc");
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin_common.delete_confirm"))) return;

    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((cust) => cust.id !== id));
      showSnackbar(t("admin_common.delete_success"));
    } catch (error) {
      console.error("Delete failed:", error?.response?.data || error);
      showSnackbar(t("admin_common.load_failed"), "error");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
  };

  const handleSortByChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    setPage(0);
    fetchCustomers(0, rowsPerPage, searchTerm, value, sortOrder);
  };

  const handleSortOrderChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    setPage(0);
    fetchCustomers(0, rowsPerPage, searchTerm, sortBy, value);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {t("customer_list.title")}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #eaeaea",
        }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("customer_list.search_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              label={t("admin_common.sort_by")}
              value={sortBy}
              onChange={handleSortByChange}
              sx={{ minWidth: 170 }}>
              <MenuItem value="first_name">{t("customer_list.table.first_name")}</MenuItem>
              <MenuItem value="last_name">{t("customer_list.table.last_name")}</MenuItem>
              <MenuItem value="id">{t("admin_common.id")}</MenuItem>
              <MenuItem value="email">{t("customer_list.table.email")}</MenuItem>
              <MenuItem value="status">{t("admin_common.status")}</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label={t("admin_common.sort_order")}
              value={sortOrder}
              onChange={handleSortOrderChange}
              sx={{ minWidth: 160 }}>
              <MenuItem value="asc">{t("admin_common.ascending")}</MenuItem>
              <MenuItem value="desc">{t("admin_common.descending")}</MenuItem>
            </TextField>

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
              {t("admin_common.search")}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
              {t("admin_common.reset")}
            </Button>
          </Stack>

          <Button variant="contained" onClick={() => navigate("add")} sx={{ whiteSpace: 'nowrap' }}>
            {t("customer_list.add_new")}
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #eaeaea",
          overflow: "hidden",
        }}>
        {loading && customers.length === 0 ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{t("admin_common.id")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("customer_list.table.picture")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("customer_list.table.first_name")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("customer_list.table.last_name")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("customer_list.table.email")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("customer_list.table.role")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("admin_common.status")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("admin_common.actions")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.id}</TableCell>

                      <TableCell>
                        <Avatar
                          src={getImageUrl(customer.picture)}

                          alt={customer.first_name}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>

                      <TableCell>{customer.first_name || "—"}</TableCell>
                      <TableCell>{customer.last_name || "—"}</TableCell>
                      <TableCell>{customer.email || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={customer.role?.display_name || customer.role?.name || "User"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.status ? "Active" : "Inactive"}
                          size="small"
                          color={customer.status ? "success" : "default"}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton onClick={() => navigate(`${customer.id}`)}>
                          <Visibility color="info" />
                        </IconButton>

                        <IconButton onClick={() => navigate(`edit/${customer.id}`)}>
                          <Edit color="primary" />
                        </IconButton>

                        <IconButton onClick={() => handleDelete(customer.id)}>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {t("customer_list.no_found")}
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
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              labelRowsPerPage={t("admin_common.rows_per_page")}
            />
          </>
        )}
      </Paper>

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
