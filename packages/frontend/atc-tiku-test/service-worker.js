const CACHE_NAME = "react-spa-cache-v1";
const usernames = [
    "巴富毅",
    "刘琦",
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "边昊",
    "温若春",
    "李明",
    "刘国莲",
    "黄恩",
    "叶大鹏",
    "潘伟生",
    "周岸",
    "张文中",
    "詹泽彬",
    "张虎",
    "胡鑫",
    "王建超",
    "朱永春",
    "郭永杰",
    "吴疆",
    "张宗根",
    "王风瑞",
    "杜涛",
    "耿若岩",
    "邓心豪",
    "蔡昊霖",
    "张笑延",
    "严亮",
    "宋天霖",
    "沈宁",
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];

const urlsToCache = [
    "/", // Home page
    "/index.html", // Main HTML page
    "/static/js/main.js", // Main JS file
    "/static/css/main.css", // Main CSS file
    "/favicon.ico", // Favicon (optional, if you have one)
    "/边昊.jpg",
    // "https://localhost:3104/%E8%92%8B%E9%9C%B2%E8%A3%95.jpg",
    // Add more assets here, such as images or other static files
];

usernames.forEach((u) => {
    urlsToCache.push("https://localhost:3104/" + u + ".jpg");
});

// Install event - cache the static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve assets from cache when offline
self.addEventListener("fetch", (event) => {
    // console.log("ddddddddddddd");
    const requestUrl = new URL(event.request.url);
    console.log(event.request.url);

    const url = new URL(event.request.url);

    // If the request is for a route (not a static asset), serve the index.html
    if (url.pathname !== "/" && url.pathname !== "/static/js/bundle.js" && !url.pathname.startsWith("/static/")) {
        event.respondWith(caches.match("/index.html"));
    } else {
        if (!navigator.onLine) {
            console.log("User is offline");
            // Check if the request is for an image (URL might be encoded)
            if (
                requestUrl.pathname.endsWith(".jpg") ||
                requestUrl.pathname.endsWith(".png") ||
                requestUrl.pathname.endsWith(".jpeg")
            ) {
                // const requestUrl = new URL(event.request.url);

                event.respondWith(
                    caches.match(event.request).then((cachedResponse) => {
                        // If the image is already cached, serve it
                        if (cachedResponse) {
                            console.log("cache");

                            console.log(cachedResponse);
                            return cachedResponse;
                        }

                        // Otherwise, fetch from the network and cache the image
                        return fetch(event.request).then((networkResponse) => {
                            // Cache the image only if it's valid (i.e., network response is 200 and type is 'basic')
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                                console.log("Caching image:", requestUrl.pathname);
                                return caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, networkResponse.clone()); // Cache the image for future use
                                    return networkResponse; // Return the network response
                                });
                            }
                            return networkResponse; // Return non-image responses without caching
                        });
                    })
                );
            }

            if (event.request.url === "https://localhost:3104/test") {
                console.log("------------------------------2222------------------------");

                event.respondWith(new Response(JSON.stringify({ test: "aaaaaaaaaaaaaaa" })));
            }
        } else {
            // // Handle other types of requests (e.g., HTML, JS, CSS)
            event.respondWith(fetch(event.request));
        }
    }
});
