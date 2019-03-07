@echo off

echo ## Building PyInstaller Binary
python -m PyInstaller -F .\pyinstaller.spec --clean

echo.
echo ## Build ready at: %cd%\dist
