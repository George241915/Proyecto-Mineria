import React, { useState, useRef, useEffect } from 'react';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      loadAvailableCameras();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const loadAvailableCameras = () => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
          startCamera(cameras[0].deviceId);
        }
      })
      .catch(error => console.error('Error enumerating devices:', error));
  };

  const startCamera = async (deviceId) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureFrameAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    await sendFrameToAPI(imageData);
  };

  const sendFrameToAPI = async (frameData) => {
    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frameData }),
      });

      if (response.ok) {
        console.log('Frame enviado');
      } else {
        console.error('Error al enviar el frame a la API');
      }
    } catch (error) {
      console.error('Error al enviar el frame:', error);
    }
  };

  useEffect(() => {
    requestCameraPermission();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(captureFrameAndSend, 1000); // captura y envio cada segundo
    return () => clearInterval(interval);
  }, []);

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
    startCamera(event.target.value);
  };

  return (
    <div>
      <div>
        <label>Select Camera:</label>
        <select value={selectedCamera} onChange={handleCameraChange}>
          {availableCameras.map(camera => (
            <option key={camera.deviceId} value={camera.deviceId}>{camera.label}</option>
          ))}
        </select>
      </div>
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;

