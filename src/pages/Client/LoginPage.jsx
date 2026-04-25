import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Stack,
  alpha,
  useTheme,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImage from "../../assets/photo/EMS-Use-with-White-Background.png";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const returnUrl = location.state?.returnUrl || '/';

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-button"),
        { 
          theme: "outline", 
          size: "large", 
          width: "100%",
          text: "continue_with",
          shape: "rectangular"
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle(response.credential, 'client');
      if (result.success) {
        navigate(returnUrl);
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during Google login.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn(formData.email, formData.password, 'client');
      if (result.success) {
        navigate(returnUrl);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
        sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default',
            py: 12
        }}
    >
      <Container maxWidth="xs">
        <Paper 
            elevation={0} 
            sx={{ 
                p: { xs: 4, md: 6 }, 
                borderRadius: 8, 
                border: '1px solid', 
                borderColor: 'divider',
                boxShadow: '0 40px 100px rgba(0,0,0,0.08)'
            }}
        >
          <Box sx={{ mb: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 4
              }}
            >
              <img 
                src={logoImage} 
                alt="EMS" 
                style={{ 
                  width: "160px", 
                  height: "auto",
                  objectFit: "contain",
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 900, 
                mb: 0.5, 
                letterSpacing: '-1.5px',
                color: theme.palette.text.primary
              }}
            >
              Event<span style={{ color: theme.palette.primary.main }}>MS</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">Login to your account to continue</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4 }
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4 }
                }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <MuiLink component={Link} to="#" variant="body2" sx={{ fontWeight: 700, textDecoration: 'none' }}>
                  Forgot Password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                    py: 2, 
                    borderRadius: 4, 
                    fontWeight: 900, 
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>

              <Divider>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>OR CONTINUE WITH</Typography>
              </Divider>

              <Box id="google-button" sx={{ 
                width: '100%', 
                '& > div': { width: '100% !important' },
                mb: 1
              }} />

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <MuiLink component={Link} to="/signup" state={{ returnUrl }} sx={{ fontWeight: 800, textDecoration: 'none' }}>
                  Sign up free
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
