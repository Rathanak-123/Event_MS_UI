import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Select,
  MenuItem,
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
  DateRange as DateRangeIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
  CreditCardOff as CreditCardOffIcon,
  AttachMoney as AttachMoneyIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getAllEvents } from "../../../api/events.api";
import reportApi from "../../../api/report.api";
import dayjs from "dayjs";
import axiosInstance from "../../../api/request";

const EventReportPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {
      total_bookings: 0,
      confirmed_payments: 0,
      unconfirmed_payments: 0,
      total_revenue: 0,
    },
    results: [],
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

      const data = await reportApi.getEventReportList(params);
      // Check for the new standardized API response format
      if (data && data.success && data.data) {
        setReportData({
          summary: {
            total_bookings: data.data.summary?.total_bookings || 0,
            confirmed_payments: data.data.summary?.confirmed_count || data.data.summary?.confirmed_payments || 0,
            unconfirmed_payments: data.data.summary?.unconfirmed_count || data.data.summary?.unconfirmed_payments || 0,
            total_revenue: data.data.summary?.total_revenue || 0,
          },
          results: data.data.items || [],
        });
      } else if (data.results) {
        setReportData({
          summary: data.summary || {
             total_bookings: data.count || data.results.length,
             confirmed_payments: data.results.filter(r => r.status?.toLowerCase() === 'confirmed').length,
             unconfirmed_payments: data.results.filter(r => r.status?.toLowerCase() !== 'confirmed').length,
             total_revenue: data.results.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0)
          },
          results: data.results,
        });
      } else if (Array.isArray(data)) {
        setReportData({
          summary: {
             total_bookings: data.length,
             confirmed_payments: data.filter(r => r.status?.toLowerCase() === 'confirmed').length,
             unconfirmed_payments: data.filter(r => r.status?.toLowerCase() !== 'confirmed').length,
             total_revenue: data.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0)
          },
          results: data,
        });
      } else {
         setReportData({
            summary: data.summary || {
                total_bookings: 0,
                confirmed_payments: 0,
                unconfirmed_payments: 0,
                total_revenue: 0,
            },
            results: data.data?.items || data.items || []
         });
      }
    } catch (error) {
      console.error("Failed to fetch report data", error);
      // Fallback or empty state could be handled here
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleView = (id) => {
    navigate(`/admin/reports/booking-detail/${id}`);
  };

  const handleExport = async (format) => {
    try {
      const params = { ...filters, export: format };
      // Depending on how backend handles export (returning file vs link)
      // Usually returning file stream:
      const response = await axiosInstance.get("/reports/event-report-list/", {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_report.${format === 'excel' ? 'xlsx' : 'csv'}`);
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
        Event Booking & Payment Report
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
          InputProps={{
            startAdornment: (
               <InputAdornment position="start">
               </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, borderRadius: 2 }}
        />

        <TextField
          placeholder="Search..."
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
            title="Total Bookings"
            value={reportData.summary.total_bookings?.toLocaleString() || "0"}
            subtext="All categories"
            icon={<DescriptionIcon fontSize="large" />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Confirmed Payments"
            value={reportData.summary.confirmed_payments?.toLocaleString() || "0"}
            subtext="Confirmed"
            icon={<CreditCardIcon fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Unconfirmed Payments"
            value={reportData.summary.unconfirmed_payments?.toLocaleString() || "0"}
            subtext="Pending"
            icon={<CreditCardOffIcon fontSize="large" />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Revenue"
            value={`$${(parseFloat(reportData.summary.total_revenue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtext="All events"
            icon={<AttachMoneyIcon fontSize="large" />}
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
            List Total Booking
          </Button>
          <Button 
            variant={filters.status === "confirmed" ? "contained" : "soft"} 
            color="info" 
            size="small" 
            sx={{ borderRadius: 6, textTransform: 'none', backgroundColor: filters.status === "confirmed" ? alpha(theme.palette.info.main, 0.2) : undefined, color: theme.palette.info.main, boxShadow: 'none' }}
            onClick={() => handleFilterChange("status", "confirmed")}
          >
            List Customer Confirmed Payment
          </Button>
          <Button 
            variant={filters.status === "unconfirmed" ? "contained" : "soft"} 
            color="info" 
            size="small" 
            sx={{ borderRadius: 6, textTransform: 'none', backgroundColor: filters.status === "unconfirmed" ? alpha(theme.palette.info.main, 0.2) : undefined, color: theme.palette.info.main, boxShadow: 'none' }}
            onClick={() => handleFilterChange("status", "unconfirmed")}
          >
            List Customer Unconfirmed Payment
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
                <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Booking Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.results.map((row, index) => (
                <TableRow key={row.booking_id || index} hover>
                  <TableCell>{row.booking_id || row.id || "N/A"}</TableCell>
                  <TableCell>{row.event_name || row.event?.title || "N/A"}</TableCell>
                  <TableCell>{row.customer_name || row.customer?.user?.first_name || "N/A"}</TableCell>
                  <TableCell>{row.username || row.customer?.user?.username || "N/A"}</TableCell>
                  <TableCell>{row.booking_date ? dayjs(row.booking_date).format('YYYY-MM-DD HH:mm:ss') : "N/A"}</TableCell>
                  <TableCell>{row.quantity || row.ticket_quantity || 0}</TableCell>
                  <TableCell>${parseFloat(row.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.payment_method || "N/A"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status?.toLowerCase() === 'confirmed' ? 'Confirmed' : 'Pending'} 
                      size="small" 
                      color={row.status?.toLowerCase() === 'confirmed' ? 'success' : 'error'}
                      sx={{ borderRadius: 1, fontWeight: 600, px: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />} 
                        sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 600 }}
                        onClick={() => handleView(row.booking_id || row.id)}
                      >
                        View
                      </Button>
                      <Button size="small" startIcon={<GetAppIcon />} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                        Export
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {reportData.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
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

export default EventReportPage;
