import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  alpha,
  Select,
  FormControl
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';


const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clientUser: user, signOut } = useAuth();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    signOut('client');
    handleProfileMenuClose();
    navigate('/');
  };

  const navLinks = [
    { title: t("navbar.browse_events"), path: "/" },
    { title: t("navbar.categories"), path: "#" },
    { title: t("navbar.my_bookings"), path: "/my-bookings" }
  ];

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 } }}>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ 
                fontWeight: 800, 
                color: 'primary.main', 
                mr: 4, 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '-0.5px'
            }}
          >
            <Box component="span" sx={{ bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1.5, mr: 0.5 }}>E</Box>
            VENTUI
          </Typography>

          {/* Search Bar (Desktop) */}
          {!isMobile && (
            <Box sx={{ 
              position: 'relative', 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.text.primary, 0.05),
              mr: 2,
              width: '300px',
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              display: 'flex',
              alignItems: 'center',
              px: 2,
              height: '40px'
            }}>
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder={t("navbar.search_placeholder")}
                sx={{ width: '100%', fontSize: '0.9rem' }}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Links (Desktop) */}
          {!isMobile && (
            <Stack direction="row" spacing={3} sx={{ mr: 4 }}>
              {navLinks.map((link) => (
                <Button 
                    key={link.title} 
                    component={Link}
                    to={link.path}
                    color="inherit" 
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, fontWeight: 600 }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>
          )}

          {/* User Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
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

            {user ? (
              <>
                <IconButton size="small" color="inherit">
                  <Badge badgeContent={0} color="primary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                      {user.full_name?.charAt(0) || user.first_name?.charAt(0) || user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                {!isMobile ? (
                  <>
                    <Button component={Link} to="/login" color="inherit" sx={{ fontWeight: 600 }}>{t("common.login")}</Button>
                    <Button component={Link} to="/signup" variant="contained" color="primary" sx={{ borderRadius: 2 }}>{t("common.signup")}</Button>
                  </>
                ) : (
                  <IconButton color="inherit" onClick={() => setMobileMenuOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.title} component={Link} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary={link.title} />
              </ListItemButton>
            ))}
            {!user && (
              <>
                <ListItem sx={{ mt: 2 }}>
                    <Button fullWidth variant="contained" color="primary" component={Link} to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Button>
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="outlined" component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Button>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { mt: 1.5, minWidth: 220, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {user?.full_name || user?.first_name || user?.name || user?.username || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose} component={Link} to="/my-bookings">{t("navbar.my_bookings")}</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>{t("common.logout")}</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
