export function projectGeo(lat, lon, center, scale) {
    const cosLat = Math.cos((center.lat * Math.PI) / 180);

    return {
        x: (lon - center.lon) * cosLat * scale.worldPerDegree,
        y: (lat - center.lat) * scale.worldPerDegree,
    };
}

// export const mapSetting = {
//   centerLat: 30.5,//★ GPS 原点（一个格子的中心）
//   centerLon: 115.8,//★ GPS 原点（一个格子的中心）
//   centerScreenX:700,//★ 屏幕原点（Canvas 上的位置）
//   :500,//★ 屏幕原点（Canvas 上的位置）
//   GRID_DEGREE: 0.25, // ★ 网格定义 每个格子 0.25°
//   GRID_SIZE_PX: 200, // ★ 网格定义 一个格子 = 200px
// };

export function createGPSToScreen(GPSpoint, mapConfig) {
    const { centerLat, centerLon, centerScreenX, centerScreenY, GRID_SIZE_PX, GRID_DEGREE } = mapConfig;
    const pxPerDeg = GRID_SIZE_PX / GRID_DEGREE;

    // DMS转换函数 - 使用闭包缓存
    function dmsToDecimal(value) {
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
        return 0;
    }

    const ORIGIN_GPS_Lat = dmsToDecimal(centerLat);
    const ORIGIN_GPS_Lon = dmsToDecimal(centerLon);

    return function gpsToScreen(GPSpoint) {
        const lat = dmsToDecimal(GPSpoint.lat);
        const lon = dmsToDecimal(GPSpoint.lon);
        const dxDeg = lon - ORIGIN_GPS_Lon;
        const dyDeg = ORIGIN_GPS_Lat - lat;

        return {
            x: centerScreenX + dxDeg * pxPerDeg,
            y: centerScreenY + dyDeg * pxPerDeg,
        };
    };
}

export function dmsGPSPointToScreen(dmsGPSPoint, mapConfig) {
    const { centerLat, centerLon, centerScreenX, centerScreenY, GRID_SIZE_PX, GRID_DEGREE ,zoom} = mapConfig;
    const pxPerDeg = (GRID_SIZE_PX / GRID_DEGREE) * zoom;

    return {
        x: centerScreenX + (dmsGPSPoint.lon - centerLon)  * pxPerDeg,
        y: centerScreenY +  ( centerLat -dmsGPSPoint.lat)* pxPerDeg,
        display: dmsGPSPoint?.display,
        pointName: dmsGPSPoint?.pointName,
    };
}


export function createProjectionCache(geoPoints, mapSetting) {
    let cachedPoints = {};
    let lastSnapshot = "";

    function snapshot() {
        return (
            mapSetting.centerLat.toFixed(6) + "|" +
            mapSetting.centerLon.toFixed(6) + "|" +
            mapSetting.zoom.toFixed(4)
        );
    }

    function updateIfNeeded() {
        const s = snapshot();
        if (s === lastSnapshot) return cachedPoints;

        cachedPoints = {};
        Object.keys(geoPoints).forEach((key) => {
            cachedPoints[key] = dmsGPSPointToScreen(
                geoPoints[key],
                mapSetting
            );
        });

        lastSnapshot = s;
        return cachedPoints;
    }

    return {
        getScreenPoints: updateIfNeeded,
    };
}
