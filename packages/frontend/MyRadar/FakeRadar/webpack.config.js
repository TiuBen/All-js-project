// webpack.config.js
const path = require('path')
module.exports = {
  entry: path.join(__dirname, '/src/index.js'), // 入口文件
  output: {
    path: path.join(__dirname, '/dist'), //打包后的文件存放的地方
    filename: 'bundle.js' //打包后输出文件的文件名
  },
  devServer: {
    static:{
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
    port: '3201', // 设置端口号为8088
  },
  
}
