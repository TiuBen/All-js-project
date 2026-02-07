// /* eslint-disable no-restricted-globals */

// const CACHE_NAME = "my-pwa-cache-v1";
// const OFFLINE_URL = "offline.html";

// self.addEventListener("install", (event) => {
//     console.log("installing service worker...");

//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.addAll([
//                 "/",
//                 "/index.html",
//                 "/styles.css",
//                 "/沈宁.jpg",
//                 OFFLINE_URL, // 缓存离线页面
//             ]);
//         })
//     );
// });

// // 拦截网络请求，使用缓存
// self.addEventListener("fetch", (event) => {
//     // 检查请求是否是图片
//     if (event.request.destination === "image") {
//         event.respondWith(
//             caches.match(event.request).then((response) => {
//                 // 如果缓存中有匹配的响应，则返回它
//                 if (response) {
//                     return response;
//                 }
//                 // 否则，发起网络请求并缓存新响应
//                 return fetch(event.request).then((networkResponse) => {
//                     return caches.open(CACHE_NAME).then((cache) => {
//                         cache.put(event.request, networkResponse.clone());
//                         return networkResponse;
//                     });
//                 });
//             })
//         );
//     }

//     // event.respondWith(
//     //     caches.match(event.request).then((response) => {
//     //         // 如果缓存中有匹配的响应，则返回它
//     //         if (response) {
//     //             return response;
//     //         }
//     //         // 否则，发起网络请求
//     //         return fetch(event.request).then((networkResponse) => {
//     //             // 将新的响应存入缓存
//     //             return caches.open(CACHE_NAME).then((cache) => {
//     //                 cache.put(event.request, networkResponse.clone());
//     //                 return networkResponse;
//     //             });
//     //         });
//     //     })
//     // );
// });

// // 激活事件，清理旧的缓存
// self.addEventListener("activate", (event) => {
//     const cacheWhitelist = [CACHE_NAME];
//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames.map((cacheName) => {
//                     if (!cacheWhitelist.includes(cacheName)) {
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         })
//     );
// });
