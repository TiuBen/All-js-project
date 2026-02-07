const cache = require("../utils/cache");
const crypto = require("crypto");
function stableJSONStringify(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
  }
  
  function getCacheKey(req) {
    const { method, originalUrl, query, body } = req;
  
    // 构造原始字符串
    const rawKey = [
      method.toUpperCase(),
      originalUrl.split("?")[0],               // 只取路径，不含 query string
      stableJSONStringify(query || {}),
      method === "GET" ? "" : stableJSONStringify(body || {}),
    ].join("|");
  
    // 做 md5 哈希
    const hash = crypto.createHash("md5").update(rawKey).digest("hex");
  
    return hash;
  }

const cacheMiddleware = (req, res, next) => {
    // //console.log("cacheMiddleware");
    // //console.log(keyBuilder);
    const key = getCacheKey(req);
    const cachedData = cache.get(key);
    if (cachedData) {
        //console.log("缓存命中:", key);
        return res.json(cachedData);
    }
    res.sendResponse = res.json;
    res.json = (body) => {
        cache.set(key, body);
        res.sendResponse(body);
    };
    next();
};

module.exports = cacheMiddleware;
