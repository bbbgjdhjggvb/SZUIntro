import { contextBridge, ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    // 通过preload暴露在渲染进程中的IPC处理器接口
    contextBridge.exposeInMainWorld('fileReadApi', {
    readConfigFile: () => ipcRenderer.invoke('read-config-file'),
    readImage:(imageName:string) => ipcRenderer.invoke('read-image', imageName),
    getImageFilesInDir:(dirpath:string) => ipcRenderer.invoke('get-image-files-in-dir', dirpath),
    readConfigFileAccorName: (file:string)=> ipcRenderer.invoke('read-config-file-accor-name', file),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
