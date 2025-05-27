import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import customTheme from './styles/customTheme';
import { AuthProvider } from './context/AuthContext';
import AuthWrapper from './context/AuthWrapper';
import { SnackbarProvider } from './context/SnackbarContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <SnackbarProvider>
          <MuiThemeProvider theme={customTheme}>
            <Router>
              <AuthWrapper />
            </Router>
          </MuiThemeProvider>
        </SnackbarProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export default App;