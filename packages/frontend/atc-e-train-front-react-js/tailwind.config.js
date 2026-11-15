/** tailwind.config.js - 只扫描 index.html 与 src 目录 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff', // 主蓝，对齐小程序视觉
        danger: '#f53f3f',  // 红，对齐小程序按钮/角标
        success: '#23b26d', // 绿，理论培训按钮/提交
      },
    },
  },
  plugins: [],
};
