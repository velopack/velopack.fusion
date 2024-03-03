<a href="https://velopack.io">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/velopack/velopack/master/artwork/velopack-white.svg">
  <img alt="Velopack Logo" src="https://raw.githubusercontent.com/velopack/velopack/master/artwork/velopack-black.svg" width="300">
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

## Documentation
- 📖 [Read the docs](https://docs.velopack.io/)
- ⚡ [Quick start guides](https://docs.velopack.io/category/quick-start)
- 🕶️ [View example apps](https://docs.velopack.io/category/sample-apps)

## Community
- ❓ Ask questions, get support, or discuss ideas on [our Discord server](https://discord.gg/CjrCrNzd3F)
- 🗣️ Report bugs on [GitHub Issues](https://github.com/velopack/velopack/issues)

## How does Velopack Fusion actually work?
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