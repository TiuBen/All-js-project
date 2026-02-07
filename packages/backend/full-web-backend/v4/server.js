// const https=require('https');

const app = require("./app");
// const { PORT } = require('./src/config/env');

// HTTPS 配置
// const options = {
//   key: fs.readFileSync('C:/Users/jserver/localhost+2-key.pem'),
//   cert: fs.readFileSync('C:/Users/jserver/localhost+2.pem'),
//   // 启用更现代的加密设置（可选）
//   minVersion: 'TLSv1.2',
//   ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
// };

// const server = https.createServer(options, app);

// const {exportAsExcel} = require("./utils/exportAsExcel");

//  exportAsExcel();

const PORT = 3205;
app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
