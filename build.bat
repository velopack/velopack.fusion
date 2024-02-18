@REM fut -o bin/UpdateManager.c,cpp,cs,java,js,ts,py,swift UpdateManager.fu

.\fut.exe -o for-cpp\Velopack.cpp -n Velopack -D CPP Json.fu Util.fu UpdateInfo.fu Platform.fu UpdateManager.fu || exit /b
.\fut.exe -o for-js\Velopack.ts -n Velopack -D JS Json.fu Util.fu VelopackApp.fu UpdateInfo.fu Platform.fu UpdateManager.fu || exit /b
.\fut.exe -o for-cs\Velopack.cs -n Velopack -D CS Json.fu || exit /b

@REM To finish the C++ code generation, we fix a few bugs in the generation and combine all files into one
powershell -Command "(gc for-cpp\Velopack.hpp) -replace 'shared_ptr', 'unique_ptr' | Out-File -encoding ASCII for-cpp\Velopack.hpp"
powershell -Command "(gc for-cpp\Velopack.cpp) -replace 'shared_ptr', 'unique_ptr' | Out-File -encoding ASCII for-cpp\Velopack.cpp"
powershell -Command "(gc for-cpp\Velopack.cpp) -replace 'make_shared', 'make_unique' | Out-File -encoding ASCII for-cpp\Velopack.cpp"
type include\json.hpp newline include\subprocess.h newline include\velopack.hpp newline for-cpp\Velopack.hpp > for-cpp\combined.hpp
move /Y for-cpp\combined.hpp for-cpp\Velopack.hpp
type for-cpp\Velopack.cpp newline include\velopack.cpp > for-cpp\combined.cpp
move /Y for-cpp\combined.cpp for-cpp\Velopack.cpp

@REM Compile typescript to javascript + definitions
cd for-js
npm run build