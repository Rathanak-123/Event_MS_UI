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

import { logout } from "../api/authApi";
import logoWhite from "../assets/photo/EMS-Use-with-White-Background.png";
import logoBlack from "../assets/photo/EMS-Use-with-Black-Background.png";
import { useTranslation } from "react-i18next";
export default function Sidebar({ open }) {
  const [userOpen, setUserOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: "none",
        },
      }}>
      <Box sx={{ 
        p: 3, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: open ? "flex-start" : "center", 
        gap: 2,
        minHeight: 80
      }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mr: open ? 0 : 0
          }}
        >
          <img 
            src={theme.palette.mode === 'dark' ? logoBlack : logoWhite} 
            alt="EMS" 
            style={{ 
              width: open ? "120px" : "40px", 
              height: "auto",
              objectFit: "contain",
              transition: "width 0.3s ease"
            }} 
          />
        </Box>
        {/* Branding text removed as logo might already contain it or user wants full logo focus */}
        {/* If branding text is still needed, I can keep it, but user said "use full logo" */}
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
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: checkinOpen ? theme.palette.primary.main : theme.palette.text.secondary
          }}>
            <QrCodeScannerIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.checkin")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: checkinOpen ? 700 : 500,
                color: checkinOpen ? theme.palette.primary.main : theme.palette.text.primary
              }} 
            />
          )}
          {open && (checkinOpen ? <ExpandLessIcon sx={{ color: theme.palette.primary.main }} /> : <ExpandMoreIcon />)}
        </ListItemButton>
 
        <Collapse in={checkinOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mb: 1 }}>
            <SubNavItem to="/admin/checkin/scanner" icon={<QrCodeScannerIcon />} label={t("sidebar.scanner")} theme={theme} />
            <SubNavItem to="/admin/checkin/list" icon={<FormatListBulletedIcon />} label={t("sidebar.checkin_list")} theme={theme} />
            <SubNavItem to="/admin/checkin/stats" icon={<AssessmentIcon />} label={t("sidebar.statistics")} theme={theme} />
          </List>
        </Collapse>

        <NavItem 
          to="/admin/reports" 
          icon={<SummarizeIcon />} 
          label={t("sidebar.report")} 
          open={open} 
          theme={theme} 
        />
 
        {/* Users Section */}
        <ListItemButton 
          onClick={() => setUserOpen(!userOpen)}
          sx={{
            borderRadius: "12px",
            mb: 0.5,
            py: 1.25,
            px: 2,
            justifyContent: open ? "initial" : "center",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: userOpen ? theme.palette.primary.main : theme.palette.text.secondary
          }}>
            <PeopleIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.users")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: userOpen ? 700 : 500,
                color: userOpen ? theme.palette.primary.main : theme.palette.text.primary
              }} 
            />
          )}
          {open && (userOpen ? <ExpandLessIcon sx={{ color: theme.palette.primary.main }} /> : <ExpandMoreIcon />)}
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
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 2 : "auto", 
            justifyContent: "center",
            color: settingOpen ? theme.palette.primary.main : theme.palette.text.secondary
          }}>
            <SettingsIcon />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary={t("sidebar.settings")} 
              primaryTypographyProps={{ 
                fontSize: "0.9rem", 
                fontWeight: settingOpen ? 700 : 500,
                color: settingOpen ? theme.palette.primary.main : theme.palette.text.primary
              }} 
            />
          )}
          {open && (settingOpen ? <ExpandLessIcon sx={{ color: theme.palette.primary.main }} /> : <ExpandMoreIcon />)}
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
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.error.main,
                  }
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: theme.palette.text.secondary }}>
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
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to === "/admin"}
      sx={{
        borderRadius: "12px",
        mb: 0.5,
        py: 1.25,
        px: 2,
        justifyContent: open ? "initial" : "center",
        color: theme.palette.text.secondary,
        "&.active": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: "20%",
            height: "60%",
            width: "4px",
            backgroundColor: theme.palette.primary.main,
            borderRadius: "0 4px 4px 0",
          }
        },
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
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
        color: theme.palette.text.secondary,
        "&.active": {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
          },
        },
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
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
