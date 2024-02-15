rmdir /s /q bin
mkdir bin
@REM fut -o bin/UpdateManager.c,cpp,cs,java,js,ts,py,swift UpdateManager.fu
@REM fut -o bin/UpdateManager.c -D C -D WINDOWS Platform.fu UpdateManager.fu
@REM fut -o bin\UpdateManager.cs -n Velopack -D CS Platform.fu UpdateManager.fu || exit /b


fut -o bin\Velopack.cpp -n Velopack -D CPP Util.fu UpdateInfo.fu Platform.fu UpdateManager.fu || exit /b
fut -o bin\Velopack.js -n Velopack -D JS Util.fu VelopackApp.fu UpdateInfo.fu Platform.fu UpdateManager.fu || exit /b
fut -o bin\Velopack.ts -n Velopack -D JS Util.fu VelopackApp.fu UpdateInfo.fu Platform.fu UpdateManager.fu || exit /b
@REM fut -o bin\Velopack.cs -n Velopack -D CS Util.fu VelopackApp.fu VelopackAsset.fu Platform.fu UpdateManager.fu || exit /b

powershell -Command "(gc bin\Velopack.hpp) -replace 'shared_ptr', 'unique_ptr' | Out-File -encoding ASCII bin\Velopack.hpp"
powershell -Command "(gc bin\Velopack.cpp) -replace 'shared_ptr', 'unique_ptr' | Out-File -encoding ASCII bin\Velopack.cpp"
powershell -Command "(gc bin\Velopack.cpp) -replace 'make_shared', 'make_unique' | Out-File -encoding ASCII bin\Velopack.cpp"
powershell -Command "(gc bin\Velopack.cpp) -replace 'std::cmatch', 'std::smatch' | Out-File -encoding ASCII bin\Velopack.cpp"

type include\json.hpp newline include\subprocess.h newline include\velopack.hpp newline bin\Velopack.hpp > bin\combined.hpp
move /Y bin\combined.hpp bin\Velopack.hpp

type bin\Velopack.cpp newline include\velopack.cpp > bin\combined.cpp
move /Y bin\combined.cpp bin\Velopack.cpp

