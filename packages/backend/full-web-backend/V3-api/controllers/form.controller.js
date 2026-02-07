const {db} = require("../models");
const FormTemplateTable = db.formTemplate;
const FormTable = db.form;
const Upload = require("../utils/SaveFile").Upload;
const jwt = require("jsonwebtoken");
const { Salt } = require("../../V2-api/config/CONST");
// ** 说明
// ** 这个文件处理两个事情
// ** 1:CRUD 表单模版
// ** 2:存储每次提交的表单
// **

// ! 这部分处理 表单模板
// ! 表单之间要关联 因为 有 审批模版 进度模版
exports.createOneFormTemplate = async (req, res) => {
    try {
        const { name, template, record } = req.body;
        const createdFormTemplate = await FormTemplateTable.create({ name, template, record });

        res.status(201).json(createdFormTemplate);
    } catch (error) {
        console.error("Error creating form template:", error);
        res.status(500).json({ error: "Failed to create form template" });
    }
};
exports.updateOneFormTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, template, record } = req.body;

        const [affectedRows] = await FormTemplateTable.update(
            { name, template, record },
            {
                where: { id },
            }
        );

        if (affectedRows === 0) {
            return res.status(404).json({ error: "Form template not found" });
        }

        res.status(200).json({ message: "Form template updated successfully" });
    } catch (error) {
        console.error("Error updating form template:", error);
        res.status(500).json({ error: "Failed to update form template" });
    }
};
exports.findOneFormTemplateByName = async (req, res) => {
    try {
        const { name } = req.params;
        const formTemplate = await db.formTemplate.findOne({ where: { name } });

        if (!formTemplate) {
            return res.status(404).json({ error: "Form template not found" });
        }

        res.status(200).json(formTemplate);
    } catch (error) {
        console.error("Error finding form template:", error);
        res.status(500).json({ error: "Failed to find form template" });
    }
};

// ! 这部分和具体的表单数据相关
// ! 除了数据部分 还有 文件/图片 这些资源该怎么处理
// ** 用multer处理 它会提供两部分
// ** [Object: null prototype] { name: 'dddd', password: 'fdsafdfa' }
// ** [Object: null prototype] {
// **   attachment: [
// **     {
// **       fieldname: 'attachment',
// **       originalname: 'ss.pdf',
// **       encoding: '7bit',
// **       mimetype: 'application/pdf',
// **       destination: 'C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public/2023-7-21',
// **       filename: 'ss.pdf',
// **       path: 'C:\\Users\\HJW-AMD-PRP\\Documents\\GitHub\\FullCompanyWeb\\back-end\\public\\2023-7-21\\ss.pdf',
// **       size: 93213
// **     }
// **   ]
// ** }

// ** <a href="/path/to/your/receipt.pdf">Download Receipt</a>
// **  <img src="/images/myw3schoolsimage.jpg" alt="W3Schools"></img>
// **  <object data="https://example.com/document.pdf" type="application/pdf">
// **   <p>Your browser does not support PDFs.</p>
// ** </object>
// ** <iframe src="https://example.com/embedded-content"></iframe>
// ** <link rel="stylesheet" href="https://example.com/style.css">
// ** <audio controls>
// **   <source src="https://example.com/audio.mp3" type="audio/mpeg">
// **   Your browser does not support the audio element.
// ** </audio>
// ** <video controls>
// **   <source src="https://example.com/video.mp4" type="video/mp4">
// **   Your browser does not support the video tag.
// ** </video>

// 如何方便后端查找到保存的文件 比如保存在 /姓名/image/2022-12-23/1.png 这个目录下面
// 比如返回的具体表单数据
//     {
//   *      id:"12312412345",这个应该是自动生成的
//   *      formUID:"这应该是关联的表单模版",
//   *      creator:"沈宁",
//   *      creator:"沈宁",
//          createTime:"2023-12-23",
//   *      img:["/沈宁/img/照片1.jpg","/沈宁/img/照片2.jpg","/沈宁/img/照片3.jpg"]
//   ?      relatedFormsUID:[],

//     }
//  这样前端访问的时候就用 "76a9b9a1f8f8.jpg"
//  然后 后端 解析 这串字符串 来直接获取文件

exports.createOneFormData = async (req, res) => {
    console.log("createOneFormData");
    console.log(req.files);
    console.log(req.body);
    console.log("query" + JSON.stringify(req.query));
    console.log("params" + JSON.stringify(req.params));

    try {
        var formJsonData = { ...req.body };
        // @STEP 如果有保存的文件,进行合并存入到formJson 中
        if (req.files) {
            if (req.files.attachment) {
                formJsonData.attachment = [];
                req.files.attachment.forEach((file) => {
                    var folder = file.destination.split("/")[file.destination.split("/").length - 1];
                    console.log(folder + "/" + file.filename);
                    formJsonData.attachment.push(folder + "/" + file.filename);
                });
            }
        }
        console.log(formJsonData);
        // @STEP 从token中提取信息,当做log record
        // const token = req.headers.authorization.split(" ")[1];
        // console.log(token);
        // var user = undefined;
        // jwt.verify(token, Salt, (err, decoded) => {
        //     if (err) {
        //         console.error("Error verifying token:", err.message);
        //         return;
        //     }

        //     // *The decoded object contains the data from the JWT payload
        //     console.log("Decoded Data:", decoded);
        //     user = decoded.name;
        //     console.log(user);
        //     formJsonData.username = user;
        // });
        // @STEP 这里是数据库的部分
        // * 保存formJsonData
        try {
            const createdForm = await FormTable.create({ data: formJsonData });
            res.status(201).json(createdForm);
        } catch (error) {
            console.error("Error creating form template:", error);
            res.status(500).json({ error: "Failed to create form template" });
        }
    } catch (error) {
        console.log(error);
    }
};
exports.findOneFormData = async (req, res) => {
    console.log(req.params);
    try {
        const allItems = await FormTable.findAll();
        return res.json(allItems);
    } catch (error) {
        return res.status(500).json({ error: "Error fetching 报销 records" });
    }
};
exports.updateOneFormData = async (req, res) => {};
exports.deleteOneFormData = async (req, res) => {};
