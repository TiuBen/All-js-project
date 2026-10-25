/**
 * ============================================================
 * upload —— 检查项截图落盘
 * ------------------------------------------------------------
 * 落盘到 config.paths.uploads（data/uploads/），
 * 对外通过 config.uploadsUrlPrefix（/api/uploads/xxx.png）静态访问。
 *
 * 刻意不用 multer / FormData：请求体本身就是图片二进制，
 * 路由上挂一个 express.raw({ type: 'image/*' }) 接住即可（见 checklistRoutes.js）。
 * ============================================================
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';
import { badRequest, payloadTooLarge, unsupportedMedia } from '../utils/http.js';
import { cleanText } from '../utils/values.js';

/** Content-Type → 后缀白名单（不在表里的一律 415） */
const EXT_BY_TYPE = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
};

/**
 * 保存一张截图
 * @param {Buffer} buffer 图片二进制（express.raw 解出来的 req.body）
 * @param {string} contentType 请求头 Content-Type
 * @param {string} [name] 原始文件名，仅用于回显
 * @returns {Promise<{url:string, name:string, type:string, size:number}>}
 */
export async function saveImage(buffer, contentType, name) {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase();
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw unsupportedMedia(`不支持的图片类型：${contentType || '(未提供)'}`);
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw badRequest('请求体为空，需要图片二进制（Content-Type: image/*）');
  }
  if (buffer.length > config.uploadMaxBytes) {
    throw payloadTooLarge(`图片超过 ${Math.round(config.uploadMaxBytes / 1024 / 1024)}MB 上限`);
  }

  // 文件名自己生成（时间戳 + 随机串），不采信客户端的 name，避免路径穿越
  const filename = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(config.paths.uploads, filename), buffer);

  return {
    url: `${config.uploadsUrlPrefix}/${filename}`,
    name: cleanText(name) ?? filename,
    type,
    size: buffer.length,
  };
}

