const { override, adjustStyleLoaders } = require("customize-cra");

module.exports = override(
  // 修改 output 配置，使其不使用哈希值
  (config) => {
    config.output.filename = 'static/js/[name].js'; // 去掉哈希
    config.output.chunkFilename = 'static/js/[name].chunk.js'; // 去掉哈希
     // 修改 CSS 文件名
     const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/[name].css'; // 去掉哈希
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].chunk.css'; // 去掉哈希
    }
    return config;
  }
);
