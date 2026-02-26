const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes, Model } = require("sequelize");
const fs = require("fs");

const app = express();
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MARK 导入辅助函数
const { getAnswers, ans1path } = require("./utils/answerToDb");
const { readDirPathSaveToDB } = require("./utils/readDirPathSaveToDB");
const { writeDbToCSV } = require("./utils/writeDbToCSV");
const { readEngAnsToDb } = require("./utils/readEngAnsToDb");
const { RawQuestionFilesDir, RawEngSelectionAnswerFile, pureQModel, SECTIONS } = require("./utils/CONST");

// MARK 导入辅助函数

const sequelize = new Sequelize("atctiku2", "root", "root1234", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    timezone: "+08:00",
    logging: false,
    query: { raw: true },
});

(() => {
    console.log("");
    SECTIONS.forEach((s) => {
        sequelize.define(s, pureQModel, {
            timestamps: false,
            freezeTableName: true,
        });
    });
})();

function getTable(sectionName) {
    if (sectionName) {
        return sequelize.models[sectionName];
    } else {
        return null;
    }
}

// (async () => {
//     await sequelize.sync();
// })();

//
app.get("/tiku", async (req, res) => {
    try {
        console.log("query:");
        console.log(req.query);
        // ! get the q elements from the database
        if (req.query?.pageIndex) {
            //MARK 默认 从第一页选5个
            const { section, pageIndex = 0, count = 5 } = req.query;
            console.log(section, pageIndex, count);
            // console.log(req);
            const neededTable = getTable(section);
            if (neededTable) {
                const test = await neededTable.findAndCountAll({
                    where: {
                        comment: {
                            [Sequelize.Op.gte]: 1,
                        },
                    },

                    offset: parseInt(pageIndex) * parseInt(count),
                    limit: parseInt(count),
                    order: [["id", "ASC"]],
                });

                res.send(test);
            } else {
                res.send("好像出了点问题");
            }
        }
        // ! get the specific q element
        if (req.query?.qId && req.query?.section) {
            const neededTable2 = getTable(req.query?.section);
            if (neededTable2) {
                const qElement = await neededTable2.findOne({
                    where: {
                        qId: req.query.qId,
                    },
                });
                if (qElement) {
                    res.send(qElement);
                } else {
                    res.send("好像出了点问题");
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
});

app.post("/tiku", async (req, res) => {
    try {
        console.log(req.body);
        // ! get the specific q element
        if (req.body?.section && req.body?.qId) {
            const neededTable = getTable(req.body.section);
            if (neededTable) {
                const qElement = await neededTable.update(
                    { ...req.body },
                    {
                        where: {
                            qId: req.body.qId,
                        },
                    }
                );
                if (qElement) {
                    console.log(qElement);
                    res.send(qElement);
                } else {
                    res.send("好像出了点问题");
                }
            }
        }
        // res.send("success");
    } catch (error) {
        console.log(error);
    }
});

var allAnswer = null;

app.post("/ans", async (req, res) => {
    console.log("后端处理答案");
    if (allAnswer === null) {
        console.log("allAnswer===nul");
        allAnswer = await getAnswers(ans1path);
    } else {
        console.log("allAnswer!!!===nul");
    }
    console.log('allAnswer["10101004"]:' + allAnswer["10101004"]);

    if (req.query?.section) {
        const dbTable = getTable(req.query.section);
        if (dbTable) {
            const allQElements = await dbTable.findAll();
            if (allQElements) {
                allQElements.forEach(async (qElement) => {
                    await dbTable.update({ rightAns: allAnswer[qElement.qId] }, { where: { qId: qElement.qId } });
                    // const qId = qElement.qId;
                    // const answer = allAnswer[qId];
                    // qElement.rightAns=answer;
                    // await qElement.save();
                });
            }
        }
    }

    // console.log("aa");
    // console.log(aa);
    // res.send(aa);
});

app.post("/ans2", async (req, res) => {
    console.log("把数据库内容转化为CSV格式");
    let oneSectionQElementsTxt = "";

    if (req.query?.section) {
        const dbTable = getTable(req.query.section);
        if (dbTable) {
            const allQElements = await dbTable.findAll();
            if (allQElements) {
                allQElements.forEach((q) => {
                    oneSectionQElementsTxt =
                        oneSectionQElementsTxt +
                        q.num +
                        "#" +
                        q.qId +
                        "#" +
                        q.rawNum +
                        "#" +
                        q.txt +
                        "#" +
                        q.A +
                        "#" +
                        q.B +
                        "#" +
                        q.C +
                        "#" +
                        q.D +
                        "#" +
                        q.rightAns +
                        "\n";
                    // oneSectionQElementsTxt +
                    // q.num +"\n" +
                    // q.qId +"\n" +
                    // q.rawNum +"\n" +
                    // q.txt +"\n"
                    // +"A."+q.A +"\n"
                    // +"B."+q.B +"\n"
                    // +"C."+q.C +"\n";
                    // oneSectionQElementsTxt +

                    // q.rawNum +"\n" +
                    // q.txt +"\n"
                    // +"A."+q.A +"\n"
                    // +"B."+q.B +"\n"
                    // +"C."+q.C +"\n"
                    // +"D."+q.D +"\n"
                    // +"\n";
                });
            }
        }
        try {
            await fs.writeFile(
                `C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/test/${req.query.section}.txt`,
                oneSectionQElementsTxt,
                function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                }
            );
            res.send("success");
        } catch (err) {
            console.log(err);
        }
    }
});

app.use("/mod", async (req, res) => {
    console.log("修改错题记录");
    try {
        // ! get the q elements from the database
        const { qId = 0, sub = "", action } = req.body;
        const neededTable = getTable(sub);
        if (neededTable) {
            const oneQuestion = await neededTable.findOne({
                where: {
                    qId: qId,
                },
                raw: false,
            });
            console.log(oneQuestion.dataValues);
            if (oneQuestion) {
                if (action === "AddToWrong") {
                    console.log(oneQuestion.comment);
                    if (oneQuestion.comment) {
                        oneQuestion.comment = parseInt(oneQuestion.comment) + 1;
                    } else {
                        oneQuestion.comment = 1;
                    }
                    await oneQuestion.save();
                    console.log("错题+1");

                    res.send(oneQuestion);
                }
                if (action === "RemoveFromWrong") {
                    console.log(oneQuestion.comment);
                    oneQuestion.comment = 0;
                    await oneQuestion.save();
                    console.log("错题-1");
                    res.send(oneQuestion);
                }
            } else {
                res.send("好像出了点问题");
            }
        } else {
            res.send("好像出了点问题");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.use(express.static("public"));

app.use("/", async (req, res) => {
    console.log(req.body);
    const ACTION = req.body.action;
    console.log(ACTION);
    switch (ACTION) {
        case "READ_FILE_SAVE_TO_DB":
            readDirPathSaveToDB(RawQuestionFilesDir);
            break;
        case "WRITE_DB_TO_CSV":
            SECTIONS.forEach((s) => {
                writeDbToCSV(s);
            });
            break;
        case "READ_ENGLISH_ANS_TO_DB":
            readEngAnsToDb(RawEngSelectionAnswerFile);
            break;
        default:
            break;
    }
    res.send("OK");
});

const port = 3103;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
