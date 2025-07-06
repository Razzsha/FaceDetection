import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";

const FaceDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      await faceapi.nets.ageGenderNet.loadFromUri("/models");
      startDetection();
    };
    loadModels();
  }, []);

  const startDetection = () => {
    setInterval(async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;

        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions()
          .withAgeAndGender();

        const dims = faceapi.matchDimensions(canvasRef.current, video, true);
        const resizedDetections = faceapi.resizeResults(detections, dims);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw face boxes
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        // Draw expressions
        faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        // Draw age and gender text
        resizedDetections.forEach((detection) => {
          const { age, gender, genderProbability } = detection;
          const box = detection.detection.box;
          const drawBox = new faceapi.draw.DrawTextField(
            [
              `Age: ${age.toFixed(0)}`,
              `Gender: ${gender} (${(genderProbability * 100).toFixed(0)}%)`,
            ],
            { x: box.x, y: box.y - 20 }
          );
          drawBox.draw(canvasRef.current);
        });
      }
    }, 100);
  };

  return (
    <div style={{ position: "relative", width: 640, height: 480 }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        style={{ position: "absolute", top: 0, left: 0, width: 640, height: 480 }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};

export default FaceDetection;