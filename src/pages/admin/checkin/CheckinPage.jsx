import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  QrCodeScanner,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { confirmCheckin } from "../../../api/checkin.api";
import { getPaginatedEventTickets } from "../../../api/eventTicket.api";

export default function CheckinPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [ticketStatusMsg, setTicketStatusMsg] = useState("");

  const handleSearchTicket = async (e) => {
    e?.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setTicketStatusMsg("");

    try {
      // Step 1: Search for the ticket details using the ticket API
      const res = await getPaginatedEventTickets({
        page: 1,
        limit: 1,
        search: ticketCode.trim(),
        filters: { ticket_code: ticketCode.trim() },
      });

      const items = res?.items || res?.data || [];
      if (items.length > 0) {
        // We found the ticket!
        setResult(items[0]);
        // Also check if it's already used
        if (items[0].status === "USED" || items[0].status === "ALREADY_USED") {
          setTicketStatusMsg("ALREADY USED");
        } else {
          setTicketStatusMsg("READY");
        }
      } else {
        setError("Ticket not found. Invalid ticket code.");
      }
    } catch (err) {
      console.error("Ticket search error:", err);
      setError("Failed to search ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!result || !result.ticket_code) return;

    setConfirming(true);
    setError(null);

    try {
      // Actually confirm check-in via Checkins API
      await confirmCheckin({ ticket_code: result.ticket_code });
      setTicketStatusMsg("SUCCESS");
    } catch (err) {
      console.error("Check-in confirm error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to confirm check-in."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Ticket Check-In
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
        <Typography variant="body1" color="text.secondary" mb={2}>
          Validate customer tickets quickly and prevent duplicate entry
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter Ticket Code"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchTicket(e);
              }
            }}
            disabled={loading}
          />
          <Button
            onClick={handleSearchTicket}
            disabled={loading || !ticketCode.trim()}
            variant="contained"
            sx={{ minWidth: 160 }}
            startIcon={<QrCodeScanner />}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Check Ticket"}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result &&
        (() => {
          const dataPayload = result.booking || result.ticket_code
            ? result
            : result.checkin
            ? result.checkin
            : result.data
            ? result.data
            : result;

          const customerName =
            dataPayload?.customer_name ||
            (dataPayload?.booking?.customer?.first_name
              ? `${dataPayload.booking.customer.first_name} ${
                  dataPayload.booking.customer.last_name || ""
                }`
              : "N/A");

          const eventTitle =
            dataPayload?.event_title ||
            dataPayload?.event_name ||
            dataPayload?.booking?.event?.title ||
            dataPayload?.booking?.event?.event_name ||
            "N/A";
          const ticketCodeStr = dataPayload?.ticket_code || "N/A";
          const ticketType =
            dataPayload?.ticket?.ticket_type ||
            dataPayload?.booking?.ticket?.ticket_type ||
            "Standard";
          const bookingId = dataPayload?.booking_id || dataPayload?.booking?.id || "N/A";

          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #eaeaea",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Verification Result
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    {ticketStatusMsg === "SUCCESS" ? (
                      <>
                        <CheckCircle color="success" fontSize="large" />
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          CHECK-IN SUCCESSFUL
                        </Typography>
                      </>
                    ) : ticketStatusMsg === "ALREADY USED" ? (
                      <>
                        <ErrorIcon color="error" fontSize="large" />
                        <Typography variant="h6" color="error.main" fontWeight="bold">
                          TICKET ALREADY USED
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircle color="info" fontSize="large" />
                        <Typography variant="h6" color="info.main" fontWeight="bold">
                          TICKET VERIFIED - PENDING CHECK-IN
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" noWrap>
                        {customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Event
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" noWrap>
                        {eventTitle}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Ticket Code
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" noWrap>
                        {ticketCodeStr}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleConfirmCheckin}
                      disabled={ticketStatusMsg !== "READY" || confirming}
                      sx={{ minWidth: 160 }}
                    >
                      {confirming ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : ticketStatusMsg === "SUCCESS" ? (
                        "Checked In"
                      ) : ticketStatusMsg === "ALREADY USED" ? (
                        "Already Used"
                      ) : (
                        "Confirm Check-In"
                      )}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #eaeaea",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Ticket Details
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Customer:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {customerName}
                      </Typography>
                    </Box>
                    <Divider />

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Event:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {eventTitle}
                      </Typography>
                    </Box>
                    <Divider />

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Ticket Type:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {ticketType}
                      </Typography>
                    </Box>
                    <Divider />

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Ticket Code:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {ticketCodeStr}
                      </Typography>
                    </Box>
                    <Divider />

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Booking ID:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {bookingId}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          );
        })()}
    </Box>
  );
}
