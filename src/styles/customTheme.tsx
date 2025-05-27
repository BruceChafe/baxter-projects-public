import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4A3D6A',
      light: '#6B5C8F', // Lighter variant of primary
      dark: '#362D4F',  // Darker variant of primary
    },
    secondary: {
      main: '#00BFA5',  // Your preferred teal
    },
    error: {
      main: '#FF4081',  // Your preferred vivid pink for errors/alerts
    },
    warning: {
      main: '#FFC107',  // Amber for warnings
    },
    info: {
      main: '#3949AB',  // Bright indigo for informational elements
    },
    success: {
      main: '#00BFA5',  // Using your teal for success states
    },
    background: {
      default: '#f3f4ed',
      paper: '#ffffff',
    },
    text: {
      primary: '#424242',
      secondary: '#757575',
    },
    action: {
      active: '#4A3D6A',
      hover: 'rgba(74, 61, 106, 0.08)',
      selected: 'rgba(74, 61, 106, 0.16)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#424242',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 400,
      color: '#424242',
    },
        h5: {
      fontWeight: 600,
      color: "#4A3D6A",
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#757575',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '1.5',
          // padding: '10px 20px',
          // fontWeight: 600,
          px: 3,
          py: 1,
        },
        containedPrimary: {
          backgroundColor: '#ff4081',
          color: '#ffffff',
          borderColor: '#d81b60',
          borderWidth: '2px',
          borderStyle: 'solid',
          '&:hover': {
            backgroundColor: '#d81b60',
            color: '#ffffff',
            borderColor: '#b6184a',
          },
        },
        containedSecondary: {
          backgroundColor: '#00BFA5',
          color: '#ffffff',
          borderColor: '#00897B',
          borderWidth: '2px',
          borderStyle: 'solid',
          '&:hover': {
            backgroundColor: '#00897B',
            color: '#ffffff',
            borderColor: '#00695C',
          },
        },
        outlinedPrimary: {
          borderColor: '#ff4081',
          borderWidth: '2px',
          borderStyle: 'solid',
          color: '#ff4081',
          '&:hover': {
            borderColor: '#d81b60',
            color: '#d81b60',
          },
        },
        outlinedSecondary: {
          borderColor: '#00BFA5',
          borderWidth: '2px',
          borderStyle: 'solid',
          color: '#00BFA5',
          '&:hover': {
            borderColor: '#00897B',
            color: '#00897B',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: "500",
          textDecoration: "underline",
          color: "#ff4081",
          "&:hover": {
            color: "#d81b60",
            textDecoration: "none",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.85rem',
          height: '24px',
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#FFF3E0',
            color: '#E65100',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#FFEBEE',
            color: '#C62828',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#E3F2FD',
            color: '#1565C0',
          },
          '&.MuiChip-colorDefault': {
            backgroundColor: '#ECEFF1',
            color: '#455A64',
          },
        },
        label: {
          padding: '0 8px',
        },
      },
    },
  },
});

export default customTheme;


