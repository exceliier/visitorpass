import React, { useState } from 'react';
import { Button, TextField, Typography,Container ,Box} from '@mui/material';
import { useHistory } from 'react-router-dom';

const DataForm: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [toVisit, setToVisit] = useState('');
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const visitorData = {
      name,
      mobile,
      address,
      purpose,
      toVisit,
      photo: localStorage.getItem('visitorPhoto'), // Retrieve photo from localStorage
    };

    try {
      const response = await fetch('http://localhost:5000/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        },
        body: JSON.stringify(visitorData),
      });

      if (response.ok) {
        const { visitorID } = await response.json();
        localStorage.setItem('visitorID', visitorID); // Save visitorID for barcode generation
        history.push('/barcode');
      } else {
        alert('Failed to save visitor data.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };

  const handleAbort = () => {
    // Clear all fields and reset the form
    setName('');
    setMobile('');
    setAddress('');
    setPurpose('');
    setToVisit('');
  };

  const handlePhoto = () => {
    // Save form data to localStorage
    localStorage.setItem('visitorName', name);
    localStorage.setItem('visitorMobile', mobile);
    localStorage.setItem('visitorAddress', address);
    localStorage.setItem('visitorPurpose', purpose);
    localStorage.setItem('visitorToVisit', toVisit);

    // Navigate to the PhotoCapture page
    history.push('/photo');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <form>
            <Typography variant="h5" gutterBottom>
              Enter Visitor Data
            </Typography>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Purpose of Visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="To Whom to Visit"
              value={toVisit}
              onChange={(e) => setToVisit(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handlePhoto}
              style={{ marginRight: '10px' }}
            >
              Photo
            </Button>
            <Button type="button" variant="outlined" color="secondary" onClick={handleAbort}>
              Abort
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default DataForm;