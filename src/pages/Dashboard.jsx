import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, Avatar, Button, Chip, Divider, IconButton, CircularProgress, Stack, useTheme, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { 
  AttachMoney, 
  Event, 
  Description, 
  PersonOutline, 
  Edit as EditIcon, 
  TrendingUp, 
  TrendingDown, 
  ConfirmationNumber, 
  CheckCircle, 
  Inventory, 
  Assessment
} from "@mui/icons-material";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import reportApi from "../api/report.api";

// Fallback image for events
const fallbackThumb = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&q=80";

export default function Dashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    summary: {},
    charts: {
      revenue_trend: { labels: [], data: [] },
      bookings_per_day: { labels: [], data: [] },
      status_distribution: []
    },
    pending_bookings: [],
    top_events: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }

  // Format data for Recharts
  const formatTrendData = (chartData) => {
    if (!chartData || !chartData.labels) return [];
    return chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.data[index]
    }));
  };

  const revenueData = formatTrendData(stats.charts.revenue_trend);
  const bookingsData = formatTrendData(stats.charts.bookings_per_day);
  const distributionData = stats.charts.status_distribution || [];

  const StatCard = ({ title, value, trend, icon, color }) => (
    <Paper sx={{
      p: 3,
      borderRadius: 4,
      boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 4px 20px rgba(0, 0, 0, 0.03)',
      border: `1px solid ${theme.palette.divider}`,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'background.paper'
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            {typeof value === 'number' && title.toLowerCase().includes('revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ 
          bgcolor: alpha(color, 0.1), 
          p: 1, 
          borderRadius: 2, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Stack>
      
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {trend >= 0 ? (
          <TrendingUp sx={{ color: '#10b981', fontSize: 16 }} />
        ) : (
          <TrendingDown sx={{ color: '#ef4444', fontSize: 16 }} />
        )}
        <Typography variant="body2" sx={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs last period</Typography>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh', width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your events today.
        </Typography>
      </Box>
      
      {/* 1. TOP METRIC CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={stats.summary.total_revenue?.value || 0} 
            trend={stats.summary.total_revenue?.trend || 0} 
            icon={<AttachMoney />} 
            color="#8b5cf6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Bookings" 
            value={stats.summary.total_bookings?.value || 0} 
            trend={stats.summary.total_bookings?.trend || 0} 
            icon={<Description />} 
            color="#3b82f6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Events" 
            value={stats.summary.total_events?.value || 0} 
            trend={stats.summary.total_events?.trend || 0} 
            icon={<Event />} 
            color="#f59e0b" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Customers" 
            value={stats.summary.total_customers?.value || 0} 
            trend={stats.summary.total_customers?.trend || 0} 
            icon={<PersonOutline />} 
            color="#10b981" 
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}><Inventory fontSize="small" /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Tickets Sold</Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">{stats.summary.tickets_sold?.value || 0}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}><CheckCircle fontSize="small" /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Confirmed</Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">{stats.summary.tickets_confirmed?.value || 0}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}><ConfirmationNumber fontSize="small" /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Tickets Generated</Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">{stats.summary.tickets_generated?.value || 0}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#ec4899', 0.1), color: '#ec4899' }}><Assessment fontSize="small" /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Tickets</Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">{stats.summary.total_tickets?.value || 0}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. CHARTS SECTION */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h6" fontWeight={700} color="text.primary">Revenue Trend</Typography>
              <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
                <Button size="small" sx={{ bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' }, borderRadius: 1.5, px: 2, textTransform: 'none' }}>Weekly</Button>
                <Button size="small" sx={{ color: 'text.secondary', px: 2, textTransform: 'none' }}>Monthly</Button>
              </Box>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary
                    }}
                    itemStyle={{ fontWeight: 600, color: theme.palette.text.primary }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9', bgcolor: 'white', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={4}>Bookings by Status</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
              <Box sx={{ position: 'relative', width: '50%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      contentStyle={{ 
                        borderRadius: 12, 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Central Text */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    {distributionData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Total
                  </Typography>
                </Box>
              </Box>

              {/* Custom Legend */}
              <Box sx={{ width: '50%', pl: 3 }}>
                <Stack spacing={2}>
                  {distributionData.map((item, index) => {
                    const total = distributionData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              ({percentage}%)
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {item.value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700} color="text.primary">Pending Bookings</Typography>
              <Button color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>View All</Button>
            </Box>
            
            <Box display="flex" flexDirection="column" gap={2}>
              {stats.pending_bookings.map((booking, idx) => (
                <Box key={booking.id} display="flex" alignItems="center" justifyContent="space-between" p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, fontWeight: 700, color: '#ffffff' }}>{booking.customer_name?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{booking.customer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.event_name}</Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight={700} color="text.primary">${booking.amount}</Typography>
                    <Chip label={booking.status} size="small" sx={{ 
                      fontSize: '0.65rem', 
                      height: 20, 
                      bgcolor: alpha('#f59e0b', 0.1), 
                      color: '#f59e0b',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }} />
                  </Box>
                </Box>
              ))}
              {stats.pending_bookings.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" py={2}>No pending bookings</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9', bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Top Performing Events</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {stats.top_events.map((event, idx) => (
                <Box key={idx} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar variant="rounded" sx={{ width: 48, height: 48, borderRadius: 2 }} src={fallbackThumb} />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{event.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.bookings} Bookings</Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight={800} color="primary.main">${event.revenue.toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{event.tickets_sold} sold</Typography>
                  </Box>
                </Box>
              ))}
              {stats.top_events.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" py={2}>No event data available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
