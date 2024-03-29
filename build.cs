using System.Collections.Concurrent;
using System.CommandLine;
using System.CommandLine.Parsing;
using System.Diagnostics;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using NuGet.Versioning;
using Spectre.Console;

string projectDir = GetMsbuildParameter("RootProjectDir");

var setVersionArg = new Option<bool>("--set-version", "-v");
var isciArg = new Option<bool>("--ci");
var rootCommand = new Command("build") {
    setVersionArg,
    isciArg,
};
ParseResult parseResult = rootCommand.Parse(args);

if (parseResult.GetValueForOption(setVersionArg))
{
    var newVersion = GetNbgvVersion();
    Log("Setting library versions to: " + newVersion);
    ReplaceAll(Path.Combine(projectDir, "for-js/package.json"), @"""version"":\s?""([\d\w\.-]+)"",", $@"""version"": ""{newVersion}"",", true);
    ReplaceAll(Path.Combine(projectDir, "for-rust/Cargo.toml"), @"^version\s?=\s?""([\d\w\.-]+)""", $@"version = ""{newVersion}""", true);
    return;
}

// build libraries
var macros = LoadNativeMacros();
RunAll(BuildRust, BuildJs, BuildCpp, BuildCs);

// check for untracked changes in ci mode
if (parseResult.GetValueForOption(isciArg))
{
    GetProcessOutput("git", "update-index --refresh", projectDir, throwNonZeroExit: false);
    GetProcessOutput("git", "git add .", projectDir, throwNonZeroExit: false);
    var status = GetProcessOutput("git", "status --porcelain", projectDir, throwNonZeroExit: false);
    if (!String.IsNullOrEmpty(status))
    {
        var untrackedFiles = status.Split(new char[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !x.Contains("package.json"))
            .Where(x => !x.Contains("package-lock.json"))
            .Where(x => !x.Contains("Cargo.toml"))
            .Where(x => !x.Contains("Cargo.lock"))
            .ToList();

        if (untrackedFiles.Any())
        {
            Console.WriteLine();
            Error("CI MODE: Untracked changes detected. Please build fusion before pushing commits.");
            Error("The following files have been modified: " + "\n  - " + String.Join("\n  - ", untrackedFiles));
            Environment.Exit(1);
        }
    }
}

void BuildRust(StringBuilder sb)
{
    RunProcess(sb, "cargo", "check", Path.Combine(projectDir, "for-rust"));
    RunProcess(sb, "cargo", "check --features cli", Path.Combine(projectDir, "for-rust"));
    RunProcess(sb, "cargo", "check --features async", Path.Combine(projectDir, "for-rust"));
    RunProcess(sb, "cargo", "test --features cli", Path.Combine(projectDir, "for-rust"));
    RunProcess(sb, "cargo", "check", Path.Combine(projectDir, "for-rust", "samples", "iced"));
}

void BuildJs(StringBuilder sb)
{
    CleanOutputDir("for-js", "*.js", "*.ts");
    var outJs = FusionBuild(sb, "for-js/Velopack.ts", "JS");

    // patches
    ReplaceAll(outJs, "TextWriter", "StringWriter");
    ReplaceAll(outJs, "RegExpMatchArray", "RegExpMatchArray | null");

    // includes
    PrependFiles(outJs, "disclaimer.txt", "ts_begin.ts");
    AppendFiles(outJs, "ts_end.ts");

    // final touches
    if (!Directory.Exists(Path.Combine(projectDir, "for-js", "node_modules")))
    {
        RunProcess(sb, "npm", "install", Path.Combine(projectDir, "for-js"));
    }
    RunProcess(sb, "npm", "run format", Path.Combine(projectDir, "for-js"));
    FixLineEndingAndTabs(outJs);
    RunProcess(sb, "npm", "run build", Path.Combine(projectDir, "for-js"));
}

void BuildCpp(StringBuilder sb)
{
    CleanOutputDir("for-cpp", "*.cpp", "*.hpp");
    var outCpp = FusionBuild(sb, "for-cpp/Velopack.cpp", "CPP", includeVeloApp: false);
    var outHpp = Path.ChangeExtension(outCpp, ".hpp");

    // patches
    ReplaceAll(outCpp, "std::format(\"{}\",", "std::to_string(");

    // includes
    PrependFiles(outCpp, "disclaimer.txt", "subprocess.h", "velopack.cpp");
    PrependFiles(outHpp, "disclaimer.txt", "velopack.hpp");

    // final touches
    FixLineEndingAndTabs(outCpp);
    FixLineEndingAndTabs(outHpp);

    if (Environment.OSVersion.Platform == PlatformID.Win32NT)
    {
        string vswherePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft Visual Studio", "Installer", "vswhere.exe");
        string msbuildPath = GetProcessOutput(vswherePath, "-latest -requires Microsoft.Component.MSBuild -find MSBuild\\**\\Bin\\MSBuild.exe", projectDir);
        RunProcess(sb, msbuildPath, "for-cpp/samples/win32/VeloCppWinSample.sln /t:Build /p:Configuration=Release", projectDir);
    }
}

void BuildCs(StringBuilder sb)
{
    CleanOutputDir("for-cs", "*.cs");
    var outCs = FusionBuild(sb, "for-cs/Velopack.cs", "CS");

    // usings
    PrependTextIfNot(outCs, "using System;", x => x.Contains("using System;"));
    PrependTextIfNot(outCs, "using System.Linq;", x => x.Contains("using System.Linq;"));
    PrependTextIfNot(outCs, "using System.IO;", x => x.Contains("using System.IO;"));
    PrependTextIfNot(outCs, "using System.Runtime.InteropServices;", x => x.Contains("using System.Runtime.InteropServices;"));
    PrependTextIfNot(outCs, "using System.Text;", x => x.Contains("using System.Text;"));
    PrependTextIfNot(outCs, "using System.Diagnostics;", x => x.Contains("using System.Diagnostics;"));
    PrependTextIfNot(outCs, "using System.Threading.Tasks;", x => x.Contains("using System.Threading.Tasks;"));

    // patches
    ReplaceAll(outCs, "internal", "public");

    // includes
    PrependFiles(outCs, "disclaimer.txt");
    AppendFiles(outCs, "velopack.cs");

    // final touches
    RunProcess(sb, "dotnet", "format CsTests.csproj", Path.Combine(projectDir, "for-cs", "test"));
    FixLineEndingAndTabs(outCs);
    RunProcess(sb, "dotnet", "test", Path.Combine(projectDir, "for-cs", "test"));
}

void ReplaceNativeMacros(string outputFile, string defineLang)
{
    var txt = File.ReadAllText(outputFile);
    var langMacros = macros[defineLang];

    foreach (Match m in Regex.Matches(txt, @"VMACRO_(\w+)"))
    {
        var name = m.Groups[1].Value;
        bool found = false;
        foreach (var macro in langMacros)
        {
            if (Regex.IsMatch(macro, $"(\\W|^)({name})$", RegexOptions.IgnoreCase))
            {
                found = true;
                txt = txt.Replace(m.Value, macro);
                break;
            }
        }
        if (!found)
        {
            throw new Exception("Could not find native macro: " + name + Environment.NewLine + "The available macros are:" + Environment.NewLine + string.Join(Environment.NewLine, langMacros));
        }
    }

    File.WriteAllText(outputFile, txt);
}

Dictionary<string, List<string>> LoadNativeMacros()
{
    Dictionary<string, List<string>> macros = new Dictionary<string, List<string>>();
    macros["CPP"] = new List<string>();
    macros["CS"] = new List<string>();
    macros["JS"] = new List<string>();

    var includeDir = Path.Combine(projectDir, "src", "include");

    foreach (var f in Directory.EnumerateFiles(includeDir, "*.cs"))
    {
        var txt = File.ReadAllText(f);
        foreach (Match m in Regex.Matches(txt, @"^\s+public static [\w<>]+ (\w+)\(", RegexOptions.Multiline))
        {
            var classIdx = txt.LastIndexOf("class", m.Index) + 5;
            var classEndIdx = txt.IndexOf("{", classIdx);
            var classTxt = txt.Substring(classIdx, classEndIdx - classIdx).Trim();
            macros["CS"].Add(classTxt + "." + m.Groups[1].Value);
        }
    }

    foreach (var f in Directory.EnumerateFiles(includeDir, "*.ts"))
    {
        foreach (Match m in Regex.Matches(File.ReadAllText(f), @"^function (\w*)\s*?\(", RegexOptions.Multiline))
        {
            macros["JS"].Add(m.Groups[1].Value);
        }
    }

    var cppTxt = File.ReadAllText(Path.Combine(includeDir, "velopack.cpp"));
    foreach (Match m in Regex.Matches(cppTxt, @"static [\w<>:]+\s(\w+)\(", RegexOptions.Multiline))
    {
        macros["CPP"].Add(m.Groups[1].Value);
    }

    return macros;
}

void RunAll(params Action<StringBuilder>[] actions)
{
    ConcurrentDictionary<string, string> errors = new();
    Parallel.ForEach(actions, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, action =>
    {
        var sb = new StringBuilder();
        var name = action.Method.Name;
        name = name.Substring(name.IndexOf("__") + 2);
        name = name.Substring(0, name.IndexOf("|"));
        try
        {
            Stopwatch sw = new Stopwatch();
            Log("Running: " + name);
            sw.Start();
            action(sb);
            sw.Stop();
            Log($"Completed: {name} in {Math.Round(sw.Elapsed.TotalSeconds, 2)}s");
        }
        catch (Exception ex)
        {
            Error($"{name} Failed.");
            sb.AppendLine(ex.ToString());
            errors[name] = sb.ToString();
        }
    });

    if (errors.Any())
    {
        foreach (var err in errors)
        {
            Console.WriteLine();
            Error(err.Key + " failed with: " + Environment.NewLine);
            Console.WriteLine(err.Value);
        }

        Console.WriteLine();

        Error($"{actions.Length - errors.Count}/{actions.Length} completed, and {errors.Count} errors occurred.");
        Environment.Exit(1);
    }
    else
    {
        AnsiConsole.MarkupLine($"[green]{actions.Length}/{actions.Length} completed successfully with no errors.[/]");
    }
}

string FusionBuild(StringBuilder sb, string outputFile, string defineLang, bool includeVeloApp = true)
{
    var fusionPath = Path.GetFullPath(Path.Combine(projectDir, "fut.exe"));
    var sourceFiles = Directory.EnumerateFiles(Path.Combine(projectDir, "src"), "*.fu", SearchOption.TopDirectoryOnly)
        .Select(x => Path.Join("src", Path.GetFileName(x)))
        .ToList();

    if (!includeVeloApp)
        sourceFiles.RemoveAll((s) => s.EndsWith("VelopackApp.fu"));

    var fusionArgs = $"-o {outputFile} -D {defineLang} -n Velopack {String.Join(" ", sourceFiles)}";

    sb.AppendLine("fut.exe " + fusionArgs);
    RunProcess(sb, fusionPath, fusionArgs, projectDir);

    var finalOutput = Path.Combine(projectDir, outputFile);
    if (!File.Exists(finalOutput))
    {
        throw new Exception("No output file found: " + outputFile);
    }

    ReplaceAll(finalOutput, "// Generated automatically with \"fut\". Do not edit.", "");
    ReplaceNativeMacros(finalOutput, defineLang);

    return finalOutput;
}

void ReplaceAll(string outputFile, string pattern, string replacement, bool patternRegex = false)
{
    var txt = File.ReadAllText(outputFile);
    if (patternRegex)
    {
        txt = Regex.Replace(txt, pattern, replacement, RegexOptions.Multiline);
    }
    else
    {
        txt = txt.Replace(pattern, replacement);
    }
    File.WriteAllText(outputFile, txt);
}

void FixLineEndingAndTabs(string outputFile)
{
    var txt = File.ReadAllText(outputFile);
    txt = txt.Replace("\t", "    ");
    txt = txt.Replace("\r\n", "\n");
    // remove excessive newlines
    txt = txt.Replace("\n\n\n", "\n\n");
    txt = txt.Replace("\n\n\n", "\n\n");
    txt = txt.Replace("\n\n\n", "\n\n");
    File.WriteAllText(outputFile, txt.Trim());
}

void PrependTextIfNot(string finalFile, string prependText, Func<string, bool> predicate)
{
    var original = File.ReadAllText(finalFile);
    if (!predicate(original))
    {
        File.WriteAllText(finalFile, prependText + Environment.NewLine + original);
    }
}

void PrependFiles(string finalFile, params string[] includeFiles)
{
    var includeFilesContent = includeFiles.Select(x => File.ReadAllText(Path.Join(projectDir, "src", "include", x))).ToList();
    var original = File.ReadAllText(finalFile);

    using var fs = File.Create(finalFile);
    using var sw = new StreamWriter(fs);

    foreach (var file in includeFilesContent)
    {
        sw.Write(file);
        sw.WriteLine();
        sw.WriteLine();
        sw.WriteLine();
    }

    sw.Write(original);
}

void AppendFiles(string finalFile, params string[] includeFiles)
{
    var includeFilesContent = includeFiles.Select(x => File.ReadAllText(Path.Join(projectDir, "src", "include", x))).ToList();
    var original = File.ReadAllText(finalFile);

    using var fs = File.Create(finalFile);
    using var sw = new StreamWriter(fs);

    sw.Write(original);

    foreach (var file in includeFilesContent)
    {
        sw.WriteLine();
        sw.WriteLine();
        sw.WriteLine();
        sw.Write(file);
    }
}

void Log(string message)
{
    AnsiConsole.MarkupLine($"[blue]INF - {Markup.Escape(message)}[/]");
}

void Error(string message)
{
    AnsiConsole.MarkupLine($"[red]ERR - {Markup.Escape(message)}[/]");
}

void CleanOutputDir(string name, params string[] patterns)
{
    foreach (var pattern in patterns)
        Directory.EnumerateFiles(Path.Combine(projectDir, name), pattern, SearchOption.TopDirectoryOnly).ToList().ForEach(File.Delete);
}

string GetMsbuildParameter(string paramName)
{
    return Path.GetFullPath(Assembly.GetExecutingAssembly()
        .GetCustomAttributes<AssemblyMetadataAttribute>()
        .Where(x => x.Key == paramName)
        .Single().Value);
}

void RunProcess(StringBuilder sb, string processPath, string arguments, string workDir, bool throwNonZeroExit = true)
{
    var psi = new ProcessStartInfo()
    {
        CreateNoWindow = true,
        FileName = FindExecutableInPath(processPath),
        Arguments = arguments,
        WorkingDirectory = workDir,
        RedirectStandardError = true,
        RedirectStandardOutput = true,
        UseShellExecute = false,
    };

    var process = new Process();
    process.StartInfo = psi;
    process.ErrorDataReceived += (sender, e) =>
    {
        if (e.Data != null) sb.AppendLine(e.Data);
    };
    process.OutputDataReceived += (sender, e) =>
    {
        if (e.Data != null) sb.AppendLine(e.Data);
    };

    process.Start();
    process.BeginErrorReadLine();
    process.BeginOutputReadLine();
    process.WaitForExit();

    if (throwNonZeroExit && process.ExitCode != 0)
    {
        throw new Exception($"Process exited with code {process.ExitCode}");
    }
}

string GetProcessOutput(string processPath, string arguments, string workDir, bool throwNonZeroExit = true)
{
    var psi = new ProcessStartInfo()
    {
        CreateNoWindow = true,
        FileName = FindExecutableInPath(processPath),
        Arguments = arguments,
        WorkingDirectory = workDir,
        RedirectStandardError = true,
        RedirectStandardOutput = true,
        UseShellExecute = false,
    };

    StringBuilder sb = new();

    var process = new Process();
    process.StartInfo = psi;
    process.ErrorDataReceived += (sender, e) =>
    {
        if (e.Data != null) sb.AppendLine(e.Data);
    };
    process.OutputDataReceived += (sender, e) =>
    {
        if (e.Data != null) sb.AppendLine(e.Data);
    };

    process.Start();
    process.BeginErrorReadLine();
    process.BeginOutputReadLine();
    process.WaitForExit();

    if (throwNonZeroExit && process.ExitCode != 0)
    {
        throw new Exception($"Process exited with code {process.ExitCode}");
    }

    return sb.ToString().Trim();
}

#pragma warning disable CS0162 // Unreachable code detected
string GetNbgvVersion()
{
    if (ThisAssembly.IsPublicRelease)
    {
        return NuGetVersion.Parse(ThisAssembly.AssemblyInformationalVersion).ToNormalizedString();
    }
    else
    {
        var v = NuGetVersion.Parse(ThisAssembly.AssemblyInformationalVersion);
        if (v.HasMetadata)
        {
            v = NuGetVersion.Parse(v.ToNormalizedString() + "-g" + v.Metadata);
        }
        return v.ToFullString();
    }
}
#pragma warning restore CS0162 // Unreachable code detected

string FindExecutableInPath(string executable)
{
    // Directly check if the executable path is provided and exists
    if (File.Exists(executable))
        return Path.GetFullPath(executable);

    // Set extensions to search for on Windows; on UNIX-like systems, this will be ignored
    var extensions = Environment.OSVersion.Platform == PlatformID.Win32NT
        ? new[] { ".exe", ".cmd", ".bat" }
        : Array.Empty<string>();

    var pathVar = Environment.GetEnvironmentVariable("PATH");
    if (pathVar == null) throw new InvalidOperationException("The PATH environment variable is not set.");

    var paths = pathVar.Split(Path.PathSeparator);

    foreach (var path in paths)
    {
        // Check if the executable without extension exists (for UNIX-like systems)
        var fullPath = Path.Combine(path, executable);
        if (File.Exists(fullPath) && (extensions.Length == 0 || extensions.Contains(Path.GetExtension(fullPath))))
            return fullPath;

        // Check with extensions if on Windows
        foreach (var ext in extensions)
        {
            fullPath = Path.Combine(path, executable + ext);
            if (File.Exists(fullPath))
                return fullPath;
        }
    }

    throw new FileNotFoundException($"Unable to find the executable: {executable} in the system PATH.");
}

//IEnumerable<string> SplitByCharacterType(string input)
//{
//    if (String.IsNullOrEmpty(input))
//        throw new ArgumentNullException(nameof(input));

//    StringBuilder segment = new StringBuilder();
//    segment.Append(input[0]);
//    var current = Char.GetUnicodeCategory(input[0]);

//    for (int i = 1; i < input.Length; i++)
//    {
//        var next = Char.GetUnicodeCategory(input[i]);
//        if (next == current)
//        {
//            segment.Append(input[i]);
//        }
//        else
//        {
//            yield return segment.ToString();
//            segment.Clear();
//            segment.Append(input[i]);
//            current = next;
//        }
//    }
//    yield return segment.ToString();
//}

//T Retry<T>(Func<T> block, int retries = 6, int retryDelay = 250)
//{
//    Contract.Requires(retries > 0);

//    while (true)
//    {
//        try
//        {
//            T ret = block();
//            return ret;
//        }
//        catch (Exception ex)
//        {
//            if (retries == 0) throw;
//            retries--;
//            Thread.Sleep(retryDelay);
//        }
//    }
//}