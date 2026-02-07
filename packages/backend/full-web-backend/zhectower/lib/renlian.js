// const FacebodyClient = require("@alicloud/facebody20191230");
// const OpenapiClient = require("@alicloud/openapi-client");
// const TeaUtil = require("@alicloud/tea-util");
// const fs = require("fs");
// const http = require("http");
// const https = require("https");

// /*
//  * 对比人脸数据库，获取是谁
//  */
// let config = new OpenapiClient.Config({
//     // 创建AccessKey ID和AccessKey Secret，请参考https://help.aliyun.com/document_detail/175144.html。
//     // 如果您用的是RAM用户AccessKey，还需要为RAM用户授予权限AliyunVIAPIFullAccess，请参考https://help.aliyun.com/document_detail/145025.html。
//     // 从环境变量读取配置的AccessKey ID和AccessKey Secret。运行示例前必须先配置环境变量。
//     //     accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
//     //     accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,

// });
// // 访问的域名
// config.endpoint = `facebody.cn-shanghai.aliyuncs.com`;

// const client = new FacebodyClient.default(config);
// const getResponse = function (httpClient, url) {
//     return new Promise((resolve, reject) => {
//         httpClient.get(url, function (response) {
//             resolve(response);
//         });
//     });
// };

// const request = (async function () {
//     try {

//         let compareFaceRequest = new FacebodyClient.CompareFaceRequest({
//             imageDataA: '32131231',
//             imageDataB: '1231231231231',
//           });
//           let runtime = new Util.RuntimeOptions({ });
//           try {
//             // 复制代码运行请自行打印 API 的返回值
//             await client.compareFaceWithOptions(compareFaceRequest, runtime);
//           } catch (error) {
//             // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
//             // 错误 message
//             console.log(error.message);
//             // 诊断地址
//             console.log(error.data["Recommend"]);
//             Util.default.assertAsString(error.message);
//           }

//     } catch (error) {
//         console.log(error);
//     }
// })();

// ! this part use python deepface to compare face

const { exec } = require("child_process");
const fs = require("fs");

const compareFace = (image1, image2, username) => {
    // console.log("compareFace called with:", image1, image2);
    const base64Data1 = image1.replace(/^data:image\/jpeg;base64,/, "");
     // 将 Base64 转换为 Buffer
     const image1Buffer = Buffer.from(base64Data1, "base64");
    fs.writeFileSync(`${username}img1.jpeg`, image1Buffer);

    const base64Data2 = image2.replace(/^data:image\/jpeg;base64,/, "");
     // 将 Base64 转换为 Buffer
     const image2Buffer = Buffer.from(base64Data2, "base64");
    fs.writeFileSync(`${username}img2.jpeg`, image2Buffer);

    console.log(`python ./utils/deepfaceCompare.py ${username}img1.jpeg ${username}img2.jpeg`);
    

    return new Promise((resolve, reject) => {
        exec(`python ./utils/deepfaceCompare.py 沈宁img1.jpeg 沈宁img2.jpeg`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                reject(err);
                return;
            }

            // 将 Python 脚本的输出（JSON）发送回客户端
            try {
                const data = stdout;
                resolve(data); // 返回 JSON 数据
            } catch (e) {
                console.error("Error parsing JSON:", e);
                reject(e);
            }
        });

        // exec("python ./utils/deepfaceCompare.py", (err, stdout, stderr) => {
        //     if (err) {
        //         console.error(`exec error: ${err}`);
        //         reject(err);
        //         return;
        //     }

        //     // 将 Python 脚本的输出（JSON）发送回客户端
        //     try {
        //         const data = JSON.parse(stdout);
        //         resolve(data); // 返回 JSON 数据
        //     } catch (e) {
        //         console.error("Error parsing JSON:", e);
        //         reject(e);
        //     }
        // });
    });
};

module.exports = { compareFace };
