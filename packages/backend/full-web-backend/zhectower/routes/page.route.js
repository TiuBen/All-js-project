const express = require("express");
const router = express.Router();


const pages = [
    { id: 1, path: "/page1", component: "Page1" },
    { id: 2, path: "/page2", component: "Page2" },
    // { id: 2, path: "D:/GitHub/full-web-backend/zhectower/pages/Page2.jsx", component: "About" },
    // 其他页面...
];

router.get("/pages", (req, res) => {
    console.log("router pages");
    
    res.json(pages);
});
router.post("/pages", (req, res) => {
    const { path, component } = req.body;
    // 假设每个页面都有一个唯一的 ID
    const newPage = { id: pages.length + 1, path, component };
    pages.push(newPage);
    res.status(201).json(newPage); // 返回创建的页面，并使用 201 状态码表示成功创建
});
// 获取特定页面（如果需要）
router.get("/pages/:id", (req, res) => {
    const page = pages.find((p) => p.id === parseInt(req.params.id));
    if (page) {
        res.json(page);
    } else {
        res.status(404).json({ message: "Page not found" });
    }
});

// 更新特定页面（如果需要）
router.put("/pages/:id", (req, res) => {
    const page = pages.find((p) => p.id === parseInt(req.params.id));
    if (page) {
        const { path, component } = req.body;
        page.path = path;
        page.component = component;
        res.json(page);
    } else {
        res.status(404).json({ message: "Page not found" });
    }
});

// 删除特定页面
router.delete("/pages/:id", (req, res) => {
    const index = pages.findIndex((p) => p.id === parseInt(req.params.id));
    if (index !== -1) {
        pages.splice(index, 1);
        res.status(204).send(); // 204 No Content 表示删除成功，但没有返回内容
    } else {
        res.status(404).json({ message: "Page not found" });
    }
});
module.exports = router;
