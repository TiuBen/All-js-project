const fs = require("fs");
const path = require("path");

// allObjects.forEach((x) => {
//     console.log(x);
// });
// function Test(app) {
//     const modulesPath = path.join(__dirname, "modules");
//     const moduleFiles = fs.readdirSync(modulesPath);

//     // console.log(modulesPath);

//     // const allObjects = [];

//     moduleFiles.forEach((file) => {
//         const modulePath = path.join(modulesPath, file);
//         // console.log("modulePath"+modulePath);
//         const moduleName = path.parse(file).name;
//         // console.log(moduleName);
//         // Require the module and store the exported object
//         // allObjects.push(require(modulePath));
//         app.use(require(modulePath))
//     });

//     console.log("这里完成全部路由的注册");
//     //   app.use()
// }

module.exports = (app)=>{
    const modulesPath = path.join(__dirname, "modules");
    const moduleFiles = fs.readdirSync(modulesPath);

    moduleFiles.forEach((file) => {
        const modulePath = path.join(modulesPath, file);
        const moduleName = path.parse(file).name;
        app.use(require(modulePath))
    });

    console.log("这里完成全部路由的注册");
    return app;
};
