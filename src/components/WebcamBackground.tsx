import { useEffect, useRef, useState, forwardRef } from "react";

interface WebcamBackgroundProps {
  className?: string;
}

export const WebcamBackground = forwardRef<
  HTMLVideoElement,
  WebcamBackgroundProps
>(({ className = "" }, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = ref || internalVideoRef;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const initWebcam = async () => {
    try {
      console.log("🎥 Initializing webcam... (attempt", retryCount + 1, ")");
      setDebugInfo(
        `Requesting camera permission... (attempt ${retryCount + 1})`
      );

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      console.log("✅ Camera stream obtained:", mediaStream);
      setDebugInfo("Camera stream obtained successfully");
      setStream(mediaStream);
      setHasPermission(true);
    } catch (err) {
      console.error("❌ Error accessing webcam:", err);
      setDebugInfo(
        `Camera error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setError("Unable to access camera. Please check permissions.");
      setHasPermission(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      initWebcam();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log("🛑 Stopping track:", track.kind);
          track.stop();
        });
      }
    };
  }, [retryCount]);

  // Set video srcObject when stream is available
  useEffect(() => {
    if (
      stream &&
      videoRef &&
      typeof videoRef === "object" &&
      videoRef.current
    ) {
      console.log("📹 Setting video srcObject...");
      const video = videoRef.current;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        console.log("✅ Video metadata loaded");
        setDebugInfo("Video loaded and ready");
      };

      video.onerror = (e) => {
        console.error("❌ Video error:", e);
        setDebugInfo("Video error occurred");
        setError("Video playback error");
      };

      video
        .play()
        .then(() => {
          console.log("▶️ Video started playing");
          setDebugInfo("Video is playing");
        })
        .catch((err) => {
          console.error("❌ Video play error:", err);
          setDebugInfo("Video play failed");
          setError("Failed to start video playback");
        });
    }
  }, [stream, videoRef]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setHasPermission(null);
    setError("");
    setDebugInfo("Retrying camera access...");
    setStream(null);
  };

  const handleManualPermission = async () => {
    try {
      setDebugInfo("Manually requesting camera permission...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log("✅ Manual permission granted:", mediaStream);
      setDebugInfo("Manual permission granted");
      setStream(mediaStream);
      setHasPermission(true);
    } catch (err) {
      console.error("❌ Manual permission failed:", err);
      setDebugInfo("Manual permission failed");
      setError("Failed to get camera permission");
      setHasPermission(false);
    }
  };

  if (hasPermission === false) {
    return (
      <div
        className={`fixed inset-0 bg-background flex items-center justify-center ${className}`}
      >
        <div className="text-center p-8 rounded-lg bg-card border">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            Camera Access Required
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">{debugInfo}</p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 mr-2"
            >
              Retry
            </button>
            <button
              onClick={handleManualPermission}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 mr-2"
            >
              Manual Permission
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div
        className={`fixed inset-0 bg-background flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Requesting camera permission...
          </p>
          <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 mt-4"
          >
            Force Retry
          </button>
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
      style={{ transform: "scaleX(-1)" }} // Mirror the video for natural feel
    />
  );
});

WebcamBackground.displayName = "WebcamBackground";
