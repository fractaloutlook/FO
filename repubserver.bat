@echo off
REM Copy the lib.rs file to the server
call plink ubuntu@149.130.211.144 -no-antispoof -i "C:\Users\USER\My Documents\oracle\oracle_private2.ppk" "cat > ~/status-module/src/lib.rs" 0<"D:\CODE_REPOS\claudbiz\server\src\lib.rs"

REM Publish the module (corrected command)
call plink ubuntu@149.130.211.144 -no-antispoof -i "C:\Users\USER\My Documents\oracle\oracle_private2.ppk" "cd ~/status-module;spacetimedb-cli publish --project-path . status-module"


