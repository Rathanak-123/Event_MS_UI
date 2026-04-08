import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Container, Paper } from "@mui/material";
import ReportFilters from "../../../components/ReportFilters";
import BookingReport from "./BookingReport";
import RevenueReport from "./RevenueReport";
import PaymentMethodReport from "./PaymentMethodReport";
import AttendanceReport from "./AttendanceReport";

const ReportPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({});
  console.log("This is report")

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your event performance, revenue, and attendance metrics in real-time.
        </Typography>
      </Box>

      {/* Global Filters Section */}
      <ReportFilters onFilter={handleFilterChange} />

      {/* Tabs Section */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #eaeaea", overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc" }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': { py: 2, fontWeight: 'medium' },
              '& .Mui-selected': { color: 'primary.main', fontWeight: 'bold' }
            }}
          >
            <Tab label="Booking Ledger" />
            <Tab label="Revenue Summary" />
            <Tab label="Payment Analytics" />
            <Tab label="Attendance Insights" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <BookingReport filters={filters} />}
          {tabValue === 1 && <RevenueReport filters={filters} />}
          {tabValue === 2 && <PaymentMethodReport filters={filters} />}
          {tabValue === 3 && <AttendanceReport filters={filters} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportPage;
