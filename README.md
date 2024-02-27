<a href="https://velopack.io">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/velopack/velopack/master/docfx/images/velopack-white.svg">
  <img alt="Velopack Logo" src="https://raw.githubusercontent.com/velopack/velopack/master/docfx/images/velopack-black.svg" width="300">
</picture>
</a>

---

[![Crates.io](https://img.shields.io/crates/v/velopack?style=flat-square)](https://crates.io/crates/velopack)
[![npmjs.com](https://img.shields.io/npm/v/velopack?style=flat-square)](https://www.npmjs.com/package/velopack)
[![Discord](https://img.shields.io/discord/767856501477343282?style=flat-square&color=purple)](https://discord.gg/CjrCrNzd3F)
[![Build](https://img.shields.io/github/actions/workflow/status/velopack/velopack.fusion/build.yml?branch=master&style=flat-square)](https://github.com/velopack/velopack.fusion/actions)
[![License](https://img.shields.io/github/license/velopack/velopack.fusion?style=flat-square)](https://github.com/velopack/velopack/blob/master/LICENSE)

# Velopack Fusion

[Velopack](https://velopack.io) is an installer and automatic update framework for cross-platform desktop applications.

Fusion is the home for client libraries which assist developers integrating their applications with [Velopack](https://velopack.io). Fusion also provides a simple command line interface for downloading and staging updates, so if your language does not have a client library you can still use the CLI to integrate your app.

## Documentation / Getting Started
The full Velopack documentation for the framework is available at [https://velopack.io/docs](https://velopack.io/docs), however there may be some additional library-specific documentation linked below.

There are a variety of getting started guides also available at [https://velopack.io/docs](https://velopack.io/docs), so be sure to check it out first.

## Supported Languages

| Lang | Status | Runtime Deps | Sync | Async | Links |
|:-:|---|---|---|---|---|
| C# | ✅ Complete | ✅ None | ✅ Yes | ✅ Yes | [quick start](https://velopack.io/docs/getting-started/csharp.html), [docs](https://velopack.io/docs/updating/overview.html), [samples](https://github.com/velopack/velopack/tree/master/samples), [nuget.org](https://nuget.org/packages/velopack) |
| Rust | ✅ Complete | ✅ None | ✅ Yes | ✅ Yes | [quick start](https://velopack.io/docs/getting-started/rust.html), [docs](https://docs.rs/velopack), [samples](https://github.com/velopack/velopack.fusion/tree/master/for-rust/samples/iced), [crates.io](crates.io/crates/velopack) |
| JS | ✅ Complete | ✅ None | ✅ Yes | ✅ Yes | [quick start](https://github.com/velopack/velopack.fusion/tree/master/for-js/README.md), [samples](https://github.com/velopack/velopack.fusion/tree/master/for-js/samples/electron-forge), [npmjs.com](https://www.npmjs.com/package/velopack) |
| C++ | ✅ Complete | 🔶 vfusion.exe | ✅ Yes | ❌ No | [velopack.hpp](https://github.com/velopack/velopack.fusion/tree/master/for-cpp) |
| Java | Planned | - | - | - | - |
| Swift | Planned | - | - | - | - |
| Python | Planned | - | - | - | - |
| Go | Planned | - | - | - | - |

Want to see your programming language get a client library but it's not listed here? [Open an issue!](https://github.com/velopack/velopack.fusion/issues)

> [!WARNING]
> If your library requires `vfusion.exe` in the table above as a runtime dependency, it's currently up to you to manually distribute this small binary (1.3mb) with your application. In the future, this will be automated.

## Other Languages
If your programming language is not listed above, or is not completed, you can always redistribute the `vfusion.exe` binary with your application and use the command line interface to download updates.

### Command Line Reference
```txt
$ vfusion.exe -h
Velopack Fusion manages and downloads packages.
https://github.com/velopack/velopack

Usage: vfusion.exe [OPTIONS]
       vfusion.exe get-version [OPTIONS]
       vfusion.exe get-packages [OPTIONS]
       vfusion.exe check [OPTIONS] --url <URL>
       vfusion.exe download [OPTIONS] --url <URL> --name <NAME>

Options:
      --verbose  Print debug messages to console / log
  -h, --help     Print help
  -V, --version  Print version

vfusion.exe get-version:
Prints the current version of the application

vfusion.exe get-packages:
Prints the path to the packages directory

vfusion.exe check:
Checks for available updates
      --url <URL>       URL or local folder containing an update source
      --downgrade       Allow version downgrade
      --channel <NAME>  Explicitly switch to a specific channel

vfusion.exe download:
Download/copies an available remote file into the packages directory
      --url <URL>       URL or local folder containing an update source
      --name <NAME>     The name of the release to download
      --channel <NAME>  Explicitly switch to a specific channel
```

## How does Velopack Fusion work?
Velopack has two fully implemented reference libraries, [one for C#](https://github.com/velopack/velopack) and [one for Rust](https://github.com/velopack/velopack.fusion/tree/master/for-rust).

For other languages, the Rust library is compiled into a small binary (`vfusion.exe`) which exposes the core functionality as a CLI. 

The rest of the libraries available here are transpiled from [the fusion (fut) language](https://github.com/fusionlanguage/fut), which is a programming langauge which does not compile, and is designed to be transpiled into other languages. These light-weight transpiled libraries interface with the fusion cli to provide a native-like programming experience, which is why they require the fusion binary bundled with your application. 

## Compiling Fusion
There is a custom build system written in C#. To compile all of Fusion you can run the following commands in your terminal:
```txt
git clone https://github.com/velopack/velopack.fusion.git
cd velopack.fusion
dotnet run
```

### Prerequisites
Because we are targeting so many languages, to build and test each library you need the following installed:
- [Rust / Cargo](https://www.rust-lang.org/tools/install)
- [Visual Studio C++ Workload](https://visualstudio.microsoft.com/downloads/)
- [.NET 6.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
- [Node.js / npm](https://nodejs.org/en/download)