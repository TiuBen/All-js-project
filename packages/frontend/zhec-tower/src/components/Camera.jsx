import React, { useRef, useEffect, useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";

function CameraComponent(props) {
    const { onCapture, displayPhoto, children } = props;

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);

    const [initingCamera, setInitingCamera] = useState(true);
    const [reCapture, setReCapture] = useState(false);

    useEffect(() => {
        const getVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setInitingCamera(false);
                }
            } catch (err) {
                console.error("Error accessing the camera: ", err);
            }
        };

        getVideo();

        // Cleanup function to stop the video stream
        return () => {
            if (videoRef.current) {
                const stream = videoRef.current.srcObject;
                if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach((track) => track.stop());
                }
            }
        };
    }, []);

    const captureImage = () => {
        setReCapture(true);
        console.log("Capturing image...");
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = videoRef.current;

        if (video) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL("image/png");
            setImage(imgData);

            //
            if (onCapture) {
                onCapture(imgData);
            }
        }
    };

    const resetCapture = () => {
        setReCapture(false);
        setImage(null);
    };

    return (
        <div className="flex flex-col gap-3 relative">
          {children}
            {image && displayPhoto && (
                <div className="absolute">
                    <img src={image} alt="Captured" style={{ width: "100%", height: "auto" }} />
                </div>
            )}
            {initingCamera ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font z-20">
                    <style>
                        {`
                    @keyframes fade {
                        0% {
                            opacity: 0.1;
                            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                        }
                        50% {
                            opacity: 1;
                            text-shadow: 0 0 20px rgba(255, 255, 255, 1);
                        }
                        100% {
                            opacity: 0.1;
                            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                        }
                    }

                    .loading-text {
                        font-size: 2em;
                        animation: fade 1.5s infinite;
                        font-weight: bold;
                        color: #3E63DD;
                    }
                `}
                    </style>
                    <div className="loading-text"> 正在初始化摄像头</div>
                </div>
            ) : (
                <></>
            )}

            <video ref={videoRef} autoPlay style={{ width: "640", height: "480" }} className=" border-4 " />
            {/* <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }}  className=' border-4 border-red-600'/> */}
            {reCapture ? (
                <Button size={"4"} onClick={resetCapture}>
                    重新拍摄
                </Button>
            ) : (
                <Button size={"4"} onClick={captureImage}>
                    拍摄
                </Button>
            )}
            <div className="relative ">
                {/* {zIndexLayer} */}

                <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
            </div>
        </div>
    );
}

export default CameraComponent;
