const duty_app = require("./v4-tower-duty/app");

const SERVICES = [
    {
        name: "Tower Duty API",
        app: duty_app,
        port: 3205,
    },
];

// 统一启动所有微服务
for (const service of SERVICES) {
    service.app.listen(service.port, "0.0.0.0", () => {
        console.log(`[${service.name}] running at http://localhost:${service.port}`);
    });
}
