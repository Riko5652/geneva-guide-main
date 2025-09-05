@echo off
echo 🔄 Updating cache versions...
node build-cache.js
if %errorlevel% equ 0 (
    echo.
    echo ✅ Cache busting complete!
    echo 💡 Run 'npm run deploy' or push to deploy
) else (
    echo ❌ Cache busting failed!
)
pause
