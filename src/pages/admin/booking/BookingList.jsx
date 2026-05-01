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
} from "@mui/material";
import { Search, Visibility, Edit, Delete, Refresh } from "@mui/icons-material";
import { getAllBookings, deleteBooking } from "../../../api/booking.api";

export default function BookingList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [allBookings, setAllBookings] = useState([]);
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

  const getCustomerLabel = (booking) => {
    if (booking?.customer && typeof booking.customer === 'object') {
      return (
        booking.customer.email ||
        booking.customer.username ||
        booking.customer.full_name ||
        `Customer ID: ${booking.customer.id ?? "—"}`
      );
    }
    return booking?.customer ? `Customer ID: ${booking.customer}` : "—";
  };

  const getEventLabel = (booking) => {
    if (booking?.event && typeof booking.event === 'object') {
      return booking.event.event_name || `Event ID: ${booking.event.id ?? "—"}`;
    }
    return booking?.event ? `Event ID: ${booking.event}` : "—";
  };

  const getTicketLabel = (booking) => {
    if (!booking?.ticket) return "—";
    if (typeof booking.ticket === 'object') {
      return `${booking.ticket.ticket_type || "Ticket"} (${booking.ticket.price || "—"})`;
    }
    return `Ticket ID: ${booking.ticket}`;
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings();
      const items = Array.isArray(data) ? data : (data?.data || []);
      setAllBookings(items);
    } catch (error) {
      console.error(error);
      setAllBookings([]);
      showSnackbar("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [location.pathname]);

  useEffect(() => {
    let filtered = [...allBookings];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        String(b.id).includes(lowerTerm) ||
        String(b.customer?.email || "").toLowerCase().includes(lowerTerm) ||
        String(b.customer?.username || "").toLowerCase().includes(lowerTerm) ||
        String(b.customer?.first_name || "").toLowerCase().includes(lowerTerm) ||
        String(b.event?.event_name || "").toLowerCase().includes(lowerTerm) ||
        String(b.status || "").toLowerCase().includes(lowerTerm)
      );
    }

    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "customer") valA = a.customer?.email || "";
      if (sortBy === "event") valA = a.event?.event_name || "";

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setTotalRows(filtered.length);
    setBookings(filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
  }, [allBookings, searchTerm, sortBy, sortOrder, page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    setSearchTerm(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setSortBy("id");
    setSortOrder("asc");
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin_common.delete_confirm")))
      return;

    try {
      await deleteBooking(id);
      setAllBookings((prev) => prev.filter((booking) => booking.id !== id));
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
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {t("booking_list.title")}
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
              placeholder={t("booking_list.search_placeholder")}
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
              <MenuItem value="id">{t("admin_common.id")}</MenuItem>
              <MenuItem value="quantity">{t("booking_list.table.quantity")}</MenuItem>
              <MenuItem value="total_amount">{t("booking_list.table.total_amount")}</MenuItem>
              <MenuItem value="status">{t("admin_common.status")}</MenuItem>
              <MenuItem value="booking_date">{t("booking_list.table.date", "Booking Date")}</MenuItem>
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
            {t("booking_list.add_new")}
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
                      <strong>{t("admin_common.id")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("booking_list.table.customer")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("booking_list.table.event")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("booking_list.table.ticket")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("booking_list.table.quantity")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("booking_list.table.total_amount")}</strong>
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
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{getCustomerLabel(booking)}</TableCell>
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
                        {t("booking_list.no_found")}
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
