'use client'
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RotateLoader } from "react-spinners";
import {FaceDetector, FilesetResolver, Detection} from '@mediapipe/tasks-vision'

export default function Home() {
    const [gameState, setGameState] = useState("pregame");
    const [question, setQuestion] = useState("");
    const ws = useRef();
    const videoElem = useRef();
    const faceDetector  = useRef();

    useEffect(()=>{ 
                
        // Initialize the object detector
        const initializefaceDetector = async () => {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
          );
          faceDetector.current = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
              delegate: "GPU"
            },
            runningMode: "VIDEO"
          });
        };
        initializefaceDetector();
        





        //Websocket setup
        ws.current = new WebSocket('ws://localhost:8081/ws');
        ws.current.addEventListener("open", (event) => {
          console.log("Connected to server.");
        });
    
        ws.current.addEventListener("message", (data) => {
            console.log(data);
        });
    
        ws.current.addEventListener("close", () => {
          console.log("Disconnected from server.");
        });
        
        

        

        return () => {
          if (ws.current) {
            ws.current.close();
          }
        };


      }, [])

    useEffect(() => {
        const utterance = new SpeechSynthesisUtterance(question);
        utterance.voice = speechSynthesis.getVoices()[0];
        speechSynthesis.speak(utterance);
    }, [question])

    useEffect(()=>{
        if(gameState === "choosing"){
            
        }
    }, [gameState])

    let lastVideoTime = useRef(-1);
    async function predictWebcam() {
        // if image mode is initialized, create a new classifier with video runningMode
        let video = videoElem.current;
        let startTimeMs = performance.now();
    
        // Detect faces using detectForVideo
        if (video.currentTime !== lastVideoTime.current) {
            lastVideoTime.current = video.currentTime;
            const detections = faceDetector.current.detectForVideo(video, startTimeMs).detections;
            console.log(detections)

        }
        // Call this function again to keep predicting when the browser is ready
        window.requestAnimationFrame(predictWebcam);
    }

    return (
        <main className="flex flex-col  max-h-screen justify-center	items-center p-24">
            <div className="flex items-center">
                <h1 className='select-none	text-7xl text-black font-bold pl-5'>Brain</h1>
                <Image src="/brain.png" width={150} height={150} alt="is brain"></Image>
                <h1 className='select-none	text-7xl text-black font-bold'>Bullet</h1>
            </div>
            {gameState === 'pregame' && <div>
                <button onClick={()=>{
                    var audio = new Audio('Kahoot Lobby Music (HD).mp3');
                    audio.loop = true;
                    audio.play();
                    setGameState("choosing")

                    navigator.mediaDevices.getUserMedia({video: true}).then(
                        (stream) => {
                            const video = videoElem.current;
                            if(!video){
                                return;
                            }
                            video.srcObject = stream;
                            video.addEventListener("loadeddata", predictWebcam);

                        }
                    )
                }} className="p-2 m-2 border-black rounded-md flex items-center mt-10"><Image src="/play.png" width={100} height={100} alt="Bones"></Image></button>
            </div>}
            {gameState === 'choosing' && <div className="flex flex-col items-center italic">
                <h2 className="text-4xl p-10 text-center text-black ">Choosing Player</h2>
                <RotateLoader ></RotateLoader>
            </div>}
            {gameState === 'question' && <>
                <h2 className="text-4xl p-10 w-3/4 text-center text-gray-600">{question}</h2>
                <h2 className="text-4xl p-5 w-3/4 text-center text-gray-400">Say your answer:</h2>
            </>}
            <video ref={videoElem} id="webcam" autoPlay={true} playsInline={true} className="" style={{width: 320, height:240}}></video>

        </main>
    );
}

/*
axios.get('/question').then(
    response => setQuestion(response.data["q"])
)

Detect faces
Speech to text
Check answer (use embeddings?)
*/