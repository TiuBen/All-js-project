在 HTML 中，可以使用原生的方式实现类似 **tooltip** 的功能，而不依赖任何外部库。以下是几种常见的方法：

---

### 1. **使用原生 HTML 的 `title` 属性**
最简单的方式是使用元素的 `title` 属性，当鼠标悬停在元素上时，会自动显示系统默认样式的提示框。

```html
<button title="这是一个提示信息">悬停查看提示</button>
```

#### 优点：
- 无需额外的 CSS 或 JavaScript。
- 兼容性很好，所有浏览器都支持。

#### 缺点：
- 样式无法自定义。
- 无法响应复杂的交互需求。

---

### 2. **使用纯 CSS 的自定义 Tooltip**
通过 `::after` 或 `::before` 伪元素和 CSS 定位，可以实现一个完全自定义的 Tooltip。

```html
<div class="tooltip">
  悬停我查看提示
  <span class="tooltip-text">这是自定义的提示信息</span>
</div>

<style>
.tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.tooltip-text {
  visibility: hidden;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%; /* 调整 tooltip 的位置 */
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
```

#### 优点：
- 样式完全可控。
- 仅需 HTML 和 CSS，无需 JavaScript。

#### 缺点：
- 对于复杂的动态内容或交互效果支持有限。

---

### 3. **使用 JavaScript 实现动态 Tooltip**
可以用 JavaScript 动态控制 Tooltip 的创建、显示和隐藏。

#### 示例
```html
<button id="tooltip-btn">悬停我</button>

<script>
  const button = document.getElementById('tooltip-btn');

  // 创建 Tooltip
  const tooltip = document.createElement('div');
  tooltip.textContent = '这是动态生成的提示信息';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'black';
  tooltip.style.color = 'white';
  tooltip.style.padding = '5px 10px';
  tooltip.style.borderRadius = '5px';
  tooltip.style.visibility = 'hidden';
  tooltip.style.transition = 'visibility 0.2s, opacity 0.2s';
  tooltip.style.opacity = 0;
  document.body.appendChild(tooltip);

  // 显示 Tooltip
  button.addEventListener('mouseenter', (e) => {
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = 1;
  });

  // 隐藏 Tooltip
  button.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = 0;
  });
</script>
```

#### 优点：
- 非常灵活，支持动态内容和复杂交互。
- Tooltip 可定位到任意位置。

#### 缺点：
- 需要写更多的代码。
- 需要手动处理样式和交互。

---

### 4. **使用 CSS 和 JavaScript 的结合**
通过 CSS 定义样式，通过 JavaScript 动态添加或移除 Tooltip 的 DOM 元素。

---

### 总结
- 如果需要简单的提示：直接使用 `title` 属性。
- 如果需要自定义样式但内容固定：使用纯 CSS 实现。
- 如果需要动态内容或复杂交互：结合 JavaScript 动态创建 Tooltip。

根据实际需求选择适合的实现方式！如果需要更复杂的例子，可以告诉我具体需求。


在 **Vite** 中，你可以通过配置文件（`vite.config.ts` 或 `vite.config.js`）为开发环境（`dev`）和生产环境（`build`）分别设置不同的配置。Vite 提供了 `defineConfig` 和条件逻辑来实现这一点。

---

### 1. 基本配置
Vite 的配置文件默认支持开发和生产环境的区分。你可以通过 `command` 参数来判断当前是开发模式还是构建模式。

#### 示例：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'; // 开发模式
  const isBuild = command === 'build'; // 生产模式

  return {
    plugins: [react()],
    // 开发环境配置
    server: isDev
      ? {
          port: 3000, // 开发服务器端口
          open: true, // 自动打开浏览器
        }
      : undefined,
    // 生产环境配置
    build: isBuild
      ? {
          outDir: 'dist', // 输出目录
          sourcemap: true, // 生成 sourcemap
          minify: 'terser', // 代码压缩
        }
      : undefined,
  };
});
```

---

### 2. 使用环境变量
Vite 支持通过 `.env` 文件加载环境变量。你可以为开发环境和生产环境分别创建 `.env.development` 和 `.env.production` 文件。

#### 文件结构：
```
project-root/
├── .env.development
├── .env.production
├── vite.config.ts
└── src/
```

#### `.env.development`（开发环境）：
```plaintext
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
```

#### `.env.production`（生产环境）：
```plaintext
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

#### 在代码中使用环境变量：
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG === 'true';

console.log('API URL:', apiUrl);
console.log('Debug Mode:', isDebug);
```

---

### 3. 根据环境动态配置
你可以根据 `mode` 参数动态调整配置。

#### 示例：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    define: {
      // 根据环境注入全局变量
      __APP_ENV__: JSON.stringify(mode),
    },
    build: {
      minify: isProduction ? 'terser' : false, // 生产环境启用压缩
      sourcemap: !isProduction, // 开发环境生成 sourcemap
    },
  };
});
```

---

### 4. 自定义开发服务器和生产构建
你可以为开发服务器和生产构建分别设置不同的行为。

#### 示例：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [react()],
    server: isDev
      ? {
          port: 3000,
          proxy: {
            '/api': {
              target: 'http://localhost:5000',
              changeOrigin: true,
            },
          },
        }
      : undefined,
    build: !isDev
      ? {
          outDir: 'dist',
          rollupOptions: {
            output: {
              manualChunks: {
                react: ['react', 'react-dom'],
                vendor: ['lodash', 'axios'],
              },
            },
          },
        }
      : undefined,
  };
});
```

---

### 5. 使用 `vite-plugin-environment` 插件
如果你需要更灵活的环境变量管理，可以使用 `vite-plugin-environment` 插件。

#### 安装：
```bash
npm install vite-plugin-environment --save-dev
```

#### 配置：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin(['API_URL', 'DEBUG']), // 注入环境变量
  ],
});
```

---

### 6. 运行和构建命令
- **开发模式**：
  ```bash
  npm run dev
  ```
  这会使用 `vite.config.ts` 中的开发配置。

- **生产模式**：
  ```bash
  npm run build
  ```
  这会使用 `vite.config.ts` 中的生产配置。

---

### 7. 完整示例

#### `vite.config.ts`：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: isDev
      ? {
          port: 3000,
          open: true,
          proxy: {
            '/api': {
              target: 'http://localhost:5000',
              changeOrigin: true,
            },
          },
        }
      : undefined,
    build: isProduction
      ? {
          outDir: 'dist',
          sourcemap: true,
          minify: 'terser',
          rollupOptions: {
            output: {
              manualChunks: {
                react: ['react', 'react-dom'],
                vendor: ['lodash', 'axios'],
              },
            },
          },
        }
      : undefined,
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
```

#### `.env.development`：
```plaintext
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
```

#### `.env.production`：
```plaintext
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

---

### 总结
- 使用 `defineConfig` 和 `command` 参数区分开发和生产环境。
- 通过 `.env` 文件管理环境变量。
- 动态配置开发服务器和生产构建行为。
- 使用插件（如 `vite-plugin-environment`）增强环境变量管理。

这种方式可以让你灵活地为开发和生产环境设置不同的配置，满足项目需求。



如果 `outTime` 可能为 `NULL`，你需要在 SQL 查询中处理这种情况，以避免遗漏数据或出现错误。以下是针对 `outTime` 为 `NULL` 的处理方法：

---

### 1. 使用 `COALESCE` 函数
`COALESCE` 函数可以返回第一个非 `NULL` 的值。如果 `outTime` 为 `NULL`，可以使用 `inTime` 作为默认值。

#### 查询语句
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (strftime('%Y', COALESCE(outTime, inTime)) = '2024' AND strftime('%m', COALESCE(outTime, inTime)) = '12');
```

---

### 2. 使用 `CASE` 语句
`CASE` 语句可以根据条件返回不同的值。如果 `outTime` 为 `NULL`，则使用 `inTime`。

#### 查询语句
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (strftime('%Y', CASE WHEN outTime IS NULL THEN inTime ELSE outTime END) = '2024'
       AND strftime('%m', CASE WHEN outTime IS NULL THEN inTime ELSE outTime END) = '12');
```

---

### 3. 使用 `IFNULL` 函数
`IFNULL` 是 SQLite 提供的函数，用于返回第一个非 `NULL` 的值。

#### 查询语句
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (strftime('%Y', IFNULL(outTime, inTime)) = '2024' AND strftime('%m', IFNULL(outTime, inTime)) = '12');
```

---

### 4. 使用 `OR` 条件单独处理 `NULL`
如果 `outTime` 为 `NULL`，则只检查 `inTime`。

#### 查询语句
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (outTime IS NULL AND strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (outTime IS NOT NULL AND strftime('%Y', outTime) = '2024' AND strftime('%m', outTime) = '12');
```

---

### 示例数据

假设 `duty` 表有以下数据：

| id  | inTime              | outTime              |
|-----|---------------------|----------------------|
| 1   | 2024-12-01 08:00:00 | 2024-12-01 17:00:00  |
| 2   | 2024-11-30 09:00:00 | 2024-12-02 18:00:00  |
| 3   | 2024-12-15 10:00:00 | NULL                 |
| 4   | 2024-12-31 07:00:00 | 2025-01-01 08:00:00  |
| 5   | 2024-11-01 08:00:00 | 2024-11-30 17:00:00  |

---

### 查询结果

#### 使用 `COALESCE` 查询
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (strftime('%Y', COALESCE(outTime, inTime)) = '2024' AND strftime('%m', COALESCE(outTime, inTime)) = '12');
```

**结果**：
| id  | inTime              | outTime              |
|-----|---------------------|----------------------|
| 1   | 2024-12-01 08:00:00 | 2024-12-01 17:00:00  |
| 2   | 2024-11-30 09:00:00 | 2024-12-02 18:00:00  |
| 3   | 2024-12-15 10:00:00 | NULL                 |
| 4   | 2024-12-31 07:00:00 | 2025-01-01 08:00:00  |

---

#### 使用 `IFNULL` 查询
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (strftime('%Y', IFNULL(outTime, inTime)) = '2024' AND strftime('%m', IFNULL(outTime, inTime)) = '12');
```

**结果**：
| id  | inTime              | outTime              |
|-----|---------------------|----------------------|
| 1   | 2024-12-01 08:00:00 | 2024-12-01 17:00:00  |
| 2   | 2024-11-30 09:00:00 | 2024-12-02 18:00:00  |
| 3   | 2024-12-15 10:00:00 | NULL                 |
| 4   | 2024-12-31 07:00:00 | 2025-01-01 08:00:00  |

---

#### 使用 `OR` 条件查询
```sql
SELECT * FROM duty
WHERE (strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (outTime IS NULL AND strftime('%Y', inTime) = '2024' AND strftime('%m', inTime) = '12')
   OR (outTime IS NOT NULL AND strftime('%Y', outTime) = '2024' AND strftime('%m', outTime) = '12');
```

**结果**：
| id  | inTime              | outTime              |
|-----|---------------------|----------------------|
| 1   | 2024-12-01 08:00:00 | 2024-12-01 17:00:00  |
| 2   | 2024-11-30 09:00:00 | 2024-12-02 18:00:00  |
| 3   | 2024-12-15 10:00:00 | NULL                 |
| 4   | 2024-12-31 07:00:00 | 2025-01-01 08:00:00  |

---

### 总结

- 使用 `COALESCE`、`IFNULL` 或 `CASE` 函数可以处理 `outTime` 为 `NULL` 的情况。
- 使用 `OR` 条件单独处理 `NULL` 也是一种有效的方法。
- 根据你的需求选择最适合的方式。

通过以上方法，你可以确保即使 `outTime` 为 `NULL`，查询结果也不会遗漏数据。