import React, { useState, useEffect } from "react";
import { server } from "../../../../lib/CONST";
import { useLocalStorageState } from "ahooks";
import { Button, Dialog } from "@radix-ui/themes";

const PostObjects = ({ objects }) => {
    const [currentIndex, setCurrentIndex] = useState(0); // Keeps track of the current object being posted
    const [isPosting, setIsPosting] = useState(false); // Track whether posting is in progress
    const [progress, setProgress] = useState(0); // Track the progress percentage (0-100)

    // This function simulates an API call to post an object
    const postObject = async (object) => {
        console.log("Posting object:", object);
        try {
            // Replace this with your actual API call
            // await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
            // return true; // Simulating a successful post

            fetch(server + "/test", {
                method: "POST",
                body: JSON.stringify(object),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json()) // Parse the response as JSON
                .then((data) => {
                    // Handle the response data here
                    console.log("Object posted successfully:", data);
                    return data;
                });
        } catch (error) {
            console.error("Error posting object:", error);
            return false;
        }
    };

    useEffect(() => {
        if (currentIndex >= objects.length) {
            setIsPosting(false);
            return;
        }

        const postNextObject = async () => {
            setIsPosting(true);
            const currentObject = objects[currentIndex];
            const success = await postObject(currentObject);

            if (success) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);

                // Update progress
                const newProgress = Math.round((nextIndex / objects.length) * 100);
                setProgress(newProgress);
            }
        };

        // Start posting the objects one by one when component mounts or when currentIndex changes
        if (isPosting) {
            postNextObject();
        }
    }, [currentIndex, isPosting, objects]);

    const startPosting = () => {
        console.log("Start Posting");
        setCurrentIndex(0); // Reset to the first object
        setIsPosting(true); // Begin posting
        setProgress(0); // Reset progress
    };

    return (
        <div>
            <Button className="border rounded-sm " disabled={!objects.length>0 || isPosting} onClick={startPosting} >
                开始上传离线数据
            </Button>
            {/* {objects.length > 0 ? (
                <div>
                    {isPosting ? (
                        <div>
                            <p>
                                Posting object {currentIndex + 1} of {objects.length}...
                            </p>
                            <p>Progress: {progress}%</p>
                            <div style={{ width: "100%", height: "20px", backgroundColor: "#ccc" }}>
                                <div
                                    style={{
                                        width: `${progress}%`,
                                        height: "100%",
                                        backgroundColor: "#4caf50",
                                    }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <h2>所有离线数据已经上传完毕</h2>
                    )}
                </div>
            ) : (
                <p>无离线数据需要上传</p>
            )} */}
        </div>
    );
};

export default PostObjects;
