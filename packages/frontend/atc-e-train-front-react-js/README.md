# atc-e-train-front-react-js - 模拟机培训/考核网页版（后台风格）

微信小程序同款功能的网页版，技术栈：React(JS) + Vite + TailwindCSS + zustand + react-router-dom + axios + dayjs。
布局采用后台管理系统风格（左侧边栏 + 顶栏 + 内容区），页面内容对齐小程序交互。

## 启动

```bash
# 1. 先启动后端（e-train 微服务，端口 3206）
cd packages/backend/full-web-backend
node index.js   # 或单独启动 v6-e-train

# 2. 启动前端开发服务器（端口 5174，/api 已代理到 3206）
cd packages/frontend/atc-e-train-front-react-js
pnpm dev        # 或 npm run dev
```

打开 http://localhost:5174 即可使用（登录认证不在范围内，直连后端数据）。

## 页面结构

| 路由 | 页面 | 对齐小程序 |
|---|---|---|
| /workbench | 工作台：四 tab（待办/已办/消息提醒/反馈记录）+ 角标 + 搜索 + 月/年度报告横幅 + 红绿双新建按钮 | 工作台首页 |
| /simulator-form | 快速填写模拟机培训/考核（含红字提示、练习号弹窗、开始时间/培训时长） | 快速填写表单 |
| /theory-form | 快速填写理论培训 | 理论培训表单 |
| /tasks/:id | 待办任务详情（可编辑字段即时回写，编号/结束时间/资格类型/教员姓名灰字只读，下一步/删除） | 任务详情页 |
| /tasks/:id/score | 评分扣分页（五组扣分项计次 −/＋，得分 = 100−Σ次数×分值，总体情况必填，提交转已办） | 评分页 |
| /training-items | 训练项目库（席位 radio + 分组折叠单选 + 搜索 + 全选/全取消） | 训练项目选择页 |
| /profile | 个人信息（用户卡片 + 月/年度报告入口 + 任务统计） | 个人信息 tab |

## 目录说明

```
src/
├── api/
│   ├── client.js        axios 实例（baseURL /api，响应拦截解包 {success, data}）
│   └── index.js         taskApi / messageApi / dictApi
├── store/
│   ├── taskStore.js     zustand：任务/消息/反馈列表 + 角标统计 + 增删改评分
│   └── dictStore.js     zustand：表单选项/训练项目/评分项字典（全局只拉一次）
├── layouts/
│   └── AdminLayout.jsx  后台布局（侧边栏菜单 + 角标 + 顶栏）
├── components/
│   ├── FormRow.jsx      表单行（label + 控件，灰字=只读）
│   ├── Select.jsx       下拉选择
│   └── TrainingItemsSelector.jsx  训练项目选择器（弹窗/独立页共用）
└── pages/               七个业务页面（见上表）
```

## 与后端的约定

- 所有请求走 `/api`（Vite 代理到 `http://localhost:3206`，见 `vite.config.js`）
- 字段名与数据库列名 snake_case 原样进出（`student`、`form_name`、`train_category`…），前端不做转换层
- 响应统一格式 `{ success, data, message }`，拦截器已解包
