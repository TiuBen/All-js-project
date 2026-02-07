import { Button, Dialog } from "@radix-ui/themes";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { useDialog, SERVER_URL } from "@utils";
// import useFaceImageAuth from "../hooks/useAuth/useFaceImageAuth";
import Camera from "@sn/Camera";


function FaceDialog(props) {
    const { username, onClick } = props;

    const { dialogPayload, setDialogPayload } = useDialog();

    const [captureImage, setCaptureImage] = useState(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    return (
        <Dialog.Root
            open={dialogPayload?.display}
            onOpenChange={() =>{}
                // setDialogPayload
                // setOpenFaceAuthDialog({
                //     display: true,
                // })
            }
        >
            {/* <Dialog.Trigger>
                <Button>{username}</Button>
            </Dialog.Trigger> */}
            <Dialog.Content style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Dialog.Title>{dialogPayload.username} </Dialog.Title>
                <Dialog.Description></Dialog.Description>
                <div className="flex flex-row items-center mb-2">
                    <label className="flex-1 text-center text-3xl ">请正面摄像头</label>
                    <Button
                        color="red"
                        onClick={() => {
                            setDialogPayload({
                                display: false,
                            });
                        }}
                    >
                        X
                    </Button>
                </div>
                <Camera getBase64ImageImage={setCaptureImage} />
                <Button
                    onClick={() => {
                      
                        if (openFaceAuthDialog.username) {
                            console.log("openFaceAuthDialog.username", dialogPayload.username);

                            fetch(`${SERVER_URL}/auth/face`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    username: dialogPayload.username,
                                    face: captureImage,
                                }),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log(data);
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                });
                        } else {
                            window.alert("出现错误!");
                        }
                    }}
                >
                    上传验证
                </Button>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default FaceDialog;
