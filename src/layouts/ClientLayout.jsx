// src/layouts/ClientLayout.jsx
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../pages/Client/Navbar";
import Footer from "../pages/Client/Footer";

export default function ClientLayout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: '#0a0a0a' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
