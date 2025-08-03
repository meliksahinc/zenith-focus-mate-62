import { useEffect, useRef, useState } from "react";
import { useVoicePrompts } from "@/hooks/useVoicePrompts";

interface AttentionTrackerProps {
  videoElement: HTMLVideoElement | null;
  onDistraction: (awayTime?: number) => void;
  onRefocus: (awayTime?: number) => void;
  isActive: boolean;
  userName: string;
}

export const AttentionTracker = ({
  videoElement,
  onDistraction,
  onRefocus,
  isActive,
  userName,
}: AttentionTrackerProps) => {
  const { speak } = useVoicePrompts();
  
  // Debug isActive prop changes
  useEffect(() => {
    console.log("🔄 AttentionTracker isActive prop changed to:", isActive);
  }, [isActive]);

  // Use ref to avoid closure issues in MediaPipe callbacks
  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const isDistractedRef = useRef(false);
  const [attentionStatus, setAttentionStatus] = useState<
    "focused" | "distracted" | "checking"
  >("checking");
  const [faceCount, setFaceCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);
  const [mediaPipeError, setMediaPipeError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [lastDistractionTime, setLastDistractionTime] = useState<number>(0);
  const [awayStartTime, setAwayStartTime] = useState<number>(0);
  const [totalAwayTime, setTotalAwayTime] = useState<number>(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const distractionTimerRef = useRef<number | null>(null);
  const lastFaceDetectionRef = useRef<number>(Date.now());
  const warningCountRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Attention messages
  const attentionMessages = {
    distracted: [
      `${userName}, Don't get distracted now, we still have time to study. You're doing great!`,
    ],
    refocused: [
      `Great! You're back, ${userName}. Keep up the good work, fully focused`,
    ],
  };

  const getRandomMessage = (type: "distracted" | "refocused") => {
    const messages = attentionMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Fallback tracking using video frame analysis
  const initFallbackTracking = () => {
    try {
      console.log("🔄 Initializing fallback video tracking...");

      // Create canvas for processing
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      canvasRef.current = canvas;
      ctxRef.current = ctx;

      setIsTracking(true);
      console.log("✅ Fallback tracking started");

      const processFrame = () => {
        if (!videoElement || !ctx || !isActiveRef.current) {
          return;
        }

        try {
          // Draw video frame to canvas
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Simple presence detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let nonBlackPixels = 0;
          let totalPixels = canvas.width * canvas.height;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 5 || g > 5 || b > 5) {
              nonBlackPixels++;
            }
          }

          const nonBlackPercentage = (nonBlackPixels / totalPixels) * 100;
          const hasPresence = nonBlackPercentage > 5;

          const now = Date.now();
          frameCountRef.current++;

          console.log("📊 Fallback detection:", {
            hasPresence,
            frameCount: frameCountRef.current,
            timestamp: now,
            isDistracted: isDistracted,
            nonBlackPercentage: nonBlackPercentage.toFixed(1),
          });

          if (hasPresence) {
            // Presence detected
            lastFaceDetectionRef.current = now;
            setLastDetectionTime(now);
            setFaceCount(1);
            setAttentionStatus("focused");

            if (isDistractedRef.current) {
              const currentTime = Date.now();
              const timeSinceLastMessage = currentTime - lastMessageTime;

              // Only send refocus message if enough time passed
              if (timeSinceLastMessage > 3000) {
                console.log("🔄 User refocused (with message)");
                setIsDistracted(false);
                isDistractedRef.current = false;
                setLastMessageTime(currentTime);
                const message = getRandomMessage("refocused");
                console.log("🔊 Speaking refocus message:", message);
                speak(message);
                onRefocus();
              } else {
                console.log("🔄 User refocused (silent)");
                setIsDistracted(false);
                isDistractedRef.current = false;
              }
            }

            if (distractionTimerRef.current) {
              clearTimeout(distractionTimerRef.current);
              distractionTimerRef.current = null;
            }

            warningCountRef.current = 0;
          } else {
            // No presence detected
            setFaceCount(0);
            setAttentionStatus("distracted");

            const timeSinceLastPresence = now - lastFaceDetectionRef.current;
            console.log(
              "👤 No presence detected. Time since last detection:",
              timeSinceLastPresence,
              "ms, isDistracted:",
              isDistracted
            );

            // Only check for distraction if not already distracted
            if (
              timeSinceLastPresence > 5000 &&
              !isDistractedRef.current &&
              isActiveRef.current
            ) {
              console.log(
                "⚠️ User distracted (Fallback) - sending single message"
              );
              setIsDistracted(true);
              isDistractedRef.current = true;
              setLastDistractionTime(now);
              setLastMessageTime(now);
              setAwayStartTime(now);

              // Send distraction message ONLY ONCE
              const message = getRandomMessage("distracted");
              console.log("🔊 Speaking distraction message:", message);
              speak(message);
              onDistraction();
              warningCountRef.current++;
            }
          }

          // Continue processing frames
          animationFrameRef.current = requestAnimationFrame(processFrame);
        } catch (error) {
          console.error("❌ Fallback frame processing error:", error);
        }
      };

      // Start processing frames
      processFrame();
    } catch (error) {
      console.error("❌ Failed to initialize fallback tracking:", error);
      setIsTracking(false);
    }
  };

  // Initialize MediaPipe once when video is available
  useEffect(() => {
    if (!videoElement) {
      console.log("❌ AttentionTracker - no video element");
      return;
    }

    // Initialize MediaPipe only once when video is ready
    if (isInitialized) {
      return;
    }

    console.log("✅ AttentionTracker starting - videoElement:", videoElement);

    const initFaceMesh = async () => {
      try {
        console.log("🎯 Initializing MediaPipe face tracking...");

        // Wait for MediaPipe scripts to load
        if (typeof window === "undefined" || !(window as any).FaceMesh) {
          console.log("⏳ Waiting for MediaPipe to load...");
          console.log("Window FaceMesh:", (window as any).FaceMesh);
          console.log("Window Camera:", (window as any).Camera);

          let attempts = 0;
          await new Promise((resolve, reject) => {
            const checkMediaPipe = () => {
              attempts++;
              console.log(`🔍 MediaPipe check attempt ${attempts}`);

              if ((window as any).FaceMesh && (window as any).Camera) {
                console.log("✅ MediaPipe scripts loaded successfully!");
                resolve(true);
              } else if (attempts > 50) {
                // 5 saniye timeout
                console.error("❌ MediaPipe loading timeout");
                reject(new Error("MediaPipe loading timeout"));
              } else {
                setTimeout(checkMediaPipe, 100);
              }
            };
            checkMediaPipe();
          });
        } else {
          console.log("✅ MediaPipe already available");
        }

        const FaceMesh = (window as any).FaceMesh;
        const Camera = (window as any).Camera;

        if (!FaceMesh || !Camera) {
          throw new Error("MediaPipe modules not available");
        }

        console.log("📊 Creating FaceMesh instance...");
        // Create FaceMesh with optimized configuration
        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://unpkg.com/@mediapipe/face_mesh@0.4.1633559619/${file}`,
        });

        // Set options optimized for performance and reliability
        await faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false, // Disable to reduce CPU usage
          minDetectionConfidence: 0.5, // Higher threshold for better performance
          minTrackingConfidence: 0.5, // Higher threshold for stability
        });

        faceMesh.onResults((results: any) => {
          // Always process results regardless of session state for face detection

          // Remove throttling that might block face detection
          // if (isProcessingRef.current) {
          //   return;
          // }
          // isProcessingRef.current = true;
          // setTimeout(() => {
          //   isProcessingRef.current = false;
          // }, 100);

          const now = Date.now();
          frameCountRef.current++;

          // Log every few frames to see what's happening
          if (frameCountRef.current % 10 === 0) {
            console.log("📊 MediaPipe results:", {
              multiFaceLandmarks: results.multiFaceLandmarks?.length || 0,
              frameCount: frameCountRef.current,
              timestamp: now,
              isDistracted: isDistracted,
              hasResults: !!results,
              landmarks: results.multiFaceLandmarks
                ? results.multiFaceLandmarks[0]?.length
                : 0,
              resultsKeys: Object.keys(results),
              videoReady: videoElement && videoElement.readyState === 4,
            });
          }

          // Always log when face detection changes
          const hasFaces =
            results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
          if (hasFaces) {
            console.log(
              "👤 FACE DETECTED! Count:",
              results.multiFaceLandmarks.length
            );
          }

          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            // Face detected - user is looking at screen
            lastFaceDetectionRef.current = now;
            setLastDetectionTime(now);
            setFaceCount(results.multiFaceLandmarks.length);
            setAttentionStatus("focused");

            // Check if user was previously distracted
            if (isDistractedRef.current) {
              const currentTime = Date.now();
              const timeSinceLastMessage = currentTime - lastMessageTime;
              const awayTime = awayStartTime ? now - awayStartTime : 0;

              // Only send refocus message if enough time passed
              if (timeSinceLastMessage > 3000) {
                console.log("🔄 User refocused (with message)");
                setIsDistracted(false);
                isDistractedRef.current = false;
                setAwayStartTime(0);
                setLastMessageTime(currentTime);
                setTotalAwayTime((prev) => prev + awayTime);
                const message = getRandomMessage("refocused");
                console.log(
                  "🔊 Speaking refocus message:",
                  message,
                  "Away time:",
                  awayTime
                );
                speak(message);
                onRefocus(awayTime);
              } else {
                console.log("🔄 User refocused (silent)");
                setIsDistracted(false);
                isDistractedRef.current = false;
                setAwayStartTime(0);
                setTotalAwayTime((prev) => prev + awayTime);
              }
            }

            // Clear any existing distraction timer
            if (distractionTimerRef.current) {
              clearTimeout(distractionTimerRef.current);
              distractionTimerRef.current = null;
            }

            // Reset warning count when focused
            warningCountRef.current = 0;
          } else {
            // No face detected
            setFaceCount(0);
            setAttentionStatus("distracted");

            const timeSinceLastFace = now - lastFaceDetectionRef.current;
            console.log(
              "👤 No face detected. Time since last detection:",
              timeSinceLastFace,
              "ms, isDistracted:",
              isDistracted,
              "isActive:",
              isActiveRef.current
            );

            console.log("🔍 Checking distraction conditions:", {
              timeSinceLastFace,
              timeSinceLastFaceOK: timeSinceLastFace > 5000,
              isDistracted,
              notDistracted: !isDistracted,
              isDistractedRef: isDistractedRef.current,
              isActive: isActiveRef.current,
              allConditionsOK:
                timeSinceLastFace > 5000 &&
                !isDistractedRef.current &&
                isActiveRef.current,
            });

            // Only check for distraction if not already distracted
            if (
              timeSinceLastFace > 5000 &&
              !isDistractedRef.current &&
              isActiveRef.current
            ) {
              console.log("⚠️ User distracted - sending single message");
              setIsDistracted(true);
              isDistractedRef.current = true;
              setLastDistractionTime(now);
              setLastMessageTime(now);
              setAwayStartTime(now);

              // Send distraction message ONLY ONCE
              const message = getRandomMessage("distracted");
              console.log("🔊 Speaking distraction message:", message);
              speak(message);
              onDistraction();
              warningCountRef.current++;
            }
          }
        });

        // Create camera with optimized resolution for better performance
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (faceMeshRef.current && !mediaPipeError) {
              try {
                console.log("📹 Sending frame to MediaPipe...");
                await faceMeshRef.current.send({ image: videoElement });
              } catch (error) {
                console.error("❌ FaceMesh send error:", error);
                // Set error flag to stop further attempts
                setMediaPipeError(true);
                // Switch to fallback
                setUseFallback(true);
                initFallbackTracking();
              }
            } else {
              console.warn(
                "⚠️ Camera frame skipped - faceMesh:",
                !!faceMeshRef.current,
                "error:",
                mediaPipeError
              );
            }
          },
          width: 480, // Reduced resolution for better performance
          height: 360,
        });

        faceMeshRef.current = faceMesh;
        cameraRef.current = camera;

        console.log("📊 MediaPipe modules loaded successfully");

        try {
          await camera.start();
          setIsTracking(true);
          setMediaPipeLoaded(true);
          setMediaPipeError(false);
          setIsInitialized(true);
          console.log("✅ Face tracking started");
        } catch (error) {
          console.error("❌ Camera start error:", error);
          setMediaPipeLoaded(false);
          setMediaPipeError(true);
          setIsInitialized(true);
          // Switch to fallback
          setUseFallback(true);
          initFallbackTracking();
        }
      } catch (error) {
        console.error("❌ Failed to initialize face tracking:", error);
        setMediaPipeLoaded(false);
        setMediaPipeError(true);
        setIsInitialized(true);
        // Switch to fallback
        setUseFallback(true);
        initFallbackTracking();
      }
    };

    // Add delay to ensure video is ready
    const timer = setTimeout(() => {
      initFaceMesh();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [videoElement, isInitialized]);

  // Cleanup only when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (error) {
        console.error("❌ Camera stop error:", error);
      }
      cameraRef.current = null;
    }

    if (faceMeshRef.current) {
      try {
        faceMeshRef.current.close();
      } catch (error) {
        console.error("❌ FaceMesh close error:", error);
      }
      faceMeshRef.current = null;
    }

    if (distractionTimerRef.current) {
      clearTimeout(distractionTimerRef.current);
      distractionTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsTracking(false);
    setIsDistracted(false);
    setAttentionStatus("checking");
    setFaceCount(0);
    setMediaPipeLoaded(false);
    setIsInitialized(false);
  };

  // Debug info (only in development)
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return (
      <div className="fixed top-20 left-2 sm:top-32 sm:left-6 z-50 bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-2 sm:p-3 shadow-2xl max-w-[200px] sm:max-w-none">
        <div className="text-xs space-y-1">
          <div
            className={`flex items-center space-x-2 ${
              attentionStatus === "focused"
                ? "text-green-400"
                : attentionStatus === "distracted"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                attentionStatus === "focused"
                  ? "bg-green-400"
                  : attentionStatus === "distracted"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            ></div>
            <span>Attention: {attentionStatus}</span>
          </div>
          <div className="text-muted-foreground">
            MediaPipe: {mediaPipeLoaded ? "✅" : "❌"}
          </div>
          <div className="text-muted-foreground">
            MediaPipe Error: {mediaPipeError ? "❌" : "✅"}
          </div>
          <div className="text-muted-foreground">
            Fallback: {useFallback ? "✅" : "❌"}
          </div>
          <div className="text-muted-foreground">
            Tracking: {isTracking ? "✅" : "❌"}
          </div>
          <div className="text-muted-foreground">Faces: {faceCount}</div>
          <div className="text-muted-foreground">
            Frames: {frameCountRef.current}
          </div>
          <div className="text-muted-foreground">
            Warnings: {warningCountRef.current}
          </div>
          <div className="text-muted-foreground">
            Last Detection:{" "}
            {lastDetectionTime
              ? new Date(lastDetectionTime).toLocaleTimeString()
              : "Never"}
          </div>
          <div className="text-muted-foreground">
            Total Away: {Math.round(totalAwayTime / 60000)}m{" "}
            {Math.round((totalAwayTime % 60000) / 1000)}s
          </div>
          <div className="text-muted-foreground">
            Active: {isActive ? "✅" : "❌"}
          </div>
        </div>
      </div>
    );
  }

  return null; // Production mode - no debug UI
};
