import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, Avatar, Button, Chip, Divider, IconButton, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AttachMoney, AccountBalanceWallet, PersonOutline, AccessAlarm, Edit as EditIcon, Description, Event } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAllEvents } from "../api/events.api";
import { getAllBookings } from "../api/booking.api";
import { getAllCustomers } from "../api/customer.api";

// Fallback image for events
const fallbackThumb = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&q=80";

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentBookings: [],
    topEvents: [],
  });

  const [bookingChartData, setBookingChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [eventsResponse, bookingsResponse, customersResponse] = await Promise.all([
          getAllEvents(),
          getAllBookings(),
          getAllCustomers(),
        ]);

        const events = Array.isArray(eventsResponse?.data) ? eventsResponse.data : (Array.isArray(eventsResponse) ? eventsResponse : []);
        const bookings = Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : (Array.isArray(bookingsResponse?.results) ? bookingsResponse.results : (Array.isArray(bookingsResponse) ? bookingsResponse : []));
        const customers = Array.isArray(customersResponse?.data) ? customersResponse.data : (Array.isArray(customersResponse) ? customersResponse : []);

        const totalEvents = events?.length || 0;
        const totalBookings = bookings?.length || 0;
        const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_amount || b.total_price || 0), 0) || 0;
        const totalCustomers = customers?.length || 0;

        // Process recent bookings
        const recentBookings = [...(bookings || [])]
          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
          .slice(0, 4);

        // Process top events (mock revenue for top events if needed, but we'll try to map)
        const eventsWithMockStats = events?.slice(0, 3).map(evt => ({
          ...evt,
          mockRevenue: Math.floor(Math.random() * 5000) + 1000,
          mockPrice: evt.tickets?.[0]?.price || Math.floor(Math.random() * 50) + 20
        })) || [];

        // Chart Data (Mocking day spreads to match aesthetics)
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Emulate daily bookings distribution
        const barData = weekDays.map((day) => ({
          name: day,
          bookings: Math.floor(Math.random() * 45) + 15
        }));

        // Emulate revenue area curve
        const areaData = weekDays.map((day) => ({
          name: day,
          revenue: Math.floor(Math.random() * 120) + 40
        }));

        setStatsData({
          totalEvents,
          totalBookings,
          totalRevenue,
          totalCustomers,
          recentBookings,
          topEvents: eventsWithMockStats,
        });
        
        setBookingChartData(barData);
        setRevenueChartData(areaData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Common Card Style
  const dashCardStyle = {
    p: 3,
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    bgcolor: 'white'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      
      {/* 1. TOP METRIC CARDS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">{t("dashboard.total_revenue")}</Typography>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '50%', color: '#0f766e', display: 'flex' }}>
                <AttachMoney fontSize="small" />
              </Box>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight="900" color="#1e293b">
                ${statsData.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>+3.67%</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Events */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">{t("dashboard.total_events")}</Typography>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '50%', color: '#0f766e', display: 'flex' }}>
                <Event fontSize="small" />
              </Box>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight="900" color="#1e293b">
                {statsData.totalEvents}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>-2.67%</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">{t("dashboard.total_bookings")}</Typography>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '50%', color: '#0f766e', display: 'flex' }}>
                <Description fontSize="small" />
              </Box>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight="900" color="#1e293b">
                {statsData.totalBookings}
              </Typography>
              <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>+2.54%</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Total Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">{t("dashboard.total_customers")}</Typography>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '50%', color: '#0f766e', display: 'flex' }}>
                <PersonOutline fontSize="small" />
              </Box>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight="900" color="#1e293b">
                {statsData.totalCustomers}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>-2.57%</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. MIDDLE AND BOTTOM GRIDS */}
      <Grid container spacing={3}>
        
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* Recent Bookings List */}
          <Paper sx={{ ...dashCardStyle, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">{t("dashboard.current_bookings")}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t("common.view_all")}</Typography>
            </Box>
            
            <Box display="flex" flexDirection="column" gap={0.5}>
              {statsData.recentBookings.map((booking, idx) => (
                <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" py={1.5} sx={{ borderBottom: idx < statsData.recentBookings.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                  <Box display="flex" alignItems="center" gap={2} width="40%">
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#0f766e' }}>{booking.customer_name?.charAt(0) || booking.customer?.first_name?.charAt(0) || 'C'}</Avatar>
                    <Typography variant="body2" fontWeight="bold" color="#334155" noWrap>
                      {booking.customer_name || (booking.customer?.first_name ? `${booking.customer.first_name} ${booking.customer.last_name || ''}` : 'Customer')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" width="15%">
                    {booking.created_at ? new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '14:30'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" width="15%">
                    {booking.quantity || 1} Tix
                  </Typography>
                  <Typography variant="body2" color="#10b981" fontWeight="bold" width="15%">
                    {booking.status || 'Confirmed'}
                  </Typography>
                  <Box width="15%" display="flex" justifyContent="flex-end">
                    <Button size="small" startIcon={<EditIcon sx={{ fontSize: 16 }} />} sx={{ color: '#475569', textTransform: 'none', minWidth: 0, p: 0 }}>{t("common.edit")}</Button>
                  </Box>
                </Box>
              ))}
              {statsData.recentBookings.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" py={2}>{t("dashboard.no_bookings")}</Typography>
              )}
            </Box>
          </Paper>

          {/* Bookings Per Day Chart */}
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">{t("dashboard.bookings_per_day")}</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Button size="small" sx={{ bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#0f172a' }, borderRadius: 1.5, px: 2, textTransform: 'none' }}>{t("common.weekly")}</Button>
                <Button size="small" sx={{ color: '#64748b', px: 2, textTransform: 'none' }}>{t("common.monthly")}</Button>
              </Box>
            </Box>
            
            <Box height={240} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="bookings" fill="#2d6a4f" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* Revenue Trend Area Chart */}
          <Paper sx={{ ...dashCardStyle, mb: 3 }}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">{t("dashboard.revenue_trend")}</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Button size="small" sx={{ bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#0f172a' }, borderRadius: 1.5, px: 2, textTransform: 'none' }}>{t("common.weekly")}</Button>
                <Button size="small" sx={{ color: '#64748b', px: 2, textTransform: 'none' }}>{t("common.monthly")}</Button>
              </Box>
            </Box>

            <Box height={220} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Top Events List */}
          <Paper sx={dashCardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">{t("dashboard.top_events")}</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Button size="small" sx={{ bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#0f172a' }, borderRadius: 1.5, px: 2, textTransform: 'none' }}>{t("common.weekly")}</Button>
                <Button size="small" sx={{ color: '#64748b', px: 2, textTransform: 'none' }}>{t("common.monthly")}</Button>
              </Box>
            </Box>

            {/* List Header */}
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="caption" color="#94a3b8" width="60%">{t("dashboard.event_name")}</Typography>
              <Typography variant="caption" color="#94a3b8" width="20%">{t("dashboard.avg_price")}</Typography>
              <Typography variant="caption" color="#94a3b8" width="20%" align="right">{t("dashboard.total_est_rev")}</Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={0}>
              {statsData.topEvents.map((evt, idx) => (
                <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" py={2} sx={{ borderBottom: idx < statsData.topEvents.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                  <Box display="flex" alignItems="center" gap={2} width="60%">
                    <Avatar src={evt.image_url || evt.image || fallbackThumb} variant="rounded" sx={{ width: 44, height: 44, borderRadius: 2 }} />
                    <Typography variant="body2" fontWeight="bold" color="#334155" noWrap sx={{ maxWidth: '80%' }}>
                      {evt.event_name || evt.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#64748b" width="20%">
                    ${evt.mockPrice}
                  </Typography>
                  <Typography variant="body2" color="#1e293b" fontWeight="900" width="20%" align="right">
                    ${evt.mockRevenue.toLocaleString()}
                  </Typography>
                </Box>
              ))}
              {statsData.topEvents.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" py={3}>{t("dashboard.no_event_data")}</Typography>
              )}
            </Box>

          </Paper>

        </Grid>
      </Grid>

    </Box>
  );
}
