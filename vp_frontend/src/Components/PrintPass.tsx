'use client';
import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import Barcode from 'react-barcode';
import { useHistory } from 'react-router-dom';

/**
 * `PrintPass` is a React functional component that renders a printable visitor pass.
 * It retrieves visitor data from `sessionStorage`, formats the current date and time,
 * and displays the visitor's details along with a barcode. The component also provides
 * options to print the pass or navigate back to the data entry form.
 *
 * @component
 *
 * @returns {JSX.Element} A styled container displaying visitor details and actions.
 *
 * @remarks
 * - The visitor data is expected to be stored in `sessionStorage` under the key `visitorData`.
 * - The current date and time are formatted using the `Intl.DateTimeFormat` API.
 * - The barcode is generated using the `Barcode` component.
 *
 * @example
 * ```tsx
 * // Example usage:
 * <PrintPass />
 * ```
 *
 * @dependencies
 * - `useState` and `useEffect` from React for state management and side effects.
 * - `useHistory` from `react-router-dom` for navigation.
 * - `Container`, `Box`, `Typography`, and `Button` from Material-UI for styling.
 * - `Barcode` for rendering the barcode.
 *
 * @styles
 * - The pass is styled to match A6 dimensions (100mm x 140mm).
 * - The visitor's photo is displayed with a fixed height and rounded corners.
 * - The barcode is styled with adjustable width and height.
 *
 * @actions
 * - `handlePrint`: Triggers the browser's print functionality.
 * - `handleNew`: Navigates back to the data entry form.
 */
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
    history.push('/pass'); // Navigate back to the DataForm page
  };

  return (
    <Container maxWidth="sm">
      <Box
        id="printable-pass"
        sx={{
          textAlign: 'center',
          p: 1,
          border: '2px solid #000',
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
          style={{ width: '80px' }}
        />
        <Typography variant="body2" gutterBottom>
          Sinchan Bhavan, Chhatrapati Sambhajinagar
        </Typography>
        <Typography variant="h6" gutterBottom>
          Visitor Pass
        </Typography>
        
        {visitorData?.photo && (
          <img
            src={visitorData.photo}
            alt="Visitor"
            style={{
              width: 'auto',
              height: '120px', // Set a fixed height for the image
              borderRadius: '8px',              
              objectFit: 'contain', // Ensures the entire image is visible within the box
            }}
          />
        )}
        <Typography variant="h6"><strong> Name: {visitorData?.name}</strong></Typography>
        <Typography variant="body1">Mobile: {visitorData?.mobile}</Typography>
        <Typography variant="body1">ID Number: {visitorData?.adhaar}</Typography>
        <Typography variant="body1">To Visit: {visitorData?.toVisit}</Typography>
        <Typography variant="body1"><strong> Time: {currentDateTime} </strong> </Typography> {/* Display current datetime */}
        <Typography variant='body2'>
          Valid upto{' '}
          {new Date(
            Math.max(
              new Date(currentDateTime).getTime() + 2 * 60 * 60 * 1000,
              new Date(currentDateTime).setHours(17, 0, 0, 0)
            )
          ).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{' '}
          on date of issue
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '1rem',
            overflow: 'hidden', // Ensure content doesn't overflow the box
            maxWidth: '90%', // Limit the width of the barcode container
            margin: '0 auto', // Center the barcode horizontally
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