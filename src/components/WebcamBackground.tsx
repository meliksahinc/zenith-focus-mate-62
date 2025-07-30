import { useEffect, useRef, useState, forwardRef } from 'react';

interface WebcamBackgroundProps {
  className?: string;
}

export const WebcamBackground = forwardRef<HTMLVideoElement, WebcamBackgroundProps>(({ className = "" }, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = ref || internalVideoRef;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user'
          },
          audio: false
        });

        const video = typeof videoRef === 'object' && videoRef?.current;
        if (video) {
          video.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Unable to access camera. Please check permissions.');
        setHasPermission(false);
      }
    };

    initWebcam();

    return () => {
      const video = typeof videoRef === 'object' && videoRef?.current;
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className={`fixed inset-0 bg-background flex items-center justify-center ${className}`}>
        <div className="text-center p-8 rounded-lg bg-card border">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Camera Access Required</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please allow camera access and refresh the page to use Focus Coach.
          </p>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className={`fixed inset-0 bg-background flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Requesting camera permission...</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`fixed inset-0 w-full h-full object-cover ${className}`}
      style={{ transform: 'scaleX(-1)' }} // Mirror the video for natural feel
    />
  );
});

WebcamBackground.displayName = 'WebcamBackground';