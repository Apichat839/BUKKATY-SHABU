/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // ย้าย build cache ไป C: เพื่อหนีปัญหา slow filesystem บน path ที่มี space
  distDir: 'C:/next-cache/bukkaty-shabu',

  webpack: (config, { dev }) => {
    if (dev) {
      // ใช้ memory cache ใน dev mode แทน filesystem → เร็วกว่ามาก
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
