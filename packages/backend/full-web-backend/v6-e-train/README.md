# v6-e-train - 模拟机培训/考核微服务（Express + SQLite3）

隶属 `full-web-backend` 微组件体系：本目录导出 Express `app`，由根 `index.js` 统一挂载，端口 **3206**。

```js
// 根 index.js 中已注册
{ name: "E-Train API", app: e_train_app, port: 3206 }
```

## 启动

```bash
# 方式一：随微服务总入口一起启动（同时拉起 v4-tower-duty 3205）
cd full-web-backend && node index.js

# 方式二：单独启动 e-train
node -e "require('./v6-e-train/app').listen(3206, () => console.log('E-Train API on 3206'))"
```

首次启动自动建表并写入种子数据（李依玲 3 条待办 + 训练项目字典 + 评分项字典 + 消息提醒），数据库文件在 `data/e-train.db`。

## 分层结构

```
v6-e-train/
├── app.js                    Express 组装（cors / body-parser / 路由挂载 / 错误兜底）
├── config/
│   ├── db.js                 sqlite3 连接（data/e-train.db）
│   ├── schema.js             建表语句
│   └── dbInit.js             建表 + 种子数据初始化
├── routes/                   仅路由声明
│   ├── router.js             /api 总入口
│   ├── taskRoute.js          /api/tasks
│   ├── messageRoute.js       /api/messages
│   └── dictRoute.js          /api/dict
├── controllers/              参数提取 + 响应包装
├── services/                 业务逻辑（任务 CRUD / 评分计算 / 字典归并）
└── utils/
    ├── dbHelper.js           sqlite3 回调 → Promise（run/get/all/exec/now）
    └── seed.js               种子数据
```

## API 一览（字段名与数据库列名 snake_case 原样进出）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | /api/tasks?status=todo&keyword=xx | 任务列表（status: todo/done，可省略） |
| GET  | /api/tasks/:id | 任务详情 |
| POST | /api/tasks | 新建待办（title 自动拼装：`学员【表单名】需录入关联表单`） |
| PUT  | /api/tasks/:id | 更新字段（student/form_name 变化自动刷 title） |
| DELETE | /api/tasks/:id | 删除任务 |
| POST | /api/tasks/:id/score | 提交评分 `{counts:[{name,count}], overall, attachments}` → 待办转已办；得分 = 100 − Σ(次数×分值)，总体情况必填 |
| GET  | /api/tasks/stats | 角标统计 {todo, done, message, feedback} |
| GET  | /api/messages | 消息提醒列表 |
| GET  | /api/messages/feedbacks | 反馈记录列表 |
| POST | /api/messages/feedbacks | 新增反馈 |
| GET  | /api/dict/form-options | 表单下拉选项（学员/分类/表单/扇区等） |
| GET  | /api/dict/training-groups | 训练项目分组（含适用席位 positions） |
| GET  | /api/dict/score-groups | 评分扣分项分组（含分值） |

用户认证/登录不在本服务范围内（由上层统一处理）。
