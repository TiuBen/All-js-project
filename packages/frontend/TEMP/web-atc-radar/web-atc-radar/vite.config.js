import { defineConfig,  } from "vite";
import path from "path"; // 需要安装 @types/node
import { env } from "process";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {

    return {
        build: {
            outDir: "dist",
            assetsDir: "src",
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, "index.html"),
                },
                output:{
                    entryFileNames:'index.js',
                    assetFileNames:'assets/[name][extname]',
                    chunkFileNames:'[name].js'
                  }
            
            },
        },
        worker:{
            format: "es",
            plugins: [
            ]
        }
    };
});
