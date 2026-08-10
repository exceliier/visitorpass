'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Button, Typography, Box, Container, IconButton, Paper, Stack } from '@mui/material';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CropIcon from '@mui/icons-material/Crop';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [clippingArea, setClippingArea] = useState({
    clipX: 20,
    clipY: 20,
    clipWidth: 260,
    clipHeight: 320,
  });
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [isClippingEnabled, setIsClippingEnabled] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(true);
  const navigate = useNavigate();

  // Start stream with facingMode support for mobile devices
  const startCamera = async (mode = facingMode) => {
    closeCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraStarted(true);
        setPhoto(null);
        setIsClippingEnabled(false);
        setIsCanvasVisible(true);
      }
    } catch (error) {
      console.warn('Error accessing stream with constraint, trying fallback:', error);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraStarted(true);
          setPhoto(null);
          setIsClippingEnabled(false);
          setIsCanvasVisible(true);
        }
      } catch (err) {
        console.error('Unable to access camera:', err);
      }
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const videoWidth = videoRef.current.videoWidth || 640;
    const videoHeight = videoRef.current.videoHeight || 480;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const photoData = canvas.toDataURL('image/png');
    closeCamera();

    setPhoto(photoData);
    setIsCameraStarted(false);

    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
    visitorData.photo = photoData;
    sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
  };

  // Native Mobile Camera file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    closeCamera();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhoto(dataUrl);
      setIsCameraStarted(false);
      setIsClippingEnabled(false);
      setIsCanvasVisible(true);

      const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
      visitorData.photo = dataUrl;
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
    };
    reader.readAsDataURL(file);
  };

  const drawRectangle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#ef4444';
    context.lineWidth = 4;
    context.strokeRect(clippingArea.clipX, clippingArea.clipY, clippingArea.clipWidth, clippingArea.clipHeight);
  };

  const clipCapturedImage = () => {
    closeCamera();
    if (!photo) return;
    setIsClippingEnabled(true);

    const image = new Image();
    image.src = photo;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const overlayCanvas = canvasRef.current;
      if (!overlayCanvas) return;

      canvas.width = 300;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      if (!context) return;

      const scaleX = image.width / overlayCanvas.width;
      const scaleY = image.height / overlayCanvas.height;

      const sourceX = Math.round(clippingArea.clipX * scaleX);
      const sourceY = Math.round(clippingArea.clipY * scaleY);
      const sourceWidth = Math.round(clippingArea.clipWidth * scaleX);
      const sourceHeight = Math.round(clippingArea.clipHeight * scaleY);

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const clippedPhotoData = canvas.toDataURL('image/png');
      setPhoto(clippedPhotoData);

      const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
      visitorData.photo = clippedPhotoData;
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));

      setIsCanvasVisible(false);
    };
  };

  const saveAndCallApi = async (isClipped = true) => {
    closeCamera();
    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
    if (!visitorData.photo) {
      alert('No photo captured.');
      return;
    }

    if (!isClipped) {
      visitorData.photo = photo;
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
    }

    try {
      const response = await axiosInstance.post('/visitors', visitorData);
      if (response.status === 201) {
        visitorData.barcode = response.data.visitorID;
        sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
        navigate('/barcode');
      } else {
        alert('Failed to save visitor data.');
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('An error occurred while saving the photo.');
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraStarted(false);
  };

  const handleAbort = () => {
    closeCamera();
    sessionStorage.removeItem('visitorData');
    navigate('/pass');
  };

  useEffect(() => {
    startCamera();
    return () => closeCamera();
  }, []);

  useEffect(() => {
    drawRectangle();
  }, [clippingArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && photo) {
      const img = new Image();
      img.src = photo;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        drawRectangle();
      };
    }
  }, [photo]);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Capture Visitor Photo
        </Typography>

        <Box sx={{ position: 'relative', width: '100%', maxWidth: 450, margin: '0 auto', overflow: 'hidden', borderRadius: 2, backgroundColor: '#000' }}>
          {photo ? (
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img
                src={photo}
                alt="Captured"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
              />
              {isCanvasVisible && (
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto',
                  }}
                />
              )}
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
              />
              {isCameraStarted && (
                <IconButton
                  onClick={toggleCameraFacing}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                  }}
                  title="Switch Front/Rear Mobile Camera"
                >
                  <FlipCameraIosIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        {/* CONTROLS */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          {photo ? (
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              {!isClippingEnabled && (
                <Button variant="contained" color="primary" startIcon={<CropIcon />} onClick={clipCapturedImage}>
                  Crop Photo
                </Button>
              )}
              <Button variant="contained" color="secondary" startIcon={<CheckIcon />} onClick={() => saveAndCallApi(isClippingEnabled)}>
                Save & Continue
              </Button>
              <Button variant="outlined" color="primary" startIcon={<PhotoCameraIcon />} onClick={() => startCamera()}>
                Retake
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              {!isCameraStarted ? (
                <Button variant="contained" color="primary" startIcon={<PhotoCameraIcon />} onClick={() => startCamera()}>
                  Start Camera
                </Button>
              ) : (
                <Button variant="contained" color="secondary" size="large" startIcon={<PhotoCameraIcon />} onClick={capturePhoto}>
                  Snap Photo
                </Button>
              )}
              <Button variant="outlined" color="primary" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current?.click()}>
                Native Mobile Camera / Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
              />
            </Stack>
          )}

          <Box>
            <Button variant="text" color="error" startIcon={<CancelIcon />} onClick={handleAbort}>
              Cancel & Exit
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PhotoCapture;
