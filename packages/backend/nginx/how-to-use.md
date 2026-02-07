完美 👍 那我给你设计一份 **`sites-available` + `sites-enabled` 结构**，让你可以很清晰地管理多个子域名。

---

## 📂 目录结构

```
/etc/nginx/
 ├── sites-available/
 │    ├── www.atctest1215.cn.conf
 │    ├── mobile.duty.atctest1215.cn.conf
 │    ├── admin.duty.atctest1215.cn.conf
 │    └── api.duty.atctest1215.cn.conf
 └── sites-enabled/
      ├── www.atctest1215.cn.conf -> ../sites-available/www.atctest1215.cn.conf
      ├── mobile.duty.atctest1215.cn.conf -> ../sites-available/mobile.duty.atctest1215.cn.conf
      ├── admin.duty.atctest1215.cn.conf -> ../sites-available/admin.duty.atctest1215.cn.conf
      └── api.duty.atctest1215.cn.conf -> ../sites-available/api.duty.atctest1215.cn.conf
```

---

## 🔧 配置文件示例

### 1. `www.atctest1215.cn.conf`

```nginx
server {
    listen 80;
    server_name www.atctest1215.cn;

    root /var/www/atctest1215.cn/www;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

### 2. `mobile.duty.atctest1215.cn.conf`

```nginx
server {
    listen 80;
    server_name mobile.duty.atctest1215.cn;

    root /var/www/atctest1215.cn/mobile;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

### 3. `admin.duty.atctest1215.cn.conf`

```nginx
server {
    listen 80;
    server_name admin.duty.atctest1215.cn;

    root /var/www/atctest1215.cn/admin;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

### 4. `api.duty.atctest1215.cn.conf`

```nginx
server {
    listen 80;
    server_name api.duty.atctest1215.cn;

    location / {
        proxy_pass http://127.0.0.1:3000; # 这里改成你的后端服务端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🚀 启用配置

1. 放置配置文件到 `/etc/nginx/sites-available/`
2. 建立软链接：

   ```bash
   sudo ln -s /etc/nginx/sites-available/www.atctest1215.cn.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/mobile.duty.atctest1215.cn.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/admin.duty.atctest1215.cn.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/api.duty.atctest1215.cn.conf /etc/nginx/sites-enabled/
   ```
3. 检查配置是否正确：

   ```bash
   sudo nginx -t
   ```
4. 重载 Nginx：

   ```bash
   sudo systemctl reload nginx
   ```

---

⚡ 这样每个域名配置都独立，你要停掉某个子域，只要删掉对应的软链接就行（不会影响其它服务）。

要不要我帮你加上 **HTTPS 配置（Let’s Encrypt 证书，支持 `*.duty.atctest1215.cn` 通配符）**？
