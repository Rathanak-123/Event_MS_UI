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
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import logoWhite from "../../assets/photo/EMS-Use-with-White-Background.png";
import logoBlack from "../../assets/photo/EMS-Use-with-Black-Background.png";

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { clientUser: user, signOut } = useAuth();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    signOut('client');
    handleProfileMenuClose();
    navigate('/');
  };

  const navLinks = [
    { title: t('navbar.browse_events'), path: '/' },
    { title: t('navbar.my_bookings'), path: '/my-bookings' },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: scrolled
          ? 'rgba(0, 0, 0, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0 }, py: 1 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              mr: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <img 
                src={theme.palette.mode === 'dark' ? logoBlack : logoWhite} 
                alt="EMS" 
                style={{ width: '100px', height: 'auto', objectFit: 'contain' }} 
              />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#fff',
                letterSpacing: '-0.5px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Event<span style={{ color: '#0d9488' }}>MS</span>
            </Typography>
          </Box>

          {/* Search (Desktop) */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: '50px',
                px: 2,
                py: 0.8,
                mr: 2,
                width: 260,
                border: '1px solid rgba(255,255,255,0.12)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
              }}
            >
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, mr: 1 }} />
              <InputBase
                placeholder={t('navbar.search_placeholder')}
                sx={{
                  width: '100%',
                  fontSize: '0.875rem',
                  color: '#fff',
                  '& input::placeholder': { color: 'rgba(255,255,255,0.5)' },
                }}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Nav Links (Desktop) */}
          {!isMobile && (
            <Stack direction="row" spacing={0.5} sx={{ mr: 3 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.title}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    px: 2,
                    borderRadius: '8px',
                    '&:hover': {
                      color: '#fff',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>
          )}

          {/* User Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Language */}
            <FormControl variant="standard" sx={{ minWidth: 50 }}>
              <Select
                value={i18n.language || 'en'}
                onChange={handleLanguageChange}
                disableUnderline
                endAdornment={<ArrowDownIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, ml: -1, pointerEvents: 'none' }} />}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  '& .MuiSelect-icon': { display: 'none' },
                  '& .MuiSelect-select': { pr: '1px !important' },
                }}
              >
                <MenuItem value="en">EN</MenuItem>
                <MenuItem value="km">KM</MenuItem>
              </Select>
            </FormControl>

            {user ? (
              <>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Badge badgeContent={0} color="error" variant="dot">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 0.5 }}>
                  <Avatar
                    sx={{ width: 34, height: 34, bgcolor: '#0d9488', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    {user.full_name?.charAt(0) || user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                {!isMobile ? (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, px: 2 }}
                    >
                      {t('common.login')}
                    </Button>
                    <Button
                      component={Link}
                      to="/signup"
                      variant="contained"
                      sx={{
                        bgcolor: '#0d9488',
                        color: '#fff',
                        borderRadius: '50px',
                        px: 3,
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#0f766e' },
                      }}
                    >
                      {t('common.signup')}
                    </Button>
                  </>
                ) : (
                  <IconButton sx={{ color: '#fff' }} onClick={() => setMobileMenuOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { bgcolor: '#111', borderLeft: '1px solid rgba(255,255,255,0.08)' } }}
      >
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.title}
                component={Link}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}
              >
                <ListItemText primary={link.title} />
              </ListItemButton>
            ))}
            {!user && (
              <>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />
                <Box sx={{ px: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button fullWidth variant="contained" component={Link} to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ bgcolor: '#0d9488', borderRadius: '50px', fontWeight: 700 }}
                  >Sign Up</Button>
                  <Button fullWidth variant="outlined" component={Link} to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50px' }}
                  >Login</Button>
                </Box>
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
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            bgcolor: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {user?.full_name || user?.first_name || user?.username || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <MenuItem
          onClick={handleProfileMenuClose}
          component={Link}
          to="/my-bookings"
          sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
        >
          {t('navbar.my_bookings')}
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ color: '#f87171', '&:hover': { bgcolor: 'rgba(248,113,113,0.08)' } }}
        >
          {t('common.logout')}
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
