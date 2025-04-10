import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Box, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useHistory } from 'react-router-dom';
const DataForm: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [adhaar, setAdhaar] = useState('');
  const [toVisit, setToVisit] = useState('');
  const [photo, setPhoto] = useState('');
  const [useOldPhoto, setUseOldPhoto] = useState(false); // Checkbox state
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    adhaar: '',
    toVisit: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [visitorData, setVisitorData] = useState<any>(null); // Store visitor data
  const history = useHistory();

  // Reset form to initial state
  const resetForm = () => {
    setName('');
    setMobile('');
    setAdhaar('');
    setToVisit('');
    setPhoto('');
    setUseOldPhoto(false);
    setErrors({
      name: '',
      mobile: '',
      adhaar: '',
      toVisit: '',
    });
    sessionStorage.removeItem('visitorData'); // Clear sessionStorage
  };

  const fetchVisitorData = async (key: 'mobile' | 'adhaar', value: string) => {
    try {
      const authToken = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/visitors/search?${key}=${value}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();

        // Populate form fields with the searched data
        setName(data.name || '');
        setMobile(data.mobile || '');
        setAdhaar(data.adhaar || '');
        setPhoto(data.photo || ''); // Set photo if available
        setUseOldPhoto(!!data.photo); // Enable checkbox if photo exists

        // Clear sessionStorage after populating the form
        sessionStorage.removeItem('visitorData');
      } else {
        alert('No visitor data found.');
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      alert('An error occurred while fetching visitor data.');
    }
  };

  const handleSearch = (key: 'mobile' | 'adhaar') => {
    if (key === 'mobile' && !/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (key === 'adhaar' && !isValidAdhaarOrPAN(adhaar)) {
      alert('Please enter a valid Adhaar (12 digits) or PAN (ABCDE1234F).');
      return;
    }
    fetchVisitorData(key, key === 'mobile' ? mobile : adhaar);
  };

  // Helper function to validate Adhaar or PAN
  const isValidAdhaarOrPAN = (value: string) => {
    const adhaarRegex = /^\d{12}$/; // Adhaar must be exactly 12 digits
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN format
    return adhaarRegex.test(value) || panRegex.test(value);
  };

  const handlePhotoOrBarcode = async () => {
    const newErrors = {
      name: name.length < 5 ? 'Name must be at least 5 characters long.' : '',
      mobile: !/^\d{10}$/.test(mobile) ? 'Mobile number must be exactly 10 digits.' : '',
      adhaar: !isValidAdhaarOrPAN(adhaar) ? 'Enter a valid Adhaar (12 digits) or PAN (ABCDE1234F).' : '',
      toVisit: toVisit.length < 5 ? 'To Whom to Visit must be at least 5 characters long.' : '',
    };

    setErrors(newErrors);

    // If there are any errors, stop execution
    if (Object.values(newErrors).some((error) => error !== '')) {
      alert('Please fix the errors before proceeding.');
      console.log('Errors:', newErrors);
      return;
    }

    // Save form data as a JSON object in sessionStorage
    const visitorData = {
      name: name || '',
      mobile: mobile || '',
      adhaar: adhaar || '',
      toVisit: toVisit || '',
      photo: photo || '', // Use the existing photo if available
      barcode: '', // Leave barcode blank to be populated later from the database
      date: new Date().toISOString(), // Add current datetime in ISO format
    };

    if (useOldPhoto) {
      // Save visitor data to the database only if moving to the barcode page
      try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(visitorData),
        });

        if (response.ok) {
          const { visitorID } = await response.json();
          visitorData.barcode = visitorID; // Update the barcode in visitorData
          sessionStorage.setItem('visitorData', JSON.stringify(visitorData)); // Save updated visitorData

          // Navigate to the barcode page
          history.push('/barcode');
        } else {
          alert('Failed to save visitor data.');
        }
      } catch (error) {
        console.error('Error during API call:', error);
        alert('An error occurred while saving the visitor data.');
      }
    } else {
      // Save visitor data to sessionStorage and navigate to the photo capture page
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
      history.push('/photo');
    }
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <IconButton onClick={() => handleSearch('mobile')} color="primary">
                <SearchIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Adhaar/PAN" // Updated label
                value={adhaar}
                onChange={(e) => setAdhaar(e.target.value)}
                fullWidth
                margin="normal"
                required
                error={!!errors.adhaar}
                helperText={errors.adhaar}
              />
              <IconButton onClick={() => handleSearch('adhaar')} color="primary">
                <SearchIcon />
              </IconButton>
            </Box>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={useOldPhoto}
                  onChange={(e) => setUseOldPhoto(e.target.checked)}
                  disabled={!photo} // Disable if no photo is available
                />
              }
              label="Use Old Photo"
            />
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handlePhotoOrBarcode}
              style={{ marginRight: '10px' }}
            >
              {useOldPhoto ? 'Barcode' : 'Photo'}
            </Button>
            <Button type="button" variant="outlined" color="secondary" onClick={resetForm}>
              Reset
            </Button>
          </form>
        </Box>
      </Container>

    </Box>
  );
};

export default DataForm;