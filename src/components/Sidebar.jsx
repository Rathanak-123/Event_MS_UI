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

// Icons for sub-items
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
import SecurityIcon from "@mui/icons-material/Security";

import { logout } from "../api/authApi";

export default function Sidebar({ open }) {
  const [userOpen, setUserOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(false);
  const navigate = useNavigate();

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
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <EventIcon color="primary" />
        {open && <Typography fontWeight="bold">EventMaster</Typography>}
      </Box>

      <List>
        <ListItemButton component={NavLink} to="/admin">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/categories">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Categories" />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/venue">
          <ListItemIcon>
            <LocationOnIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Venue" />}
        </ListItemButton>

        <ListItemButton component={NavLink} to="/admin/events">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Events" />}
        </ListItemButton>

        <ListItemButton component={NavLink} to="/admin/tickets">
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Tickets" />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/bookings">
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Booking" />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/admin/reports">
          <ListItemIcon>
            <SummarizeIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Report" />}
        </ListItemButton>

        {/* Users Section */}
        <ListItemButton onClick={() => setUserOpen(!userOpen)}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Users" />}
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
              <ListItemText primary="User System" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/customer">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="User Client" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Settings Section */}
        <ListItemButton onClick={() => setSettingOpen(!settingOpen)}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Settings" />}
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
              <ListItemText primary="General" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/admin/settings/security">
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Security" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 4 }} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
