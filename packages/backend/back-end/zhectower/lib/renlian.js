const FacebodyClient = require("@alicloud/facebody20191230");
const OpenapiClient = require("@alicloud/openapi-client");
const TeaUtil = require("@alicloud/tea-util");
const fs = require("fs");
const http = require("http");
const https = require("https");


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
const getResponse = function (httpClient, url) {
    return new Promise((resolve, reject) => {
        httpClient.get(url, function (response) {
            resolve(response);
        });
    });
};


const request = (async function () {
    try {
      
        let compareFaceRequest = new FacebodyClient.CompareFaceRequest({
            imageDataA: '32131231',
            imageDataB: '1231231231231',
          });
          let runtime = new Util.RuntimeOptions({ });
          try {
            // 复制代码运行请自行打印 API 的返回值
            await client.compareFaceWithOptions(compareFaceRequest, runtime);
          } catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            // 诊断地址
            console.log(error.data["Recommend"]);
            Util.default.assertAsString(error.message);
          }    


    } catch (error) {
        console.log(error);
    }
})();
