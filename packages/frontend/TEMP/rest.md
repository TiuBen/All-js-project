在 RESTful API 中添加 `_links` 是一种常见的做法，目的是为了实现 **HATEOAS**（Hypermedia as the Engine of Application State，超媒体作为应用状态引擎）。HATEOAS 是 REST 架构风格的一个重要原则，通过在 API 响应中嵌入链接，客户端可以动态发现和导航资源，而无需依赖硬编码的 URL。

### `_links` 的作用
1. **资源导航**：通过 `_links`，客户端可以知道与当前资源相关的其他资源或操作。例如，获取用户信息时，API 可以返回一个链接，指向该用户的订单列表。
2. **解耦客户端和服务器**：客户端不需要预先知道所有资源的 URL，而是通过响应中的链接动态获取。
3. **提高 API 的可发现性**：开发者可以更容易理解 API 的结构和功能。

### `_links` 的常见格式
`_links` 通常是一个对象，包含多个链接，每个链接都有一个关系（`rel`）和一个 URL（`href`）。例如：

```json
{
  "id": 123,
  "name": "John Doe",
  "_links": {
    "self": { "href": "/users/123" },
    "orders": { "href": "/users/123/orders" },
    "update": { "href": "/users/123", "method": "PUT" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}
```

- `self`：指向当前资源的链接。
- `orders`：指向与当前资源相关的其他资源（如用户的订单）。
- `update` 和 `delete`：指向对当前资源执行操作的链接，可能包含 HTTP 方法（如 `PUT` 或 `DELETE`）。

### 实现 HATEOAS 的好处
1. **动态性**：客户端不需要硬编码 URL，而是通过响应中的链接动态获取。
2. **灵活性**：服务器可以随时更改 URL 结构，只要保持链接关系不变，客户端无需修改。
3. **自描述性**：API 响应包含足够的信息，客户端可以理解如何与资源交互。

### 示例场景
假设有一个用户资源，客户端可以通过以下步骤与之交互：
1. 获取用户信息：
   ```json
   {
     "id": 123,
     "name": "John Doe",
     "_links": {
       "self": { "href": "/users/123" },
       "orders": { "href": "/users/123/orders" }
     }
   }
   ```
2. 通过 `orders` 链接获取用户的订单列表：
   ```json
   {
     "orders": [
       { "id": 1, "product": "Book" },
       { "id": 2, "product": "Pen" }
     ],
     "_links": {
       "self": { "href": "/users/123/orders" },
       "user": { "href": "/users/123" }
     }
   }
   ```

### 总结
在 RESTful API 中添加 `_links` 是为了实现 HATEOAS，使 API 更具动态性和自描述性。通过嵌入链接，客户端可以轻松发现和导航资源，减少对硬编码 URL 的依赖，同时提高 API 的灵活性和可维护性。