/**
 * 格式化数值：保留2位小数，若无有效值则返回0
 * @param {number|null|undefined} value - 输入值
 * @returns {string,number} 格式化后的值（或0）
 */
function formateDecimal(value) {
      // 检查是否为有效数字（非 null/undefined/NaN，且不为 0）
      if (value === null || value === undefined || isNaN(value)) {
          return "";
      }
  
      // 四舍五入到2位小数，并避免 -0 的情况
      const rounded = Math.round(value * 100) / 100;
      return rounded === 0 ? "" : rounded; // 明确返回 0（而非 -0）
  }
  
 module.exports= { formateDecimal };
  