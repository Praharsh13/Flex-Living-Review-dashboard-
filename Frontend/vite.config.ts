import {loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'


// https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(),
//     react()],
//   server:{
//     proxy:{
//         '/api': "http://localhost:8081"
//       }
//     }
// })
export default ({ mode }: { mode: string }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.BACKEND_URL || 'http://localhost:8081'
  return {
    plugins: [react(),tailwindcss()],
    server: { proxy: { '/api': { target, changeOrigin: true, secure: false } } },
  }
}