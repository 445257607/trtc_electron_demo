import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/main/libs/trtc-electron-sdk/build/mac-framework/arm64/*.framework',
            dest: '../../node_modules/electron/dist/Electron.app/Contents/Frameworks'
          },
          {
            src: 'src/main/libs/trtc-electron-sdk/build/mac-framework/arm64/*.framework',
            dest: './Frameworks'
          },
          {
            src: 'src/main/libs/trtc-electron-sdk/build/Release/arm64/*.node',
            dest: '.'
          }
        ]
      })
    ],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@preload': resolve('src/preload')
      }
    },
    plugins: [vue()]
  }
})
