import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { Dialog, Button } from "@radix-ui/themes";
import {useDialog} from "../../../hooks";
import { server } from "../../../../lib/CONST";
import { useLocalStorageState } from "ahooks";
import useFaceImageAuth from "../../../hooks/useAuth/useFaceImageAuth";
import Camera from "../../../component/Camera";

function TakePhotoDialog(props) {
    const { username } = props;

    const { openTakePhotoDialog, setOpenTakePhotoDialog } = useDialog();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // const [photo, setPhoto] = useState(null);
    function onCapture(image) {
        // setPhoto(image);

        try {
            fetch(server + "/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    image: image,
                }),
            })
                .then((response) => response.json())
                .then((result) => {
                    setData(result);
                });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog.Root open={openTakePhotoDialog} onOpenChange={() => setOpenTakePhotoDialog(!openTakePhotoDialog)}>
            <Dialog.Content style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Dialog.Title className="flex flex-row justify-between">
                    <div>人脸照片采样</div>
                    <Button color="red" onClick={()=>setOpenTakePhotoDialog(false)}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description>请正面摄像头</Dialog.Description>
                <Camera onCapture={onCapture} />
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default TakePhotoDialog;
