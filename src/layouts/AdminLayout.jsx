// src/layouts/AdminLayout.jsx
import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminLayout({ dark, setDark }) {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box className="no-print">
        <Sidebar open={open} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Box className="no-print">
          <Header
            dark={dark}
            setDark={setDark}
            toggleSidebar={() => setOpen(!open)}
          />
        </Box>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
