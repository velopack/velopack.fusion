#include <string>
#include <filesystem>
#include <algorithm>
#include <cctype>
#include <stdexcept>
#include <functional>
#include <iostream>
#include <fstream>
#include <sstream>
#include <thread>

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define PATH_MAX MAX_PATH
#include <windows.h>
#endif // VELO_MSVC

namespace Velopack
{
#if UNICODE
    void startup(wchar_t **args, size_t c_args)
    {
        for (size_t i = 0; i < c_args; ++i)
        {
            if (::std::wstring(args[i]) == L"--veloapp-install")
            {
                exit(0);
            }
            if (::std::wstring(args[i]) == L"--veloapp-updated")
            {
                exit(0);
            }
            if (::std::wstring(args[i]) == L"--veloapp-obsolete")
            {
                exit(0);
            }
            if (::std::wstring(args[i]) == L"--veloapp-uninstall")
            {
                exit(0);
            }
        }
    }
#endif // UNICODE

    void startup(char **args, size_t c_args)
    {
        for (size_t i = 0; i < c_args; ++i)
        {
            if (::std::string(args[i]) == "--veloapp-install")
            {
                exit(0);
            }
            if (::std::string(args[i]) == "--veloapp-updated")
            {
                exit(0);
            }
            if (::std::string(args[i]) == "--veloapp-obsolete")
            {
                exit(0);
            }
            if (::std::string(args[i]) == "--veloapp-uninstall")
            {
                exit(0);
            }
        }
    }

    std::string util_current_os_name()
    {
#if defined(__APPLE__)
        return "darwin";
#elif defined(_WIN32)
        return "win32";
#else
        return "linux";
#endif
    }

    std::string util_string_to_lower(std::string str)
    {
        std::string data = str;
        std::transform(data.begin(), data.end(), data.begin(),
                       [](unsigned char c)
                       { return std::tolower(c); });
        return data;
    }

    bool util_does_file_exist(std::string file_path)
    {
        return std::filesystem::exists(file_path);
    }

    std::string util_get_own_exe_path()
    {
        const size_t buf_size = PATH_MAX;
        char path_buf[buf_size];
        size_t bytes_read = buf_size;

#if defined(__APPLE__)
        if (_NSGetExecutablePath(path_buf, &bytes_read) != 0)
        {
            throw std::runtime_error("Buffer size is too small for executable path.");
        }
#elif defined(_WIN32)
        HMODULE hMod = GetModuleHandleA(NULL);
        bytes_read = GetModuleFileNameA(hMod, path_buf, buf_size);
#else
        bytes_read = readlink("/proc/self/exe", path_buf, bufSize);
        if ((int)bytes_read == -1)
        {
            throw std::runtime_error("Permission denied to /proc/self/exe.");
        }
#endif

        return std::string(path_buf, bytes_read);
    }

    bool ci_equal(const std::string &a, const std::string &b)
    {
        return std::equal(a.begin(), a.end(), b.begin(), b.end(),
                          [](char a, char b)
                          {
                              return tolower(a) == tolower(b);
                          });
    }

    subprocess_s util_start_process(const std::vector<std::string> *command_line, int options)
    {
        auto size = command_line->size();
        const char **command_line_array = new const char *[size + 1];
        for (size_t i = 0; i < size; ++i)
        {
            command_line_array[i] = command_line->at(i).c_str();
        }
        command_line_array[size] = NULL; // last element must be NULL

        struct subprocess_s subprocess;
        int result = subprocess_create(command_line_array, options, &subprocess);
        delete[] command_line_array; // clean up the array

        if (result != 0)
        {
            throw std::runtime_error("Unable to start Update process.");
        }

        return subprocess;
    }

    std::string util_start_process_blocking_output(const std::vector<std::string> *command_line, int options)
    {
        subprocess_s subprocess = util_start_process(command_line, options);
        FILE *p_stdout = subprocess_stdout(&subprocess);
        std::filebuf buf = std::basic_filebuf<char>(p_stdout);
        std::istream is(&buf);
        std::stringstream buffer;
        buffer << is.rdbuf();
        return buffer.str();
    }


}