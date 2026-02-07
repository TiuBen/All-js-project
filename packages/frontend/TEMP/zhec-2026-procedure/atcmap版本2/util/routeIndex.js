export function buildRouteIndex(...depDefs) {
    const index = new Map();

    depDefs.forEach(def => {
        def.forEach(proc => {
            proc.lines.forEach(line => {
                index.set(line.lineName, line);
            });
        });
    });

    return index;
}
