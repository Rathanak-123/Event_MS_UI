import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  useTheme,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImage from "../../assets/photo/EMS-Use-with-White-Background.png";
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  
  const returnUrl = location.state?.returnUrl || '/';
  
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
        document.getElementById("google-auth-button"),
        { 
          theme: "filled_blue", 
          size: "large", 
          width: "100%",
          text: "continue_with",
          shape: "pill"
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
        setError(result.error || 'Google verification failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during Google verification.');
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
                boxShadow: '0 40px 100px rgba(0,0,0,0.08)',
                position: 'relative'
            }}
        >
          {/* Close Button */}
          <IconButton 
            component={Link} 
            to="/" 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              color: 'text.secondary',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected', color: 'text.primary' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{ mb: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <img src={logoImage} alt="EMS" style={{ width: "120px", height: "auto" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px' }}>
              Welcome to <span style={{ color: theme.palette.primary.main }}>EventMS</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">Join thousands of event enthusiasts today</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

          <Stack spacing={4}>
            <Box id="google-auth-button" sx={{ 
              width: '100%', 
              '& > div': { width: '100% !important' },
              mb: 1
            }} />
            
            <Typography variant="caption" color="text.secondary" align="center" sx={{ opacity: 0.8 }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
