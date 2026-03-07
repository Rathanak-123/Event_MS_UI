import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Avatar,
  Box,
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";

/* Page title config */
const pageTitle = (path) => {
  const map = {
    "/admin": "Dashboard",
    "/admin/events": "Events",
    "/admin/users": "User List",
    "/admin/venue": "Venue",
    "/admin/categories": "Categories",
    "/admin/user-roles": "User Roles",
    "/admin/settings/general": "General Settings",
    "/admin/settings/security": "Security Settings",
  };
  return map[path] || "Dashboard";
};

export default function Header({ dark, setDark, toggleSidebar }) {
  const location = useLocation();

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>

          {/* 🔥 Dynamic Page Name */}
          <Typography variant="h6" fontWeight="bold">
            {pageTitle(location.pathname)}
          </Typography>
        </Box>

        {/* Center Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            px: 2,
            borderRadius: 2,
            width: 300,
          }}
        >
          <SearchIcon fontSize="small" />
          <InputBase placeholder="Search…" sx={{ ml: 1, flex: 1 }} />
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Switch checked={dark} onChange={() => setDark(!dark)} />
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar alt="Admin" src="https://i.pravatar.cc/40" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
