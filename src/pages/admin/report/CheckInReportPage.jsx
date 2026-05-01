import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  Autocomplete,
} from "@mui/material";
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Percent as PercentIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getAllEvents } from "../../../api/events.api";
import reportApi from "../../../api/report.api";
import dayjs from "dayjs";
import axiosInstance from "../../../api/request";

const CheckInReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {
      total_tickets: 0,
      checked_in_count: 0,
      not_checked_in_count: 0,
      checkin_rate: 0,
    },
    items: [],
  });

  const [filters, setFilters] = useState({
    event_id: "",
    date: "",
    search: "",
    status: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.event_id) params.event_id = filters.event_id;
      if (filters.date) params.date = filters.date;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const response = await reportApi.getCheckInReport(params);
      if (response && response.success && response.data) {
        setReportData({
          summary: response.data.summary || {
            total_tickets: 0,
            checked_in_count: 0,
            not_checked_in_count: 0,
            checkin_rate: 0,
          },
          items: response.data.items || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch check-in report data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleView = (bookingId) => {
    navigate(`/admin/reports/check-in-detail/${bookingId}`);
  };

  const handleExport = async (format) => {
    try {
      const params = { ...filters, export: format };
      const response = await axiosInstance.get("/reports/check-in-report/", {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checkin_report.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to export", error);
    }
  };

  const SummaryCard = ({ title, value, subtext, icon, color }) => (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ my: 0.5 }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary">
              {subtext}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: theme.palette.mode === 'dark' ? 'background.default' : '#fdfbf0', minHeight: '100vh', borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {t("sidebar.check_in_report", "Event Check-in Report")}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, backgroundColor: theme.palette.background.paper, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Autocomplete
          options={events}
          getOptionLabel={(option) => option.event_name || option.name || option.title || ""}
          value={events.find((ev) => ev.id === filters.event_id) || null}
          onChange={(event, newValue) => {
            handleFilterChange("event_id", newValue ? newValue.id : "");
          }}
          size="small"
          sx={{ minWidth: 250 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select Event"
              InputProps={{
                ...params.InputProps,
                sx: { borderRadius: 2, ...params.InputProps.sx },
              }}
            />
          )}
        />

        <TextField
          type="date"
          size="small"
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          sx={{ minWidth: 200, borderRadius: 2 }}
        />

        <TextField
          placeholder="Search by Ticket, Name or Email..."
          size="small"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200, borderRadius: 2 }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Tickets"
            value={reportData.summary.total_tickets?.toLocaleString() || "0"}
            subtext="Generated tickets"
            icon={<DescriptionIcon fontSize="large" />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Checked In"
            value={reportData.summary.checked_in_count?.toLocaleString() || "0"}
            subtext="Tickets used"
            icon={<CheckCircleIcon fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Not Checked In"
            value={reportData.summary.not_checked_in_count?.toLocaleString() || "0"}
            subtext="Pending check-in"
            icon={<ErrorIcon fontSize="large" />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Check-in Rate"
            value={`${reportData.summary.checkin_rate}%`}
            subtext="Overall attendance"
            icon={<PercentIcon fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={700} mr={1}>Quick Views</Typography>
          <Button 
            variant={filters.status === "" ? "contained" : "soft"} 
            color="info" 
            size="small" 
            sx={{ borderRadius: 6, textTransform: 'none', backgroundColor: filters.status === "" ? alpha(theme.palette.info.main, 0.2) : undefined, color: theme.palette.info.main, boxShadow: 'none' }}
            onClick={() => handleFilterChange("status", "")}
          >
            All Tickets
          </Button>
          <Button 
            variant={filters.status === "checked_in" ? "contained" : "soft"} 
            color="info" 
            size="small" 
            sx={{ borderRadius: 6, textTransform: 'none', backgroundColor: filters.status === "checked_in" ? alpha(theme.palette.info.main, 0.2) : undefined, color: theme.palette.info.main, boxShadow: 'none' }}
            onClick={() => handleFilterChange("status", "checked_in")}
          >
            Checked In
          </Button>
          <Button 
            variant={filters.status === "not_checked_in" ? "contained" : "soft"} 
            color="info" 
            size="small" 
            sx={{ borderRadius: 6, textTransform: 'none', backgroundColor: filters.status === "not_checked_in" ? alpha(theme.palette.info.main, 0.2) : undefined, color: theme.palette.info.main, boxShadow: 'none' }}
            onClick={() => handleFilterChange("status", "not_checked_in")}
          >
            Not Checked In
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            color="success" 
            size="small" 
            startIcon={<GetAppIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', backgroundColor: '#e2f5e9', color: '#2e7d32', boxShadow: 'none', '&:hover': { backgroundColor: '#c8e6c9' } }}
            onClick={() => handleExport("excel")}
          >
            Export Excel
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            size="small" 
            startIcon={<GetAppIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', backgroundColor: '#e2f5e9', color: '#2e7d32', boxShadow: 'none', '&:hover': { backgroundColor: '#c8e6c9' } }}
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </Button>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Ticket Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.items.map((row, index) => (
                <TableRow key={row.ticket_code || index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {row.ticket_code}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.event_name || "N/A"}</TableCell>
                  <TableCell>{row.customer_name || "N/A"}</TableCell>
                  <TableCell>{row.username || "N/A"}</TableCell>
                  <TableCell>{row.booking_date ? dayjs(row.booking_date).format('YYYY-MM-DD HH:mm:ss') : "N/A"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status === 'USED' ? 'Checked In' : 'Not Checked In'} 
                      size="small" 
                      color={row.status === 'USED' ? 'success' : 'warning'}
                      variant="soft"
                      sx={{ borderRadius: 1, fontWeight: 600, px: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleView(row.booking_id)}
                        sx={{ 
                          borderRadius: 1.5, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          py: 0.5
                        }}
                      >
                        View
                      </Button>
                      <IconButton 
                        size="small" 
                        sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1.5 }}
                        onClick={() => {/* Add export logic if needed per row */}}
                      >
                        <GetAppIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {reportData.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No records found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default CheckInReportPage;
