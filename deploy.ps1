# PowerShell 部署脚本（Windows）

Write-Host "Building Next.js project..." -ForegroundColor Cyan
npm run build

Write-Host "Copying build output to root..." -ForegroundColor Cyan
# 复制 out 目录下的所有内容到根目录
Copy-Item -Path "out\*" -Destination "." -Recurse -Force

# 创建 .nojekyll 文件
New-Item -ItemType File -Path ".nojekyll" -Force | Out-Null

Write-Host "`nDeployment files ready! Now commit and push:" -ForegroundColor Green
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host "  git commit -m 'Deploy to GitHub Pages'" -ForegroundColor Yellow
Write-Host "  git push origin master" -ForegroundColor Yellow
