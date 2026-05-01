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
import { getPaginatedTickets, deleteTicket } from "../../../api/ticket.api";
import { getAllEvents } from "../../../api/events.api";

export default function TicketList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
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
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getEventName = (eventId) => {
    const found = events.find((item) => item.id === eventId);
    return found?.event_name || `Event ID: ${eventId}`;
  };

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const fetchTickets = async (
    customPage = page,
    customRowsPerPage = rowsPerPage,
    customSearch = searchTerm,
    customSortBy = sortBy,
    customSortOrder = sortOrder,
  ) => {
    setLoading(true);
    try {
      const data = await getPaginatedTickets({
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

      setTickets(Array.isArray(items) ? items : []);
      setTotalRows(total);
    } catch (error) {
      console.error(error);
      setTickets([]);
      setTotalRows(0);
      setTickets([]);
      setTotalRows(0);
      showSnackbar(t("admin_common.load_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [location.pathname, page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    setSearchTerm(searchInput);
    fetchTickets(0, rowsPerPage, searchInput, sortBy, sortOrder);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setSortBy("id");
    setSortOrder("asc");
    setPage(0);
    fetchTickets(0, rowsPerPage, "", "id", "asc");
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin_common.delete_confirm"))) return;

    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
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
    fetchTickets(0, rowsPerPage, searchTerm, value, sortOrder);
  };

  const handleSortOrderChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    setPage(0);
    fetchTickets(0, rowsPerPage, searchTerm, sortBy, value);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {t("ticket_list.title")}
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
              placeholder={t("ticket_list.search_placeholder")}
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
              <MenuItem value="ticket_type">{t("ticket_list.table.type")}</MenuItem>
              <MenuItem value="price">{t("ticket_list.table.price")}</MenuItem>
              <MenuItem value="quantity">{t("ticket_list.table.quantity")}</MenuItem>
              <MenuItem value="sold">{t("ticket_list.table.sold")}</MenuItem>
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
            {t("ticket_list.add_new")}
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
        {loading && tickets.length === 0 ? (
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
                      <strong>{t("ticket_list.table.event")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("ticket_list.table.type")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("ticket_list.table.price")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("ticket_list.table.quantity")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("ticket_list.table.sold")}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{t("admin_common.actions")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>{ticket.event?.event_name || "—"}</TableCell>
                      <TableCell>{ticket.ticket_type || "—"}</TableCell>
                      <TableCell>{ticket.price || "—"}</TableCell>
                      <TableCell>{ticket.quantity ?? "—"}</TableCell>
                      <TableCell>{ticket.sold ?? "—"}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => navigate(`${ticket.id}`)}>
                          <Visibility color="info" />
                        </IconButton>

                        <IconButton
                          onClick={() => navigate(`edit/${ticket.id}`)}>
                          <Edit color="primary" />
                        </IconButton>

                        <IconButton onClick={() => handleDelete(ticket.id)}>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t("ticket_list.no_found")}
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
