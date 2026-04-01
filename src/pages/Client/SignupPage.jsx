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
  IconButton,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signup } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  
  const returnUrl = location.state?.returnUrl || '/';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signup-button"),
        { 
          theme: "outline", 
          size: "large", 
          width: "100%",
          text: "signup_with",
          shape: "rectangular"
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle(response.credential);
      if (result.success) {
        navigate(returnUrl);
      } else {
        setError(result.error || 'Google signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during Google signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (response) {
        navigate('/login', { state: { returnUrl } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px' }}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Start your journey with us today</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4 }
                }}
              />
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
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4 }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                    mt: 2,
                    py: 2, 
                    borderRadius: 4, 
                    fontWeight: 900, 
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>SIGN UP WITH</Typography>
              </Divider>

              <Box id="google-signup-button" sx={{ 
                width: '100%', 
                '& > div': { width: '100% !important' },
                mb: 1
              }} />

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" state={{ returnUrl }} sx={{ fontWeight: 800, textDecoration: 'none' }}>
                  Log in
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
