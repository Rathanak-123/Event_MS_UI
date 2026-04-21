import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Button
} from "@mui/material";
import {
  CheckCircle,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Refresh
} from "@mui/icons-material";
import { paginateCheckins } from "../../../api/checkin.api";
import { getAllEvents } from "../../../api/events.api";

export default function CheckinListPage() {
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedCheckin, setSelectedCheckin] = useState(null);

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  const fetchRecentCheckins = async () => {
    try {
      setLoadingRecent(true);
      const filters = {};
      if (selectedEventId) {
        filters.event_id = selectedEventId;
      }
      const res = await paginateCheckins({
        page: 1,
        limit: 50, // Increase limit for list page
        sort_by: "created_at",
        sort_order: "desc",
        filters
      });
      setRecentCheckins(res?.items || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch recent checkins:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentCheckins();
  }, [selectedEventId]);

  const handleReset = () => {
    setSelectedEventId("");
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Check-In List
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #eaeaea",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ flex: 1 }}
          >
            <TextField
              select
              size="small"
              label="Filter by Event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              sx={{ minWidth: 200, maxWidth: 300 }}
            >
              <MenuItem value="">
                <em>All Events</em>
              </MenuItem>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title || event.event_name}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              sx={{ minWidth: 120 }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #eaeaea",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Ticket Code</strong>
                </TableCell>
                <TableCell>
                  <strong>Customer</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Time</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRecent && recentCheckins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : recentCheckins.length > 0 ? (
                recentCheckins.map((item, index) => {
                  const custName =
                    item.customer_name ||
                    (item.booking?.customer?.first_name
                      ? `${item.booking.customer.first_name} ${
                          item.booking.customer.last_name || ""
                        }`
                      : "Unknown");
                  const timeObj = item.created_at || item.checkin_time;
                  const timeStr = timeObj
                    ? new Date(timeObj).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "N/A";

                  const isSuccess = item.status === "SUCCESS" || !item.status;
                  const isAlreadyUsed =
                    item.status === "ALREADY_USED" || item.status === "ALREADY USED";

                  let chipColor = "error";
                  let chipIcon = <ErrorIcon fontSize="small" />;
                  let chipLabel = item.status || "SUCCESS";

                  if (isSuccess) {
                    chipColor = "success";
                    chipIcon = <CheckCircle fontSize="small" />;
                  } else if (isAlreadyUsed) {
                    chipColor = "warning";
                    chipIcon = <ErrorIcon fontSize="small" />;
                    chipLabel = "ALREADY USED";
                  }

                  return (
                    <TableRow key={item.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.ticket_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{custName}</TableCell>
                      <TableCell>
                        <Chip
                          label={chipLabel}
                          size="small"
                          color={chipColor}
                          icon={chipIcon}
                          sx={{ fontWeight: "bold", borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>{timeStr}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => setSelectedCheckin(item)}>
                          <VisibilityIcon color="info" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No check-ins found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedCheckin}
        onClose={() => setSelectedCheckin(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Check-In Detail
          </Typography>
          <IconButton onClick={() => setSelectedCheckin(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCheckin &&
            (() => {
              const custName =
                selectedCheckin.customer_name ||
                (selectedCheckin.booking?.customer?.first_name
                  ? `${selectedCheckin.booking.customer.first_name} ${
                      selectedCheckin.booking.customer.last_name || ""
                    }`
                  : "Unknown");
              const eventTitle =
                selectedCheckin.event_title ||
                selectedCheckin.booking?.event?.title ||
                selectedCheckin.booking?.event?.event_name ||
                "Unknown Event";
              const ticketType =
                selectedCheckin.ticket?.ticket_type ||
                selectedCheckin.booking?.ticket?.ticket_type ||
                "Standard";
              const timeObj = selectedCheckin.created_at || selectedCheckin.checkin_time;
              const timeStr = timeObj
                ? new Date(timeObj).toLocaleString([], {
                    dateStyle: "long",
                    timeStyle: "short",
                  })
                : "N/A";

              return (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Ticket Code
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedCheckin.ticket_code}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {custName}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Event
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" textAlign="right">
                      {eventTitle}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Ticket Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {ticketType}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Check-In Time
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {timeStr}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedCheckin.status || "SUCCESS"}
                      size="small"
                      color={
                        selectedCheckin.status === "SUCCESS" || !selectedCheckin.status
                          ? "success"
                          : selectedCheckin.status === "ALREADY_USED" || selectedCheckin.status === "ALREADY USED"
                          ? "warning"
                          : "error"
                      }
                      sx={{ fontWeight: "bold", borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              );
            })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
