const { DataTypes, Model } = require("sequelize");
const sequelize = require("./sequelize"); // Assuming you've configured your Sequelize connection

// 包括所有的文件 都是一个 document
// 员工上传的头像
// 员工上传的产品目录
// 每个风扇的规格书
// 联系人里的名片的图片
// jpg png word excel pdf 

class Document extends Model {}

Document.init(
    {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileType:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        pathURL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        md4:{
            type: DataTypes.STRING,
        },
        thumbnail:{
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
       
        author: {
            type: DataTypes.STRING,
        },
        tags: {
            type: DataTypes.STRING, // Array of strings for tags

            allowNull: true,
            get() {
                if (this.getDataValue("tags") === null || this.getDataValue("tags") === undefined) {
                    return null;
                } else {
                    return this.getDataValue("tags").split(";");
                }
            },
            set(val) {
                if (val === null || val === undefined) {
                    return this.setDataValue("tags", null);
                } else if (Array.isArray(val)) {
                    return this.setDataValue("tags", val.join(";"));
                }
                // return this.setDataValue("email", val);
            },
        },

      //   publicationDate: {
      //       type: DataTypes.DATE,
      //   },
      //   isPublished: {
      //       type: DataTypes.BOOLEAN,
      //       defaultValue: false,
      //   },
    },
    {
        sequelize,
        modelName: "Document",
        tableName: "documents", // Adjust the table name as needed
        // Other options...
    }
);

module.exports = Document;
