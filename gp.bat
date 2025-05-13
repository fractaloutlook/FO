@echo off
REM Store the current date and time in a variable
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%-%dt:~8,6%"

REM First, perform the normal git operations
git add .
git commit -m "%~1"

REM Create diffs directory if it doesn't exist
if not exist "diffs" mkdir diffs

REM Generate diff files for key components
echo Generating diffs for key files...

REM Use git show to get previous versions
git show HEAD:src/components/StatusUpdates.tsx > diffs/StatusUpdates.tsx.prev 2>nul
git show HEAD:src/components/ChatSystem.jsx > diffs/ChatSystem.jsx.prev 2>nul
git show HEAD:src/components/AdminControls.tsx > diffs/AdminControls.tsx.prev 2>nul
git show HEAD:src/pages/LandingPage.jsx > diffs/LandingPage.jsx.prev 2>nul
git show HEAD:server/src/lib.rs > diffs/lib.rs.prev 2>nul

REM Compare with current versions and save diffs
git diff HEAD~1 HEAD -- src/components/StatusUpdates.tsx > diffs/StatusUpdates.tsx.diff 2>nul
git diff HEAD~1 HEAD -- src/components/ChatSystem.jsx > diffs/ChatSystem.jsx.diff 2>nul
git diff HEAD~1 HEAD -- src/components/AdminControls.tsx > diffs/AdminControls.tsx.diff 2>nul
git diff HEAD~1 HEAD -- src/pages/LandingPage.jsx > diffs/LandingPage.jsx.diff 2>nul
git diff HEAD~1 HEAD -- server/src/lib.rs > diffs/lib.rs.diff 2>nul

REM Add the diff files to the repo
git add diffs/*.diff

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% neq 0 (
  git commit -m "Auto-generated diffs for key files"
)

REM Push all changes
git push origin main

echo Done!