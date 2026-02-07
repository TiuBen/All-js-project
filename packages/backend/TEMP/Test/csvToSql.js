const csvFilePath = "/Users/HJW-AMD-PRP/Desktop/test.csv"

const fs = require("fs");

const csv = require('csv-parser')

const moment = require('moment');

const db = require('../V2-api/models/index.js');
const QuotationTable = db.quotation;

var results = [];
exports.testCsvToSql = (params) => {
    fs.createReadStream(csvFilePath)
        .pipe(csv({ separator: ',' }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // console.log(results);
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                console.log("++++++++++++++++++++++++++++++");
                console.log(element);

                console.log("++++++++++++++++++++++++++++++");

                QuotationTable.create({
                    itemName: element.itemName,
                    supplierName: element.supplierName,
                    neederName: element.neederName,
                    specification: element.specification,
                    itemDetail: element.itemDetail,
                    getPrice: parseFloat(element.getPrice),
                    salePrice: parseFloat(element.salePrice),
                    quotationStaff: element.quotationStaff,
                    quotationTime: moment(element.quotationTime, "YYYY/M/D").toDate(),
                    targetProfit: element.targetProfit,
                    reviewOpinion: `${element.reviewOpinion1} ; ${element.reviewOpinion2} ; ${element.reviewOpinion3}`,
                    supplement: element.supplement
                })
                    .then((data) => {
                        console.log(data);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

        });
}

// {
//     id: '1',
//     itemName: '风扇',
//     supplierName: '鼎道工厂',
//     neederName: '天磁',
//     specification: '4028',
//     itemDetail: 'AGV04028B12V-F.PWM',
//     getPrice: '18.87',
//     salePrice: '19.8',
//     quotationStaff: '张明圆',
//     quotationTime: '2022/10/31 星期一',
//     targetProfit: '0.0493',
//     reviewOpinion1: '王娟娟',
//     reviewOpinion2: '吴莉11--1',
//     reviewOpinion3: '罗旭航11-1',
//     supplement: ''
//   }
//   {
//     id: '2',
//     itemName: '风扇',
//     supplierName: '鼎道工厂',
//     neederName: '天磁',
//     specification: '8025',
//     itemDetail: 'DD80DSVH-012',
//     getPrice: '12.35',
//     salePrice: '12.95',
//     quotationStaff: '张明圆',
//     quotationTime: '2022/11/2 星期三',
//     targetProfit: '0.0486',
//     reviewOpinion1: '王娟娟',
//     reviewOpinion2: '吴莉11-4',
//     reviewOpinion3: '罗旭航11-2',
//     supplement: ''
//   }