import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ────────────────────────────────────────────────
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logoImage from "../../../assets/photo/EMS-Use-with-White-Background.png";
import { useTheme, alpha } from "@mui/material/styles";

export default function Login() {
  const [email, setEmail] = useState("admin123@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email.trim(), password, 'admin');

    setLoading(false);

    if (result.success) {
      const roleName = result.user?.role?.name?.toLowerCase() || result.user?.role?.toLowerCase() || '';
      const isAdmin = roleName === 'admin' || roleName === 'super admin' || result.user?.is_superuser || result.user?.is_staff;
      
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        signOut('admin');
        setError("Access Denied: You do not have admin privileges.");
      }
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
            p: 4,
            bgcolor: "#020617", // Deep dark background matching sidebar
            borderRadius: 6,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* White Square Logo Container */}
          <Box sx={{ 
            width: 64, 
            height: 64, 
            bgcolor: "white", 
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            p: 1
          }}>
            <img 
              src={logoImage} 
              alt="EMS" 
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                color: "#ffffff", 
                letterSpacing: -2,
              }}
            >
              Event
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                color: "#00a3a3", 
                letterSpacing: -2,
              }}
            >
              MS
            </Typography>
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha("#ffffff", 0.5), 
              fontSize: "0.75rem", 
              fontWeight: 600, 
              mt: 1,
              letterSpacing: 1,
              textTransform: 'uppercase'
            }}
          >
            Admin Console
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
            sx={{ mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2" underline="hover">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2" underline="hover">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 8, mb: 4 }}
      >
        © {new Date().getFullYear()} Event<span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>MS</span> — All rights reserved.
      </Typography>
    </Container>
  );
}
