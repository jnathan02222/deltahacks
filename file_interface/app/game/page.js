'use client'
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RotateLoader } from "react-spinners";
import {FaceDetector, FilesetResolver, Detection} from '@mediapipe/tasks-vision'

export default function Home() {
    const [gameState, setGameState] = useState("pregame");
    const [answer, setAnswer] = useState("");
    const [input, setInput] = useState("");
    const faceCounterRandomizer = useRef(1);
    const gameStateRef = useRef();

    const recognition = useRef();
    const choosingMusic = useRef();
    const questionMusic = useRef();
    const answerData = useRef();

    const [question, setQuestion] = useState("");
    const faceCounter = useRef(0);
    const countedFace = useRef(false);
    const ws = useRef();
    const videoElem = useRef();
    const faceDetector  = useRef();
    const range = 20;

    useEffect(()=>{
            answerData.current = {question : question, answer : answer, input : input}
    }, [question, answer, input])

        

    useEffect(()=>{ 
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        recognition.current = new SpeechRecognition();
        recognition.current.lang = "en-US";
        recognition.current.continuous = true;
        recognition.current.interimResults = true;

        recognition.current.onresult = (event) => {
            let speech = event.results[event.results.length - 1][0].transcript
            setTimeout(()=>{
                setInput(
                    prev => {
                        if(prev === speech && prev !== "" && gameStateRef.current === "question"){
                            axios.post("/answer", answerData.current).then(
                                response => {
                                    
                                    if(response.data === "No"){
                                        ws.current.send("shoot")
                                        setQuestion("RELOAD!!!")
                                        setTimeout(() => {setGameState("choosing")}, 3000)
                                    }else{
                                        setQuestion("")
                                        setGameState("choosing")
                                    }
                                }
                            )
                        }
                        return prev
                    }
                )
            }, 3000)
            setInput(speech)
        };

                
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
            ws.current.send("right")
            choosingMusic.current.play();
            questionMusic.current.pause();
            let counter = Math.floor(Math.random()*10)
            console.log(counter)
            faceCounterRandomizer.current = counter
            faceCounter.current = 0
        }else if(gameState === "question"){
            ws.current.send("stop")
            questionMusic.current.play();
            choosingMusic.current.pause();
            axios.get('/question').then(
                response => {
                    setQuestion(response.data["q"])
                    setAnswer(response.data["a"])
                    setInput("")
                    
                }
            )
            
        }
        gameStateRef.current = gameState
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
            if(detections[0]){
                let values = detections[0]["boundingBox"]
                if(values["originX"] + values["width"]/2 > video.videoWidth/2 - range && values["originX"] + values["width"]/2 < video.videoWidth/2 + range && !countedFace.current){
                    faceCounter.current = faceCounter.current + 1;
                    countedFace.current = true;
                } else if(!(values["originX"] + values["width"]/2 > video.videoWidth/2 - range && values["originX"] + values["width"]/2 < video.videoWidth/2 + range) && countedFace.current){
                    countedFace.current = false;
                }
            }
            console.log(faceCounter.current)
            if(faceCounter.current === faceCounterRandomizer.current){
                
                setGameState("question")
            }
        }   
        // {originX: 241, originY: 268, width: 224, height: 224, angle: 0}
        // Call this function again to keep predicting when the browser is ready
        window.requestAnimationFrame(predictWebcam);
    }

    return (
        <main className="flex flex-col  max-h-screen items-center">
            <div className="flex items-center pt-10">
                <h1 className='select-none	text-7xl text-black font-bold pl-5'>Bullet</h1>
                <Image src="/brain.png" width={150} height={150} alt="is brain"></Image>
                <h1 className='select-none	text-7xl text-black font-bold'>Brain</h1>
            </div>
            {gameState === 'pregame' && <div className="absolute flex justify-center items-center w-full    h-screen">
                <button  onClick={()=>{
                    choosingMusic.current = new Audio('Kahoot Lobby Music (HD).mp3');
                    questionMusic.current = new Audio('Pink Soldiers.mp3');
                    choosingMusic.current.loop = true;
                    questionMusic.current.loop = true;
                    
                    choosingMusic.current.play();
                    

                    setGameState("choosing")
                    recognition.current.start()

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
                <h2 className="text-4xl p-5 w-3/4 text-center text-gray-400">{input}</h2>
            </>}
            <video ref={videoElem} id="webcam" autoPlay={true} playsInline={true} className="hidden" style={{width: 320, height:240}}></video>

        </main>
    );
}

/*


Detect faces
Speech to text
Check answer (use embeddings?)
*/