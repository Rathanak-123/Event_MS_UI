import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SummarizeIcon from "@mui/icons-material/Summarize";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

// Icons for sub-items
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
import SecurityIcon from "@mui/icons-material/Security";

import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import logoWhite from "../assets/photo/EMS-Use-with-White-Background.png";
import logoBlack from "../assets/photo/EMS-Use-with-Black-Background.png";
import { useTranslation } from "react-i18next";

export default function Sidebar({ open }) {
  const [userOpen, setUserOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 260 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 260 : 80,
          transition: theme.transitions.create(["width", "background-color"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          borderRight: `1px solid ${isDark ? alpha('#ffffff', 0.05) : '#e2e8f0'}`,
          backgroundColor: isDark ? "#0f172a" : "#ffffff", // Dynamic background
          backgroundImage: "none",
          color: isDark ? "#ffffff" : "#1e293b"
        },
      }}>
      
      {/* Header Section with Card Style */}
      <Box sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: open ? "space-between" : "center",
          p: open ? 1.5 : 1,
          borderRadius: 3,
          bgcolor: isDark ? alpha("#ffffff", 0.05) : "#f8fafc", // Card background based on theme
          border: isDark ? "none" : "1px solid #f1f5f9",
          cursor: "pointer",
          "&:hover": { bgcolor: isDark ? alpha("#ffffff", 0.1) : "#f1f5f9" },
          transition: "all 0.2s ease",
          minHeight: 64
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* White Square Logo Container */}
            <Box sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: isDark ? "white" : "#0f172a", // Contrast logo box
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              p: 0.5
            }}>
              <img 
                src={isDark ? logoBlack : logoWhite} // Toggle logo color
                alt="EMS" 
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>

            {open && (
              <Box>
                <Typography variant="body2" fontWeight={800} color="inherit" sx={{ lineHeight: 1.2 }}>
                  EventMS
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block' }}>
                  Admin Console
                </Typography>
              </Box>
            )}
          </Stack>

          {open && (
            <UnfoldMoreIcon sx={{ color: isDark ? alpha("#ffffff", 0.3) : alpha("#000000", 0.3), fontSize: 20 }} />
          )}
        </Box>
      </Box>

      <List sx={{ px: 1.5, py: 1 }}>
        <NavItem 
          to="/admin" 
          icon={<DashboardIcon />} 
          label={t("sidebar.dashboard")} 
          open={open} 
          theme={theme} 
        />
        <NavItem 
          to="/admin/categories" 
          icon={<EventIcon />} 
          label={t("sidebar.categories")} 
          open={open} 
          theme={theme} 
        />
        <NavItem 
          to="/admin/venue" 
          icon={<LocationOnIcon />} 
          label={t("sidebar.venue")} 
          open={open} 
          theme={theme} 
        />
        <NavItem 
          to="/admin/events" 
          icon={<EventIcon />} 
          label={t("sidebar.events")} 
          open={open} 
          theme={theme} 
        />
        <NavItem 
          to="/admin/tickets" 
          icon={<ConfirmationNumberIcon />} 
          label={t("sidebar.tickets")} 
          open={open} 
          theme={theme} 
        />
        <NavItem 
          to="/admin/bookings" 
          icon={<ConfirmationNumberIcon />} 
          label={t("sidebar.booking")} 
          open={open} 
          theme={theme} 
        />

        <ListItemButton 
          onClick={() => setCheckinOpen(!checkinOpen)}
          sx={{
            borderRadius: "12px",
            mb: 0.5,
            py: 1.25,
            px: 2,
            justifyContent: open ? "initial" : "center",
            color: isDark ? (checkinOpen ? "#ffffff" : alpha("#ffffff", 0.7)) : (checkinOpen ? theme.palette.primary.main : "#64748b"),
            "&:hover": {
              backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
              color: isDark ? "#ffffff" : theme.palette.primary.main,
              "& .MuiListItemIcon-root": {
                color: isDark ? "#ffffff" : theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: "inherit"
          }}>
            <QrCodeScannerIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.checkin")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: checkinOpen ? 700 : 500,
                color: "inherit"
              }} 
            />
          )}
          {open && (checkinOpen ? <ExpandLessIcon sx={{ color: "inherit" }} /> : <ExpandMoreIcon sx={{ color: "inherit" }} />)}
        </ListItemButton>
 
        <Collapse in={checkinOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mb: 1 }}>
            <SubNavItem to="/admin/checkin/scanner" icon={<QrCodeScannerIcon />} label={t("sidebar.scanner")} theme={theme} />
            <SubNavItem to="/admin/checkin/list" icon={<FormatListBulletedIcon />} label={t("sidebar.checkin_list")} theme={theme} />
          </List>
        </Collapse>

        <ListItemButton 
          onClick={() => setReportOpen(!reportOpen)}
          sx={{
            borderRadius: "12px",
            mb: 0.5,
            py: 1.25,
            px: 2,
            justifyContent: open ? "initial" : "center",
            color: isDark ? (reportOpen ? "#ffffff" : alpha("#ffffff", 0.7)) : (reportOpen ? theme.palette.primary.main : "#64748b"),
            "&:hover": {
              backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
              color: isDark ? "#ffffff" : theme.palette.primary.main,
              "& .MuiListItemIcon-root": {
                color: isDark ? "#ffffff" : theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: "inherit"
          }}>
            <SummarizeIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.report")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: reportOpen ? 700 : 500,
                color: "inherit"
              }} 
            />
          )}
          {open && (reportOpen ? <ExpandLessIcon sx={{ color: "inherit" }} /> : <ExpandMoreIcon sx={{ color: "inherit" }} />)}
        </ListItemButton>
 
        <Collapse in={reportOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mb: 1 }}>
            <SubNavItem to="/admin/reports/event-booking" icon={<AssessmentIcon />} label={t("sidebar.event_booking_report", "Event Report")} theme={theme} />
            <SubNavItem to="/admin/reports/check-in" icon={<AssessmentIcon />} label={t("sidebar.check_in_report", "Check-in Report")} theme={theme} />
          </List>
        </Collapse>
 
        {/* Users Section */}
        <ListItemButton 
          onClick={() => setUserOpen(!userOpen)}
          sx={{
            borderRadius: "12px",
            mb: 0.5,
            py: 1.25,
            px: 2,
            justifyContent: open ? "initial" : "center",
            color: isDark ? (userOpen ? "#ffffff" : alpha("#ffffff", 0.7)) : (userOpen ? theme.palette.primary.main : "#64748b"),
            "&:hover": {
              backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
              color: isDark ? "#ffffff" : theme.palette.primary.main,
              "& .MuiListItemIcon-root": {
                color: isDark ? "#ffffff" : theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: "inherit"
          }}>
            <PeopleIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.users")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: userOpen ? 700 : 500,
                color: "inherit"
              }} 
            />
          )}
          {open && (userOpen ? <ExpandLessIcon sx={{ color: "inherit" }} /> : <ExpandMoreIcon sx={{ color: "inherit" }} />)}
        </ListItemButton>
 
        <Collapse in={userOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mb: 1 }}>
            <SubNavItem to="/admin/users" icon={<ManageAccountsIcon />} label={t("sidebar.user_system")} theme={theme} />
            <SubNavItem to="/admin/customer" icon={<PersonIcon />} label={t("sidebar.user_client")} theme={theme} />
          </List>
        </Collapse>
 
        {/* Settings Section */}
        <ListItemButton 
          onClick={() => setSettingOpen(!settingOpen)}
          sx={{
            borderRadius: "12px",
            mb: 0.5,
            py: 1.25,
            px: 2,
            justifyContent: open ? "initial" : "center",
            color: isDark ? (settingOpen ? "#ffffff" : alpha("#ffffff", 0.7)) : (settingOpen ? theme.palette.primary.main : "#64748b"),
            "&:hover": {
              backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
              color: isDark ? "#ffffff" : theme.palette.primary.main,
              "& .MuiListItemIcon-root": {
                color: isDark ? "#ffffff" : theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: "inherit"
          }}>
            <SettingsIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.settings")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: settingOpen ? 700 : 500,
                color: "inherit"
              }} 
            />
          )}
          {open && (settingOpen ? <ExpandLessIcon sx={{ color: "inherit" }} /> : <ExpandMoreIcon sx={{ color: "inherit" }} />)}
        </ListItemButton>
 
        <Collapse in={settingOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mb: 1 }}>
            <SubNavItem to="/admin/settings/general" icon={<TuneIcon />} label={t("sidebar.general")} theme={theme} />
            <SubNavItem to="/admin/settings/security" icon={<SecurityIcon />} label={t("sidebar.security")} theme={theme} />
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                pl: 4,
                py: 1,
                borderRadius: "10px",
                mb: 0.5,
                mx: 1,
                color: alpha("#ffffff", 0.5),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.light,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.error.light,
                  }
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={t("common.logout")} 
                primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}

function NavItem({ to, icon, label, open, theme }) {
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        borderRadius: "12px",
        mb: 0.5,
        py: 1.25,
        px: 2,
        justifyContent: open ? "initial" : "center",
        color: isDark ? alpha("#ffffff", 0.7) : "#64748b",
        "&.active": {
          backgroundColor: isDark ? alpha("#ffffff", 0.1) : alpha(theme.palette.primary.main, 0.08),
          color: isDark ? "#ffffff" : theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: isDark ? "#ffffff" : theme.palette.primary.main,
          },
        },
        "&:hover": {
          backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
          color: isDark ? "#ffffff" : theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: isDark ? "#ffffff" : theme.palette.primary.main,
          },
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: open ? 2 : "auto",
          justifyContent: "center",
          color: "inherit",
          transition: "0.2s",
        }}
      >
        {icon}
      </ListItemIcon>
      {open && (
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        />
      )}
    </ListItemButton>
  );
}

function SubNavItem({ to, icon, label, theme }) {
  const isDark = theme.palette.mode === 'dark';
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        borderRadius: "10px",
        mb: 0.5,
        mx: 1,
        pl: 4,
        py: 1,
        color: isDark ? alpha("#ffffff", 0.5) : "#94a3b8",
        "&.active": {
          backgroundColor: isDark ? alpha("#ffffff", 0.05) : alpha(theme.palette.primary.main, 0.04),
          color: isDark ? "#ffffff" : theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: isDark ? "#ffffff" : theme.palette.primary.main,
          },
        },
        "&:hover": {
          backgroundColor: isDark ? alpha("#ffffff", 0.03) : alpha(theme.palette.primary.main, 0.02),
          color: isDark ? "#ffffff" : theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: isDark ? "#ffffff" : theme.palette.primary.main,
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
        {icon && <Box sx={{ transform: "scale(0.8)" }}>{icon}</Box>}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      />
    </ListItemButton>
  );
}
