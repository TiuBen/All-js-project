module.exports = {
    HOST: "localhost",
    PORT: "3306", // MARK 注意这里的连接端口 不是33060
    USER: "root",
    PASSWORD: "root1234",
    DB: "supplier",
    DIALECT: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  
