import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Paper,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getPaginatedEvents } from "../api/events.api";

const ReportFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    eventId: "",
    search: "",
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getPaginatedEvents({ limit: 100 });
        setEvents(response.items || []);
      } catch (error) {
        console.error("Failed to fetch events for filter:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilter({
      start_date: filters.startDate
        ? dayjs(filters.startDate).format("YYYY-MM-DD")
        : null,
      end_date: filters.endDate
        ? dayjs(filters.endDate).format("YYYY-MM-DD")
        : null,
      event_id: filters.eventId || null,
      search: filters.search || null,
    });
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      eventId: "",
      search: "",
    };
    setFilters(resetFilters);
    onFilter({});
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, border: "1px solid #eaeaea", borderRadius: 3 }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: "bold", color: "text.secondary" }}
        >
          FILTER CONTROLS
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-end"
          flexWrap="wrap"
        >
          <TextField
            label="Search keyword"
            placeholder="Name, email, etc..."
            size="small"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>Filter by Event</InputLabel>
            <Select
              value={filters.eventId}
              label="Filter by Event"
              onChange={(e) => handleChange("eventId", e.target.value)}
            >
              <MenuItem value="">All Events</MenuItem>
              {events.map((evt) => (
                <MenuItem key={evt.id} value={evt.id}>
                  {evt.event_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="From Date"
            value={filters.startDate}
            onChange={(val) => handleChange("startDate", val)}
            slotProps={{
              textField: { size: "small", sx: { flex: 1, minWidth: 150 } },
            }}
          />

          <DatePicker
            label="To Date"
            value={filters.endDate}
            onChange={(val) => handleChange("endDate", val)}
            slotProps={{
              textField: { size: "small", sx: { flex: 1, minWidth: 150 } },
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{ px: 3, height: 40, borderRadius: 2 }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ height: 40, borderRadius: 2 }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
};

export default ReportFilters;
