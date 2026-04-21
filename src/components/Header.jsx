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
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* Page title config */
const pageTitle = (path) => {
  const map = {
    "/admin": "sidebar.dashboard",
    "/admin/events": "sidebar.events",
    "/admin/users": "header.user_list",
    "/admin/venue": "sidebar.venue",
    "/admin/categories": "sidebar.categories",
    "/admin/user-roles": "header.user_roles",
    "/admin/settings/general": "sidebar.general",
    "/admin/settings/security": "sidebar.security",
  };
  return map[path] || "sidebar.dashboard";
};

export default function Header({ dark, setDark, toggleSidebar }) {
  const location = useLocation();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

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
            {t(pageTitle(location.pathname))}
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
          <InputBase placeholder={t("common.search")} sx={{ ml: 1, flex: 1 }} />
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Language Toggle */}
          <FormControl variant="standard" sx={{ minWidth: 50, mr: 1 }}>
            <Select
              value={i18n.language || 'en'}
              onChange={handleLanguageChange}
              disableUnderline
              sx={{ 
                fontSize: '0.9rem', 
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="km">KM</MenuItem>
            </Select>
          </FormControl>
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
