'use client';
import React from 'react';
import Barcode from 'react-barcode';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';

/**
 * BarcodeGenerator Component
 *
 * This React functional component generates a visitor pass with a barcode
 * and displays visitor details retrieved from the `sessionStorage`.
 *
 * @component
 * @returns {JSX.Element} A styled container displaying visitor details, a barcode,
 * and a button to navigate to the print page.
 *
 * @remarks
 * - The visitor data is expected to be stored in `sessionStorage` under the key `visitorData`.
 * - If the `visitorData` object is not found or is invalid, default empty values are used.
 * - The barcode is generated using the `Barcode` component.
 *
 * @dependencies
 * - `useHistory` from `react-router-dom` for navigation.
 * - `Container`, `Box`, `Typography`, and `Button` from Material-UI for layout and styling.
 * - `Barcode` for rendering the barcode.
 *
 * @example
 * // Example visitorData stored in sessionStorage:
 * sessionStorage.setItem('visitorData', JSON.stringify({
 *   photo: 'https://example.com/photo.jpg',
 *   name: 'John Doe',
 *   mobile: '1234567890',
 *   adhaar: '1234-5678-9012',
 *   toVisit: 'Reception',
 *   barcode: '123456789012'
 * }));
 *
 * // Render the component
 * <BarcodeGenerator />
 */
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
        <Typography variant="body1">नांव : {visitorData?.name}</Typography>
        <Typography variant="body1">मोबाइल : {visitorData?.mobile}</Typography>
        <Typography variant="body1">ओळखपत्र क्रमांक : {visitorData?.adhaar}</Typography>
        <Typography variant="body1">कोणास भेटणार : {visitorData?.toVisit}</Typography>
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