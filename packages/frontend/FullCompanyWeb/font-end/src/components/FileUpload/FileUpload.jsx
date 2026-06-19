import React, { useState } from "react";
import http from "../../utils/axiosHelper";

const fileTypes = [
    "image/png",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    `image/x-icon`,
];
function validFileType(file) {
    return fileTypes.includes(file.type);
}

function returnFileSize(number) {
    if (number < 1024) {
        return number + "bytes";
    } else if (number > 1024 && number < 1048576) {
        return (number / 1024).toFixed(1) + "KB";
    } else if (number > 1048576) {
        return (number / 1048576).toFixed(1) + "MB";
    }
}

export default function FileUpload() {
    const [file, setFile] = useState(null);

    return (
        <div>
            <form method="post" encType="multipart/form-data">
                <div>
                    <label htmlFor="image_uploads">Choose images to upload (PNG, JPG)</label>
                    <input
                        type="file"
                        id="image_uploads"
                        className="image_uploads"
                        accept={(fileTypes[0]+fileTypes[1]+fileTypes[2])}
                        multiple
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(e.target.files[0]);
                            setFile(e.target.files[0]);
                        }}
                    />
                </div>
                <div className="preview">
                    <p>No files currently selected for upload</p>
                </div>
                <div>
                    <button
                        disabled={file === null}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const formData = new FormData();
                            formData.append("avatar", file);
                            fetch("http://localhost:3100/upload", {
                                method: "POST",
                                body: formData,
                            })
                                .then((response) => response.json())
                                .then((result) => {
                                    console.log("Success:", result);
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                });
                        }}
                    >
                        Submit
                    </button>
                </div>
            </form>
            <button
                onClick={(e) => {
                    console.log("dfsafd");
                    fetch("http://localhost:3100/test", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((response) => response.json())
                        .then((result) => {
                            console.log("Success:", result);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });

                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                test
            </button>
            <br />
            <button
                onClick={(e) => {
                    console.log("test222");
                    fetch("http://localhost:3100/upload", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body:JSON.stringify({"POST":"POST"})
                    })
                        .then((response) => {
                            return response.json();
                        })
                        .then((result) => {
                            console.log("Success:");
                            console.log( result);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });

                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
              POST   upload
            </button>
        </div>
    );
}
