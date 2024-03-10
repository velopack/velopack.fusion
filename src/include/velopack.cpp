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
// #include "subprocess.h"

// platform-specific includes
#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define PATH_MAX MAX_PATH
#include <Windows.h> // For GetCurrentProcessId, GetModuleFileName, MultiByteToWideChar, WideCharToMultiByte, LCMapStringEx
#elif defined(__unix__) || defined(__APPLE__)
#include <unistd.h>  // For getpid
#include <libproc.h> // For proc_pidpath
#endif

// unicode string manipulation support
#if defined(QT_CORE_LIB)

#include <QString>
static std::string VeloString_ToLower(std::string_view s)
{
    QString t = QString::fromStdString(std::string { s });
    return t.toLower().toStdString();
}

static std::string VeloString_ToUpper(std::string_view s)
{
    QString t = QString::fromStdString(std::string { s });
    return t.toUpper().toStdString();
}

#elif defined(_WIN32)

#include <Windows.h>
static std::string VeloString_Win32LCMap(std::string_view s, DWORD flags)
{
    int size = MultiByteToWideChar(CP_UTF8, 0, s.data(), (int)s.size(), nullptr, 0);
    std::wstring wide(size, 0);
    MultiByteToWideChar(CP_UTF8, 0, s.data(), (int)s.size(), wide.data(), size);
    size = LCMapStringEx(LOCALE_NAME_SYSTEM_DEFAULT, LCMAP_LINGUISTIC_CASING | flags, wide.data(), size, nullptr, 0, nullptr, nullptr, 0);
    std::wstring wideResult(size, 0);
    LCMapStringEx(LOCALE_NAME_SYSTEM_DEFAULT, LCMAP_LINGUISTIC_CASING | flags, wide.data(), wide.size(), wideResult.data(), size, nullptr, nullptr, 0);
    int resultSize = WideCharToMultiByte(CP_UTF8, 0, wideResult.data(), size, nullptr, 0, nullptr, nullptr);
    std::string result(resultSize, 0);
    WideCharToMultiByte(CP_UTF8, 0, wideResult.data(), size, result.data(), resultSize, nullptr, nullptr);
    return result;
}

static std::string VeloString_ToLower(std::string_view s)
{
    return VeloString_Win32LCMap(s, LCMAP_LOWERCASE);
}

static std::string VeloString_ToUpper(std::string_view s)
{
    return VeloString_Win32LCMap(s, LCMAP_UPPERCASE);
}

#elif defined(VELOPACK_NO_ICU)

static std::string VeloString_ToLower(std::string_view s)
{
    std::string data(s);
    std::transform(data.begin(), data.end(), data.begin(), [](unsigned char c){ return std::tolower(c); });
    return data;
}

static std::string VeloString_ToUpper(std::string_view s)
{
    std::string data(s);
    std::transform(data.begin(), data.end(), data.begin(), [](unsigned char c){ return std::toupper(c); });
    return data;
}

#else

#include <unicode/unistr.h>

static std::string VeloString_ToLower(std::string_view s)
{
    std::string result;
    return icu::UnicodeString::fromUTF8(s).toLower().toUTF8String(result);
}

static std::string VeloString_ToUpper(std::string_view s)
{
    std::string result;
    return icu::UnicodeString::fromUTF8(s).toUpper().toUTF8String(result);
}

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

static std::string nativeGetCurrentProcessPath()
{
    const size_t buf_size = PATH_MAX;
    char path_buf[buf_size];
    size_t bytes_read = buf_size;

#if defined(_WIN32)
    HMODULE hMod = GetModuleHandleA(NULL);
    bytes_read = GetModuleFileNameA(hMod, path_buf, buf_size);
#else
    // Inspired by: https://stackoverflow.com/a/8149380
    bytes_read = proc_pidpath(getpid(), path_buf, sizeof(path_buf));
    if (bytes_read <= 0)
    {
        throw std::runtime_error("Can't find current process path");
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
        throw std::runtime_error("Unable to start process.");
    }

    return subprocess;
}

static void nativeStartProcessFireAndForget(const std::vector<std::string> *command_line)
{
    nativeStartProcess(command_line, subprocess_option_no_window | subprocess_option_inherit_environment);
}

static std::string nativeStartProcessBlocking(const std::vector<std::string> *command_line)
{
    subprocess_s subprocess = nativeStartProcess(command_line, subprocess_option_no_window | subprocess_option_inherit_environment);
    FILE *p_stdout = subprocess_stdout(&subprocess);

    if (!p_stdout)
    {
        throw std::runtime_error("Failed to open subprocess stdout.");
    }

    std::stringstream buffer;
    constexpr size_t bufferSize = 4096; // Adjust buffer size as necessary
    char readBuffer[bufferSize];

    // Read the output in chunks
    while (!feof(p_stdout) && !ferror(p_stdout))
    {
        size_t bytesRead = fread(readBuffer, 1, bufferSize, p_stdout);
        if (bytesRead > 0)
        {
            buffer.write(readBuffer, bytesRead);
        }
    }

    int return_code;
    subprocess_join(&subprocess, &return_code);

    if (return_code != 0)
    {
        throw std::runtime_error("Process returned non-zero exit code. Check the log for more details.");
    }

    if (ferror(p_stdout))
    {
        throw std::runtime_error("Error reading subprocess output.");
    }

    return buffer.str();
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