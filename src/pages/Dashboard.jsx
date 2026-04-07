import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  TrendingUp,
  Event,
} from "@mui/icons-material";
import reportApi from "../api/report.api";
import { getPaginatedEvents } from "../api/events.api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Revenue", value: "$0", change: "Real-time", color: "#22c55e", icon: <AttachMoney /> },
    { title: "Tickets Sold", value: "0", change: "Real-time", color: "#22c55e", icon: <ShoppingCart /> },
    { title: "Avg. Attendance", value: "0%", change: "Real-time", color: "#22c55e", icon: <TrendingUp /> },
    { title: "Active Events", value: "0", change: "Total registered", color: "#6366f1", icon: <Event /> },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch data for all stats
        const [revenueRes, eventRes, attendanceRes] = await Promise.all([
          reportApi.getRevenueReport({ page: 1, limit: 100 }),
          getPaginatedEvents({ page: 1, limit: 1 }),
          reportApi.getAttendanceReport({ page: 1, limit: 100 }),
        ]);

        const revenueItems = revenueRes.data?.items || [];
        const totalRevenue = revenueItems.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
        const totalTickets = revenueItems.reduce((sum, item) => sum + (item.total_tickets_sold || 0), 0);
        
        const attendanceItems = attendanceRes.data?.items || [];
        const avgAttendance = attendanceItems.length > 0 
          ? attendanceItems.reduce((sum, item) => sum + (item.attendance_rate || 0), 0) / attendanceItems.length 
          : 0;

        const totalEvents = eventRes.total || 0;

        setStats([
          {
            title: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "From all events",
            color: "#22c55e",
            icon: <AttachMoney />,
          },
          {
            title: "Tickets Sold",
            value: totalTickets.toLocaleString(),
            change: "Across all bookings",
            color: "#22c55e",
            icon: <ShoppingCart />,
          },
          {
            title: "Avg. Attendance",
            value: `${avgAttendance.toFixed(1)}%`,
            change: "Average show-up rate",
            color: "#22c55e",
            icon: <TrendingUp />,
          },
          {
            title: "Active Events",
            value: totalEvents.toString(),
            change: "Total event count",
            color: "#6366f1",
            icon: <Event />,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {stats.map((item, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "white",
            }}>
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="body2" color="gray">
                {item.title}
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#6d28d9",
                  p: 1,
                  borderRadius: "50%",
                }}>
                {item.icon}
              </Box>
            </Box>

            {/* Value */}
            <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
              {item.value}
            </Typography>

            {/* Change */}
            <Typography variant="body2" sx={{ mt: 1, color: item.color }}>
              {item.change}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
