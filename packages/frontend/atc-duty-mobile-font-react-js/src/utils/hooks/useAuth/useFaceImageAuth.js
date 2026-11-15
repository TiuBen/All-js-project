import { useState, useEffect, useContext } from "react";
import { server } from "../../../lib/CONST";

const useFaceImageAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);

    const authenticateFaceImage = async (imageData, secondFetchPayload) => {
        const { username, selectedPosition, selectedDutyType } = secondFetchPayload;
        console.log(imageData);

        console.log(secondFetchPayload);

        // setLoading(true);
        // setError(null);

        // const formData = new FormData();
        // formData.append("image", imageData);

        // try {
        //     fetch(server + "/auth/face", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             username: username,
        //             facePhoto: imageData,
        //         }),
        //     })
        //         .then((response) => response.json())
        //         .then((result) => {
        //             console.log("阿里云 返回数据");
        //             console.log(result);
        //             if (result?.body?.data?.confidence > 61) {
        //                 console.log("识别成功");
        //                 console.log(result.body.data.confidence);
        //                 //! another fetch
        //                 return fetch(server + "/duty", {
        //                     method: "POST",
        //                     headers: {
        //                         "Content-Type": "application/json",
        //                     },
        //                     body: JSON.stringify({
        //                         username: username,
        //                         position: selectedPosition,
        //                         dutyType: selectedDutyType,
        //                     }),
        //                 })
        //                     .then((res) => res.json())
        //                     .then((data) => {
                               
        //                         setResponseData(data);
        //                     });

                     
        //             } else {
        //                 setError("识别失败");
        //             }
        //         });
        // } catch (err) {
        //     setError(err.message);
        // } finally {
        //     setLoading(false);
        // }
    };

    return { authenticateFaceImage, loading, error, responseData };
};

export default useFaceImageAuth;
