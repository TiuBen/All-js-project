import { defineConfig } from "vite";
import javascriptObfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
    plugins: [
        // JavaScript 混淆插件（生产环境启用）
        // javascriptObfuscator(
        //     {
        //         // 混淆选项
        //         options: {
        //             // 字符串混淆
        //             stringArray: true,
        //             stringArrayEncoding: ["base64", "rc4"],
        //             stringArrayThreshold: 0.75,

        //             // 标识符名生成器
        //             identifierNamesGenerator: "hexadecimal",

        //             // 重命名全局变量
        //             renameGlobals: true,

        //             // 控制流扁平化
        //             controlFlowFlattening: true,
        //             controlFlowFlatteningThreshold: 0.75,

        //             // 死代码注入
        //             deadCodeInjection: true,
        //             deadCodeInjectionThreshold: 0.4,

        //             // 数字混淆
        //             numbersToExpressions: true,

        //             // 转换对象键
        //             transformObjectKeys: true,

        //             // 自防御
        //             selfDefending: true,
        //             debugProtection: true,
        //             debugProtectionInterval: 2000,

        //             // 禁用控制台输出
        //             disableConsoleOutput: true,

        //             // 域名锁定（可选）
        //             // domainLock: ['yourdomain.com'],

        //             // 简化代码
        //             simplify: true,

        //             // 目标环境
        //             target: "browser",

        //             // 其他选项
        //             unicodeEscapeSequence: true,
        //             compact: true,
        //             rotateStringArray: true,
        //         },
        //     },
        //     {
        //         // 插件选项
        //         apply: "build", // 只在构建时启用
        //         enableInDevelopment: false,
        //     }
        // ),
    ],

    build: {
        outDir: "dist",
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                // 让 terser 配合混淆
                reduce_vars: true,
                unused: true,
                dead_code: true,
            },
            mangle: {
                // 启用混淆
                properties: true,
                toplevel: true,
                keep_classnames: false,
                keep_fnames: false,
                reserved: [], // 不保留任何名称
            },
        },
        sourcemap: false,
    },
});
