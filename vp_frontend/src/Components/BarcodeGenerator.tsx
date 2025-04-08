import React from 'react';
import Barcode from 'react-barcode';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';

const BarcodeGenerator: React.FC = () => {
  const history = useHistory();
  const visitorId = localStorage.getItem('visitorID');
  const visitorPhoto = localStorage.getItem('visitorPhoto');
  const visitorName = localStorage.getItem('visitorName');
  const visitorMobile = localStorage.getItem('visitorMobile');
  const visitorAddress = localStorage.getItem('visitorAddress');
  const visitorPurpose = localStorage.getItem('visitorPurpose');
  const visitorToVisit = localStorage.getItem('visitorToVisit');

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom>
          Visitor Barcode
        </Typography>
        {visitorPhoto && (
          <img
            src={visitorPhoto}
            alt="Visitor"
            style={{
              borderRadius: '8px',
              width: '80%',
              maxWidth: '320px',
              height: 'auto',
              objectFit: 'contain',
            }}
            
          />
        )}
        <Typography variant="body1">Name: {visitorName}</Typography>
        <Typography variant="body1">Mobile: {visitorMobile}</Typography>
        <Typography variant="body1">Address: {visitorAddress}</Typography>
        <Typography variant="body1">Purpose: {visitorPurpose}</Typography>
        <Typography variant="body1">To Visit: {visitorToVisit}</Typography>
        <Barcode value={visitorId || ''} width={1} height={50} />
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => history.push('/print')} variant="contained" color="primary">
            Print Pass
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BarcodeGenerator;