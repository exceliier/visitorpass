import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import Barcode from 'react-barcode';
import { useHistory } from 'react-router-dom';

const PrintPass: React.FC = () => {
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorMobile, setVisitorMobile] = useState<string | null>(null);
  const [visitorAddress, setVisitorAddress] = useState<string | null>(null);
  const [visitorPurpose, setVisitorPurpose] = useState<string | null>(null);
  const [visitorToVisit, setVisitorToVisit] = useState<string | null>(null);
  const [visitorPhoto, setVisitorPhoto] = useState<string | null>(null);
  const [visitorId, setvisitorId] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>(''); // State for current datetime
  const history = useHistory();

  useEffect(() => {
    setVisitorName(localStorage.getItem('visitorName'));
    setVisitorMobile(localStorage.getItem('visitorMobile'));
    setVisitorAddress(localStorage.getItem('visitorAddress'));
    setVisitorPurpose(localStorage.getItem('visitorPurpose'));
    setVisitorToVisit(localStorage.getItem('visitorToVisit'));
    setVisitorPhoto(localStorage.getItem('visitorPhoto'));
    setvisitorId(localStorage.getItem('visitorID')); // Retrieve visitorID for barcode

    // Generate and set the current datetime in dd/MMM/yyyy format
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(now);
    setCurrentDateTime(formattedDate);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleNew = () => {
    localStorage.clear(); // Clear all data from localStorage
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
          Visitor Pass
        </Typography>
        {visitorPhoto && (
          <img
            src={visitorPhoto}
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
        <Typography variant="body1">Name: {visitorName}</Typography>
        <Typography variant="body1">Mobile: {visitorMobile}</Typography>
        <Typography variant="body1">Address: {visitorAddress}</Typography>
        <Typography variant="body1">Purpose: {visitorPurpose}</Typography>
        <Typography variant="body1">To Visit: {visitorToVisit}</Typography>
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
            value={visitorId || ''}
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