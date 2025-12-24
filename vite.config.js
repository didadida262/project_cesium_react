import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

/** @type {import('vite').UserConfig} */
export default {
  plugins: [react(), cesium()],
  build: {
    commonjsOptions: {
      strictRequires: true, // 兼容commonjs
    },
    outDir: 'dist',
    rollupOptions: {
      plugins: {
        // 重写静态资源路径
        name: 'rewrite-paths',
        generateBundle(_, bundle) {
          for (const fileName in bundle) {
            const chunk = bundle[fileName]
            if (chunk.type === 'chunk' && chunk.code) {
              chunk.code = chunk.code.replace(
                /\/json\//g,
                '/cesium-react-vite/json/',
              )
              chunk.code = chunk.code.replace(/\/images\//g, '/images/')
              chunk.code = chunk.code.replace(/\/models\//g, '/models/')
            }
          }
        },
      },
    },
  },
}
