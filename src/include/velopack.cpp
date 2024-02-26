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
#include "Velopack.hpp"

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define PATH_MAX MAX_PATH
#include <Windows.h>
#elif defined(__unix__) || defined(__APPLE__) && defined(__MACH__)
#include <unistd.h> // For getpid on UNIX-like systems
#endif

static std::string nativeCurrentOsName()
{
#if defined(__APPLE__)
    return "darwin";
#elif defined(_WIN32)
    return "win32";
#else
    return "linux";
#endif
}

static bool nativeDoesFileExist(std::string file_path)
{
    return std::filesystem::exists(file_path);
}

static void nativeExitProcess(int exit_code)
{
    ::exit(exit_code);
}

static std::string nativeGetCurrentProcessPath()
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

static subprocess_s nativeStartProcess(const std::vector<std::string> *command_line, int options)
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

static void nativeStartProcessFireAndForget(const std::vector<std::string> *command_line)
{
    nativeStartProcess(command_line, subprocess_option_no_window);
}

// static std::thread nativeStartProcessAsyncReadLine(const std::vector<std::string> *command_line, Velopack::ProcessReadLineHandler *handler)
// {
//     subprocess_s subprocess = nativeStartProcess(command_line, subprocess_option_no_window | subprocess_option_enable_async);

//     std::thread outputThread([subprocess, handler]() mutable
//     {
//         const unsigned BUFFER_SIZE = 1024;
//         char readBuffer[BUFFER_SIZE];
//         std::string accumulatedData;

//         // read all stdout from the process one line at a time
//         while (true) {
//             unsigned bytesRead = subprocess_read_stdout(&subprocess, readBuffer, BUFFER_SIZE - 1);

//             if (bytesRead == 0) {
//                 // bytesRead is 0, indicating the process has completed
//                 // Process any remaining data in accumulatedData as the last line if needed
//                 if (!accumulatedData.empty()) {
//                     handler->handleProcessOutputLine(accumulatedData);
//                 }
//                 return;
//             }

//             accumulatedData += std::string(readBuffer, bytesRead);

//             // Process accumulated data for lines
//             size_t pos;
//             while ((pos = accumulatedData.find('\n')) != std::string::npos) {
//                 std::string line = accumulatedData.substr(0, pos);
//                 if (handler->handleProcessOutputLine(line)) {
//                     return; // complete or err
//                 }
//                 accumulatedData.erase(0, pos + 1);
//             }
//         }
//     });

//     return outputThread;
// }

static std::string nativeStartProcessBlocking(const std::vector<std::string> *command_line)
{
    subprocess_s subprocess = nativeStartProcess(command_line, subprocess_option_no_window);
    FILE *p_stdout = subprocess_stdout(&subprocess);
    std::filebuf buf = std::basic_filebuf<char>(p_stdout);
    std::istream is(&buf);
    std::stringstream buffer;
    buffer << is.rdbuf();

    int return_code;
    subprocess_join(&subprocess, &return_code);

    if (return_code != 0)
    {
        throw std::runtime_error("Process returned non-zero exit code. Check the log for more details.");
    }

    return buffer.str();
}

static int32_t nativeCurrentProcessId()
{
#if defined(_WIN32)
    return GetCurrentProcessId();
#elif defined(__unix__) || defined(__APPLE__) && defined(__MACH__)
    return getpid();
#else
#error "Unsupported platform"
    return -1; // Indicate error or unsupported platform
#endif
}

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
} // namespace Velopack