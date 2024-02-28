*Applies to: Windows, MacOS, Linux*

# Getting Started: C++

1. Copy [Velopack.hpp](https://github.com/velopack/velopack.fusion/blob/master/for-cpp/Velopack.hpp) and [Velopack.cpp](https://github.com/velopack/velopack.fusion/blob/master/for-cpp/Velopack.cpp) into your project. 

2. If you are on Linux or MacOS, you'll need [ICU4C](https://icu.unicode.org/) installed. Like many other C libraries, this is bundled into one package. 
Installing the development package with your package manager (`apt` etc) is sufficient to make it available to compilers. The specific command you'll need is OS/Distro specific.

3. Add the `Velopack::startup()` to your entry point (eg. `main()` or `wmain()`) as early as possible, ideally the first statement to run:
```cpp
#include "Velopack.hpp"

wmain(int argc**, wchar_t *argv[ ], wchar_t *envp[ ])
{
    // velopack may exit / restart your app at this statement
    Velopack::startup(argv, argc);

    // ... your other startup code here
}
```

3. Add auto-updates somewhere to your app:
```cpp
#include "Velopack.hpp"
#include <memory>

static void update_app()
{
    Velopack::UpdateManagerSync manager{};
    manager.setUrlOrPath("https://the.place/you-host/updates");

    std::shared_ptr<Velopack::UpdateInfo> updInfo = manager.checkForUpdates();
    if (updInfo == nullptr) {
        return; // no updates available
    }

    manager.downloadUpdates(updInfo->targetFullRelease.get());
    manager.applyUpdatesAndRestart(updInfo->targetFullRelease.get());
}
```

4. Compile your app to a program using your usual compiler (eg. msvc, cmake, gcc, etc)

5. Install the `vpk` command line tool:
```sh
dotnet tool update -g vpk
```
***Note: you must have the .NET Core SDK 6 installed to use and update `vpk`***

6. Package your Velopack release / installers:
```sh
vpk pack -u MyAppUniqueId -v 1.0.0 -p /myBuildDir -e myexename.exe
```

✅ You're Done! Your app now has auto-updates and an installer.
You can upload your release to your website, or use the `vpk upload` command to publish it to the destination of your choice.