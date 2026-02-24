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
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SummarizeIcon from "@mui/icons-material/Summarize";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Dashboard,
  Event,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import Venue from "../pages/Venue";

export default function Sidebar({ open }) {
  const [userOpen, setUserOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          transition: "0.3s",
        },
      }}>
      {/* Logo / Name */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Event color="primary" />
        {open && <Typography fontWeight="bold">EventMaster</Typography>}
      </Box>

      <List>
        {/* Dashboard */}
        <ListItemButton component={NavLink} to="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItemButton>
        <ListItemButton component={NavLink} to="/veneu">
          <ListItemIcon>
            <LocationOnIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Veneu" />}
        </ListItemButton>
        {/* Events */}
        <ListItemButton component={NavLink} to="/events">
          <ListItemIcon>
            <Event />
          </ListItemIcon>
          {open && <ListItemText primary="Events" />}
        </ListItemButton>
         {/* Categories*/}
        <ListItemButton component={NavLink} to="/categories">
          <ListItemIcon>
            <Event />
          </ListItemIcon>
          {open && <ListItemText primary="Categories" />}
        </ListItemButton>

        {/*Tickets*/}
        <ListItemButton component={NavLink} to="/tickets">
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Tickets" />}
        </ListItemButton>
        {/*Report*/}
        <ListItemButton component={NavLink} to="/reports">
          <ListItemIcon>
            <SummarizeIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Report" />}
        </ListItemButton>

        {/* Users Dropdown */}
        <ListItemButton onClick={() => setUserOpen(!userOpen)}>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          {open && <ListItemText primary="Users" />}
          {open && (userOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={userOpen}>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/users">
              <ListItemText primary="User List" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={NavLink} to="/user-roles">
              <ListItemText primary="User Roles" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Settings Dropdown */}
        <ListItemButton onClick={() => setSettingOpen(!settingOpen)}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          {open && <ListItemText primary="Settings" />}
          {open && (settingOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={settingOpen}>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/settings/general">
              <ListItemText primary="General" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to="/settings/security">
              <ListItemText primary="Security" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
