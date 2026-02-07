import { Button, Dialog } from "@radix-ui/themes";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { server, usernames, usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3 } from "../../lib/CONST";
import Avatar from "../../components/Avatar";
import { useLocalStorageState } from "ahooks";
import dayjs from "dayjs";

const Positions = [
    { position: "西塔台", dutyType: ["主班", "副班"] },
    { position: "西地面", dutyType: ["主班", "副班"] },
    { position: "西放行", dutyType: ["主班", "副班"] },
    { position: "进近高扇", dutyType: ["主班", "副班"] },
    { position: "进近低扇", dutyType: ["主班", "副班"] },
    { position: "东塔台", dutyType: ["主班", "副班"] },
    { position: "东地面", dutyType: ["主班", "副班"] },
    { position: "东放行", dutyType: ["主班", "副班"] },
    { position: "领班" },
    { position: "流控" },
];

const DialogContext = createContext(null);

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [initCamera, setInitCamera] = useState(true);

    const [canButtonClick, setCanButtonClick] = useState(false);
    const [failCount, setFailCount]= useState(0);

    const [floatingText, setFloatingText] = useState("正在初始化摄像头");

    const { setOpenSelectUserDialog, setOpenCompareFaceDialog } = useContext(DialogContext);
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

    return (
        <div className="flex flex-col gap-3 relative">
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
                    setLoading(true);
                    setError(null);
                    setData(null);
                    setFloatingText("正在识别人脸");
                    //
                    setCanButtonClick(false);
                    //
                    const canvas = canvasRef.current;
                    const context = canvas.getContext("2d");
                    const video = videoRef.current;

                    if (video) {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imgData = canvas.toDataURL("image/png");
                        setImage(imgData);

                        fetch(server + "/auth/face", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username: username,
                                facePhoto:imgData

                            }) ,
                        })
                            .then((response) => response.json())
                            .then((result) => {
                                setLoading(false);
                                setData(result);
                                console.log(result);
                                if (result?.body?.data?.confidence > 61) {
                                    console.log(result.body.data.confidence);
                                    setFloatingText("识别成功...");

                                    //! another fetch
                                    return fetch(server + "/duty", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            username: username,
                                            position: selectedPosition,
                                            dutyType: selectedDutyType,
                                        }),
                                    })
                                        .then((res) => res.json())
                                        .then((data) => {
                                            setTimeout(() => {
                                                setOpenSelectUserDialog(false);
                                                setOpenCompareFaceDialog(false);
                                            }, 3000);
                                        })
                                        .then(() => {
                                            window.location.reload();
                                        });
                                    //! another fetch
                                } else {
                                    setFloatingText("识别失败");
                                    setFailCount(failCount + 1);
                                    setTimeout(() => {
                                        setImage(null);
                                        setFloatingText(null);
                                        setCanButtonClick(true);
                                    }, 3000);
                                }
                            })
                            .catch((error) => {
                                setError(error.message);
                            })
                            .finally(() => {
                                setInitCamera(false);
                                setImage(null);
                            });
                    }
                }}
            >
                拍摄
            </Button>

            <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
        </div>
    );
}

function CompareFaceDialogButton(props) {
    const { username } = props;

    const { openCompareFaceDialog, setOpenCompareFaceDialog } = useContext(DialogContext);

    return (
        <Dialog.Root open={openCompareFaceDialog} onOpenChange={() => setOpenCompareFaceDialog(true)}>
            <Dialog.Trigger>
                <Button>{username}</Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Dialog.Title> </Dialog.Title>
                <Dialog.Description></Dialog.Description>
                <div className="flex flex-row items-center mb-2">
                    <label className="flex-1 text-center text-3xl ">请正面摄像头</label>
                    <Button color="red" size={"3"} onClick={() => setOpenCompareFaceDialog(false)}>
                        X
                    </Button>
                </div>
                <ComparePhotoCameraComponent username={username} />
            </Dialog.Content>
        </Dialog.Root>
    );
}

function ConfirmOutDialog(props) {
    const { username, position, dutyType } = props;
    const { openConfirmGetOutDialog, setOpenConfirmGetOutDialog, response, setNeedReload } = useContext(DialogContext);

    return (
        <Dialog.Root open={openConfirmGetOutDialog} onOpenChange={() => setOpenConfirmGetOutDialog()}>
            <Dialog.Content className=" flex flex-col gap-2 justify-between">
                <Dialog.Title className="flex flex-row justify-between">
                    确认退出？
                    <Button color="indigo" onClick={() => setOpenConfirmGetOutDialog(false)}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description></Dialog.Description>

                <Button
                    color="red"
                    size={"3"}
                    onClick={() => {
                        fetch(server + "/duty", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username: username,
                                position: position,
                                dutyType: dutyType,
                            }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                setOpenConfirmGetOutDialog(false);
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                            .finally(() => {
                                window.location.reload();
                            });
                    }}
                >
                    确认
                </Button>
            </Dialog.Content>
        </Dialog.Root>
    );
}

function SelectUserDialog(props) {
    const { openSelectUserDialog, setOpenSelectUserDialog, response, setNeedReload } = useContext(DialogContext);
    //     const { username, prepareTime, shiftType, message, error = null } = response;
    const [selectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [selectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    return (
        <Dialog.Root open={openSelectUserDialog} onOpenChange={() => setOpenSelectUserDialog(!openSelectUserDialog)}>
            <Dialog.Content maxWidth="1000px" className=" flex flex-col">
                <Dialog.Title className="flex flex-row justify-between">
                    <div>进行接班</div>
                    <Button color="crimson" variant="soft" onClick={() => setOpenSelectUserDialog(false)}>
                        X
                    </Button>
                </Dialog.Title>
                <Dialog.Description>点击姓名</Dialog.Description>
                <div className="flex flex-col flex-wrap gap-2">
                    <div className="flex flex-row flex-1 flex-wrap gap-2 border-b-2 pb-1">
                        {["沈宁"].map((x, index) => {
                            return <CompareFaceDialogButton key={index} username={x} />;
                        })}
                    </div>
                    {[usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3].map((uRow, index) => {
                        return (
                            <div key={index} className="flex flex-row flex-1 flex-wrap gap-2 border-b-2 pb-1">
                                {uRow.map((x, key) => {
                                    return (
                                        <Button
                                            color="cyan"
                                            variant="soft"
                                            onClick={() => {
                                                fetch(server + "/duty", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        username: x,
                                                        position: selectedPosition,
                                                        dutyType: selectedDutyType,
                                                    }),
                                                })
                                                    .then((res) => res.json())
                                                    .then((data) => {
                                                        setOpenSelectUserDialog(false);
                                                    })
                                                    .then(() => {
                                                        window.location.reload();
                                                    });
                                            }}
                                            key={key}
                                            style={{ width: "5rem" }}
                                        >
                                            {x}
                                        </Button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}

const OneUser = (props) => {
    const { username, position, dutyType, inTime } = props;
    const { openConfirmGetOutDialog, setOpenConfirmGetOutDialog, response, setNeedReload } = useContext(DialogContext);

    const date1 = dayjs(inTime);

    const [inDutyTime, setInDutyTime] = useState(dayjs.duration(dayjs(Date.now()).diff(date1)).format("H小时m分"));
    const [isOver2Hours, setIsOver2Hours] = useState(false);

    const handleClick = async () => {
        fetch(server + "/duty", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                position: position,
                dutyType: dutyType,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setOpenConfirmGetOutDialog(false);
                window.location.reload();
            });
    };

    useEffect(() => {
        const _inDutyTime = dayjs.duration(dayjs(Date.now()).diff(date1)).format(`H小时m分`);
        setInDutyTime(_inDutyTime);

        if (parseInt(dayjs.duration(dayjs(Date.now()).diff(date1)).format("H")) >= 2) {
            setIsOver2Hours(true);
        }

        const second = setInterval(() => {
            const _inDutyTime = dayjs.duration(dayjs(Date.now()).diff(date1)).format(`H小时m分`);
            setInDutyTime(_inDutyTime);

            if (dayjs(Date.now()).diff(date1, "hours", true) >= 2.17) {
                setIsOver2Hours(true);
                handleClick();
            }
        }, 60 * 1000);

        return () => clearInterval(second);
    }, []);

    return (
        <div className="flex flex-row items-stretch gap-2 border border-blue-600 rounded-lg p-2">
            <Avatar className="max-h-[4rem] max-w-[2.5rem] " username={username} />
            <div className=" flex flex-col flex-1 justify-between">
                <h4 className={` text-sm font-black italic ${isOver2Hours ? " text-red-600" : " text-green-600"}`}>
                    {inDutyTime}
                </h4>

                <Button variant="soft" onClick={() => setOpenConfirmGetOutDialog(true)}>
                    退出
                </Button>
            </div>
            <ConfirmOutDialog username={username} position={position} dutyType={dutyType} />
        </div>
    );
};

const Stand = (props) => {
    const { position, dutyType, setNeedReload } = props;
    const [standData, setStandData] = useState(null);
    const { setOpenSelectUserDialog } = useContext(DialogContext);
    const [selectedPosition, setSelectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [selectedDutyType, setSelectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    useEffect(() => {
        if (dutyType === undefined) {
            fetch(
                server +
                    "/duty?" +
                    new URLSearchParams({
                        position: position,
                    })
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);

                    if (data.error) {
                        setStandData(null);
                    } else {
                        setStandData(data);
                    }
                });
        } else {
            fetch(
                server +
                    "/duty?" +
                    new URLSearchParams({
                        position: position,
                        dutyType: dutyType,
                    })
            )
                .then((res) => res.json())
                .then((data) => {
                    // console.log(data);

                    if (data.error) {
                        setStandData(null);
                    } else {
                        setStandData(data);
                    }
                });
        }
    }, [position, dutyType, setNeedReload]);

    return (
        <div className="flex flex-col items-center border rounded-lg p-1 gap-1 text-center self-stretch">
            <div className="flex flex-row items-center gap-2">
                {dutyType && <h3 className="font-black text-blue-600 text-lg">{dutyType}</h3>}

                <Button
                    style={{ marginTop: "auto" }}
                    onClick={() => {
                        setSelectedPosition(position);
                        setSelectedDutyType(dutyType);
                        setOpenSelectUserDialog(true);
                    }}
                >
                    接班
                </Button>
            </div>
            {standData &&
                standData.map((y, index) => {
                    return (
                        <OneUser
                            username={y.username}
                            inTime={y.inTime}
                            key={index}
                            position={position}
                            dutyType={dutyType}
                        />
                    );
                })}
        </div>
    );
};

const Position = (props) => {
    const { position, dutyType } = props;

    const [needReload, setNeedReload] = React.useState(false);

    return (
        <>
            {position ? (
                <div className="border rounded-lg flex  flex-col items-center gap-2 p-1 self-stretch">
                    <h2 className="font-black text-xl">{position}</h2>
                    <div className="flex flex-row gap-2 p-1">
                        {dutyType !== undefined ? (
                            <>
                                {dutyType.map((x, index) => {
                                    return <Stand position={position} dutyType={x} key={index} />;
                                })}
                            </>
                        ) : (
                            <Stand position={position} />
                        )}
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </>
    );
};

function SimpleMain() {
    const [needReload, setNeedReload] = useState(false);
    const [selectedPosition, setSelectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [selectedDutyType, setSelectedDutyType] = useLocalStorageState("dutyType", { listenStorageChange: true });

    const [openSelectUserDialog, setOpenSelectUserDialog] = useState(false);
    const [openConfirmGetOutDialog, setOpenConfirmGetOutDialog] = useState(false);
    const [openCompareFaceDialog, setOpenCompareFaceDialog] = useState(false);

    useEffect(() => {
        // if (openConfirmGetOutDialog) {
        //     setOpenCompareFaceDialog(true);
        // }
        // if (openCompareFaceDialog) {
        //     setOpenConfirmGetOutDialog(true);
        // }
    }, [openConfirmGetOutDialog, openCompareFaceDialog, setOpenCompareFaceDialog, setOpenConfirmGetOutDialog]);

    return (
        <DialogContext.Provider
            value={{
                needReload: needReload,
                setNeedReload: setNeedReload,

                openSelectUserDialog: openSelectUserDialog,
                setOpenSelectUserDialog: setOpenSelectUserDialog,

                selectedPosition: selectedPosition,
                setSelectedPosition: setSelectedPosition,
                openConfirmGetOutDialog: openConfirmGetOutDialog,
                setOpenConfirmGetOutDialog: setOpenConfirmGetOutDialog,
                openCompareFaceDialog: openCompareFaceDialog,
                setOpenCompareFaceDialog: setOpenCompareFaceDialog,
            }}
        >
            <div>{server}</div>
          
            <div className=" justify-self-center grid  sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  m-auto  place-self-center gap-2 ">
                {Positions.map((x, index) => {
                    return <Position position={x.position} dutyType={x?.dutyType} key={index} />;
                })}
                <SelectUserDialog />
            </div>
        </DialogContext.Provider>
    );
}

export default SimpleMain;
