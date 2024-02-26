<a href="https://velopack.io">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/velopack/velopack/master/docfx/images/velopack-white.svg">
  <img alt="Velopack Logo" src="https://raw.githubusercontent.com/velopack/velopack/master/docfx/images/velopack-black.svg" width="300">
</picture>
</a>

---

[![Discord](https://img.shields.io/discord/767856501477343282?style=flat-square&color=purple)](https://discord.gg/CjrCrNzd3F)
[![Build](https://img.shields.io/github/actions/workflow/status/velopack/velopack.fusion/build.yml?branch=develop&style=flat-square)](https://github.com/velopack/velopack.fusion/actions)
[![License](https://img.shields.io/github/license/velopack/velopack.fusion?style=flat-square)](https://github.com/velopack/velopack/blob/master/LICENSE)

# Velopack Fusion

Velopack is an installer and automatic update framework for cross-platform desktop applications.

Fusion is the home for client libraries which assist developers integrating their applications with [Velopack](https://velopack.io). Fusion also provides a simple command line interface for downloading and staging updates, so if your language does not have a client library you can still use the CLI.

## Documentation / Getting Started
The full Velopack documentation for the framework is available at [https://velopack.io/docs](https://velopack.io/docs), however there may be some additional library-specific documentation linked below.

There are a variety of getting started guides also available at [https://velopack.io/docs](https://velopack.io/docs), so be sure to check it out first.

## Supported Languages

### Standalone
These are full stand-alone library implementations, which you can install and require no additional dependencies.
- **C# / .NET:** The core reference library is at [velopack/velopack](https://github.com/velopack/velopack). Also see the [documentation](https://velopack.io/docs) and the [NuGet package](https://www.nuget.org/packages/Velopack). While there is also a Fusion generated C# library in this repository it should generally not be used.
- **Rust:** There is an [official Rust crate](https://crates.io/crates/velopack). Also see the [documentation](https://docs.rs/velopack/0.0.1/velopack/).

### Fusion
These libraries are a light weight wrapper around `vfusion.exe`. They will provide a native and convenient API to application authors, but ***require you also distribute the `vfusion.exe` binary (1.3mb) with your app.***
- **C++:** This is shipped as a pair of `.hpp`/`.cpp` files. The latest [can be found here](https://github.com/velopack/velopack.fusion/tree/master/for-cpp).
- **JS / TS / Electron:**: WIP, will be published on npmjs.com soon.

### Command Line
While there might not be a client library for your programming language, you can always redistribute the `vfusion.exe` binary with your application and use the command line interface to download updates. The command line reference is below:

```txt
$ vfusion.exe -h
Velopack Fusion (0.0.0-local) manages and downloads packages.
https://github.com/velopack/velopack

Usage: vfusion.exe [OPTIONS]
       vfusion.exe get-version [OPTIONS]
       vfusion.exe check [OPTIONS] --url <URL>
       vfusion.exe download [OPTIONS] --url <URL>

Options:
      --verbose  Print debug messages to console / log
  -h, --help     Print help
  -V, --version  Print version

vfusion.exe get-version:
Prints the current version of the application
  -h, --help  Print help

vfusion.exe check:
Checks for available updates
      --url <URL>       URL or local folder containing an update source
      --downgrade       Allow version downgrade
      --channel <NAME>  Explicitly switch to a specific channel
  -h, --help            Print help

vfusion.exe download:
Download/copies an available remote file into the packages directory
      --url <URL>       URL or local folder containing an update source
      --downgrade       Allow version downgrade
      --channel <NAME>  Explicitly switch to a specific channel
  -h, --help            Print help

C:\Source\velopack.fusion\for-rust\target\release>
```

## How does Velopack Fusion work?
Velopack has two fully implemented reference libraries, [one for C#](https://github.com/velopack/velopack) and [one for Rust](https://github.com/velopack/velopack.fusion/tree/master/for-rust).

For other languages, the Rust library is compiled into a small binary (`vfusion.exe`) which exposes the functionality as a CLI. 

The rest of the libraries available here are transpiled from [fusion / fut](https://github.com/fusionlanguage/fut), which is a programming langauge designed to be transpiled into other languages. These light-weight transpiled libraries interface with the fusion cli to provide a native-like programming experience, which is why they require the fusion binary bundled with your application. 

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