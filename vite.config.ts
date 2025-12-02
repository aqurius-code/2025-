import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 작업 디렉토리에서 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 클라이언트 코드에서 process.env.API_KEY를 사용할 수 있도록 치환
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})