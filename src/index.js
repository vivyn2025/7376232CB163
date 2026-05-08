import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles/dashboard.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#245a73'
    },
    secondary: {
      main: '#7a5c2e'
    },
    background: {
      default: '#f4f6f7'
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    h4: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    }
  }
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
