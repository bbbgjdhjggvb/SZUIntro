import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readFileSync } from 'fs';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// 获取动态资源的根目录
function getDynamicAssetsPath() {
  if (app.isPackaged) {
    // 生成环境
    const rpath = path.posix.join(process.resourcesPath, 'external');
    return  rpath
  } else {
    // 开发环境：资源位于项目根目录的resources/external
    const rpath = path.posix.join(app.getAppPath(), 'resources', 'external');
    // console.log('Dynamic assets path (dev):', path);
    return rpath
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 3840,
    height: 2160,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // // 在生产环境中打开 DevTools 以便调试
    // if (is.dev) {
    //   mainWindow.webContents.openDevTools()
    // }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 添加页面加载错误处理
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    // console.error('Failed to load:', errorCode, errorDescription, validatedURL)
  })

  // 添加控制台消息监听
  mainWindow.webContents.on('console-message', (_event, level, message, _line, _sourceId) => {
    // console.log(`Renderer console [${level}]: ${message}`)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // 在生产环境中，确保路径正确
    const indexPath = join(__dirname, '../renderer/index.html')
    // console.log('Loading renderer from:', indexPath)
    mainWindow.loadFile(indexPath)
  }
}

// IPC ：读取json文件
ipcMain.handle('read-config-file', async(_event) =>{
   try {
    const configPath = join(getDynamicAssetsPath(), 'data', 'data.json');
    const configData = readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error reading dynamic config data.json:`, error);
    return null;
  }
})

// IPC ：读取json文件
ipcMain.handle('read-config-file-accor-name', async(_event, file: string) =>{
   try {
    const configPath = join(getDynamicAssetsPath(), 'data', file);
    const configData = readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error reading dynamic config data.json:`, error);
    return null;
  }
})

// IPC 处理器：读取图片文件（返回 Base64 编码）
ipcMain.handle('read-image', async (_event, imageName: string) => {
  try {
    const imagePath = join(getDynamicAssetsPath(), imageName);
    const imageData = readFileSync(imagePath);
    // 将图片数据转换为 Base64 编码，以便在渲染进程的<img>标签中使用
    const base64Image = `data:image/${imageName.split('.').pop()};base64,${imageData.toString('base64')}`;
    return base64Image;
  } catch (error) {
    console.error(`Error reading dynamic image ${imageName}:`, error);
    return null;
  }
});

// get-image-files-in-dir返回图片的相对路径和对应的名称
interface PhotoItem{
  fullPath: string;
  displayName: string; // 相对路径，用于前端
  title: string;
}

//IPC 处理器：递归遍历文件夹，并且过滤出jpg/png图片文件
ipcMain.handle('get-image-files-in-dir', async (_event, dirpath: string) => {
  // dirpath前面可能有 '/'，需要删除
  const cleanDirPath = dirpath.startsWith('/') ? dirpath.slice(1) : dirpath
  const fullPath = path.posix.join(getDynamicAssetsPath(), cleanDirPath);

  // console.log('Scanning Dir: ' + fullPath)

  try{
    if(!fs.existsSync(fullPath)){
      console.error(`Directory does not exist: ${fullPath}`);
      return [];
    }

    const result: PhotoItem[] = [];
    // 读取子文件夹
    const subDirs = fs.readdirSync(fullPath, { withFileTypes: true });

    for(const subDir of subDirs){
      if(subDir.isDirectory()){
        const subDirPath = path.posix.join(fullPath, subDir.name);

        // 获取子文件夹中的所有文件，按照规定只有一张
        const files = fs.readdirSync(subDirPath);

        //找到第一张图片文件，排除一些跨系统的dotfile
        const validImage = files.find(file=>{
          if (file.startsWith('.')) return false;
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })

        if(validImage){
          result.push({
            fullPath:path.posix.join(subDirPath, validImage),
            displayName: path.posix.join(dirpath, subDir.name, files[0]),
            title:subDir.name
          });
        }
      }
    }
    return result;

  } catch (error) {
    console.error(`Error reading directory ${fullPath}:`, error);
    return [];
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 自定义读取图片的协议，对照片读取进行优化
  protocol.handle('local-image', (request) =>{
    const url = request.url.replace('local-image://', '');

    // 解码url，处理中文路径，特殊字符
    const decodedPath = decodeURIComponent(url);
    const rootDir = getDynamicAssetsPath();

    const fullPath = path.posix.join(rootDir, decodedPath);

    // console.log('Loading image from local-image protocol:', fullPath);

    return net.fetch(pathToFileURL(fullPath).toString());
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.