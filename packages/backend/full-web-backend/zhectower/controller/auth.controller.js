const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { exec, spawn } = require("child_process");
// const facebody20191230 = require("@alicloud/facebody20191230");
// const OpenApi = require("@alicloud/openapi-client");
// const Util = require("@alicloud/tea-util");

async function PostFaceImageToCompareFace(req, res) {
    console.log("compare face");
    const { username, facePhoto } = req.body;
    const cleanBase64ImageFace1 = facePhoto.substring(facePhoto.indexOf(",") + 1);
    const face2 = await findImageAndConvertToBase64(directoryPath, username);
    const cleanBase64ImageFace2 = face2.substring(face2.indexOf(",") + 1);
    const _data = await postToAliyunToCompare(cleanBase64ImageFace1, cleanBase64ImageFace2);

    // await delay(2000); // Wait for 2000 ms
    // res.status(200).json({ body: { data: { confidence: 85 } } });
    // const _data= await postToAliyunToCompare();
    console.log(_data);
    res.status(200).json({ ..._data });
}

const { faceImageDb } = require("../utils/SqliteDb");

async function getUserFaceBase64Image(username, faceDb) {
    const sql = `select base64 from images where username='${username}'`;

    return new Promise((resolve, reject) => {
        faceDb.get(sql, (err, rows) => {
            if (err) {
                console.error(`Error executing SQL query:${sql}`, err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const cleanBase64 = (base64String) => {
    return base64String.replace(/[\n\r\s]/g, ""); // 去除换行符和空格
};
async function PostFaceImageToCompareFace2(req, res) {
    console.log("compare face");
    const username = req.body.username;
    const fromCameraImage = req.body.image;
    console.log(fromCameraImage.slice(0, 50));

    const { base64: userDbFaceBase64Image } = await getUserFaceBase64Image(username, faceImageDb);

    // 使用 spawn 调用 Python 脚本，并通过 stdin 传递 base64 数据
    const pythonProcess = spawn("python", ["D:/GitHub/full-web-backend/zhectower/utils/deepfaceCompare.py"]);
    const data = {
        img1_base64: userDbFaceBase64Image,
        img2_base64: fromCameraImage,
    };

    // 将 JSON 字符串写入 Python 脚本的 stdin
    pythonProcess.stdin.write(JSON.stringify(data)); // 写入 JSON 数据
    pythonProcess.stdin.end(); // 关闭 stdin
    let output = "";

    pythonProcess.stdout.on("data", (data) => {
        console.log(`Output: ${data.toString()}`);
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString()}`);
    });

    // 当 Python 脚本执行完毕时
    pythonProcess.on("close", (code) => {
        if (code === 0) {
            // 如果 Python 脚本成功执行，发送输出结果
            // res.send({ ...output });
            try {
                // Parse the output as JSON
                const result = JSON.parse(output);
                // Send the parsed JSON as the response
                res.send(result);
            } catch (error) {
                // Handle JSON parsing errors
                console.error("Failed to parse Python script output:", error);
                res.status(500).send({ error: "Failed to parse Python script output" });
            }
        } else {
            // 如果 Python 脚本执行失败，发送错误信息
            res.status(500).send({ error: "Python script execution failed", details: output });
        }
    });

    // res.send({ dddd: "test" });
}

async function FindIsWho(req, res) {
    console.log("FindIsWho");
    // const base64Image = req.body.image;
    // console.log(base64Image.slice(0, 50));

    // if (!base64Image) {
    //     return res.status(400).json({ error: "没有接收到 Base64 图片" });
    // }

    // console.log("收到 Base64 图片数据，长度:", base64Image.length);

    // // 调用 Python 脚本
    // const pythonProcess = spawn("python", ["D:/GitHub/full-web-backend/zhectower/utils/deepfaceFind.py"]);

    // let resultData = "";

    // // **将 Base64 发送给 Python**
    // pythonProcess.stdin.write(base64Image);
    // pythonProcess.stdin.end();

    // pythonProcess.stdout.on("data", (data) => {
    //     resultData += data.toString();
    // });

    // pythonProcess.stderr.on("data", (data) => {
    //     console.error(`错误: ${data}`);
    // });

    // pythonProcess.on("close", (code) => {
    //     console.log(`Python 进程退出，代码 ${code}`);
    //     try {
    //         // const resultJSON = JSON.parse(resultData); // 解析 Python 返回的 JSON
    //         console.log(resultData);

    //         // res.json(resultJSON);
    //     } catch (err) {
    //         console.log("解析失败");

    //         console.log(err);

    //         // res.status(500).json({ error: "解析失败" });
    //     }
    // });

    res.send({ dddd: "test" });
}

class Client {
    /**
     * 使用AK&SK初始化账号Client
     * @return Client
     * @throws Exception
     */
    static createClient() {
        // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考。
        // 建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html。

        // 从环境变量读取配置的AccessKey ID和AccessKey Secret。运行示例前必须先配置环境变量。
        const accessKeyId = "LTAI5tMuLVViqmku7nuaRGSe";
        const accessKeySecret = "PEzQkAj92eiXisvV00wxP2fd33TPLZ";

        let config = new OpenApi.Config({
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
            // accessKeyId: process.env["ALIBABA_CLOUD_ACCESS_KEY_ID"],
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
            // accessKeySecret: process.env["ALIBABA_CLOUD_ACCESS_KEY_SECRET"],
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
        });

        // Endpoint 请参考 https://api.aliyun.com/product/facebody
        config.endpoint = `facebody.cn-shanghai.aliyuncs.com`;
        return new facebody20191230.default(config);
    }
}

async function aliyunFaceCompare(req, res) {
    if (!req.body.image || !req.body.username) {
        res.send({
            code: 400,
            msg: "参数错误",
        });
        return;
    }
    let client = Client.createClient();
    const fromCameraImage = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
    const { base64 } = await getUserFaceBase64Image(req.body.username, faceImageDb);
    const _pureUserDbFaceBase64Image = base64.replace(/^data:image\/jpeg;base64,/, "");

    let compareFaceRequest = new facebody20191230.CompareFaceRequest({
        imageDataA: fromCameraImage,
        imageDataB: _pureUserDbFaceBase64Image,
    });
    let runtime = new Util.RuntimeOptions({});
    try {
        // 复制代码运行请自行打印 API 的返回值
        const result = await client.compareFaceWithOptions(compareFaceRequest, runtime);
        //    console.log(JSON.stringify(result));
        res.send(result);
    } catch (error) {
        // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
        // 错误 message
        console.log("errorerrorerrorerrorerror");
        console.log(error.message);
        // 诊断地址
        console.log(error);
        Util.default.assertAsString(error.message);
        res.send(error);
    }
}

module.exports = {
    PostFaceImageToCompareFace,
    PostFaceImageToCompareFace2,
    FindIsWho,
    aliyunFaceCompare,

    // uploadMiddleware: upload.fields([
    //     { name: "file1", maxCount: 1 },
    //     { name: "file2", maxCount: 1 },
    // ]),
    // uploadFiles,
};
