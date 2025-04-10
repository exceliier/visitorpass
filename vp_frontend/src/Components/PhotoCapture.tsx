import React, { useRef, useState, useEffect } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';

const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [clippingArea, setClippingArea] = useState({
    clipX: 50,
    clipY: 50,
    clipWidth: 300, // Increased width
    clipHeight: 300, // Increased height
  });
  const [isCameraStarted, setIsCameraStarted] = useState(false); // Track if the camera is started
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false); // Track if the photo is captured
  const [isClippingEnabled, setIsClippingEnabled] = useState(false); // Track if clipping is enabled
  const history = useHistory();

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraStarted(true); // Camera is now started
        setIsPhotoCaptured(false); // Reset photo captured state
        setIsClippingEnabled(false); // Reset clipping state
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access the camera.');
    }
  };

  // Capture the photo
  const capturePhoto = async () => {
    if (!videoRef.current) {
      console.error('Video element is not initialized.');
      return;
    }

    const canvas = document.createElement('canvas');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context is not available.');
      return;
    }

    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const photoData = canvas.toDataURL('image/png');

    setPhoto(photoData); // Display the captured image
    setIsCameraStarted(false); // Disable camera-related actions
    setIsPhotoCaptured(true); // Enable photo-related actions

    // Retrieve the visitorData JSON object from sessionStorage
    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');

    // Update the photo field in visitorData
    visitorData.photo = photoData;

    // Save the updated visitorData object back to sessionStorage
    sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
  };

  // Draw the fixed-size rectangle on the canvas
  const drawRectangle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the rectangle with a thicker line
    context.strokeStyle = 'red';
    context.lineWidth = 6; // Increased line thickness
    context.strokeRect(
      clippingArea.clipX,
      clippingArea.clipY,
      clippingArea.clipWidth,
      clippingArea.clipHeight
    );
  };

  // Allow the user to move the rectangle
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const startX = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const startY = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
  
    // Add a margin around the rectangle to make it easier to grab
    const margin = 10;
  
    // Check if the touch/mouse is inside the rectangle (with margin)
    if (
      startX >= clippingArea.clipX - margin &&
      startX <= clippingArea.clipX + clippingArea.clipWidth + margin &&
      startY >= clippingArea.clipY - margin &&
      startY <= clippingArea.clipY + clippingArea.clipHeight + margin
    ) {
      const offsetX = startX - clippingArea.clipX;
      const offsetY = startY - clippingArea.clipY;
  
      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX =
          'touches' in moveEvent
            ? moveEvent.touches[0].clientX - rect.left
            : (moveEvent as MouseEvent).clientX - rect.left;
        const currentY =
          'touches' in moveEvent
            ? moveEvent.touches[0].clientY - rect.top
            : (moveEvent as MouseEvent).clientY - rect.top;
  
        // Update the rectangle's position
        setClippingArea((prev) => ({
          ...prev,
          clipX: Math.max(0, Math.min(canvas.width - prev.clipWidth, currentX - offsetX)),
          clipY: Math.max(0, Math.min(canvas.height - prev.clipHeight, currentY - offsetY)),
        }));
      };
  
      const handleEnd = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
  
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }
  };

  // Clip the captured image
  const clipCapturedImage = () => {
    if (!photo) {
      console.error('No photo available to clip.');
      return;
    }

    setIsClippingEnabled(true); // Enable clipping state

    const image = new Image();
    image.src = photo;
  
    image.onload = () => {
      const canvas = document.createElement('canvas');
  
      // Scale the clipping area to match the original image dimensions
      const scaleX = image.width / canvasRef.current!.width; // Scale factor for X
      const scaleY = image.height / canvasRef.current!.height; // Scale factor for Y
  
      const clipX = clippingArea.clipX * scaleX;
      const clipY = clippingArea.clipY * scaleY;
      const clipWidth = clippingArea.clipWidth * scaleX;
      const clipHeight = clippingArea.clipHeight * scaleY;
  
      // Set the canvas dimensions to match the clipping area
      canvas.width = clipWidth;
      canvas.height = clipHeight;
  
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Canvas context is not available.');
        return;
      }
  
      // Draw the clipped portion of the image onto the canvas
      context.drawImage(
        image,
        clipX, // Source X
        clipY, // Source Y
        clipWidth, // Source Width
        clipHeight, // Source Height
        0, // Destination X
        0, // Destination Y
        clipWidth, // Destination Width
        clipHeight // Destination Height
      );
  
      // Convert the clipped canvas content to a data URL
      const clippedPhotoData = canvas.toDataURL('image/png');
      console.log('Clipped photo data:', clippedPhotoData);
  
      setPhoto(clippedPhotoData); // Update the photo with the clipped image
  
      // Retrieve the visitorData JSON object from sessionStorage
      const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
  
      // Update the photo field in visitorData
      visitorData.photo = clippedPhotoData;
  
      // Save the updated visitorData object back to sessionStorage
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
  
      // Clear the rectangle from the overlay canvas
      const overlayCanvas = canvasRef.current;
      if (overlayCanvas) {
        const overlayContext = overlayCanvas.getContext('2d');
        if (overlayContext) {
          overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
      }
    };
  };
  

  // Save data and call the API
  const saveAndCallApi = async () => {
    // Retrieve the visitorData JSON object from sessionStorage
    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');

    if (!visitorData.photo) {
      alert('No photo available to save.');
      return;
    }

    const accessToken = sessionStorage.getItem('authToken');
    try {
      const response = await fetch('http://localhost:5000/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(visitorData), // Send the updated visitorData object
      });

      if (response.ok) {
        const { visitorID } = await response.json();
        visitorData.barcode = visitorID; // Update the barcode in visitorData
        sessionStorage.setItem('visitorData', JSON.stringify(visitorData)); // Save updated visitorData
        history.push('/barcode'); // Navigate to BarcodeGenerator
      } else {
        alert('Failed to save visitor data.');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      alert('An error occurred while saving the photo.');
    }
  };

  // Stop the camera
  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Handle abort action
  const handleAbort = () => {
    setPhoto(null);
    sessionStorage.removeItem('visitorData'); // Clear visitor data from sessionStorage
    closeCamera();
    history.push('/'); // Navigate back to the home route
  };
  // Cleanup on component unmount
  useEffect(() => {
    drawRectangle(); // Draw the rectangle whenever the clipping area changes
  }, [clippingArea]);

  useEffect(() => {
    return () => {
      closeCamera();
    };
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
        drawRectangle(); // Draw the rectangle after setting canvas dimensions
      };
    }
  }, [photo]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Capture Photo
      </Typography>
      <Box sx={{ textAlign: 'center', position: 'relative' }}>
        {photo ? (
          <div>
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
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={clipCapturedImage}
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                disabled={isClippingEnabled} // Disable if clipping is already done
              >
                Clip Image
              </Button>
              <Button
                onClick={saveAndCallApi}
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                disabled={!isClippingEnabled} // Enable only after clipping is done
              >
                Save and Submit
              </Button>
              <Button onClick={handleAbort} variant="outlined" color="secondary">
                Cancel
              </Button>
            </Box>
          </div>
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
              <Button
                onClick={startCamera}
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                disabled={isCameraStarted} // Disable if the camera is already started
              >
                Start Camera
              </Button>
              <Button
                onClick={capturePhoto}
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                disabled={!isCameraStarted} // Enable only if the camera is started
              >
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