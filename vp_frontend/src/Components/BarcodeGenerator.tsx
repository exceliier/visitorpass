import React from 'react';
import Barcode from 'react-barcode';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';

const BarcodeGenerator: React.FC = () => {
  const history = useHistory();

  // Retrieve the visitorData JSON object from sessionStorage
  const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom>
          Visitor Barcode
        </Typography>
        {visitorData?.photo && (
          <img
            src={visitorData.photo}
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
        <Typography variant="body1">Name: {visitorData?.name}</Typography>
        <Typography variant="body1">Mobile: {visitorData?.mobile}</Typography>
        <Typography variant="body1">Adhaar Number: {visitorData?.adhaar}</Typography>
        <Typography variant="body1">To Visit: {visitorData?.toVisit}</Typography>
        <Barcode value={visitorData?.barcode || ''} width={1} height={50} />
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