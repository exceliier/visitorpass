import React, { useRef, useState, useEffect } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';

const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const history = useHistory();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        console.log('Video element initialized:', videoRef.current);
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          console.log('Video stream is ready');
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access the camera.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) {
      console.error('Video element is not initialized.');
      return;
    }

    const canvas = document.createElement('canvas');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    console.log('Video dimensions:', { videoWidth, videoHeight });

    if (!videoWidth || !videoHeight) {
      console.error('Video dimensions are not available.');
      return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context is not available.');
      return;
    }

    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const photoData = canvas.toDataURL('image/png');
    

    setPhoto(photoData);
    closeCamera(); // Stop the camera after capturing the photo
    localStorage.setItem('visitorPhoto', photoData);
    

    // Retrieve form data from localStorage
    const visitorData = {
      name: localStorage.getItem('visitorName'),
      mobile: localStorage.getItem('visitorMobile'),
      address: localStorage.getItem('visitorAddress'),
      purpose: localStorage.getItem('visitorPurpose'),
      toVisit: localStorage.getItem('visitorToVisit'),
      photo: photoData,
    };

    // Ensure all required fields are present
    if (
      !visitorData.name ||
      !visitorData.mobile ||
      !visitorData.address ||
      !visitorData.purpose ||
      !visitorData.toVisit
    ) {
      alert('Visitor data is incomplete. Please fill out all fields.');
      history.push('/dataform'); // Navigate back to the form
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer your_jwt_secret`, // Replace with actual token
        },
        body: JSON.stringify(visitorData),
      });

      if (response.ok) {
        const { visitorID } = await response.json();
        localStorage.setItem('visitorID', visitorID); // Save visitorID for barcode generation        
        history.push('/barcode'); // Navigate to BarcodeGenerator
      } else {
        alert('Failed to save visitor data.');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      alert('An error occurred while saving the photo.');
    }finally {
      closeCamera(); // Stop the camera after capturing the photo
    }
  };

  const closeCamera = () => {
    console.log('closeCamera method called');
    if (videoRef.current) {
      console.log('videoRef.current:', videoRef.current);
      console.log('videoRef.current.srcObject:', videoRef.current.srcObject);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      videoRef.current.srcObject = null; // Release the camera
      console.log('Camera stopped and released.');
    } else {
      console.log('No active camera stream to stop.');
    }
  };

  const handleAbort = () => {
    setPhoto(null);
    closeCamera(); // Stop the camera if it's running
    history.push('/'); // Navigate back to the home route
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Capture Photo
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        {photo ? (
          <img
            src={photo}
            alt="Captured"
            style={{
              borderRadius: '8px',
              width: '80%',
              maxWidth: '320px',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div>
            <video
              ref={videoRef}
              autoPlay
              style={{
                borderRadius: '8px',
                width: '80%',
                maxWidth: '320px',
                height: 'auto',
                objectFit: 'cover',
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Button onClick={startCamera} variant="contained" color="primary" sx={{ mr: 2 }}>
                Start Camera
              </Button>
              <Button onClick={capturePhoto} variant="contained" color="secondary" sx={{ mr: 2 }}>
                Capture Photo
              </Button>
              <Button onClick={handleAbort} variant="outlined" color="secondary">
                Cancel
              </Button>
            </Box>
          </div>
        )}
      </Box>
    </Container>
  );
};

export default PhotoCapture;