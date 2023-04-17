import './App.css';
import React, { Component } from 'react';
import Routes from './services/Routes';
import PrimaryAppBar from './components/PrimaryAppBar';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import { MockInterviewProvider } from './context/MockInterviewContext';
import { AuthProvider } from './context/AuthContext';

class App extends Component {
  render() {
    return (
      <>
        <ThemeProvider theme={theme}>
          <AuthProvider>
          <PrimaryAppBar />
          <div>
            <MockInterviewProvider>
              <Routes />
            </MockInterviewProvider>
          </div>
          </AuthProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default App;
