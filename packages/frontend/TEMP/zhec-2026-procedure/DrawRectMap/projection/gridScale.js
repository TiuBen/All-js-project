// 1️⃣ projection/gridScale.js

// !负责把
// !±0.5° → 100px
// !转换成一个稳定的世界比例
export function createGridScale(mapSetting) {
    const { latlonRange, defaultGridSizePx } = mapSetting;
  
    // 世界单位定义为“像素语义单位”
    const worldPerDegree = defaultGridSizePx / (latlonRange * 2);
  
    return {
      worldPerDegree,
      degreePerWorld: 1 / worldPerDegree,
    };
  }
  

  export function projectGeo(lat, lon, center, scale) {
    const cosLat = Math.cos(center.lat * Math.PI / 180);
  
    return {
      x: (lon - center.lon) * cosLat * scale.worldPerDegree,
      y: (lat - center.lat) * scale.worldPerDegree,
    };
  }