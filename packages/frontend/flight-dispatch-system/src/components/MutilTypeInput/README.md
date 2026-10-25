# MutilTypeInput 使用说明

多类型输入框（非受控组件）：`label + textarea + 隐藏 file input + 图片预览区`。
文字用 IndexedDB 本地缓存（Blob 不转 Base64），刷新 / 关闭再打开自动恢复。

## 文件职责

| 文件 | 职责 |
|---|---|
| `cache.js` | IndexedDB 工具层：开库、按 key 读写删，零业务概念，可被其他地方直接引用 |
| `cache.store.js` | zustand 数据中枢：防抖落库、objectURL 生命周期、整理数据（collect）、提交（submitAll）。组件只走它，不直接碰 cache.js |
| `MutilTypeInput.jsx` | 组件本体。图片大小上限 `IMAGE_MAX_BYTES = 6M` 写在这个文件顶部，直接改；也可用 `maxImageBytes` props 单实例覆盖 |

## 用法

```jsx
<MutilTypeInput uuid={item.uuid} label="视频监管检查重点" />
```

- `uuid` 必填且稳定（本地缓存 key），多个实例各存各的，互不覆盖。
- 图片三个入口：Ctrl+V 粘贴 / 拖入（拖入时边框变色）/ 点击「添加图片」（只接受 `image/*`）。
- 预览区：缩略图 + 右上角 × 删除 + 单击放大（Esc 或单击关闭）。
- 非受控：父组件不接状态、不传回调。

## 整理 / 提交（cache.store.js）

```js
import useMutilTypeInputStore from "./cache.store";

const store = useMutilTypeInputStore.getState();

// 整理：不传参 = 全部草稿；传 uuid 数组 = 指定几条
const drafts = await store.collect();
// drafts: [{ uuid, note, images: [{ id, name, type, size, blob }], createdAt, updatedAt }]

// 提交：逐条交给 handler，成功一条清一条本地草稿，失败保留可重试
const results = await store.submitAll(async (draft) => {
    const form = new FormData();
    form.append("uuid", draft.uuid);
    form.append("note", draft.note);
    draft.images.forEach((img) => form.append("images", img.blob, img.name));
    await fetch("/api/submit", { method: "POST", body: form });
});
```

## 注意

- 同一张图删了又贴回会拿到新 id，旧 Blob 已被清理，不会残留。
- `cache.js` 的库名是 `mutil-type-input-cache`（store：`drafts` + `images`），换库名只改 cache.js 顶部常量。
- 卸载时会尽力落库一次，但浏览器被强杀时异步写入不保证完成；防抖 500ms + 失焦保存是主要保障。
