#include <string>
#include <filesystem>
#include <algorithm>
#include <cctype>

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define PATH_MAX MAX_PATH
#include <windows.h>
#endif // VELO_MSVC

namespace Velopack {

#if UNICODE
void startup(wchar_t** args, size_t c_args) {
    for (size_t i = 0; i < c_args; ++i) {
        if (::std::wstring(args[i]) == L"--veloapp-install") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-updated") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-obsolete") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-uninstall") {
            exit(0);
        }
    }
}
#endif // UNICODE

void startup(char** args, size_t c_args) {
    for (size_t i = 0; i < c_args; ++i) {
        if (::std::string(args[i]) == "--veloapp-install") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-updated") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-obsolete") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-uninstall") {
            exit(0);
        }
    }
}

std::string util_current_os_name()
{
#ifdef __APPLE__
    return "darwin";
#elif defined(_WIN32)
    return "win32";
#else
    return "linux";
#endif
}

std::string util_string_to_lower(std::string str) {
    std::string data = str;
    std::transform(data.begin(), data.end(), data.begin(),
        [](unsigned char c) { return std::tolower(c); });
    return data;
}

bool util_does_file_exist(std::string file_path) {
    return std::filesystem::exists(file_path);
}

std::string util_get_own_exe_path() {
	const size_t buf_size = PATH_MAX;
	char path_buf[buf_size];
	size_t bytes_read = buf_size;

#ifdef __APPLE__
	if (_NSGetExecutablePath(path_buf, &bytes_read) != 0) {
		throw std::runtime_error("Buffer size is too small for executable path.");
	}
#elif defined(_WIN32)
	HMODULE hMod = GetModuleHandleA(NULL);
	bytes_read = GetModuleFileNameA(hMod, path_buf, buf_size);
#else
	bytes_read = readlink("/proc/self/exe", path_buf, bufSize);
	if ((int)bytes_read == -1) {
		throw std::runtime_error("Permission denied to /proc/self/exe.");
	}
#endif

	return std::string(path_buf, bytes_read);
}

bool ci_equal(const std::string& a, const std::string& b) {
    return std::equal(a.begin(), a.end(), b.begin(), b.end(),
        [](char a, char b) {
            return tolower(a) == tolower(b);
        });
}

}