//  UNICODE SUPPORT NOTES
// 
//  To keep this library as light as possible, we will try to avoid using ICU4C 
//  if possible. If Qt is available, we will use its QString class to handle
//  Unicode string manipulation. On Windows, we will use the Win32 unicode API.
//  If neither of these are available, we will fall back to using ICU4C.
//
//  On Windows, for full Unicode support, you will need to set the code page.
//  https://learn.microsoft.com/en-us/windows/apps/design/globalizing/use-utf8-code-page
// 
//  If you would like to disable ICU4C and fall back to ASCII-only functions on, 
//  systems without an alternative implementation, uncomment the following define:
//
//  #define VELOPACK_NO_ICU

#ifndef VELOPACK_H_INCLUDED
#define VELOPACK_H_INCLUDED

#include <cstddef>

namespace Velopack
{
#if UNICODE
    void startup(wchar_t **args, size_t c_args);
#endif // UNICODE
    void startup(char **args, size_t c_args);
}

#endif // VELOPACK_H_INCLUDED