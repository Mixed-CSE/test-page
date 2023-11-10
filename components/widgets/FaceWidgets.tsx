import { Emotion, EmotionName } from "../../lib/data/emotion";
import { None, Optional } from "../../lib/utilities/typeUtilities";
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../menu/Auth";
import { FacePrediction } from "../../lib/data/facePrediction";
import { FaceTrackedVideo } from "./FaceTrackedVideo";
import { TrackedFace } from "../../lib/data/trackedFace";
import { VideoRecorder } from "../../lib/media/videoRecorder";
import { blobToBase64 } from "../../lib/utilities/blobUtilities";
import { getApiUrlWs } from "../../lib/utilities/environmentUtilities";

type FaceWidgetsProps = {
  onCalibrate: Optional<(emotions: Emotion[]) => void>;
};

let mode = ""; // 실전에서는 이 부분을 고치시오.

export function FaceWidgets({ onCalibrate }: FaceWidgetsProps) {
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<VideoRecorder | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const mountRef = useRef(true);
  const recorderCreated = useRef(false);
  const numReconnects = useRef(0);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]); // [bbox, color]의 배열
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [status, setStatus] = useState("");
  const numLoaderLevels = 5;
  const maxReconnects = 3;
  const loaderNames: EmotionName[] = [
    "Calmness",
    "Joy",
    "Amusement",
    "Anger",
    "Confusion",
    "Disgust",
    "Sadness",
    "Horror",
    "Surprise (negative)",
  ];

  useEffect(() => {
    console.log("Mounting component");
    mountRef.current = true;
    console.log("Connecting to server");
    connect();

    return () => {
      console.log("Tearing down component");
      stopEverything();
    };
  }, []);

  function connect() {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Socket already exists, will not create");
    } else {
      const baseUrl = getApiUrlWs(authContext.environment);
      const endpointUrl = `${baseUrl}/v0/stream/models`;
      const socketUrl = `${endpointUrl}?apikey=${authContext.key}` + mode;
      console.log(`Connecting to websocket... (using ${endpointUrl})`);
      setStatus(`Connecting to server...`);

      const socket = new WebSocket(socketUrl);

      socket.onopen = socketOnOpen;
      socket.onmessage = socketOnMessage;
      socket.onclose = socketOnClose;
      socket.onerror = socketOnError;

      socketRef.current = socket;
    }
  }

  async function socketOnOpen() {
    console.log("Connected to websocket");
    setStatus("Connecting to webcam...");
    if (recorderRef.current) {
      console.log("Video recorder found, will use open socket");
      await capturePhoto();
    } else {
      console.warn("No video recorder exists yet to use with the open socket");
    }
  }

  async function socketOnMessage(event: MessageEvent) {
    setStatus("");
    const response = JSON.parse(event.data);
    let emotionArray = [];
    console.log(response);
    const response2 = response.face.predictions;

    for (var object in response2) {
      const response3 = response2[object].emotions;
      for (var obj in response3) {
        emotionArray.push(response3[obj].score);
      }
    }

    const predictions: FacePrediction[] = response.face?.predictions || [];
    const warning = response.face?.warning || "";
    const error = response.error;
    if (error) {
      setStatus(error);
      console.error(error);
      stopEverything();
      return;
    }

    if (predictions.length === 0) {
      setStatus(warning.replace(".", ""));
      setEmotions([]);
    }

    // 이부분이다아아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙
    // 이부분이다아아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙
    // 이부분이다아아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙
    // 이부분이다아아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙아아앙
    const newTrackedFaces: TrackedFace[] = [];
    predictions.forEach(async (pred: FacePrediction, dataIndex: number) => {
      // 감정벡터 추출 작업
      let emotionArray2 = [];
      for (var obj in pred.emotions) {
        emotionArray2.push(pred.emotions[obj].score);
      }

      // console.log("추출한 감정 벡터: ", emotionArray2);

      /* 
      구현해야 할 코드
      : 감정 벡터(emotionArray)를 모델의 입력값으로 넣어서 0 또는 1을 받아온다.
      */ // axios 모듈 가져오기
      const axios = require("axios");

      // 보낼 배열 데이터

      // 배열을 JSON 문자열로 변환
      const jsonString = JSON.stringify(emotionArray2);
      // console.log("이게 보내질거얌", { data: jsonString });
      // 서버 URL 설정
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({ data: jsonString });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      let isUnderstanding = 1;
      let color = "rgb(0, 255, 0, 0.5)";

      fetch("http://localhost:8104/predict", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          result = JSON.parse(result);
          isUnderstanding = result["result"];
          if (isUnderstanding == 1) {
            color = "rgb(0, 255, 0, 0.5)";
          } else {
            color = "rgb(255, 0, 0, 0.5)";
          }
          newTrackedFaces.push({ boundingBox: pred.bbox, color: color });
          if (dataIndex === 0) {
            const newEmotions = pred.emotions;
            setEmotions(newEmotions);
            if (onCalibrate) {
              onCalibrate(newEmotions);
            }
          }
        });
    });
    setTrackedFaces(newTrackedFaces);

    await capturePhoto();
  }

  async function socketOnClose(event: CloseEvent) {
    console.log("Socket closed");

    if (mountRef.current === true) {
      setStatus("Reconnecting");
      console.log("Component still mounted, will reconnect...");
      connect();
    } else {
      console.log("Component unmounted, will not reconnect...");
    }
  }

  async function socketOnError(event: Event) {
    console.error("Socket failed to connect: ", event);
    if (numReconnects.current >= maxReconnects) {
      setStatus(`Failed to connect to the Hume API (${authContext.environment}).
      Please log out and verify that your API key is correct.`);
      stopEverything();
    } else {
      numReconnects.current++;
      console.warn(`Connection attempt ${numReconnects.current}`);
    }
  }

  function stopEverything() {
    console.log("Stopping everything...");
    mountRef.current = false;
    const socket = socketRef.current;
    if (socket) {
      console.log("Closing socket");
      socket.close();
      socketRef.current = null;
    } else {
      console.warn("Could not close socket, not initialized yet");
    }
    const recorder = recorderRef.current;
    if (recorder) {
      console.log("Stopping recorder");
      recorder.stopRecording();
      recorderRef.current = null;
    } else {
      console.warn("Could not stop recorder, not initialized yet");
    }
  }

  async function onVideoReady(videoElement: HTMLVideoElement) {
    console.log("Video element is ready");

    if (!photoRef.current) {
      console.error("No photo element found");
      return;
    }

    if (!recorderRef.current && recorderCreated.current === false) {
      console.log("No recorder yet, creating one now");
      recorderCreated.current = true;
      const recorder = await VideoRecorder.create(videoElement, photoRef.current);

      recorderRef.current = recorder;
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Socket open, will use the new recorder");
        await capturePhoto();
      } else {
        console.warn("No socket available for sending photos");
      }
    }
  }

  async function capturePhoto() {
    const recorder = recorderRef.current;

    if (!recorder) {
      console.error("No recorder found");
      return;
    }

    const photoBlob = await recorder.takePhoto();
    sendRequest(photoBlob);
  }

  async function sendRequest(photoBlob: Blob) {
    const socket = socketRef.current;

    if (!socket) {
      console.error("No socket found");
      return;
    }

    const encodedBlob = await blobToBase64(photoBlob);
    const requestData = JSON.stringify({
      data: encodedBlob,
      models: {
        face: {},
      },
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(requestData);
    } else {
      console.error("Socket connection not open. Will not capture a photo");
      socket.close();
    }
  }

  return (
    <div>
      <div className="md:flex">
        <FaceTrackedVideo
          className="mb-6"
          onVideoReady={onVideoReady}
          trackedFaces={trackedFaces} // 이부분이당
          width={1000}
          height={750}
        />
      </div>
      <div className="pt-6">{status}</div>
      <canvas className="hidden" ref={photoRef}></canvas>
    </div>
  );
}

FaceWidgets.defaultProps = {
  onCalibrate: None,
};
