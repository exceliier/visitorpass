import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  IconButton,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useHistory } from 'react-router-dom';
import axiosInstance from '../axiosInstance'; // Import the centralized Axios instance

/**
 * The `DataForm` component is a React functional component that provides a form for entering and managing visitor data.
 * It includes fields for name, mobile number, Adhaar/PAN, and the person to visit, along with functionality for photo handling.
 * 
 * ## Features:
 * - **Form Fields**: Allows users to input visitor details such as name, mobile number, Adhaar/PAN, and the person to visit.
 * - **Search Functionality**: Enables searching for existing visitor data by mobile number or Adhaar/PAN.
 * - **Photo Handling**: Supports using an existing photo or capturing a new one.
 * - **Validation**: Validates input fields for correctness (e.g., mobile number format, Adhaar/PAN format).
 * - **Session Management**: Stores and retrieves visitor data in `sessionStorage`.
 * - **API Integration**: Communicates with a backend API to fetch and save visitor data.
 * - **Navigation**: Redirects to the photo capture or barcode page based on user actions.
 * - **Reset Functionality**: Resets the form to its initial state.

 * ## State Variables:
 * - `name`: Stores the visitor's name.
 * - `mobile`: Stores the visitor's mobile number.
 * - `adhaar`: Stores the visitor's Adhaar or PAN number.
 * - `toVisit`: Stores the name of the person to visit.
 * - `otherToVisit`: Stores additional text when "Other" is selected in the dropdown.
 * - `photo`: Stores the visitor's photo (if available).
 * - `useOldPhoto`: Boolean indicating whether to use an existing photo.
 * - `errors`: Object containing validation error messages for form fields.
 * - `showConfirmation`: Boolean to control the display of a confirmation dialog.
 * - `visitorData`: Stores the visitor data object for session management.
 * 
 * ## Methods:
 * - `resetForm`: Resets all form fields and clears session storage.
 * - `fetchVisitorData`: Fetches visitor data from the backend API based on mobile number or Adhaar/PAN.
 * - `handleSearch`: Validates input and triggers the search for visitor data.
 * - `isValidAdhaarOrPAN`: Validates the format of Adhaar or PAN numbers.
 * - `handlePhotoOrBarcode`: Validates form fields, saves visitor data, and navigates to the appropriate page (photo or barcode).
 * 
 * ## Props:
 * This component does not accept any props.
 * 
 * ## Dependencies:
 * - `useHistory`: For navigation between pages.
 * - `sessionStorage`: For temporary storage of visitor data.
 * - `fetch`: For API calls to the backend.
 * - `Material-UI`: For UI components such as `Box`, `Container`, `TextField`, `Button`, etc.
 * 
 * ## Usage:
 * Render the `DataForm` component to allow users to input and manage visitor data in a visitor management system.
 */
const DataForm: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [adhaar, setAdhaar] = useState('');
  const [toVisit, setToVisit] = useState('');
  const [otherToVisit, setOtherToVisit] = useState(''); // State for additional text when "Other" is selected
  const [photo, setPhoto] = useState('');
  const [useOldPhoto, setUseOldPhoto] = useState(false); // Checkbox state
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    adhaar: '',
    toVisit: '',
  });
  const history = useHistory();

  // Reset form to initial state
  const resetForm = () => {
    setName('');
    setMobile('');
    setAdhaar('');
    setToVisit('');
    setOtherToVisit('');
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
      const response = await axiosInstance.get(`/visitors/search`, {
        params: { [key]: value }, // Pass query parameters
      });

      if (response.status === 200) {
        const data = response.data;

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

  const handleToVisitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setToVisit(value);
    if (value !== 'Other') {
      setOtherToVisit(''); // Clear additional text if "Other" is not selected
    }
  };

  const handlePhotoOrBarcode = async () => {
    const isValidDrivingLicense = (value: string) => /^[A-Z]{2}\d{2} \d{11}$/.test(value); // Format: Two letters, two digits, space, 11 digits
    const isValidPassport = (value: string) => /^[A-Z]{1}[0-9]{7}$/.test(value); // Format: One letter followed by 7 digits
    const isValidElectorsID = (value: string) => /^[A-Z]{3}[0-9]{7}$/.test(value); // Format: Three letters followed by 7 digits

    const newErrors = {
      name: name.length < 5 ? 'Name must be at least 5 characters long.' : '',
      mobile: !/^\d{10}$/.test(mobile) ? 'Mobile number must be exactly 10 digits.' : '',
      adhaar: !(
        isValidAdhaarOrPAN(adhaar) ||
        isValidDrivingLicense(adhaar) ||
        isValidPassport(adhaar) ||
        isValidElectorsID(adhaar)
      )
        ? 'Enter a valid Adhaar (12 digits), PAN (ABCDE1234F), Driving License (e.g., KA01 12345678901), Passport (A1234567), or Electors ID (e.g., ABC1234567).'
        : '',
      toVisit: toVisit === 'Other' && otherToVisit.trim() === '' ? 'Please specify whom to visit.' : '',
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
      toVisit: toVisit === 'Other' ? otherToVisit : toVisit, // Use additional text if "Other" is selected
      photo: photo || '', // Use the existing photo if available
      barcode: '', // Leave barcode blank to be populated later from the database
      date: new Date().toISOString(), // Add current datetime in ISO format
    };

    if (useOldPhoto) {
      // Save visitor data to the database only if moving to the barcode page
      try {
        const response = await axiosInstance.post('/visitors', visitorData);

        if (response.status === 201) {
          const { visitorID } = response.data;
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

  function goHome(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    history.push('/'); // Navigate to the home page
  }

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
        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <form>
            <Typography variant="h5" gutterBottom textAlign="center">
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
                label="Adhaar/PAN/DrLic/EID/passport" // Updated label
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
            <FormControl variant='outlined' fullWidth margin="normal" required error={!!errors.toVisit}>
            <InputLabel id="to-visit-label">To Whom to Visit</InputLabel>
              <Select
                labelId="to-visit-label" // Link the InputLabel to the Select
                id="to-visit" // Add an id for the Select
                value={toVisit}
                onChange={handleToVisitChange}
              >
                <MenuItem value="GMIDC Technical-section">GMIDC Technical</MenuItem>
                <MenuItem value="GMIDC Accounts-section">GMIDC Accounts</MenuItem>
                <MenuItem value="GMIDC Dakshata-court-section">GMIDC Dakshata-court</MenuItem>
                <MenuItem value="GMIDC-Ex Dir">GMIDC-ED</MenuItem>
                <MenuItem value="GMIDC-Sup Engr">GMIDC-SE</MenuItem>
                <MenuItem value="GMIDC-EE/DySE">GMIDC-SE</MenuItem>
                <MenuItem value="CEWRD-Techincal">CEWRD-Techincal</MenuItem>
                <MenuItem value="CEWRD-Corr. Branch">CEWRD-CB</MenuItem>
                <MenuItem value="CEWRD-Chief Engr">CEWRD-CE</MenuItem>
                <MenuItem value="CEWRD-Ex Engr">CEWRD-PA</MenuItem>
                <MenuItem value="QCC">Qquality Control Circle</MenuItem>
                <MenuItem value="AID">Aurangabad Irrigation Division</MenuItem>
                <MenuItem value="MID-1">MI Divisoin No-1</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.toVisit && <Typography color="error">{errors.toVisit}</Typography>}
            </FormControl>
            {toVisit === 'Other' && (
              <TextField
                label="Specify Whom to Visit"
                value={otherToVisit}
                onChange={(e) => setOtherToVisit(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            )}
            <Button type="button" variant="outlined" color="secondary" onClick={goHome}           
            style={{ marginRight: '30px' }}>
              HOME
            </Button>
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