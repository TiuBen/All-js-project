function rawRowToJsObject(row) {
    if (!row) return row;

    const parsedRow = { ...row };

    for (const key in parsedRow) {
        const val = parsedRow[key];
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                    parsedRow[key] = parsed;
                }
            } catch {
                // 不是 JSON，就保持原样
            }
        }
    }
    return parsedRow;
}

const normalizeValue = (val) => {
    if (Array.isArray(val)) {
        return JSON.stringify(val); // 或者 val.join(";")
    }
    return val;
};

module.exports = { rawRowToJsObject, normalizeValue };
w;
