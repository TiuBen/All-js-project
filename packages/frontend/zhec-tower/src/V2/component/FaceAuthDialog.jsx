import { Button, Dialog } from "@radix-ui/themes";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import {useDialog} from "../hooks";
import { server } from "../../lib/CONST";
import { useLocalStorageState } from "ahooks";
import useFaceImageAuth from "../hooks/useAuth/useFaceImageAuth";

const IcComparingComponent = ({ info }) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font z-20 bg-white">
            <style>
                {`
                      @keyframes fade {
                          0% {
                              opacity: 1;
                              text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                          }
                          50% {
                              opacity: 0.2;
                              text-shadow: 0 0 20px rgba(255, 255, 255, 1);
                          }
                          100% {
                              opacity: 1;
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
            <div className="loading-text"> {info}</div>
        </div>
    );
};

function ComparePhotoCameraComponent(props) {
    const { username } = props;

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // const [data, setData] = useState(null);
    const [initCamera, setInitCamera] = useState(true);

    const [canButtonClick, setCanButtonClick] = useState(false);
    const [failCount, setFailCount] = useState(0);

    const [floatingText, setFloatingText] = useState("正在初始化摄像头");

    const { authenticateFaceImage, loading, error, responseData } = useFaceImageAuth();

    // const { setOpenSelectUserDialog, setOpenCompareFaceDialog } = useContext(DialogContext);
    const [selectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [selectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    useEffect(() => {
        const getVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCanButtonClick(true);
                    setFloatingText("");
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
            const imgData = canvas.toDataURL("image/png");
            setImage(imgData);
        }
    };

    useEffect(() => {
      authenticateFaceImage(image, {
            username: username,
            position: selectedPosition,
            dutyType: selectedDutyType,
        });
    }, [image])
    

    

    return (
        <div className="flex flex-col gap-3 relative">
            {/* <div className="flex flex-row items-center gap-2">
                <canvas ref={canvasRef} width={64} height={64} style={{ display: "",border: "1px solid #000" }} />
                  dddd
                <img src={server.url + "/api/v1/face/image/" + username} alt="服务器上用户照片" />
            </div> */}
            <IcComparingComponent info={floatingText} />
            {image && (
                <div className="absolute">
                    <img src={image} alt="Captured" style={{ width: "100%", height: "auto" }} />
                </div>
            )}

            <video ref={videoRef} autoPlay style={{ width: "640", height: "480" }} className=" border-4 " />

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

function FaceAuthDialog(props) {
    const { username } = props;

    const { openFaceAuthDialog, setOpenFaceAuthDialog } = useDialog();

    return (
        <Dialog.Root open={openFaceAuthDialog} onOpenChange={() => setOpenFaceAuthDialog(true)}>
            {/* <Dialog.Trigger>
                <Button>{username}</Button>
            </Dialog.Trigger> */}
            <Dialog.Content style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Dialog.Title> </Dialog.Title>
                <Dialog.Description></Dialog.Description>
                <div className="flex flex-row items-center mb-2">
                    <label className="flex-1 text-center text-3xl ">请正面摄像头</label>
                    <Button color="red" onClick={() => setOpenFaceAuthDialog(false)}>
                        X
                    </Button>
                </div>

                <ComparePhotoCameraComponent username={username} />
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default FaceAuthDialog;
