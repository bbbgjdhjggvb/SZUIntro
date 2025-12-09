import { ElectronAPI } from '@electron-toolkit/preload'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    fileReadApi: {
      readConfigFile:() => Promise<any | null>,
      readConfigFileAccorName: () => Promise<any | null>,
      getImageFilesInDir:(dirpath:string) => Promise<PhotoItem[]>
    }
  }
}