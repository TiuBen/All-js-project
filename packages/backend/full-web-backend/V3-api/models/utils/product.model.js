// 一个商品该有的数据
// uuid
// name
// 简介
// 详细
// 所属公司
// 图片或者pdf说明书
// 价格
// 该条目的创建者

const { DataTypes } = require("sequelize");

const Product = sequelize.define("Product", {
    // 主键，自动生成唯一的 UUID
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    //     产品编号（Product SKU）：产品的唯一标识符，用于跟踪和管理产品。
    sku: {
        type: DataTypes.STRING,
    },
    // 商品名称
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 商品简介
    introduction: {
        type: DataTypes.STRING,
    },
    // 商品详细介绍
    details: {
        type: DataTypes.STRING,
    },
    // 销售商 进货渠道
    saleCompany: {
        type: DataTypes.STRING,
    },
    // 公司或制造商信息
    manufacturer: {
        type: DataTypes.STRING,
    },
    //* 商品的图片说明 或者 pdf 或者说明书 document { filetype, filename, md4 ,pathUrl}
    //*     documents: {
    //*         type: DataTypes.STRING, // 如果你想保存文件的 URL
    //*         get(){
    //*         }
    //*     },
    // 商品的价格
    price: {
        type: DataTypes.DECIMAL(10, 2), // 例如，保存价格的十进制数值类型
    },
    // 库存数量
    stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // 产品类别
    category: {
        type: DataTypes.STRING,
    },
    createdBy: {
        type: DataTypes.STRING,
        defaultValue: "员工",
        allowNull: false,
    },
});

// const Product = sequelize.define("ProductItem", {
//     // 主键，自动生成唯一的 UUID
//     uuid: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         allowNull: false,
//         primaryKey: true,
//     },
//     // 商品名称
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     // 商品简介
//     introduction: {
//         type: DataTypes.TEXT,
//     },
//     // 商品详细介绍
//     details: {
//         type: DataTypes.TEXT,
//     },
//     // 销售商 进货渠道
//     saleCompany: {
//         type: DataTypes.STRING,
//     },
//     // 公司或制造商信息
//     manufacturer: {
//         type: DataTypes.STRING,
//     },
//     // 商品的图片说明 或者 pdf 或者说明书
//     documentUrl: {
//         type: DataTypes.STRING, // 如果你想保存文件的 URL
//     },
//     // 商品的价格
//     price: {
//         type: DataTypes.DECIMAL(10, 2), // 例如，保存价格的十进制数值类型
//     },
//     // 库存数量
//     stockQuantity: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     // 产品类别
//     category: {
//         type: DataTypes.STRING,
//     },
//     createdBy: {
//         type: DataTypes.STRING,
//         defaultValue: "员工",
//         allowNull: false,
//     },
// });

// // 同步模型到数据库
sequelize.sync();

module.exports = Product;
