import { createTheme } from "@mui/material/styles";

const themeOptions = {
  shape: {
    borderRadius: 16, // Softer curves for modern SaaS feel
  },
  typography: {
    fontFamily: '"Inter", "Inter Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(15, 118, 110, 0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.03)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 12px 32px rgba(15, 118, 110, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        },
        root: {
          backgroundImage: "none",
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        }
      }
    }
  },
};

export const lightTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e", // Teal/Green SaaS primary
      dark: "#115e59",
      light: "#2dd4bf",
      contrastText: "#fff",
    },
    secondary: {
      main: "#0ea5e9", // Sky blue secondary
      light: "#38bdf8",
      dark: "#0369a1",
      contrastText: "#fff",
    },
    background: {
      default: "#f8fafc", // Very soft slate blue-grey
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#64748b", // Slate 500
    },
    divider: "rgba(15, 23, 42, 0.08)"
  },
});

export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#2dd4bf", // Lighter teal for dark mode
      dark: "#0f766e",
      light: "#5eead4",
    },
    secondary: {
      main: "#38bdf8",
    },
    background: {
      default: "#0f172a", // Slate 900
      paper: "#1e293b", // Slate 800
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "rgba(248, 250, 252, 0.08)"
  },
});
