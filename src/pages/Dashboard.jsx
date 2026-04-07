import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  AttachMoney,
  Event,
  CalendarToday,
  BookOnline,
  People,
  LocalPlay
} from "@mui/icons-material";
import { getAllEvents } from "../api/events.api";
import { getAllBookings } from "../api/booking.api";
import { getAllCustomers } from "../api/customer.api";
import { getEventTickets } from "../api/eventTicket.api";

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    generatedTickets: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [events, bookings, customers, tickets] = await Promise.all([
          getAllEvents(),
          getAllBookings(),
          getAllCustomers(),
          getEventTickets()
        ]);
        
        const totalEvents = events?.length || 0;
        const upcomingEvents = events?.filter(e => {
          const dateStr = e.date || e.start_date || e.start_time;
          return dateStr ? new Date(dateStr) > new Date() : false;
        }).length || 0;
        
        const totalBookings = bookings?.length || 0;
        const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_price || b.total_amount || 0), 0) || 0;
        const totalCustomers = customers?.length || 0;
        const generatedTickets = tickets?.length || 0;
        
        setStatsData({
          totalEvents,
          upcomingEvents,
          totalBookings,
          totalRevenue,
          totalCustomers,
          generatedTickets
        });
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Events",
      value: statsData.totalEvents.toString(),
      icon: <Event />,
    },
    {
      title: "Upcoming Events",
      value: statsData.upcomingEvents.toString(),
      icon: <CalendarToday />,
    },
    {
      title: "Total Bookings",
      value: statsData.totalBookings.toString(),
      icon: <BookOnline />,
    },
    {
      title: "Total Revenue",
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      icon: <AttachMoney />,
    },
    {
      title: "Total Customers",
      value: statsData.totalCustomers.toString(),
      icon: <People />,
    },
    {
      title: "Generated Event Tickets",
      value: statsData.generatedTickets.toString(),
      icon: <LocalPlay />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((item, index) => (
        <Grid item xs={12} md={4} key={index}>
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
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
