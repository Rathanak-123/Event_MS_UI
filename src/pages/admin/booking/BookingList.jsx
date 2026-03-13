import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
} from "@mui/material";
import { Search, Visibility, Edit, Delete, Refresh } from "@mui/icons-material";
import { getPaginatedBookings, deleteBooking } from "../../../api/booking.api";

export default function BookingList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("id");
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
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getUserLabel = (booking) => {
    return (
      booking?.user?.email ||
      booking?.user?.username ||
      booking?.user?.full_name ||
      `User ID: ${booking?.user?.id ?? "—"}`
    );
  };

  const getEventLabel = (booking) => {
    return (
      booking?.event?.event_name || `Event ID: ${booking?.event?.id ?? "—"}`
    );
  };

  const getTicketLabel = (booking) => {
    if (!booking?.ticket) return "—";
    return `${booking.ticket.ticket_type || "Ticket"} (${booking.ticket.price || "—"})`;
  };

  const fetchBookings = async (
    customPage = page,
    customRowsPerPage = rowsPerPage,
    customSearch = searchTerm,
    customSortBy = sortBy,
    customSortOrder = sortOrder,
  ) => {
    setLoading(true);
    try {
      const data = await getPaginatedBookings({
        page: customPage + 1,
        limit: customRowsPerPage,
        sort_by: customSortBy,
        sort_order: customSortOrder,
        search: customSearch,
        filters: {},
      });

      const items = data?.items || data?.results || data?.data || [];
      const total =
        data?.total || data?.count || data?.total_items || items.length || 0;

      setBookings(Array.isArray(items) ? items : []);
      setTotalRows(total);
    } catch (error) {
      console.error(error);
      setBookings([]);
      setTotalRows(0);
      showSnackbar("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [location.pathname, page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    setSearchTerm(searchInput);
    fetchBookings(0, rowsPerPage, searchInput, sortBy, sortOrder);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setSortBy("id");
    setSortOrder("asc");
    setPage(0);
    fetchBookings(0, rowsPerPage, "", "id", "asc");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      showSnackbar("Booking deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error?.response?.data || error);
      showSnackbar("Delete failed", "error");
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
    fetchBookings(0, rowsPerPage, searchTerm, value, sortOrder);
  };

  const handleSortOrderChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    setPage(0);
    fetchBookings(0, rowsPerPage, searchTerm, sortBy, value);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Booking Management
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
            sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search booking..."
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
              label="Sort By"
              value={sortBy}
              onChange={handleSortByChange}
              sx={{ minWidth: 170 }}>
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="total_amount">Total Amount</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="booking_date">Booking Date</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Sort Order"
              value={sortOrder}
              onChange={handleSortOrderChange}
              sx={{ minWidth: 160 }}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </TextField>

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}>
              Search
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ minWidth: 120 }}>
              Reset
            </Button>
          </Stack>

          <Button variant="contained" onClick={() => navigate("add")}>
            Add Booking
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
        {loading && bookings.length === 0 ? (
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
                      <strong>ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>User</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Event</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Ticket</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{getUserLabel(booking)}</TableCell>
                      <TableCell>{getEventLabel(booking)}</TableCell>
                      <TableCell>{getTicketLabel(booking)}</TableCell>
                      <TableCell>{booking.quantity ?? "—"}</TableCell>
                      <TableCell>{booking.total_amount || "—"}</TableCell>
                      <TableCell>{booking.status || "—"}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => navigate(`${booking.id}`)}>
                          <Visibility color="info" />
                        </IconButton>

                        <IconButton
                          onClick={() => navigate(`edit/${booking.id}`)}>
                          <Edit color="primary" />
                        </IconButton>

                        <IconButton onClick={() => handleDelete(booking.id)}>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No bookings found
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
