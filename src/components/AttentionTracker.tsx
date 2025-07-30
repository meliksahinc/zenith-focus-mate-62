import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface AttentionTrackerProps {
  videoElement: HTMLVideoElement | null;
  onDistraction: () => void;
  onRefocus: () => void;
  isActive: boolean;
}

export const AttentionTracker = ({ 
  videoElement, 
  onDistraction, 
  onRefocus, 
  isActive 
}: AttentionTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const distractionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFaceDetectionRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isActive || !videoElement) {
      cleanup();
      return;
    }

    const initFaceMesh = async () => {
      try {
        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        await faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          const now = Date.now();
          
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // Face detected - user is looking at screen
            lastFaceDetectionRef.current = now;
            
            if (isDistracted) {
              setIsDistracted(false);
              onRefocus();
            }
            
            // Clear any existing distraction timer
            if (distractionTimerRef.current) {
              clearTimeout(distractionTimerRef.current);
              distractionTimerRef.current = null;
            }
          } else {
            // No face detected - check if distracted for too long
            const timeSinceLastFace = now - lastFaceDetectionRef.current;
            
            if (timeSinceLastFace > 10000 && !isDistracted) {
              // User has been distracted for more than 10 seconds
              setIsDistracted(true);
              onDistraction();
            }
          }
        });

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoElement });
            }
          },
          width: 1280,
          height: 720
        });

        faceMeshRef.current = faceMesh;
        cameraRef.current = camera;
        
        await camera.start();
        setIsTracking(true);
      } catch (error) {
        console.error('Failed to initialize face tracking:', error);
      }
    };

    initFaceMesh();

    return cleanup;
  }, [isActive, videoElement, onDistraction, onRefocus, isDistracted]);

  const cleanup = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    
    if (distractionTimerRef.current) {
      clearTimeout(distractionTimerRef.current);
      distractionTimerRef.current = null;
    }
    
    setIsTracking(false);
    setIsDistracted(false);
  };

  return null; // This component doesn't render anything
};