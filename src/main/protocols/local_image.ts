import { app, net, protocol } from "electron";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import sharp from "sharp";
import crypto from 'crypto';

const PROTOCOL_NAME = 'local-image';
const CHACHE_DIR = path.join(app.getPath('userData'), 'image_cache');

if (!fs.existsSync(CHACHE_DIR)){
    // 递归创建目录
    fs.mkdirSync(CHACHE_DIR, { recursive: true });
}

/**
 * 图片协议
 * @param getRootDir 一个回调函数，用于动态获取资源目录
 */
export function registerLocalImageProtocol(getRootDir: () => string) {
    protocol.handle(PROTOCOL_NAME, async (request)=>{
        const urlObj = new URL(request.url);
        let fullRelativePath = urlObj.host + urlObj.pathname;
        const relativePath = decodeURIComponent(fullRelativePath.replace(/^\/*/,'')); // 处理中文，去掉开头斜杠
        console.log(`[Protocol]: Requested local-image URL: ${request.url}, resolved path: ${relativePath}`);
        const isThumb = urlObj.searchParams.get('type') === 'thumb';
        const rootDir = getRootDir();
        const fullPath = path.join(rootDir, relativePath);

        // 如果文件不存在
        if (!fs.existsSync(fullPath)) {
            console.error(`[Protocol]: File not found: ${fullPath}`);
            return new Response(null, { status: 404 });
        }

        // 缩略图
        if(isThumb) {
            try {
                const hash = crypto.createHash('md5').update(fullPath).digest('hex');
                const cacheFileName = `${hash}.webp`; 
                const cachePath = path.join(CHACHE_DIR, cacheFileName);

                if(fs.existsSync(cachePath)) {
                    return net.fetch(pathToFileURL(cachePath).toString());
                }

                // 如果不存在启动另外的线程，生成缩略图
                await sharp(fullPath).resize(500).webp({ quality: 90 }).toFile(cachePath);
                return net.fetch(pathToFileURL(cachePath).toString());
            } catch (error) {
                console.error(`[Protocol]: Error generating thumbnail for ${fullPath}:`, error);
                return net.fetch(pathToFileURL(fullPath).toString());
            }
        }

        return net.fetch(pathToFileURL(fullPath).toString());
    });
}