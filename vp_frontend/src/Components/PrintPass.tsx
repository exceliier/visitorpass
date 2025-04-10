import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import Barcode from 'react-barcode';
import { useHistory } from 'react-router-dom';

const PrintPass: React.FC = () => {
  const [visitorData, setVisitorData] = useState<any>(null); // Store visitor data
  const [currentDateTime, setCurrentDateTime] = useState<string>(''); // State for current datetime
  const history = useHistory();

  useEffect(() => {
    // Retrieve the visitorData JSON object from sessionStorage
    const data = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
    setVisitorData(data);

    // Generate and set the current datetime in dd/MMM/yyyy format
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);
    setCurrentDateTime(formattedDate);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleNew = () => {
    history.push('/'); // Navigate back to the DataForm page
  };

  return (
    <Container maxWidth="sm">
      <Box
        id="printable-pass"
        sx={{
          textAlign: 'center',
          p: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
          width: '100mm', // Match A6 width
          height: '140mm', // Match A6 height
          boxSizing: 'border-box',
          margin: 'auto',
        }}
      >
        <img
          src="/logo.png" // Replace with your logo path
          alt="Logo"
          style={{ width: '80px', marginBottom: '1rem' }}
        />
        <Typography variant="h5" gutterBottom>
          Sinchan Bhavan - Visitor Pass
        </Typography>
        {visitorData?.photo && (
          <img
            src={visitorData.photo}
            alt="Visitor"
            style={{
              width: 'auto',
              height: '100px', // Set a fixed height for the image
              borderRadius: '8px',
              marginBottom: '1rem',
              objectFit: 'contain', // Ensures the entire image is visible within the box
            }}
          />
        )}
        <Typography variant="h6">Name: {visitorData?.name}</Typography>
        <Typography variant="body1">Mobile: {visitorData?.mobile}</Typography>
        <Typography variant="body1">Adhaar Number: {visitorData?.adhaar}</Typography>
        <Typography variant="body1">To Visit: {visitorData?.toVisit}</Typography>
        <Typography variant="body1">Entry Time: {currentDateTime}</Typography> {/* Display current datetime */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '1rem',
          }}
        >
          <Barcode
            value={visitorData?.barcode || ''}
            width={1} // Adjust barcode width
            height={40} // Adjust barcode height
            margin={0} // Remove extra margins
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button onClick={handlePrint} variant="contained" color="primary" sx={{ mr: 2 }}>
          Print
        </Button>
        <Button onClick={handleNew} variant="outlined" color="secondary">
          New Visitor
        </Button>
      </Box>
    </Container>
  );
};

export default PrintPass;