import { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";
import "./FaceDetection.css";
import axios from "axios";
const MODEL_URL = "/models";

function FaceDetectionCamera({ setSongs }) {
  const videoRef = useRef();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Attempting to load Face-API models...");
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log("ssdMobilenetv1 loaded.");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log("faceLandmark68Net loaded.");
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("faceExpressionNet loaded.");

        setModelsLoaded(true);
        console.log("All Face-API models loaded successfully!");
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  const startCamera = useCallback(async () => {
    console.log("Start Camera function called.");
    setCameraError(null);

    if (!modelsLoaded) {
      console.log("Models not yet loaded. Cannot start camera.");
      setCameraError("Models not loaded yet.");
      return;
    }
    if (stream) {
      console.log("Stream already active.");
      return;
    }

    try {
      console.log("Attempting to get user media (access webcam)...");
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log("User media obtained.", currentStream);
      setStream(currentStream);
      if (videoRef.current) {
        videoRef.current.srcObject = currentStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Could not access webcam. Please check permissions.";
      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please allow camera permissions in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on your device.";
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "Camera is already in use or inaccessible by the browser.";
      } else if (error.name === "AbortError") {
        errorMessage = "Camera access request was aborted.";
      } else if (error.name === "SecurityError") {
        errorMessage =
          "Camera access denied due to security policy (e.g., non-HTTPS or iframe issues).";
      }
      setCameraError(errorMessage);
      setStream(null);
    }
  }, [modelsLoaded, stream]);

  useEffect(() => {
    if (modelsLoaded && !stream) {
      console.log(
        "Models loaded and no stream active. Starting camera automatically..."
      );
      startCamera();
    }
  }, [modelsLoaded, stream, startCamera]);

  const handleDetectMoodClick = useCallback(async () => {
    const video = videoRef.current;

    if (!modelsLoaded || !stream || !video || video.paused || video.ended) {
      setCurrentMood("Camera not active or models not loaded.");
      setTimeout(() => setCurrentMood(null), 3000);
      return;
    }

    console.log("Attempting to detect mood on click...");
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detection && detection.expressions) {
      const expressions = detection.expressions;
      let prominentExpressionLabel = "";
      let maxConfidence = 0;

      for (const expr in expressions) {
        if (expr === "surprised") {
          continue;
        }
        if (expressions?.[expr] > maxConfidence) {
          maxConfidence = expressions?.[expr];
          prominentExpressionLabel = expr;
        }
      }
      setCurrentMood(prominentExpressionLabel);
      const { data } = await axios.get(
        `http://localhost:3000/songs?mood=${prominentExpressionLabel}`
      );
      setSongs(data.song);

      console.log(`Prominent Mood Detected: ${prominentExpressionLabel}`);

      setTimeout(() => {
        setCurrentMood(null);
      }, 5000);
    } else {
      setCurrentMood("No face detected for mood analysis.");
      setTimeout(() => setCurrentMood(null), 3000);
    }
  }, [modelsLoaded, stream]);

  return (
    <div className="face-detection-container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted playsInline />
      </div>

      <div className="mood-heading-container">
        <h1 className="mood-heading">Mood Detector</h1>
        {!modelsLoaded && (
          <p className="status-message">Loading models, please wait...</p>
        )}
        {cameraError && <p className="error-message">Error: {cameraError}</p>}
        {modelsLoaded && stream && (
          <button
            onClick={handleDetectMoodClick}
            className="detect-mood-button"
          >
            Detect Mood
          </button>
        )}

        {currentMood && (
          <div className="mood-display">Detected Mood: {currentMood}</div>
        )}
      </div>
    </div>
  );
}

export default FaceDetectionCamera;
