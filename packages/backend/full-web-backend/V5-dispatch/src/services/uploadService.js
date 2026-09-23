/**
 * ============================================================
 * 截图上传 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 只做一件事：把一张图片的**原始二进制**写进 data/uploads，返回可访问的 url。
 *
 * 设计取舍（与前端 utils/checkImage.js 的约定配套）：
 *   - **不用 Base64**：请求体就是原始字节（Content-Type: image/png 之类），
 *     省掉 33% 膨胀，也省掉前后端的编解码。
 *   - **不用 multer / FormData**：单文件、无字段，express.raw 就够了，
 *     不引入新依赖。
 *   - 文件名由服务端生成（时间戳 + 随机串 + 扩展名），**不使用客户端文件名**，
 *     从根上避免路径穿越（../../）与重名覆盖。
 *   - 图片是检查单的现场证据，属于"写进去就不该被改"的附件，
 *     因此落盘即终态，不做覆盖/重命名，删除记录时也不动文件
 *     （记录删除后图片成为孤儿文件，量级可忽略，清理属后续运维动作）。
 * ============================================================
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';

/** 允许的图片类型 → 扩展名（不允许的类型直接拒绝，避免被塞进 .js/.html） */
const EXT_BY_TYPE = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/tiff': '.tif',
};

/**
 * 保存一张截图
 * @param {Object} input
 * @param {Buffer} input.buffer 图片原始字节（express.raw 解析后的 req.body）
 * @param {string} input.type   内容类型（image/png ...）
 * @param {string} [input.name] 原始文件名（仅用于兜底推断扩展名与展示）
 * @returns {Promise<Object>} { url, name, type, size }
 */
export async function saveImage({ buffer, type, name }) {
  const contentType = String(type || '').split(';')[0].trim().toLowerCase();

  // 先判类型，再判体积：Content-Type 不是 image/* 时 express.raw 根本没解析请求体
  // （req.body 是 undefined）——先报类型错，报错信息才对得上病因。
  if (!EXT_BY_TYPE[contentType]) {
    const err = new Error(`unsupported image type: ${contentType || '(none)'}`);
    err.status = 415;
    throw err;
  }
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    const err = new Error('empty image body');
    err.status = 400;
    throw err;
  }
  if (buffer.length > config.uploadMaxBytes) {
    const err = new Error(`image too large (max ${Math.round(config.uploadMaxBytes / 1024 / 1024)}MB)`);
    err.status = 413;
    throw err;
  }

  // 文件名服务端自造：时间戳(36 进制) + 随机串，天然唯一、无客户端输入
  const fileName = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${EXT_BY_TYPE[contentType]}`;
  await fs.writeFile(path.join(config.paths.uploads, fileName), buffer);

  return {
    url: `${config.uploadsUrlPrefix}/${fileName}`,
    name: name || fileName,
    type: contentType,
    size: buffer.length,
  };
}
