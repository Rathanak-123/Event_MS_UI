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
  MenuItem,
  Breadcrumbs,
  Link,
  Stack,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

/* Page title config */
/* Page title config */
const getPageTitleKey = (path) => {
  const map = {
    "/admin": "sidebar.dashboard",
    "/admin/dashboard": "sidebar.dashboard",
    "/admin/events": "sidebar.events",
    "/admin/users": "header.user_list",
    "/admin/customer": "sidebar.user_client",
    "/admin/venue": "sidebar.venue",
    "/admin/categories": "sidebar.categories",
    "/admin/bookings": "sidebar.booking",
    "/admin/tickets": "sidebar.tickets",
    "/admin/reports": "sidebar.analytics",
    "/admin/reports/event-booking": "sidebar.event_booking_report",
    "/admin/reports/check-in": "sidebar.check_in_report",
    "/admin/checkin/scanner": "sidebar.scanner",
    "/admin/checkin/list": "sidebar.checkin_list",
    "/admin/checkin/stats": "sidebar.statistics",
    "/admin/settings/general": "sidebar.general",
    "/admin/settings/security": "sidebar.security",
  };
  
  if (path.startsWith("/admin/reports/booking-detail/")) {
    return "header.booking_detail";
  }
  
  if (path.startsWith("/admin/reports/check-in-detail/")) {
    return "header.check_in_detail";
  }
  
  return map[path];
};

export default function Header({ dark, setDark, toggleSidebar }) {
  const theme = useTheme();
  const { adminUser } = useAuth();
  const location = useLocation();
  const { i18n, t } = useTranslation();

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const renderBreadcrumb = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { label: t("sidebar.dashboard"), active: path === "/admin" || path === "/admin/dashboard" }
    ];
    
    if (path.includes("/reports/")) {
      breadcrumbs.push({ label: t("sidebar.report"), active: false });
    } else if (path.includes("/checkin/")) {
      breadcrumbs.push({ label: t("sidebar.checkin"), active: false });
    } else if (path.includes("/settings/")) {
      breadcrumbs.push({ label: t("sidebar.settings"), active: false });
    }

    const titleKey = getPageTitleKey(path);
    if (titleKey) {
      const label = t(titleKey);
      if (!breadcrumbs.find(b => b.label === label)) {
        breadcrumbs.push({ label: label, active: true });
      } else {
        // If it's already there, make it active
        breadcrumbs.forEach(b => { if (b.label === label) b.active = true; });
      }
    }

    return (
      <Breadcrumbs 
        separator={<Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: alpha(theme.palette.text.secondary, 0.3), mx: 0.5 }} />}
        aria-label="breadcrumb"
        sx={{ 
          "& .MuiBreadcrumbs-ol": { alignItems: "center" }
        }}
      >
        {breadcrumbs.map((b, i) => (
          <Box 
            key={i}
            sx={{ 
              display: "flex", 
              alignItems: "center",
              cursor: b.active ? "default" : "pointer",
              "&:hover": !b.active ? {
                "& .MuiTypography-root": { color: "primary.main", opacity: 1 }
              } : {}
            }}
          >
            <Typography 
              sx={{ 
                fontSize: "0.8rem", 
                fontWeight: b.active ? 700 : 600,
                color: b.active ? "text.primary" : "text.secondary",
                opacity: b.active ? 1 : 0.6,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                transition: "all 0.2s ease"
              }}
            >
              {b.label}
            </Typography>
          </Box>
        ))}
      </Breadcrumbs>
    );
  };

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0}
      sx={{ 
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        backdropFilter: "blur(20px) saturate(180%)",
        zIndex: theme.zIndex.drawer + 1,
        transition: "all 0.3s ease"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: { xs: 70, md: 80 }, px: { xs: 2, md: 4 } }}>
        {/* Left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ 
              color: "text.secondary",
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.06) }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box sx={{ ml: 2 }}>
            {renderBreadcrumb()}
          </Box>
        </Box>

        {/* Center Search - Command Palette Style */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            px: 2,
            borderRadius: "14px",
            width: 320,
            height: 44,
            border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "text",
            "&:hover": {
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              borderColor: alpha(theme.palette.divider, 0.1),
            },
            "&:focus-within": {
              bgcolor: "background.paper",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              borderColor: theme.palette.primary.main,
              width: 440,
            }
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "text.secondary", mr: 1.5 }} />
          <InputBase 
            placeholder="Search metrics, events, or users..." 
            sx={{ 
              fontSize: "0.85rem", 
              width: "100%",
              fontWeight: 500,
              "& input::placeholder": { color: "text.secondary", opacity: 0.5 }
            }} 
          />
          <Typography variant="caption" sx={{ 
            bgcolor: alpha(theme.palette.text.primary, 0.06), 
            px: 1, 
            py: 0.3, 
            borderRadius: 1.5, 
            color: "text.secondary",
            fontWeight: 700,
            fontSize: "0.65rem",
            ml: 1,
            fontFamily: "monospace",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            ⌘K
          </Typography>
        </Box>

        {/* Right */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Language Selector - Enhanced */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            borderRadius: "10px",
            px: 1
          }}>
            <FormControl variant="standard" sx={{ minWidth: 45 }}>
              <Select
                value={i18n.language || 'en'}
                onChange={handleLanguageChange}
                disableUnderline
                sx={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  color: 'text.secondary',
                  '& .MuiSelect-select': { py: 0.8 },
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <MenuItem value="en">EN</MenuItem>
                <MenuItem value="km">KM</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: "auto", opacity: 0.5 }} />

          {/* Theme Toggle */}
          <IconButton 
            onClick={() => setDark(!dark)} 
            sx={{ 
              color: "text.secondary",
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.06), color: dark ? "#ffb700" : "#6366f1" },
              transition: "all 0.3s ease"
            }}
          >
            {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          {/* Notifications - Pulse effect would be via CSS, simplified here */}
          <IconButton sx={{ 
            color: "text.secondary",
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.06) }
          }}>
            <Badge 
              badgeContent={3} 
              color="error"
              sx={{ 
                "& .MuiBadge-badge": { 
                  fontSize: "0.6rem", 
                  height: 16, 
                  minWidth: 16,
                  fontWeight: 800,
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
                } 
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 28, my: "auto", opacity: 0.5 }} />

          {/* User Profile - Premium Card Style */}
          <Stack 
            direction="row" 
            spacing={1.5} 
            alignItems="center" 
            sx={{ 
              cursor: "pointer", 
              ml: 1,
              p: 0.5,
              pr: 1.5,
              borderRadius: "12px",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) }
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                alt={adminUser?.full_name || adminUser?.username || "Admin"} 
                src={adminUser?.profile_image} 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: theme.palette.primary.main,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
              >
                {!adminUser?.profile_image && getInitials(adminUser?.full_name || adminUser?.username)}
              </Avatar>
              <Box sx={{ 
                position: 'absolute', 
                bottom: 2, 
                right: 2, 
                width: 10, 
                height: 10, 
                bgcolor: "#10b981", 
                borderRadius: "50%", 
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: "0 0 5px rgba(16, 185, 129, 0.5)"
              }} />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.1, color: "text.primary" }}>
                {adminUser?.full_name || adminUser?.username || "Admin User"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {adminUser?.role || "Super Admin"}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
