import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const button = document.getElementById("webcamButton");
const blendShapesEl = document.getElementById("video-blend-shapes");

let faceLandmarker;
let runningMode = "IMAGE";
let webcamRunning = false;
let lastVideoTime = -1;

const videoWidth = 480;
const drawingUtils = new DrawingUtils(canvasCtx);

/* ---------------- CREATE LANDMARKER ---------------- */

async function createFaceLandmarker() {
  const resolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    numFaces: 1,
    runningMode,
  });
}

await createFaceLandmarker();

/* ---------------- WEBCAM ---------------- */

button.addEventListener("click", async () => {
  if (!faceLandmarker) return;

  webcamRunning = !webcamRunning;
  button.innerText = webcamRunning ? "DISABLE WEBCAM" : "ENABLE WEBCAM";

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.addEventListener("loadeddata", predictWebcam);
});

/* ---------------- MAIN LOOP ---------------- */

async function predictWebcam() {
  const ratio = video.videoHeight / video.videoWidth;

  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * ratio + "px";

  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  canvasElement.style.width = video.style.width;
  canvasElement.style.height = video.style.height;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode });
  }

  const now = performance.now();

  let results;
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, now);
  }

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results?.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#00FFAA", lineWidth: 1 }
      );
    }
  }

  drawBlendShapes(results?.faceBlendshapes);

  if (webcamRunning) {
    requestAnimationFrame(predictWebcam);
  }
}

/* ---------------- BLEND SHAPES ---------------- */

function drawBlendShapes(blendShapes) {
  if (!blendShapes || !blendShapes.length) return;

  blendShapesEl.innerHTML = "";

  blendShapes[0].categories.forEach((shape) => {
    const li = document.createElement("li");
    li.innerText = `${shape.displayName || shape.categoryName}: ${shape.score.toFixed(3)}`;
    blendShapesEl.appendChild(li);
  });
}
