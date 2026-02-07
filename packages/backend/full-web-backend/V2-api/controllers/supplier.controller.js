// const mysql = require("mysql2");
// const connectionString=require("../config/connectionString");
// (()=>{console.info("测试连接字符串");console.log(connectionString)})();

// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "root1234",
//     port: "3306",
//     database: "supplier",
//     charset: "utf8",
// });


const testSupplier={
    "name": "先团平状温需规处造确万小三。",
    "address": "西南上海白山市米林县",
    "category": "许,例,适,风",
    "detail": "图对做工开说又从斯行通区反头观。使达道长小比变运统七五较准。行般文运酸米万我风流而管么斯识间先验。车展响布断革议表起么化前。百明石往反五水集示少间全治包开意。三相几发个第事习得置新品经情些究特构。每可写或般见近每非日清民般物。",
    "staff": [
        {
            "name": "余桂英",
            "contact": [
                {
                    "type": "电话",
                    "content": "375248160911034061"
                }
            ]
        }
    ]
}



// create and save a new worker
exports.TESTCONNECTION = (req,res) => {
    console.log("***TEST CONNECTION***");
    // connection.query("SELECT * FROM testjson;", function (error, results, fields) {
    //     console.log(error);
    //     console.log(JSON.stringify(results, null, 4));
    //     console.log(fields);
    // });

    console.log("params");
    console.log(req.params);
    console.log("path");
    console.log(req.path);

    res.status(400).send({
        message:"dddddd"
    })
};


const {db} = require('../models/index');
const SupplierTable=db.supplier;

exports.createOne = (req, res) => {
    console.log("+++++++++CREATE one++++++++++++++++++");
    if (!req.body) {
        res.status(400).send({
            message: "新建供应商失败",
        });
        return;
    }
    const _supplier={
        rawData:req.body
    }

    SupplierTable.create(_supplier)
    .then((data) => {
        res.status(200).send(data);
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Worker.",
        });
    });
};


exports.findAll = (req, res) => {
    // 先要获取公司名称
    console.log("+++++++++查询供应商++++++++++++++++++++");
    console.log(req.path.split("/"));

    if (!req.path) {
        res.status(400).send({
            message: "查询供应商失败",
        });
        return;
    }
    const _companyName = req.path.split("/")[1];
    SupplierTable.findAll({
        where:{
            company:_companyName
        }
    }).then((data) => {
        res.status(200).send(data);
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Worker.",
        });
    });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

};

exports.update = (req, res) => {
    const id = req.params.id;

   
};

exports.delete = (req, res) => {
    const id = req.params.id;
};

exports.deleteAll = (req, res) => {
 
};




// const _value= JSON.stringify(req.body, null, 4)
// connection.query(
//     `INSERT INTO testjson VALUES (?)`,_value,
//     function (error, results, fields) {
//         console.log(error);
//         if(error){
//             res.status(400).send(error);
//             return;
//         }
//         if (results) {
//             res.status(200).send({...results,...req.body});
//             return;
//         }
        
//         console.log(fields);
//     }
// );