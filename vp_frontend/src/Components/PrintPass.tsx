'use client';
import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import Barcode from 'react-barcode';
import { useNavigate } from 'react-router-dom'; // Replace useHistory with useNavigate
import { STATIC_TEXT } from '../appconfig';
import { useSettings } from '../context/SettingsContext';

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
 * - `useNavigate` from `react-router-dom` for navigation.
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
  const { settings } = useSettings();
  const [visitorData, setVisitorData] = useState<any>(null); // Store visitor data
  const [currentDateTime, setCurrentDateTime] = useState<string>(''); // State for current datetime
  const [rawEntryDate, setRawEntryDate] = useState<Date>(new Date());
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  useEffect(() => {
    // Retrieve the visitorData JSON object from sessionStorage
    const data = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
    setVisitorData(data);

    // Use visitor's date if available, otherwise current datetime
    const dateToUse = data.date ? new Date(data.date) : new Date();
    setRawEntryDate(dateToUse);
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateToUse);
    setCurrentDateTime(formattedDate);
  }, []);

  const getExpiryTimeString = () => {
    if (!rawEntryDate || isNaN(rawEntryDate.getTime())) return '';
    const validityHours = settings?.validityHours || 2;
    const timeBasedExpiry = new Date(rawEntryDate.getTime() + validityHours * 60 * 60 * 1000);

    const [cutoffHour, cutoffMinute] = (settings?.cutoffTime || '17:00')
      .split(':')
      .map(Number);

    const cutoffDate = new Date(rawEntryDate);
    cutoffDate.setHours(cutoffHour || 17, cutoffMinute || 0, 0, 0);

    const finalExpiryTime = new Date(
      Math.max(timeBasedExpiry.getTime(), cutoffDate.getTime())
    );
    return finalExpiryTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNew = () => {
    navigate('/pass'); // Navigate to new visitor form
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous screen
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
          fontFamily: settings?.fontFamily || "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif",
          '& *': {
            fontFamily: 'inherit !important',
          },
        }}
      >
        <img
          src={settings?.logoUrl || '/logo.png'}
          alt="Logo"
          style={{ width: '80px', maxHeight: '60px', objectFit: 'contain' }}
        />
        <Typography variant="body2" gutterBottom>
          {settings?.organizationName || STATIC_TEXT.ORGANIZATION_NAME}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {settings?.passTitle || 'अभ्यागत प्रवेश परवाना'}
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
        <Typography variant="h6">
          <strong> नांव : {visitorData?.name}</strong>
        </Typography>
        <Typography variant="body1">मोबाइल : {visitorData?.mobile}</Typography>
        <Typography variant="body1">
          ओळखपत्र क्रमांक : {visitorData?.adhaar}
        </Typography>
        <Typography variant="body1">
          कोणास भेटणार : {visitorData?.toVisit}
        </Typography>
        <Typography variant="body1">
          <strong> वेळ : {currentDateTime} </strong>{' '}
        </Typography>{' '}
        {/* Display current datetime */}
        <Typography variant="body2">
          {getExpiryTimeString()} {settings?.footerNotice || 'पर्यन्त प्रवेश परवाना वैध आहे.'}
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
        <Button
          onClick={handlePrint}
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          Print
        </Button>
        <Button
          onClick={handleNew}
          variant="outlined"
          color="secondary"
          sx={{ mr: 2 }}
        >
          New Visitor
        </Button>
        <Button onClick={handleBack} variant="outlined" color="secondary">
          Back
        </Button>
      </Box>
    </Container>
  );
};

export default PrintPass;
