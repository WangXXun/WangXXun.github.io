/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 需要设置 basePath 如果仓库不在根目录
  // 由于你的仓库名是 WangXXun.github.io，不需要 basePath
  basePath: '',
  assetPrefix: '',
}

module.exports = nextConfig
