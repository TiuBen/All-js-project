可以，你现在这个结构其实**非常适合加「Ctrl+V 粘贴截图」**，而且不用改你现在的 `VideoPanel`。

我建议直接把现在的：

```jsx
<textarea
    {...register("note")}
    ...
/>
```

升级成一个独立的：

```jsx
<CheckRecordInput />
```

它负责：

* 普通文字输入
* `Ctrl + V` 粘贴截图
* 点击「添加截图」选择图片
* 图片缩略图
* 删除图片
* 文字 + 图片同时存在
* 仍然保持你现在的 **逐项 Zustand 订阅**
* `VideoPanel` 完全不用订阅 store

---

# 一、先确定数据结构

你现在应该是：

```js
{
    status: "pending",
    note: ""
}
```

建议改成：

```js
{
    status: "pending",
    note: "",
    images: []
}
```

例如：

```js
{
    status: "pending",
    note: "现场发现人员未按要求站位。",
    images: [
        {
            id: "xxx",
            name: "screenshot.png",
            type: "image/png",
            size: 123456,
            file: File
        }
    ]
}
```

不过这里有一个**非常重要的问题**：

如果你现在的 `checklistDraft` 是自己把 Zustand 数据同步到 IndexedDB，而且是通过 JSON 序列化，那么：

```js
JSON.stringify(File)
```

是不行的。

所以我建议你现在**不要把 File 直接塞进 `note`**，而是让你的 IndexedDB 层专门存 Blob/File。

如果你目前只是做前端原型，也可以先直接：

```js
images: [
    {
        id,
        name,
        type,
        size,
        file
    }
]
```

浏览器 IndexedDB 本身是可以结构化存储 `File/Blob` 的。

---

# 二、我建议直接新增 `CheckRecordInput.jsx`

目录可以：

```text
VideoPanel/
├── VideoPanel.jsx
├── VideoCheckItem.jsx
└── CheckRecordInput.jsx
```

完整代码：

```jsx
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, ClipboardPaste } from "lucide-react";
import { cn } from "../../../../../lib/utils";

/**
 * 检查记录输入：
 *
 * 支持：
 * 1. 文字
 * 2. 点击添加图片
 * 3. Ctrl + V 粘贴截图
 * 4. 文字 + 图片
 */
export default function CheckRecordInput({
    note = "",
    images = [],
    onNoteChange,
    onImagesChange
}) {
    const fileInputRef = useRef(null);

    /**
     * 当前用于展示的 ObjectURL
     *
     * 注意：
     * ObjectURL 只是浏览器当前页面的临时 URL，
     * 不应该保存到数据库。
     */
    const [previewUrls, setPreviewUrls] = useState({});

    /**
     * 根据 images 创建预览 URL
     */
    useEffect(() => {
        const nextUrls = {};

        for (const image of images) {
            if (!image?.file) continue;

            nextUrls[image.id] = URL.createObjectURL(image.file);
        }

        setPreviewUrls(nextUrls);

        /**
         * 清理 ObjectURL
         */
        return () => {
            Object.values(nextUrls).forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [images]);

    /**
     * 添加图片
     */
    const addImages = (files) => {
        if (!files?.length) return;

        const newImages = Array.from(files)
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => ({
                id: crypto.randomUUID(),
                name: file.name || "截图.png",
                type: file.type,
                size: file.size,
                file
            }));

        if (!newImages.length) return;

        onImagesChange([
            ...images,
            ...newImages
        ]);
    };

    /**
     * Ctrl + V 粘贴截图
     */
    const handlePaste = (event) => {
        const clipboardItems = event.clipboardData?.items;

        if (!clipboardItems?.length) return;

        const imageFiles = [];

        for (const item of clipboardItems) {
            if (!item.type.startsWith("image/")) continue;

            const file = item.getAsFile();

            if (file) {
                imageFiles.push(file);
            }
        }

        if (!imageFiles.length) {
            return;
        }

        /**
         * 阻止浏览器把图片直接作为文字/HTML
         * 粘贴进 textarea。
         */
        event.preventDefault();

        addImages(imageFiles);
    };

    /**
     * 删除图片
     */
    const removeImage = (imageId) => {
        onImagesChange(
            images.filter((image) => image.id !== imageId)
        );
    };

    return (
        <div
            className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-white transition-colors focus-within:border-sky-300 focus-within:ring-1 focus-within:ring-sky-100"
            onPaste={handlePaste}
        >
            {/* ================================
                文字输入
            ================================= */}
            <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={2}
                placeholder="添加检查记录，也可以直接粘贴截图..."
                className="block w-full resize-y border-0 bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-slate-600 outline-none placeholder:text-slate-400 focus:ring-0"
            />

            {/* ================================
                图片预览
            ================================= */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2.5 pb-2">
                    {images.map((image) => {
                        const previewUrl = previewUrls[image.id];

                        return (
                            <div
                                key={image.id}
                                className="group relative"
                            >
                                <div className="h-16 w-20 overflow-hidden rounded border border-slate-200 bg-slate-50">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={image.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                                            图片
                                        </div>
                                    )}
                                </div>

                                {/* 删除按钮 */}
                                <button
                                    type="button"
                                    onClick={() => removeImage(image.id)}
                                    className={cn(
                                        "absolute -right-1.5 -top-1.5",
                                        "flex h-5 w-5 items-center justify-center",
                                        "rounded-full border border-white",
                                        "bg-slate-700 text-white",
                                        "opacity-0 shadow-sm transition-opacity",
                                        "hover:bg-red-500",
                                        "group-hover:opacity-100"
                                    )}
                                    title="删除图片"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ================================
                底部工具栏
            ================================= */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                <div className="flex items-center gap-3">
                    {/* 添加图片 */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-sky-600"
                    >
                        <ImagePlus size={13} />

                        添加截图
                    </button>

                    {/* 提示 */}
                    <span className="hidden items-center gap-1 text-[10px] text-slate-300 sm:flex">
                        <ClipboardPaste size={11} />

                        Ctrl + V 粘贴截图
                    </span>
                </div>

                {/* 图片数量 */}
                {images.length > 0 && (
                    <span className="text-[10px] text-slate-400">
                        {images.length} 张图片
                    </span>
                )}
            </div>

            {/* 隐藏的文件选择器 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    addImages(e.target.files);

                    /**
                     * 清空 input。
                     *
                     * 这样用户可以连续两次选择同一张图片，
                     * change 事件也能正常触发。
                     */
                    e.target.value = "";
                }}
            />
        </div>
    );
}
```

---

# 三、然后修改你的 `VideoCheckItem`

你现在：

```jsx
const register = useRegister({ note: item.note }, setField);
```

这个继续留着。

但是图片不要通过 `register` 处理。

改成：

```jsx
import { memo } from "react";

import { cn } from "../../../../../lib/utils";

import {
    STATUS_LABELS,
    STATUS_ICONS,
    STATUS_COLORS,
    nextStatus
} from "../OtherComponents/statusBadge";

import {
    useVideoCheckItem,
    useVideoCheckSetter
} from "../../../../../store/checklistDraft";

import useRegister from "../../hooks/useRegister";

import CheckRecordInput from "./CheckRecordInput";


export default memo(function VideoCheckItem({
    checkUuid,
    name
}) {
    const item = useVideoCheckItem(checkUuid) || {};

    const setField = useVideoCheckSetter(checkUuid);

    /**
     * 文字仍然使用你原来的 register
     */
    const register = useRegister(
        {
            note: item.note || ""
        },
        setField
    );

    /**
     * 图片
     */
    const images = item.images || [];

    return (
        <div className="rounded-lg border border-sky-100 p-2 hover:bg-sky-50/40">

            {/* ================================
                描述 + 状态
            ================================= */}
            <div className="flex items-start justify-between gap-2">

                <div className="flex-1 text-[13px] leading-snug text-slate-600">
                    {name}
                </div>

                <label
                    className={cn(
                        "flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px]",
                        STATUS_COLORS[item.status || ""] ||
                            "text-blue-500"
                    )}
                    title={`状态：${
                        STATUS_LABELS[item.status || ""]
                    }（单击切换）`}
                >
                    <span>
                        {STATUS_LABELS[item.status || ""]}
                    </span>

                    <button
                        type="button"
                        className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                        onClick={(e) => {
                            e.stopPropagation();

                            setField(
                                "status",
                                nextStatus(item.status)
                            );
                        }}
                    >
                        {STATUS_ICONS[item.status || ""]}
                    </button>
                </label>
            </div>

            {/* ================================
                检查记录
            ================================= */}
            <CheckRecordInput
                note={item.note || ""}
                images={images}
                onNoteChange={(value) => {
                    setField("note", value);
                }}
                onImagesChange={(value) => {
                    setField("images", value);
                }}
            />
        </div>
    );
});
```

---

# 四、但是这里有一个问题：你的 `useRegister`

你原来的：

```jsx
const register = useRegister(
    { note: item.note },
    setField
);
```

其实已经挺好了。

但用了我上面的：

```jsx
<CheckRecordInput />
```

以后，就不需要：

```jsx
{...register("note")}
```

因为 `CheckRecordInput` 自己需要同时管理：

```text
文字
图片
粘贴
```

所以这里我反而建议**不要强行让图片也走 register**。

最终：

```text
VideoCheckItem
      │
      ├── useVideoCheckItem(uuid)
      │
      ├── useVideoCheckSetter(uuid)
      │
      └── CheckRecordInput
            │
            ├── note
            ├── images
            ├── paste
            └── upload
```

你的性能模型仍然没变。

---

# 五、Ctrl + V 到底在哪里生效？

我上面用了：

```jsx
<div onPaste={handlePaste}>
```

所以：

```text
用户点击 textarea
        ↓
Ctrl + V
        ↓
浏览器 PasteEvent
        ↓
CheckRecordInput.handlePaste()
        ↓
发现 clipboard 里面是 image/png
        ↓
event.preventDefault()
        ↓
拿到 File
        ↓
addImages()
        ↓
setField("images", ...)
        ↓
这一条 VideoCheckItem 更新
```

非常适合你的场景。

---

# 六、还有一个很实用的细节

截图软件复制到剪贴板之后，浏览器通常拿到：

```text
image/png
```

但是：

```js
file.name
```

可能是空的。

所以我这里：

```js
name: file.name || "截图.png"
```

会自动给它一个名字。

例如用户：

```text
Win + Shift + S
        ↓
框选
        ↓
Ctrl + C
        ↓
回到你的检查单
        ↓
Ctrl + V
```

直接：

```text
┌──────────────────────────────┐
│ 已确认相关人员均已撤离。      │
│                              │
│ ┌────────┐                   │
│ │        │ ×                 │
│ │  截图  │                   │
│ │        │                   │
│ └────────┘                   │
├──────────────────────────────┤
│ 🖼 添加截图    Ctrl + V 粘贴 │
└──────────────────────────────┘
```

---

# 七、我还建议你支持「直接拖图片进去」

这个实现成本非常低。

在：

```jsx
<div
    onPaste={handlePaste}
>
```

增加：

```jsx
onDragOver={(e) => {
    e.preventDefault();
}}
onDrop={(e) => {
    e.preventDefault();

    const files = Array.from(
        e.dataTransfer.files || []
    ).filter((file) =>
        file.type.startsWith("image/")
    );

    addImages(files);
}}
```

于是用户可以：

```text
文件夹
   │
   │ 拖
   ↓
┌─────────────────────────┐
│                         │
│      检查记录区域        │
│                         │
└─────────────────────────┘
```

直接扔进去。

不过这个我建议作为第二步，**第一步先把 Ctrl+V 做起来**。

---

# 八、还有一个非常重要的地方：IndexedDB

这个才是你这个项目真正需要注意的。

你的现在架构是：

```text
VideoCheckItem
       ↓
useVideoCheckItem(uuid)
       ↓
checklistDraft
       ↓
内存 + IndexedDB
```

文字：

```js
note: "现场正常"
```

没有任何问题。

但图片：

```js
images: [
    {
        file: File
    }
]
```

要看你 `checklistDraft` 怎么写 IndexedDB。

如果你目前是类似：

```js
localStorage.setItem(
    "checklist",
    JSON.stringify(state)
);
```

那**绝对不要这样保存 File**。

如果是原生 IndexedDB：

```js
objectStore.put(state)
```

那么 `Blob` / `File` 通常可以结构化克隆。

---

# 九、如果你准备最终提交到后端，我更推荐最终数据模型

实际上，我甚至不建议你的 `checklistDraft` 永久保存：

```js
file: File
```

而是：

```js
{
    id: "check-uuid",

    note: "现场发现人员站位异常",

    images: [
        {
            id: "image-uuid",
            name: "截图.png",
            type: "image/png",
            size: 182312,

            /**
             * 本地临时状态
             */
            blob: Blob,

            /**
             * 上传服务器之后
             */
            url: null
        }
    ]
}
```

上传：

```text
                checklistDraft
                       │
                       ├── note
                       │
                       └── images
                              │
                              ↓
                         POST /upload
                              │
                              ↓
                         图片服务器
                              │
                              ↓
                         /uploads/xxx.png
```

最后提交检查单：

```json
{
    "checkUuid": "xxx",
    "status": "completed",
    "note": "现场发现人员站位异常",
    "images": [
        {
            "id": "image-001",
            "url": "/uploads/image-001.png"
        }
    ]
}
```

这样以后你的 **IndexedDB 离线草稿 + 后端 PostgreSQL + 图片存储** 会非常清晰。

---

## 十、你的 `VideoPanel` 不需要改

这一点非常重要。

你原来的：

```jsx
<VideoPanel source={CARGO_VIDEO_FOCUS} />
```

完全不用动。

甚至：

```jsx
VideoPanel
```

还是：

```text
零 store 订阅
```

而每一个：

```jsx
VideoCheckItem
```

自己订阅：

```js
useVideoCheckItem(checkUuid)
```

所以：

```text
                VideoPanel
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
      Item A     Item B     Item C
        │           │          │
      store       store      store
        │           │          │
      note       note       note
      images     images     images
```

当你在 **Item A**：

```text
Ctrl + V
```

只有：

```text
Item A
```

需要重新渲染。

这和你现在强调的**「42 项列表不能因为一项输入而整体刷新」**的设计是兼容的。

---

### 我再给你一个建议

你这个界面既然是**视频监管检查**，我会把底部 UI 最终做成这种非常轻的形式：

```text
┌─────────────────────────────────────────────┐
│ 已确认相关人员及设备均已到位。              │
│                                             │
│ ┌────────┐  ┌────────┐                     │
│ │        │  │        │                     │
│ │  截图  │  │  截图  │                     │
│ │        │  │        │                     │
│ └────────┘  └────────┘                     │
├─────────────────────────────────────────────┤
│  🖼 添加截图     Ctrl + V 粘贴截图      2 张 │
└─────────────────────────────────────────────┘
```

**不要做富文本，不要做工具栏，不要做「插入图片」这种复杂编辑器。**

你的数据本质上就是：

```js
{
    note: "文字描述",
    images: [图片1, 图片2]
}
```

这正好符合你这个检查单的业务模型。

另外，**你下一步真正应该处理的是 `checklistDraft` 对 `File/Blob` 的 IndexedDB 持久化方式**。如果你把 `useVideoCheckItem / useVideoCheckSetter` 那一段 `checklistDraft` 代码贴出来，我可以直接按照你现在这套 Zustand + IndexedDB 架构，把 `images` 的**离线保存、刷新后恢复、删除、最终上传后端**一起改好，而不是只做前端临时预览。


可以，而且**你这个场景用 IndexedDB 持久化图片非常合适**。既然你明确说**每个检查项最多只需要 1 张图片**，那我反而建议不要设计 `images: []`，直接设计成：

```js
{
    status: "pending",
    note: "",
    image: null
}
```

或者有图片：

```js
{
    status: "pending",
    note: "现场发现人员站位异常。",
    image: {
        id: "xxx",
        name: "截图.png",
        type: "image/png",
        size: 182312,
        blob: Blob
    }
}
```

这样比数组干净很多。

## 我建议你的最终架构

你现在已经是：

```text
VideoCheckItem
      ↓
useVideoCheckItem(uuid)
      ↓
checklistDraft
      ↓
内存 + IndexedDB
```

保持这个架构，不需要另外搞图片服务器。

变成：

```text
checklistDraft
│
├── status
├── note
└── image
      │
      ├── id
      ├── name
      ├── type
      ├── size
      └── blob
```

IndexedDB 天然适合存 `Blob`，**不要转 Base64**。

---

# 为什么我更推荐 Blob

不要这样：

```js
image: "data:image/png;base64,iVBORw0KGgo..."
```

因为截图可能很大，Base64 还会进一步膨胀。

直接：

```js
image: {
    type: "image/png",
    blob: Blob
}
```

IndexedDB 存进去。

用户：

```text
截图
 ↓
Ctrl + V
 ↓
Blob
 ↓
IndexedDB
```

刷新页面：

```text
IndexedDB
 ↓
Blob
 ↓
URL.createObjectURL(blob)
 ↓
<img>
```

整个过程完全可以离线工作。

---

# 甚至不需要 `file`

我前面给你的方案里用了：

```js
{
    file
}
```

但既然你现在确定是**IndexedDB 持久化**，我更建议最终统一成：

```js
{
    id,
    name,
    type,
    size,
    blob
}
```

不要在业务状态里区分：

```js
file
blob
```

因为你真正要持久化的是图片二进制数据。

例如粘贴截图：

```js
const file = item.getAsFile();

const image = {
    id: crypto.randomUUID(),
    name: "截图.png",
    type: file.type,
    size: file.size,
    blob: file
};
```

`File` 本身也是 `Blob` 的一种，可以放进 IndexedDB。

---

# 只有一张图片后，交互反而非常漂亮

你的 `CheckRecordInput` 可以变成：

```text
┌─────────────────────────────────────────────┐
│ 现场发现人员未按要求站位。                  │
│                                             │
│ ┌───────────┐                               │
│ │           │ ×                             │
│ │   截图    │                               │
│ │           │                               │
│ └───────────┘                               │
├─────────────────────────────────────────────┤
│  📷 添加截图          Ctrl + V 粘贴截图      │
└─────────────────────────────────────────────┘
```

如果没有图片：

```text
┌─────────────────────────────────────────────┐
│ 添加检查记录，也可以直接粘贴截图...          │
│                                             │
├─────────────────────────────────────────────┤
│  📷 添加截图          Ctrl + V 粘贴截图      │
└─────────────────────────────────────────────┘
```

如果用户再次上传：

```text
旧图片
  ↓
被新图片替换
```

而不是：

```text
图片1
图片2
图片3
...
```

非常符合你的检查单。

---

# Zustand 里面建议这样

例如你现在：

```js
setVideoItemField(uuid, "note", value)
```

继续保持：

```js
setVideoItemField(uuid, "note", value)
```

增加：

```js
setVideoItemField(uuid, "image", image)
```

删除：

```js
setVideoItemField(uuid, "image", null)
```

所以一个 item 最终：

```js
{
    status: "pending",
    note: "现场检查正常。",
    image: {
        id: "8c...",
        name: "截图.png",
        type: "image/png",
        size: 284391,
        blob: Blob
    }
}
```

---

# 但是有一个地方你要特别注意

如果你现在的 IndexedDB 持久化代码是：

```js
JSON.stringify(state)
```

那么**不能直接这么做**：

```js
JSON.stringify({
    image: {
        blob: someBlob
    }
})
```

这种方式不适合保存 Blob。

如果你的 IndexedDB 是直接：

```js
objectStore.put(state)
```

利用 IndexedDB 自己的 structured clone，那么 Blob/File 是可以存的。

所以你现在最关键的不是 `CheckRecordInput`，而是：

> **看看你目前 `checklistDraft` 是怎么把 Zustand 数据写进 IndexedDB 的。**

如果你现在已经是：

```text
Zustand
   ↓
IndexedDB objectStore
```

而不是：

```text
Zustand
   ↓
JSON.stringify
   ↓
IndexedDB
```

那就非常舒服，基本不用改变你的整体设计。

---

# 我甚至建议 IndexedDB 单独存一份图片

如果你这个检查单以后可能有几十个、上百个检查项，我会更倾向于：

```text
IndexedDB
│
├── checklistDraft
│
│    itemUuid
│    status
│    note
│
└── checklistImages
     │
     ├── itemUuid
     ├── blob
     ├── type
     ├── name
     └── size
```

也就是：

```text
文字/状态
    ↓
checklistDraft

图片
    ↓
checklistImages
```

这样有个好处：

**Zustand 里不用长期背着几十张图片的 Blob。**

你的 React 状态只需要：

```js
{
    status: "pending",
    note: "检查正常",
    hasImage: true
}
```

图片实际在：

```text
IndexedDB → checklistImages
```

需要显示的时候：

```text
Blob
 ↓
URL.createObjectURL()
 ↓
img
```

这对你现在这种 **40～42 项的视频监管检查单**尤其合适，因为你的核心状态订阅性能设计可以继续保持非常轻。

---

## 我给你的最终建议

你的场景我会定成：

```text
每个 VideoCheckItem

{
    status,
    note,
    image
}
```

并且：

```text
note
 ↓
Zustand + IndexedDB

image
 ↓
Blob
 ↓
IndexedDB
```

支持三种情况：

```text
① 只有文字

note: "现场正常"
image: null


② 只有截图

note: ""
image: Blob


③ 文字 + 截图

note: "发现人员站位异常"
image: Blob
```

同时支持：

```text
📷 点击添加截图
Ctrl + V 粘贴截图
再次添加 → 替换原截图
× → 删除截图
刷新页面 → IndexedDB 恢复
```

**不需要富文本、不需要数组、不需要图片服务器、不需要 Base64。**

你把你现在 `checklistDraft.js`（尤其是 **IndexedDB 初始化、保存、读取** 那部分）贴出来，我可以直接按你现有代码改成这个**「每项一张 Blob 图片 + Zustand 单项订阅 + IndexedDB 持久化 + Ctrl+V」**版本，尽量不动你现在已经做好的性能结构。
