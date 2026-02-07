// utils/routeGenerator.js
function generateCRUDRoutes(router, controller, middlewares = {}) {
    const { create, update, getAll, getById, delete: _delete } = controller;
    const { create: createMw, update: updateMw, default: defaultMw = [] } = middlewares;

    router.get("/", ...(defaultMw || []), getAll);
    router.post("/", ...(createMw || defaultMw || []), create);
    router.get("/:id", ...(defaultMw || []), getById);
    router.put("/:id", ...(updateMw || defaultMw || []), update);
    router.delete("/:id", ...(defaultMw || []), _delete);

    return router;
}

module.exports = { generateCRUDRoutes };
