/// <reference types="vite/client" />

// 这行是关键
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明JSON模块
declare module '*.json' {
  const value: any
  export default value
}