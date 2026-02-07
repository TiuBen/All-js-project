const NodeCache= require("node-cache");
const myCache = new NodeCache({stdTTL: 60*8});



// class DutyCacheSystem {
//       constructor() {
//         this.cache = new Map(); // 可以使用Redis、Memcached等替代
//         this.defaultTTL = 3600; // 默认缓存时间1小时
//       }
    
//       // 生成缓存键
//       generateKey(query) {
//         return generateCacheKey(query, 'duty');
//       }
    
//       // 获取缓存数据
//       async get(query) {
//         const key = this.generateKey(query);
//         const cached = this.cache.get(key);
        
//         if (cached && cached.expiry > Date.now()) {
//           return cached.data;
//         }
        
//         // 缓存过期或不存在，清理缓存
//         if (cached) {
//           this.cache.delete(key);
//         }
        
//         return null;
//       }
    
//       // 设置缓存数据
//       async set(query, data, ttl = this.defaultTTL) {
//         const key = this.generateKey(query);
//         const expiry = Date.now() + (ttl * 1000);
        
//         this.cache.set(key, {
//           data,
//           expiry,
//           timestamp: Date.now()
//         });
        
//         return true;
//       }
    
//       // 删除缓存
//       async delete(query) {
//         const key = this.generateKey(query);
//         return this.cache.delete(key);
//       }
    
//       // 清空所有相关缓存
//       async clearAll(prefix = 'duty') {
//         for (const key of this.cache.keys()) {
//           if (key.startsWith(prefix + ':')) {
//             this.cache.delete(key);
//           }
//         }
//       }
    
//       // 带缓存的查询方法
//       async cachedQuery(query, forceRefresh = false) {
//         // 如果强制刷新，直接查询数据库
//         if (forceRefresh) {
//           const data = await fromDutyDbGetData(query);
//           await this.set(query, data);
//           return data;
//         }
    
//         // 尝试从缓存获取
//         const cachedData = await this.get(query);
//         if (cachedData) {
//           return cachedData;
//         }
    
//         // 缓存未命中，查询数据库并缓存结果
//         const data = await fromDutyDbGetData(query);
//         await this.set(query, data);
        
//         return data;
//       }
//     }
module.exports = myCache;
