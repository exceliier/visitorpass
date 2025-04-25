'use client';
import React, { useState } from 'react';
import { Button, TextField, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axiosInstance from '../axiosInstance'; // Use the axiosInstance

const HomePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for date input
  const [visitorData, setVisitorData] = useState<any[]>([]); // State for fetched visitor data
  const navigate = useNavigate(); // Initialize navigate


  const handlePass = () => {
    navigate('/pass'); // Navigate to the DataForm component
  }
  // Handle printing the daily register
  const handlePrintDailyRegister = async () => {
    if (!selectedDate) {
      alert('Please select a date to print the daily register.');
      return;
    }

    try {
      // Fetch data from the backend using axiosInstance
      const response = await axiosInstance.get('/visitors/by-date', {
        params: { date: selectedDate },
      });

      setVisitorData(response.data); // Set the fetched data

      // Navigate to the DailyRegisterPage with state
      navigate('/daily-register', {
        state: { selectedDate, visitorData: response.data },
      });
    } catch (error) {
      console.error('Error fetching daily register:', error);
      alert('Failed to fetch daily register. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '2rem' }}>
      {/* Date input and button for printing daily register */}
      <Button
          variant="contained"
          color="secondary"
          onClick={handlePass} // Navigate to the DataForm component
          gap="5rem"
        >
          Visitor Passes
        </Button>
      <Box sx={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="small"
          sx={{ width: 'auto' }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePrintDailyRegister}
        >
          Print Register
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;