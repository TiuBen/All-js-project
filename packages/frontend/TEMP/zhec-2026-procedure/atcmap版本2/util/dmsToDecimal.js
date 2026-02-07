export function dmsToDecimal(value) {
    if (typeof value === "number") return value;

    // 去掉空格
    const v = value.trim();

    // ===== 1. DMS: 30°19'36.7"
    let m = v.match(/^(\d+)°(\d+)'([\d.]+)"$/);
    if (m) {
        const deg = +m[1];
        const min = +m[2];
        const sec = +m[3];
        return deg + min / 60 + sec / 3600;
    }

    // ===== 2. DM: 30°26.5"
    m = v.match(/^(\d+)°([\d.]+)"$/);
    if (m) {
        const deg = +m[1];
        const min = +m[2];
        return deg + min / 60;
    }

    // ===== 3. Decimal: 30.4416
    m = v.match(/^\d+(\.\d+)?$/);
    if (m) {
        return +v;
    }

    console.error("Unknown lat/lon format:", value);
    return NaN;
}