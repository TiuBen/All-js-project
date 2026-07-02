/**
 * 成功响应格式
 * @param {object} res Express response 对象
 * @param {string} message 响应消息
 * @param {object|array} data 返回数据
 * @param {number} statusCode HTTP状态码 (默认200)
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
    const response = {
      success: true,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  
    if (data !== null) {
      // 处理分页数据
      if (data.data && data.pagination) {
        response.data = data.data;
        response.pagination = data.pagination;
      } 
      // 普通数据
      else {
        response.data = data;
      }
    }
  
    return res.status(statusCode).json(response);
  };
  
  /**
   * 错误响应格式
   * @param {object} res Express response 对象
   * @param {string} message 错误消息
   * @param {number} statusCode HTTP状态码 (默认400)
   * @param {object} error 原始错误对象 (开发环境)
   */
  const errorResponse = (res, message = 'Error', statusCode = 400, error = null) => {
    const response = {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  
    // 开发环境下返回原始错误信息
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
  
    return res.status(statusCode).json(response);
  };
  
  module.exports = {
    successResponse,
    errorResponse,
  };