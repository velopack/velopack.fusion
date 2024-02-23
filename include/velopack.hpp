#ifndef VELOPACK_H_INCLUDED
#define VELOPACK_H_INCLUDED

#include <string>
#include <vector>
#include <thread>

namespace Velopack
{
#if UNICODE
    void startup(wchar_t **args, size_t c_args);
#endif // UNICODE
    void startup(char **args, size_t c_args);
}
#endif // VELOPACK_H_INCLUDED