import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PhotoCapture from './components/PhotoCapture';
import DataForm from './components/DataForm';
import BarcodeGenerator from './components/BarcodeGenerator';
import PrintPass from './components/PrintPass';
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
          <Typography variant="h4" gutterBottom align="center">
            Visitor Pass Management
          </Typography>
          <Switch>
            <Route exact path="/" component={DataForm} />            
            <Route path="/photo" component={PhotoCapture} />
            <Route path="/barcode" component={BarcodeGenerator} />
            <Route path="/print" component={PrintPass} />
          </Switch>
        </Container>
      </Box>
    </Router>
  );
};

export default App;