import { useCallback, useEffect, useRef, useState } from "react";

// Custom hook to manage camera access and video element
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Clean up camera resources
  const stopCamera = useCallback(() => {
    let tracksStopped = false;

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();

      if (tracks.length > 0) {
        tracks.forEach((track) => {
          track.stop();
        });
        tracksStopped = true;
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    return tracksStopped;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Initialize camera with proper constraints
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError("Video element not found");
      return false;
    }

    await stopCamera();

    if (!isMountedRef.current) return false;

    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setError(null);
        return true;
      }

      stream.getTracks().forEach((track) => track.stop());
      return false;
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Camera access error:", err);
        setError("Camera access denied");
      }
      return false;
    }
  }, [stopCamera]);

  // Play the video and return a promise
  const playVideo = useCallback(async () => {
    if (!videoRef.current) {
      return Promise.reject(new Error("Video element not found"));
    }

    try {
      await videoRef.current.play();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Video play error:", err);
      setError(`Could not play camera video: ${message}`);
      return Promise.reject(err);
    }
  }, []);

  return {
    videoRef,
    error,
    startCamera,
    stopCamera,
    playVideo,
  };
}

export default useCamera;
