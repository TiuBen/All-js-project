// auto-cache-middleware.js
const cache = {};

// 动态生成缓存键（支持API路径和参数）
const generateCacheKey = (req) => {
    return `${req.originalUrl}_${JSON.stringify(req.params)}`;
};

// 自动缓存中间件
const autoCache = (options = {}) => {
    return (req, res, next) => {
        // 跳过非GET请求或显式排除的路由
        if (req.method !== "GET" || options.exclude?.test(req.path)) {
            return next();
        }

        const key = options.key || generateCacheKey(req);
        const cachedData = cache[key];

        // 返回缓存数据
        if (cachedData) {
            //console.log(`[Cache] Hit ${key}`);
            return res.json(cachedData);
        }

        // 劫持res.json()方法设置缓存
        const originalJson = res.json;
        res.json = (body) => {
            if (res.statusCode === 200) {
                cache[key] = body;
                //console.log(`[Cache] Set ${key}`);
            }
            originalJson.call(res, body);
        };

        next();
    };
};

// 清除缓存中间件（用于写操作）
const clearCache = (options = {}) => {
    return (req, res, next) => {
        const keysToClear = [];

        // 清除特定键
        if (options.key) {
            keysToClear.push(options.key);
        }

        // 清除路径匹配的缓存
        if (options.pathPattern) {
            Object.keys(cache).forEach((key) => {
                if (key.startsWith(options.pathPattern)) {
                    keysToClear.push(key);
                }
            });
        }

        keysToClear.forEach((key) => {
            delete cache[key];
            //console.log(`[Cache] Cleared ${key}`);
        });

        next();
    };
};

module.exports = { autoCache, clearCache };
