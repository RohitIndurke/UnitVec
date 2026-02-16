@echo off
echo Starting PHP Server on http://localhost:3000
php -S localhost:3000 -c "d:\UnitVec - Copy\php.ini" -t frontend backend/router.php
pause
