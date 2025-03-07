call plink opc@64.181.202.144 -no-antispoof -i "C:\Users\USER\My Documents\oracle\oracle_private1.ppk" < "D:\CODE_REPOS\claudbiz\server\src\lib.rs" "cat > ~/status-module/src/lib.rs"

call plink opc@64.181.202.144 -no-antispoof -i "C:\Users\USER\My Documents\oracle\oracle_private1.ppk" cd ~/status-module;spacetimedb-cli publish --project-path . status-module