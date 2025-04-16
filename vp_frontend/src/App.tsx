import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PhotoCapture from './Components/PhotoCapture';
import DataForm from './Components/DataForm';
import BarcodeGenerator from './Components/BarcodeGenerator';
import PrintPass from './Components/PrintPass';
import Login from './Components/Login';
import HomePage from './Components/HomePage';

import PrivateRoute from './Components/PrivateRoute';
import { Container, Typography, Box } from '@mui/material';

/**
 * The `App` component serves as the main entry point for the Visitor Pass Management application.
 * It sets up the routing structure and provides a consistent layout for the application.
 *
 * @returns {JSX.Element} The rendered `App` component.
 *
 * @remarks
 * - The component uses `react-router-dom` for routing.
 * - It includes both public and private routes, with `PrivateRoute` ensuring authentication for specific paths.
 * - The layout is styled using Material-UI components such as `Box`, `Container`, and `Typography`.
 *
 * @routes
 * - `/login`: Public route for the login page, rendered by the `Login` component.
 * - `/`: Private route for the main data form, rendered by the `DataForm` component.
 * - `/photo`: Private route for photo capture, rendered by the `PhotoCapture` component.
 * - `/barcode`: Private route for barcode generation, rendered by the `BarcodeGenerator` component.
 * - `/print`: Private route for printing visitor passes, rendered by the `PrintPass` component.
 */
const App: React.FC = () => {
  return (
    <Router>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom align="center">
            Visitor Pass Management
          </Typography>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute exact path="/" component={HomePage} />
            <PrivateRoute exact path="/pass" component={DataForm} />
            <PrivateRoute path="/photo" component={PhotoCapture} />
            <PrivateRoute path="/barcode" component={BarcodeGenerator} />
            <PrivateRoute path="/print" component={PrintPass} />
          </Switch>
        </Container>
      </Box>
    </Router>
  );
};

export default App;