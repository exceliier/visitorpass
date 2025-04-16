import React, { useState } from 'react';
import { Button, TextField, Box, Container, Typography, Modal } from '@mui/material';
import { useHistory } from 'react-router-dom';
import IMBTable from './IMBTable'; // Import the IMBTable component
import axiosInstance from '../axiosInstance'; // Use the axiosInstance

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for date input
  const [modalOpen, setModalOpen] = useState<boolean>(false); // State for modal visibility
  const [visitorData, setVisitorData] = useState<any[]>([]); // State for fetched visitor data
  const history = useHistory();

  // Format the selected date to Indian format (DD-MM-YYYY)
  const formatDateToIndian = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(date));
  };

  // Navigate to the Gate Pass (DataForm) page
  const handleNavigateToGatePass = () => {
    history.push('/pass'); // Replace '/gatepass' with the actual route for DataForm
  };

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
      setModalOpen(true); // Open the modal
    } catch (error) {
      console.error('Error fetching daily register:', error);
      alert('Failed to fetch daily register. Please try again.');
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '2rem' }}>
      
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
      <Box sx={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="small" // Use compact size for the date input
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
     

      {/* Modal for displaying the daily register */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          id="printable-modal" // Add a unique ID for the modal
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            "@media print": {
              "& .no-print": {
                display: "none", // Hide elements with the no-print class during printing
              },
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Daily Visitor Register for {formatDateToIndian(selectedDate)}
          </Typography>
          <IMBTable
            data={visitorData.map((visitor) => ({
              ...visitor,
              date: new Date(visitor.date).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }), // Format the date field to display only the time
            }))}
            visibleColumns={['name', 'mobile', 'adhaar', 'toVisit', 'date']}
            columnMap={{
              name: 'Name',
              mobile: 'Mobile',
              adhaar: 'ID',
              toVisit: 'Whom To Visit',
              date: 'Entry Time', // Update the label for the time column
            }}
            title=""
            noDataMessage="No visitors found for the selected date."
            showPagination={false} // Disable pagination
            showFilters={false} // Disable filters
            rowAction={null} // No row actions
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.print()}
            className="no-print" // Add no-print class to exclude this button
            sx={{
              marginTop: '1rem',
            }}
          >
            Print
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default HomePage;