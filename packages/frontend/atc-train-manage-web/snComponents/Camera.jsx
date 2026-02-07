import { Button, Dialog } from "@radix-ui/themes";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";


function Camera(props) {
    const {  onCapture,getBase64ImageImage } = props;

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);

    const [canButtonClick, setCanButtonClick] = useState(false);
    const [failCount, setFailCount] = useState(0);

    useEffect(() => {
        const getVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCanButtonClick(true);
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
        console.log("Capturing image...");
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = videoRef.current;

        if (video) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL("image/jpeg");
            setImage(imgData);
            if (onCapture) {
                onCapture(imgData);
            }
            if (getBase64ImageImage) {
                getBase64ImageImage(imgData);
                console.log("imgData", imgData.substring(0,30));
                
            }

            
        }
    };

 

    return (
        <div className="flex flex-col gap-3 relative">
            {image && (
                <div className="absolute">
                    <img src={image} alt="Captured" style={{ width: "100%", height: "auto" }} />
                </div>
            )}

            <video ref={videoRef} autoPlay style={{ width: "640", height: "480" }}  />

            <Button
                disabled={!canButtonClick}
                size={"4"}
                onClick={() => {
                    captureImage();
                  
                }}
            >
                拍摄
            </Button>
            <div className="relative ">
                <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
            </div>
        </div>
    );
}

export default Camera;
