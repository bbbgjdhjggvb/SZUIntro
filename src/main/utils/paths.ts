import { app } from "electron";
import path from "path";

export function getDynamicAssetsPath(): string {
  if (app.isPackaged) {
    // 生成环境
    const rpath = path.posix.join(process.resourcesPath, 'external');
    return  rpath
  } else {
    // 开发环境：资源位于项目根目录的resources/external
    const rpath = path.posix.join(app.getAppPath(), 'resources', 'external');
    return rpath
  }
}