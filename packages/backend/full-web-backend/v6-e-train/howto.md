你的这个目录树设计，我建议采用 **“数据库负责记录目录层级，后端负责权限和目录规则，前端负责展示和操作入口控制”** 的方案。

这里有一个很重要的原则：

**不能只依靠前端隐藏右键菜单来保护执照题库。必须在后端限制，避免通过 API 直接修改目录。**

结合你的截图和 Prisma Schema，我建议把题库目录分成两种类型：

- **执照题库（LICENSE）**：系统固定目录，根节点及其所有后代均为只读。
- **地方题库（LOCAL）**：用户可以管理目录，创建子级、同级，重命名、删除、调整同级顺序。

两种目录在数据库中使用同一张 `theory-category` 表，不需要拆成两张表。

## **一、先明确目录树的规则**

**执照题库**

系统固定 · 只读

&#x20;第一部分 基础知识

只读

第1部分

飞行原理

航空气象

航空器及应用

航空情报

空域

空中导航

空中交通管制一般规定

人为因素

通信、导航和监视设备

通用航空

&#x20;第二部分 专业基础知识

只读

&#x20;第三部分 英语知识

只读

**地方题库**

可编辑

&#x20;地方题库

&#x20;自定义章节 A

&#x20;自定义章节 B

需要保证以下规则：

| 操作      | 执照题库 | 地方题库 |
| ------- | ---- | ---- |
| 新建子级    | 禁止   | 允许   |
| 新建同级    | 禁止   | 允许   |
| 上移 / 下移 | 禁止   | 允许   |
| 删除      | 禁止   | 允许   |
| 重命名     | 禁止   | 允许   |
| 跨题库移动   | 禁止   | 禁止   |

另外，根目录应该始终固定在最上面：

1. 执照题库
2. 地方题库

地方题库下面的节点可以自由调整顺序，但不能移动到执照题库下面。

## **二、修改 Prisma Schema**

你目前的 `TheoryCategory` 使用的是邻接表结构：

```
parentId String?
parent   TheoryCategory?
children TheoryCategory[]
```

这个设计完全可以保留，不需要改成其他树形结构。

我只建议增加一个字段：`treeType`，用来标识节点属于哪一种题库。

### **1. 增加枚举**

```
/// 题库目录类型
enum CategoryTreeType {
  LICENSE // 执照题库
  LOCAL   // 地方题库
}
```

### **2. 修改 TheoryCategory**

下面是可以直接替换的版本：

```

model TheoryCategory {
  id        String  @id @default(uuid()) @db.Uuid
  name      String

  // 父节点
  parentId  String? @map("parent_id") @db.Uuid
  parent    TheoryCategory? @relation("TheoryCategoryTree", fields: [parentId], references: [id])
  children  TheoryCategory[] @relation("TheoryCategoryTree")

  // 所属题库类型：执照题库 / 地方题库
  treeType  CategoryTreeType @default(LOCAL) @map("tree_type")

  // 同级排序
  sortOrder Int @default(0) @map("sort_order")

  // 该目录下的理论题目
  theoryItems TheoryDb[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([parentId, sortOrder])
  @@index([treeType])
  @@map("theory-category")
}

```

这里为什么不直接增加 `isEditable`？

因为 `treeType` 表达的是业务归属，而不是单纯的权限。

例如：

- `LICENSE`：属于执照题库，整个分支不可编辑。
- `LOCAL`：属于地方题库，整个分支允许编辑。

这样以后即使增加其他题库类型，也比较容易扩展。

**注意：** `treeType` 是冗余保存的信息，创建子节点时必须继承父节点的 `treeType`，不能由前端随意传递。

### **3. 初始化目录数据**

你的根节点建议固定为：

| name | parentId | treeType | sortOrder |
| ---- | -------- | -------- | --------- |
| 执照题库 | null     | LICENSE  | 0         |
| 地方题库 | null     | LOCAL    | 1         |

它们的所有子节点都继承各自根节点的 `treeType`。

例如：

```
执照题库        LICENSE
├── 第一部分    LICENSE
│   ├── 飞行原理 LICENSE
│   └── 航空气象 LICENSE
│
地方题库        LOCAL
├── 地方章节A   LOCAL
└── 地方章节B   LOCAL
```

不要忘记：如果数据库已经存在目录，执行迁移时必须先把现有目录按照根节点回填 `treeType`，不能直接依赖 `@default(LOCAL)`，否则原有执照题库会被错误标记成地方题库。

## **三、右键菜单设计**

我建议你保留目前的六个操作，不需要增加太多菜单。

但应该根据当前选中的节点动态控制菜单。

### **1. 地方题库根节点**

右键「地方题库」：

在当前层级新建子级

选中节点上移

选中节点下移

删除此节点

重命名

根节点不允许删除、重命名、调整顺序，也不提供新建同级，因为根节点由系统固定。

### **2. 地方题库的普通子节点**

右键「地方章节 A」：

在当前层级新建子级

在当前层级新建同级

选中节点上移

选中节点下移

删除此节点

重命名

### **3. 执照题库及其所有后代**

**只读目录**

右键时不显示任何修改菜单。

如果需要，可以显示一个普通的「查看目录信息」，但不允许执行写操作。

这里有一个细节：

假设选中的是「第一部分」下面的「飞行原理」，新建同级应该创建在「第一部分」下面，而不是根目录下面。

也就是说：

- 新建子级：`parentId = 当前节点.id`
- 新建同级：`parentId = 当前节点.parentId`

## **四、后端必须实施的权限判断**

这是整个设计最重要的部分。

不要相信前端传过来的：

```
{
  treeType: "LOCAL"
}
```

因为用户可以自己修改请求，把执照题库节点伪装成地方题库节点。

后端应该通过数据库查询当前节点，判断它真实所属的题库。

### **1. 新建子级**

```
export async function createChildCategory(categoryId, name) {
  return prisma.$transaction(async (tx) => {
    const parent = await tx.theoryCategory.findUnique({
      where: { id: categoryId },
    });

    if (!parent) {
      throw new Error("目录不存在");
    }

    if (parent.treeType !== "LOCAL") {
      throw new Error("执照题库不允许修改");
    }

    const lastChild = await tx.theoryCategory.findFirst({
      where: { parentId: parent.id },
      orderBy: { sortOrder: "desc" },
    });

    return tx.theoryCategory.create({
      data: {
        name,
        parentId: parent.id,
        treeType: parent.treeType,
        sortOrder: (lastChild?.sortOrder ?? -1) + 1,
      },
    });
  });
}
```

这样，无论前端传什么参数，子节点都会继承父节点的真实类型。

### **2. 新建同级**

逻辑基本相同：

```
export async function createSiblingCategory(categoryId, name) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.theoryCategory.findUnique({
      where: { id: categoryId },
    });

    if (!current) {
      throw new Error("目录不存在");
    }

    if (current.treeType !== "LOCAL") {
      throw new Error("执照题库不允许修改");
    }

    // 根节点不能创建同级节点
    if (!current.parentId) {
      throw new Error("根目录不允许创建同级节点");
    }

    const lastSibling = await tx.theoryCategory.findFirst({
      where: { parentId: current.parentId },
      orderBy: { sortOrder: "desc" },
    });

    return tx.theoryCategory.create({
      data: {
        name,
        parentId: current.parentId,
        treeType: current.treeType,
        sortOrder: (lastSibling?.sortOrder ?? -1) + 1,
      },
    });
  });
}
```

### **3. 上移和下移**

我建议采用交换 `sortOrder` 的方式，而不是每次移动都重新修改所有节点。

例如：

```
机场管制       sortOrder = 0
进近管制       sortOrder = 1
进近雷达管制   sortOrder = 2
```

点击「进近管制」上移：

```
机场管制       sortOrder = 1
进近管制       sortOrder = 0
进近雷达管制   sortOrder = 2
```

注意，上移和下移只能在同一个父节点下面进行。

实现时：

1. 查询当前节点。
2. 判断 `treeType === LOCAL`。
3. 查询同级相邻节点。
4. 使用事务交换两个节点的 `sortOrder`。
5. 没有上一个或下一个节点时，直接返回，不执行操作。

### **4. 删除节点**

我建议采用比较保守的删除策略：

- 有子目录：不允许删除。
- 有关联题目：不允许删除。
- 没有子目录、没有题目：允许删除。

这样可以避免误删整个章节以及题目归属关系。

```
export async function deleteCategory(categoryId) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.theoryCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            children: true,
            theoryItems: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("目录不存在");
    }

    if (category.treeType !== "LOCAL" || !category.parentId) {
      throw new Error("该目录不允许删除");
    }

    if (
      category._count.children > 0 ||
      category._count.theoryItems > 0
    ) {
      throw new Error("该目录下存在子目录或题目，不能删除");
    }

    await tx.theoryCategory.delete({
      where: { id: categoryId },
    });
  });
}
```

重命名也采用同样的原则：后端重新查询节点，检查 `treeType`，禁止修改 `LICENSE`。

## **五、关于跨题库移动，我建议直接从接口设计上杜绝**

你目前的右键菜单只有：

- 上移
- 下移

没有真正的跨父节点移动功能。

我建议暂时不要提供拖拽移动目录的功能。

如果以后需要拖拽，也必须额外判断：

```
if (source.treeType !== target.treeType) {
  throw new Error("不允许跨题库移动目录");
}

if (source.treeType === "LICENSE") {
  throw new Error("执照题库不允许移动");
}
```

另外还要检查不能把一个目录移动到自己的后代节点下面，避免产生循环引用。

这样即使将来增加拖拽排序，也不会破坏你的目录结构。

## **六、前端如何判断右键菜单**

前端不需要自己递归查询数据库判断权限，后端返回的每个节点已经包含 `treeType`。

例如：

```
{
  id: "uuid",
  name: "飞行原理",
  parentId: "uuid",
  treeType: "LICENSE",
  sortOrder: 1,
  children: []
}
```

右键菜单可以统一使用下面的判断：

```
const isReadOnly = node.treeType === "LICENSE";
const isRoot = node.parentId === null;

// 执照题库整个分支只读
const canEdit = !isReadOnly;

// 只有普通地方目录才能创建同级
const canCreateSibling = canEdit && !isRoot;

// 根目录不能删除、重命名、移动
const canManageOrder = canEdit && !isRoot;
```

然后根据这些状态生成菜单：

```
const menuItems = [
  ...(canEdit ? [
    { key: "create-child", label: "新建子级" },
  ] : []),

  ...(canCreateSibling ? [
    { key: "create-sibling", label: "新建同级" },
  ] : []),

  ...(canManageOrder ? [
    { key: "move-up", label: "上移" },
    { key: "move-down", label: "下移" },
    { key: "rename", label: "重命名" },
    { key: "delete", label: "删除此节点" },
  ] : []),
];
```

实际使用时，你还可以根据当前节点的同级位置，进一步隐藏不可执行的上移、下移操作。

## **七、目录查询和排序**

获取整个目录树时，建议后端一次性返回树形数据。

根节点固定排序：

```
const categories = await prisma.theoryCategory.findMany({
  where: {
    parentId: null,
  },
  orderBy: {
    sortOrder: "asc",
  },
  include: {
    children: {
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        children: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    },
  },
});
```

上面只是展示到三级的示例。如果目录未来可能无限嵌套，建议后端使用递归查询或一次性查询全部节点，再在 JS 中组装树形结构。

另外，根节点不应该开放给普通前端 API 创建、删除或者调整顺序。初始化时通过 Seed 创建即可。

## **八、我还建议你做两个小调整**

**1. TheoryCategory 和 TheoryDb 的关系明确命名**

你原来的 Schema 中有：

```
// TheoryCategory
theoryItems TheoryDb[]

// TheoryDb
category TheoryCategory? @relation(
  "TheoryCategoryItems",
  fields: [categoryId],
  references: [id]
)
```

建议两边统一：

```
// TheoryCategory
theoryItems TheoryDb[] @relation("TheoryCategoryItems")
```

**2. 数据库层面防止删除有题目的目录**

可以考虑将 `TheoryDb` 的关系设置为：

```
category TheoryCategory? @relation(
  "TheoryCategoryItems",
  fields: [categoryId],
  references: [id],
  onDelete: Restrict
)
```

这样即使后端删除逻辑出现疏漏，也不会轻易删除仍然被题目引用的目录。

## **最终推荐的结构**

## **题库目录管理架构**

**LICENSE · 执照题库**

固定数据，由 Seed 或后台维护，不开放前端修改权限。

**LOCAL · 地方题库**

允许创建子级、同级、重命名、删除和同级排序。

**PostgreSQL / Prisma**

统一使用 TheoryCategory，通过 treeType 标识目录归属。

**Express 后端业务校验**

每次修改重新查询数据库，校验题库类型、节点层级和操作合法性。

**React 目录树**

根据 treeType 动态展示右键菜单，负责交互和目录展示。

**我的最终建议：** 你现在的邻接表设计不需要推翻，增加 `treeType` 就可以满足当前需求。尤其不要为了实现目录权限，再额外拆出 `LicenseCategory` 和 `LocalCategory` 两张表，这会让后续题目查询、考试组卷和目录管理变得更复杂。

还有一个值得提前考虑的问题：将来如果需要让教员维护地方题库、但普通学员只能查看，那么可以在现在的 `treeType` 基础上，再增加用户角色权限判断，两者互不冲突。