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
import logoImage from "../assets/photo/EMS-Use-with-White-Background.png";
import { useTranslation } from "react-i18next";
export default function Sidebar({ open }) {
  const [userOpen, setUserOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          transition: "0.3s",
          overflowX: "hidden",
        },
      }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center", gap: 1 }}>
        <img 
          src={logoImage} 
          alt="EventMaster Logo" 
          style={{ 
            width: open ? "100%" : "40px", 
            maxWidth: open ? "160px" : "40px", 
            height: "auto",
            objectFit: "contain"
          }} 
        />
      </Box>

      <List>
        <ListItemButton component={NavLink} to="/admin">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.dashboard")} />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/categories">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.categories")} />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/venue">
          <ListItemIcon>
            <LocationOnIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.venue")} />}
        </ListItemButton>
 
        <ListItemButton component={NavLink} to="/admin/events">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.events")} />}
        </ListItemButton>
 
        <ListItemButton component={NavLink} to="/admin/tickets">
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.tickets")} />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/bookings">
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.booking")} />}
        </ListItemButton>
        <ListItemButton onClick={() => setCheckinOpen(!checkinOpen)}>
          <ListItemIcon>
            <QrCodeScannerIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.checkin")} />}
          {open && (checkinOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
        </ListItemButton>
 
        <Collapse in={checkinOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/admin/checkin/scanner">
              <ListItemIcon>
                <QrCodeScannerIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.scanner")} />
            </ListItemButton>
 
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/admin/checkin/list">
              <ListItemIcon>
                <FormatListBulletedIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.checkin_list")} />
            </ListItemButton>
 
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/admin/checkin/stats">
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.statistics")} />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton component={NavLink} to="/admin/reports">
          <ListItemIcon>
            <SummarizeIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.report")} />}
        </ListItemButton>
 
        {/* Users Section */}
        <ListItemButton onClick={() => setUserOpen(!userOpen)}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.users")} />}
          {open && (userOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
        </ListItemButton>
 
        <Collapse in={userOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/users">
              <ListItemIcon>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.user_system")} />
            </ListItemButton>
 
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/customer">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.user_client")} />
            </ListItemButton>
          </List>
        </Collapse>
 
        {/* Settings Section */}
        <ListItemButton onClick={() => setSettingOpen(!settingOpen)}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {open && <ListItemText primary={t("sidebar.settings")} />}
          {open && (settingOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
        </ListItemButton>
 
        <Collapse in={settingOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/settings/general">
              <ListItemIcon>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.general")} />
            </ListItemButton>
 
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/settings/security">
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.security")} />
            </ListItemButton>
 
            <ListItemButton sx={{ pl: 4 }} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={t("common.logout")} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
