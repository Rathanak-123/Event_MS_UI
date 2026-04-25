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
            alignItems: "center",
            justifyContent: "center",
            mb: 4
          }}
        >
          <img 
            src={logoImage} 
            alt="EMS" 
            style={{ 
              width: "180px", 
              height: "auto",
              objectFit: "contain",
            }} 
          />
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: theme.palette.text.primary,
            letterSpacing: "-1px",
            mb: 1
          }}
        >
          Event<span style={{ color: theme.palette.primary.main }}>MS</span>
        </Typography>

        <Typography component="h1" variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Admin Control Center
        </Typography>

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
