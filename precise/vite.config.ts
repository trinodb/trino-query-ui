import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Used for local debugging against Trino also running on localhost at port 8080:
// https://vitejs.dev/config/
export default defineConfig({
  base: '/query/',
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// Used for integration into Trino
// // https://vitejs.dev/config/
// export default defineConfig({
//   base: '/query/', // This tells your app it's served from the /query/ path
//   plugins: [react()]
// });