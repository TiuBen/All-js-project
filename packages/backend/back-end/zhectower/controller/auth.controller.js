const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FacebodyClient = require("@alicloud/facebody20191230");
const OpenapiClient = require("@alicloud/openapi-client");
const TeaUtil = require("@alicloud/tea-util");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

// 从文件夹里面获取人脸图片
const findImageAndConvertToBase64  = (directory, baseName) => {
    return new Promise((resolve, reject) => {
        try {
          const files = fs.readdirSync(directory);
    
          for (const file of files) {
            // Get the file name without extension
            const fileBaseName = path.basename(file, path.extname(file));
            
            // Check if the base name matches (case-insensitive)
            if (fileBaseName.toLowerCase() === baseName.toLowerCase()) {
              const filePath = path.join(directory, file);
              
              // Read the file and convert to base64
              fs.readFile(filePath, (err, data) => {
                if (err) {
                  return reject(`Error reading file: ${err.message}`);
                }
                const base64Image = data.toString('base64');
                resolve(base64Image);
              });
    
              return; // Exit after finding the file
            }
          }
    
          // File not found
          resolve(null);
        } catch (err) {
          reject(`Error reading directory: ${err.message}`);
        }
      });
  };

const directoryPath="./public/日常照片";

// const searchFileName = '沈宁'; // Change this to the file you are searching for

// findImageAndConvertToBase64(directoryPath, searchFileName)
//   .then(base64 => {
//     if (base64) {
//       console.log(`Base64 representation:\n${base64}`);
//     } else {
//       console.log('File not found.');
//     }
//   })
//   .catch(err => {
//     console.error(err);
//   });



/*
 * 对比人脸数据库，获取是谁
 */
let config = new OpenapiClient.Config({
    // 创建AccessKey ID和AccessKey Secret，请参考https://help.aliyun.com/document_detail/175144.html。
    // 如果您用的是RAM用户AccessKey，还需要为RAM用户授予权限AliyunVIAPIFullAccess，请参考https://help.aliyun.com/document_detail/145025.html。
    // 从环境变量读取配置的AccessKey ID和AccessKey Secret。运行示例前必须先配置环境变量。
    //     accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    //     accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    accessKeyId: "LTAI5tMuLVViqmku7nuaRGSe",
    accessKeySecret: "PEzQkAj92eiXisvV00wxP2fd33TPLZ",
});
// 访问的域名
config.endpoint = `facebody.cn-shanghai.aliyuncs.com`;

const client = new FacebodyClient.default(config);

async function postToAliyunToCompare(faceA,face2) {
    try {
        let compareFaceRequest = new FacebodyClient.CompareFaceAdvanceRequest();

        compareFaceRequest.imageDataA =faceA;
        compareFaceRequest.imageDataB =face2;
        let runtime = new TeaUtil.RuntimeOptions({});

        try {
            // 复制代码运行请自行打印 API 的返回值
            const _test = await client.compareFaceWithOptions(compareFaceRequest, runtime);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++");
            // console.log(_test);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++");
            return _test;
        } catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            // 诊断地址
            console.log(error.data["Recommend"]);
            TeaUtil.default.assertAsString(error.message);
        }
    } catch (error) {
        console.log(error);
    }
}

// function _getUserPhotoBase64(username) {
//     // Read the file and convert to Base64
//     const filePath = path.join(__dirname, req.file.path);
//     fs.readFile(filePath, (err, data) => {
//         if (err) {
//             return res.status(500).send("Error reading file.");
//         }

//         // Convert the image data to Base64
//         const base64Image = Buffer.from(data).toString("base64");
//     });
// }

async function PostFaceImageToCompareFace(req, res) {
    console.log("compare face");
  
    // console.log(req.body);
    const {username,facePhoto}=req.body;
    const cleanBase64ImageFace1 = facePhoto.substring(facePhoto.indexOf(',') + 1);
    const face2= await findImageAndConvertToBase64(directoryPath,username);
    const cleanBase64ImageFace2 = face2.substring(face2.indexOf(',') + 1);
    const _data= await postToAliyunToCompare(cleanBase64ImageFace1,cleanBase64ImageFace2);

  
    // await delay(2000); // Wait for 2000 ms
    // res.status(200).json({ body: { data: { confidence: 85 } } });
    // const _data= await postToAliyunToCompare();
    console.log(_data);
    res.status(200).json({..._data});
}

module.exports = {
    PostFaceImageToCompareFace,
};
