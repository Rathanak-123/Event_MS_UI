import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  TrendingUp,
  Event,
} from "@mui/icons-material";

const stats = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: "+15.2% vs last month",
    color: "#22c55e",
    icon: <AttachMoney />,
  },
  {
    title: "Tickets Sold",
    value: "8,420",
    change: "+8.4% vs last month",
    color: "#22c55e",
    icon: <ShoppingCart />,
  },
  {
    title: "Conversion Rate",
    value: "12.5%",
    change: "+1.2% vs last month",
    color: "#22c55e",
    icon: <TrendingUp />,
  },
  {
    title: "Active Events",
    value: "14",
    change: "-2 events closed",
    color: "#ef4444",
    icon: <Event />,
  },
];

export default function Dashboard() {
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
