import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Stack,
  MenuItem,
  TablePagination,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate, Outlet } from "react-router-dom";
import { getPaginatedEvents, createEvent, updateEvent, deleteEvent } from "../../../api/events.api";
import StatusBadge from "../../../components/StatusBadge";
import EventModal from "../../../components/EventModal";
import { getImageUrl } from "../../../utils/imageUtils";

const EventList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // TablePagination uses 0-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      const data = await getPaginatedEvents({
        page: page + 1, // API expects 1-based indexing
        limit: rowsPerPage,
        search: searchQuery,
        filters,
      });
      
      const items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
      setEvents(items);
      setTotalItems(data?.total || data?.count || data?.total_items || items.length || 0);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(t("event_list.load_error"));
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchEvents]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }
      fetchEvents();
    } catch (err) {
      console.error("Failed to save event:", err);
      throw err;
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm(t("event_list.actions.delete_confirm"))) {
      try {
        await deleteEvent(id);
        fetchEvents();
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
            {t("event_list.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("event_list.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
        >
          {t("event_list.add_new")}
        </Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("event_list.search")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label={t("event_list.status")}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            >
              <MenuItem value="all">{t("event_list.all_statuses")}</MenuItem>
              <MenuItem value="upcoming">{t("event_list.upcoming")}</MenuItem>
              <MenuItem value="ongoing">{t("event_list.ongoing")}</MenuItem>
              <MenuItem value="completed">{t("event_list.completed")}</MenuItem>
              <MenuItem value="cancelled">{t("event_list.cancelled")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table & Pagination Container */}
      {!loading || events.length > 0 ? (
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t("event_list.table.id")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("event_list.table.event")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("event_list.table.category_venue")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("event_list.table.date")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("event_list.table.status")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">{t("event_list.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>{event.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={getImageUrl(event.image)}
                          variant="rounded"
                          sx={{ width: 40, height: 40, borderRadius: 1.5 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {event.event_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{event.category?.category_name || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.venue?.name || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{event.event_date}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.start_time}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t("event_list.actions.view")}>
                        <IconButton onClick={() => navigate(`${event.id}`)} size="small" color="info">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("event_list.actions.edit")}>
                        <IconButton onClick={() => handleOpenEditModal(event)} size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("event_list.actions.delete")}>
                        <IconButton onClick={() => handleDeleteEvent(event.id)} size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">{t("event_list.table.no_found")}</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {!loading && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t("admin_common.rows_per_page")}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(0,0,0,0.01)'
              }}
            />
          )}
        </Paper>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Modal */}
      <EventModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent}
      />

      {/* For detail view or other nested routes */}
      <Outlet />
    </Box>
  );
};

export default EventList;
