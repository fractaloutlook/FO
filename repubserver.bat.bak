@echo off
REM Copy the lib.rs file to the server
call plink ubuntu@64.181.202.3 -no-antispoof -i "C:\Users\USER\My Documents\oracle\newdualsys.ppk" "cat > ~/status-module/src/lib.rs" 0<"D:\CODE_REPOS\claudbiz\server\src\lib.rs"

REM Publish the module using bash to load environment properly
call plink ubuntu@64.181.202.3 -no-antispoof -i "C:\Users\USER\My Documents\oracle\newdualsys.ppk" "bash -l -c 'cd ~/status-module && spacetime publish --project-path . status-module'"
