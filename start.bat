@echo off
title inakuro-db (port 3001)
cd /d "C:\Users\y-okawa\Desktop\appsetting\inakuro-db"
echo Starting inakuro-db on http://localhost:3001
echo Press Ctrl+C to stop.
npm run dev -- --port 3001
pause
