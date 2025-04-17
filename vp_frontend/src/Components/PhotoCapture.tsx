'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useHistory } from 'react-router-dom';
import axiosInstance from '../axiosInstance'; // Import axiosInstance

/**
 * PhotoCapture Component
 *
 * This React functional component provides a user interface for capturing, clipping, 
 * and saving a photo using the device's camera. It includes features such as 
 * starting/stopping the camera, capturing a photo, clipping a specific area of the 
 * captured photo, and submitting the photo data to an API.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered PhotoCapture component.
 *
 * @remarks
 * - The component uses the `useRef` hook to reference the video and canvas elements.
 * - The `useState` hook is used to manage the state of the photo, clipping area, 
 *   and other UI-related states.
 * - The `useEffect` hook is used for cleanup and updating the canvas when the 
 *   clipping area or photo changes.
 *
 * @features
 * - Start and stop the camera using the `startCamera` and `closeCamera` functions.
 * - Capture a photo from the video stream using the `capturePhoto` function.
 * - Draw and move a clipping rectangle on the canvas to select a specific area of the photo.
 * - Clip the selected area of the photo using the `clipCapturedImage` function.
 * - Save the photo and submit it to an API using the `saveAndCallApi` function.
 * - Handle abort actions to reset the state and navigate back to the home route.
 *
 * @dependencies
 * - React and React hooks (`useState`, `useRef`, `useEffect`).
 * - Material-UI components (`Container`, `Typography`, `Box`, `Button`).
 * - Browser APIs (`navigator.mediaDevices.getUserMedia`, `sessionStorage`).
 *
 * @example
 * ```tsx
 * import PhotoCapture from './PhotoCapture';
 *
 * const App = () => {
 *   return (
 *     <div>
 *       <PhotoCapture />
 *     </div>
 *   );
 * };
 *
 * export default App;
 * ```
 */
const PhotoCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [clippingArea, setClippingArea] = useState({
    clipX: 0,
    clipY: 0,
    clipWidth: 300, // Increased width
    clipHeight: 400, // Increased height
  });
  const [isCameraStarted, setIsCameraStarted] = useState(false); // Track if the camera is started
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false); // Track if the photo is captured
  const [isClippingEnabled, setIsClippingEnabled] = useState(false); // Track if clipping is enabled
  const [isCanvasVisible, setIsCanvasVisible] = useState(true);
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
        setIsCanvasVisible(true); // Ensure the canvas is visible
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
    closeCamera(); // Stop the camera after capturing the photo

    setPhoto(photoData); // Display the captured image
    setIsCameraStarted(false); // Disable camera-related actions
    setIsPhotoCaptured(true); // Enable photo-related actions

    // Retrieve the visitorData JSON object from sessionStorage
    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');

    // Update the photo field in visitorData
    visitorData.photo = photoData;

    // Save the updated visitorData object back to sessionStorage
    sessionStorage.setItem('visitorData', JSON.stringify(visitorData));

    // Redraw the rectangle after capturing the photo
    drawRectangle();
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
    if (!canvas || !photo) return;
  
    const rect = canvas.getBoundingClientRect();
    const startX = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const startY = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
  
    const img = new Image();
    img.src = photo;
  
    img.onload = () => {
      // Calculate the rendered dimensions of the image
      const canvasAspectRatio = canvas.width / canvas.height;
      const imageAspectRatio = img.width / img.height;
  
      let renderedWidth, renderedHeight, offsetX, offsetY;
  
      if (canvasAspectRatio > imageAspectRatio) {
        // Image is constrained by height
        renderedHeight = canvas.height;
        renderedWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - renderedWidth) / 2;
        offsetY = 0;
      } else {
        // Image is constrained by width
        renderedWidth = canvas.width;
        renderedHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - renderedHeight) / 2;
      }
  
      // Check if the touch/mouse is inside the rectangle
      if (
        startX >= clippingArea.clipX &&
        startX <= clippingArea.clipX + clippingArea.clipWidth &&
        startY >= clippingArea.clipY &&
        startY <= clippingArea.clipY + clippingArea.clipHeight
      ) {
        const offsetXFromClip = startX - clippingArea.clipX;
        const offsetYFromClip = startY - clippingArea.clipY;
  
        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
          const currentX =
            'touches' in moveEvent
              ? moveEvent.touches[0].clientX - rect.left
              : (moveEvent as MouseEvent).clientX - rect.left;
          const currentY =
            'touches' in moveEvent
              ? moveEvent.touches[0].clientY - rect.top
              : (moveEvent as MouseEvent).clientY - rect.top;
  
          // Constrain the rectangle to the image's rendered bounds
          setClippingArea((prev) => ({
            ...prev,
            clipX: Math.max(
              offsetX,
              Math.min(offsetX + renderedWidth - prev.clipWidth, currentX - offsetXFromClip)
            ),
            clipY: Math.max(
              offsetY,
              Math.min(offsetY + renderedHeight - prev.clipHeight, currentY - offsetYFromClip)
            ),
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
  };

  // Clip the captured image
  const clipCapturedImage = () => {
    closeCamera(); // Stop the camera before clipping
    if (!photo) {
      console.error('No photo available to clip.');
      return;
    }
  
    setIsClippingEnabled(true); // Enable clipping state
  
    const image = new Image();
    image.src = photo;
  
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const overlayCanvas = canvasRef.current;
  
      if (!overlayCanvas) {
        console.error('Overlay canvas is not available.');
        return;
      }
  
      // Ensure the overlay canvas contains the image
      const overlayContext = overlayCanvas.getContext('2d');
      if (!overlayContext) {
        console.error('Overlay canvas context is not available.');
        return;
      }
  
      // Draw the image onto the overlay canvas if not already drawn
      overlayContext.drawImage(image, 0, 0, overlayCanvas.width, overlayCanvas.height);
  
      // Use the rectangle's dimensions directly
      const clipX = clippingArea.clipX;
      const clipY = clippingArea.clipY;
      const clipWidth = clippingArea.clipWidth;
      const clipHeight = clippingArea.clipHeight;
  
      // Set the canvas dimensions to match the clipping area
      canvas.width = 300; // Desired width for the clipped image
      canvas.height = 400; // Desired height for the clipped image
  
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Canvas context is not available.');
        return;
      }
  
      // Map the clipping area to the original image dimensions
      const scaleX = image.width / overlayCanvas.width;
      const scaleY = image.height / overlayCanvas.height;
  
      const sourceX = Math.round(clipX * scaleX);
      const sourceY = Math.round(clipY * scaleY);
      const sourceWidth = Math.round(clipWidth * scaleX);
      const sourceHeight = Math.round(clipHeight * scaleY);
  
      // Draw the clipped portion of the image onto the canvas and resize it
      context.drawImage(
        image, // Use the original image as the source
        sourceX, // Source X
        sourceY, // Source Y
        sourceWidth, // Source Width
        sourceHeight, // Source Height
        0, // Destination X
        0, // Destination Y
        canvas.width, // Destination Width (resized)
        canvas.height // Destination Height (resized)
      );
  
      // Convert the resized clipped canvas content to a data URL
      const clippedPhotoData = canvas.toDataURL('image/png');
      console.log('Clipped and resized photo data:', clippedPhotoData);
  
      setPhoto(clippedPhotoData); // Update the photo with the clipped and resized image
  
      // Update visitorData in sessionStorage
      const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
      visitorData.photo = clippedPhotoData;
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
  
      // Clear the rectangle from the overlay canvas
      overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); // Clear the rectangle
      setIsCanvasVisible(false); // Hide the canvas after clipping
    };
  };

  // Save data and call the API
  const saveAndCallApi = async (isClipped = true) => {
    closeCamera(); // Stop the camera before saving
    const visitorData = JSON.parse(sessionStorage.getItem('visitorData') || '{}');
  
    if (!visitorData.photo) {
      alert('No photo available to save.');
      return;
    }
  
    if (!isClipped) {
      // Save the unmodified photo
      visitorData.photo = photo;
      sessionStorage.setItem('visitorData', JSON.stringify(visitorData));
    }
  
    try {
      // Use axiosInstance to make the API call
      const response = await axiosInstance.post('/visitors', visitorData);
  
      if (response.status === 201) {
        const { visitorID } = response.data;
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
    if (isClippingEnabled) {
      // If clipping is done, reset the state and restart the camera
      setPhoto(null);
      setIsClippingEnabled(false); // Reset clipping state
      setIsPhotoCaptured(false); // Reset photo captured state
      setClippingArea({
        clipX: 0,
        clipY: 0,
        clipWidth: 300, // Default width
        clipHeight: 300, // Default height
      }); // Reset the rectangle
      startCamera(); // Restart the camera
    } else {
      // For other steps, navigate back to the home route
      setPhoto(null);
      sessionStorage.removeItem('visitorData'); // Clear visitor data from sessionStorage
      closeCamera();
      history.push('/pass'); // Navigate back to the home route
    }

    // Redraw the rectangle after resetting the photo
    drawRectangle();
  };

  // Cleanup on component unmount
  useEffect(() => {
    // Automatically start the camera when the component mounts
    startCamera();

    // Cleanup: Stop the camera when the component unmounts
    return () => {
      closeCamera();
    };
  }, []);

  useEffect(() => {
    drawRectangle(); // Draw the rectangle whenever the clipping area changes
  }, [clippingArea]);

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
                maxWidth: '100%', // Limit the width to the container
                height: 'auto', // Maintain aspect ratio
                objectFit: 'contain', // Ensure the image fits within the container
              }}
            />
            {isCanvasVisible && (
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  maxWidth: '100%', // Limit the width to the container
                  height: 'auto', // Maintain aspect ratio
                  pointerEvents: 'auto',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              />
            )}
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
                onClick={() => saveAndCallApi(false)} // Save without clipping
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                disabled={!photo || isClippingEnabled} // Disable if no photo or clipping is enabled
              >
                Save Without Clipping
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
                width: '100%',                
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