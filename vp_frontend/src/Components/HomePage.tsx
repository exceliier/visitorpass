import React, { useState } from 'react';
import { Button, TextField, Box, Container, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for date input
  const history = useHistory();

  // Navigate to the Gate Pass (DataForm) page
  const handleNavigateToGatePass = () => {
    history.push('/pass'); // Replace '/gatepass' with the actual route for DataForm
  };

  // Handle printing the daily register
  const handlePrintDailyRegister = () => {
    if (!selectedDate) {
      alert('Please select a date to print the daily register.');
      return;
    }
    // Logic to fetch and print the daily register for the selected date
    console.log(`Printing daily register for date: ${selectedDate}`);
    alert(`Daily register for ${selectedDate} is being printed.`);
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery) {
      alert('Please enter a search query.');
      return;
    }
    // Logic to search by name, mobile, or ID
    console.log(`Searching for: ${searchQuery}`);
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Visitor Management System
      </Typography>

      {/* Button to navigate to Gate Pass */}
      <Box sx={{ marginBottom: '2rem' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigateToGatePass}
        >
          Go to Gate Pass
        </Button>
      </Box>

      {/* Date input and button for printing daily register */}
      <Box sx={{ marginBottom: '2rem' }}>
        <Typography variant="h6" gutterBottom>
          Print Daily Register
        </Typography>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ marginRight: '1rem' }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePrintDailyRegister}
        >
          Print Register
        </Button>
      </Box>

      {/* Search box for searching by name, mobile, or ID */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Search Visitor
        </Typography>
        <TextField
          placeholder="Search by Name, Mobile, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '1rem', width: '70%' }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;