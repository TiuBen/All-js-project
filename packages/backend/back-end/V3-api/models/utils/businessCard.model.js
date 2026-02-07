const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const businessCard = sequelize.define("businessCard", {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                if (this.getDataValue("email") === null || this.getDataValue("email") === undefined) {
                    return null;
                } else {
                    return this.getDataValue("email").split(";");
                }
            },
            set(val) {
                if (val === null || val === undefined) {
                    return this.setDataValue("email", null);
                } else if (Array.isArray(val)) {
                    return this.setDataValue("email", val.join(";"));
                }
                // return this.setDataValue("email", val);
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                if (this.getDataValue("phone") === null || this.getDataValue("phone") === undefined) {
                    return null;
                } else {
                    return this.getDataValue("phone").split(";");
                }
            },
            set(val) {
                if (val === null || val === undefined) {
                    return this.setDataValue("phone", null);
                } else if (Array.isArray(val)) {
                    return this.setDataValue("phone", val.join(";"));
                }
                // return this.setDataValue("phone", val.join(";"));
            },
        },
        contact : {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                if (this.getDataValue("contact") === null || this.getDataValue("contact") === undefined) {
                    return null;
                } else {
                    return this.getDataValue("contact").split(";");
                }
            },
            set(val) {
                if (val === null || val === undefined) {
                    return this.setDataValue("contact", null);
                } else if (Array.isArray(val)) {
                    return this.setDataValue("contact", val.join(";"));
                }
                // return this.setDataValue("email", val);
            },
        },

        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        frontImg: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        backImg: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return businessCard;
};
