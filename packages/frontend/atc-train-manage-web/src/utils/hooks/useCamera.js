import { useState, useEffect } from 'react';

const useCamera = () => {
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCamera(true);
        // Stop the stream to release the camera
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setHasCamera(false);
        setError(err);
      }
    };

    checkCamera();
  }, []);

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
    } catch (err) {
      setError(err);
    }
  };

  return { hasCamera, requestCameraAccess, error };
};

export default useCamera;
