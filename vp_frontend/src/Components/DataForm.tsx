import React, { useState } from 'react';
import { Button, TextField, Typography,Container ,Box} from '@mui/material';
import { useHistory } from 'react-router-dom';

const DataForm: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [adhhaar, setAdhhaar] = useState('');  
  const [toVisit, setToVisit] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    adhhaar: '',    
    toVisit: '',
  });
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const visitorData = {
      name,
      mobile,
      adhhaar,      
      toVisit,
      photo: localStorage.getItem('visitorPhoto'), // Retrieve photo from localStorage
    };

    try {
      const authToken = localStorage.getItem('authToken'); // Retrieve authToken from localStorage
      const response = await fetch('http://localhost:5000/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Use the retrieved token
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
    const newErrors = {
      name: name.length < 5 ? 'Name must be at least 5 characters long.' : '',
      mobile: !/^\d{10}$/.test(mobile) ? 'Mobile number must be exactly 10 digits.' : '',
      adhhaar: !/^\d{12}$/.test(mobile) ? 'adhhaar must be at least 12 characters long.' : '',      
      toVisit: toVisit.length < 5 ? 'To Whom to Visit must be at least 5 characters long.' : '',
    };

    setErrors(newErrors);

    // If there are any errors, stop execution
    if (Object.values(newErrors).some((error) => error !== '')) {
      alert('Please fix the errors before proceeding to photo capture.');
      return;
    }

    // Save form data to localStorage
    localStorage.setItem('visitorName', name);
    localStorage.setItem('visitorMobile', mobile);
    localStorage.setItem('visitorAdhhaar', adhhaar);    
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
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.mobile}
              helperText={errors.mobile}
            />
            <TextField
              label="Adhhaar Number"
              value={adhhaar}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.adhhaar}
              helperText={errors.adhhaar}
            />
            
            <TextField
              label="To Whom to Visit"
              value={toVisit}
              onChange={(e) => setToVisit(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.toVisit}
              helperText={errors.toVisit}
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