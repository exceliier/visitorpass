import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PhotoCapture from './components/PhotoCapture';
import DataForm from './components/DataForm';
import BarcodeGenerator from './components/BarcodeGenerator';
import PrintPass from './components/PrintPass';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { Container, Typography, Box } from '@mui/material';

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
            <PrivateRoute exact path="/" component={DataForm} />
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