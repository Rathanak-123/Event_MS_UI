import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button
} from "@mui/material";
import { Assessment, Group, ConfirmationNumber, ShowChart } from "@mui/icons-material";
import { getCheckinStats } from "../../../api/checkin.api";

export default function CheckinStats() {
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckinStats(eventId);
      setStats(data);
    } catch (err) {
      setError("Failed to load statistics. Please verify the Event ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="800" gutterBottom>
        Check-in Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enter an Event ID to view real-time check-in statistics.
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Event ID"
          variant="outlined"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          size="small"
        />
        <Button 
          variant="contained" 
          onClick={fetchStats}
          disabled={!eventId || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "View Stats"}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>
      )}

      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, bgcolor: '#f3e8ff' }}>
              <CardContent>
                <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary" variant="subtitle2">Total Bookings</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.total_bookings || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, bgcolor: '#e0f2fe' }}>
              <CardContent>
                <ConfirmationNumber color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary" variant="subtitle2">Tickets Checked-in</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.checked_in || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, bgcolor: '#ffedd5' }}>
              <CardContent>
                <Group color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary" variant="subtitle2">Pending Check-in</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {(stats.total_bookings || 0) - (stats.checked_in || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, bgcolor: '#dcfce7' }}>
              <CardContent>
                <ShowChart color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="text.secondary" variant="subtitle2">Check-in Rate</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total_bookings ? Math.round((stats.checked_in / stats.total_bookings) * 100) : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
