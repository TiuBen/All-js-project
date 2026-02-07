const { Sequelize, DataTypes, Model } = require("sequelize");
// ** 说明
// ** 所有的表单模版 存储 到一个 table 里面  
// ** 表单模版的名称  
// ** 表单模版的内容 
// ** 每次表单模版的记录(谁什么时候创建了表单,谁在什么时候修改了表单的什么内容,这个表单模版是否批准)
module.exports = (sequelize) => {
    const form = sequelize.define(
        "form",
        {
            data: { type: DataTypes.JSON, allowNull: false },
            record: { type: DataTypes.JSON, allowNull: true },
        },
        {
            hooks: {
                beforeUpdate: (record, options) => {
                    // record.dataValues.record +=record.dataValues.record;
                },
            },
        }
    );

    return form;
};
