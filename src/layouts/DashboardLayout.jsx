// src/layouts/DashboardLayout.jsx
import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ dark, setDark }) {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={open} />
      <Box sx={{ flexGrow: 1 }}>
        <Header
          dark={dark}
          setDark={setDark}
          toggleSidebar={() => setOpen(!open)}
        />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
