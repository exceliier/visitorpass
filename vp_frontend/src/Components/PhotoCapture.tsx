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
    console.log('Captured photo data:', photoData);

    setPhoto(photoData);
    localStorage.setItem('visitorPhoto', photoData);
    console.log('Photo saved to localStorage:', photoData);

    history.push('/barcode'); // Navigate to BarcodeGenerator
  };

  const handleAbort = () => {
    setPhoto(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
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
              width: '100%',
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
                width: '100%',
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