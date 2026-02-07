const {db} = require('../../V2-api/models/index.js');
const QuotationTable = db.quotation;

exports.createOne = (req, res) => {
    console.log("+++++++++创建 报价单++++++++++++++++++");
    if (!req.body) {
        res.status(400).send({
            message: "创建报价单失败",
        });
        return;
    }
    const _quotation = {
        rawData: req.body
    }

    QuotationTable.create(_quotation)
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Quotation.",
            });
        });
};


exports.findAll = async (req, res) => {
    // 先要获取公司名称
    console.log("+++++++++查询 所有 报价单++++++++++++++++++++");
    console.log(req.path.split("/"));

    if (!req.path) {
        res.status(400).send({
            message: "查询供应商失败",
        });
        return;
    }
    const _companyName = req.path.split("/")[1];
    console.log(_companyName);
    const _q = await QuotationTable.findAll();


    res.status(200).send(_q);

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

