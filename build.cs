using System.Diagnostics;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using Spectre.Console;

string projectDir = GetMsbuildParameter("RootProjectDir");
RunAll(BuildJs, BuildCpp, BuildCs);

void BuildJs()
{
    CleanOutputDir("for-js", "*.js", "*.ts");
    var outJs = FusionBuild("for-js/Velopack.ts", "JS");
    ReplaceAll(outJs, "TextWriter", "StringWriter");
    PrependFiles(outJs, "disclaimer.txt");
    FixLineEndingAndTabs(outJs);
    RunProcess("npm", "run build", Path.Combine(projectDir, "for-js"));
}

void BuildCpp()
{
    CleanOutputDir("for-cpp", "*.cpp", "*.hpp");
    var outCpp = FusionBuild("for-cpp/Velopack.cpp", "CPP", includeVeloApp: false);
    PrependFiles(outCpp, "disclaimer.txt", "subprocess.h", "velopack.cpp");
    PrependFiles(Path.ChangeExtension(outCpp, ".hpp"), "disclaimer.txt", "velopack.hpp");
    FixLineEndingAndTabs(outCpp);
}

void BuildCs()
{
    CleanOutputDir("for-cs", "*.cs");
    var outCs = FusionBuild("for-cs/Velopack.cs", "CS");
    PrependTextIfNot(outCs, "using System.Linq;", x => x.Contains("using System.Linq;"));
    PrependFiles(outCs, "disclaimer.txt");
    AppendFiles(outCs, "process.cs");
    ReplaceAll(outCs, "internal", "public");
    RunProcess("dotnet", "format CsTests.csproj", Path.Combine(projectDir, "for-cs", "test"));
    FixLineEndingAndTabs(outCs);
    RunProcess("dotnet", "test", Path.Combine(projectDir, "for-cs", "test"));
}

void RunAll(params Action[] actions)
{
    int errors = 0;
    foreach (var action in actions)
    {
        try
        {
            Console.WriteLine();
            Log("Running: " + action.Method.Name);
            action();
            Log("Completed: " + action.Method.Name);
            Console.WriteLine();
        }
        catch (Exception ex)
        {
            Error($"{action.Method.Name} Failed.");
            Error(ex.ToString());
            errors++;
        }
    }

    if (errors > 0)
    {
        Error($"{errors} errors occurred.");
        Environment.Exit(1);
    }
    else
    {
        AnsiConsole.MarkupLine($"[green]Build completed successfully.[/]");
    }
}

string FusionBuild(string outputFile, string defineLang, bool includeVeloApp = true)
{
    var fusionPath = Path.GetFullPath(Path.Combine(projectDir, "fut.exe"));
    var sourceFiles = Directory.EnumerateFiles(projectDir, "*.fu", SearchOption.TopDirectoryOnly)
        .Select(x => Path.GetFileName(x))
        .ToList();

    if (!includeVeloApp)
        sourceFiles.Remove("VelopackApp.fu");

    var fusionArgs = $"-o {outputFile} -D {defineLang} -n Velopack {String.Join(" ", sourceFiles)}";

    Console.WriteLine("fut.exe " + fusionArgs);
    RunProcess(fusionPath, fusionArgs, projectDir);

    var finalOutput = Path.Combine(projectDir, outputFile);
    if (!File.Exists(finalOutput))
    {
        throw new Exception("No output file found: " + outputFile);
    }

    ReplaceAll(finalOutput, "// Generated automatically with \"fut\". Do not edit.", "");

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
    txt = txt.Replace("\n\n", "\n");
    txt = txt.Replace("\n\n", "\n");
    txt = txt.Replace("\n\n", "\n");
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
    var includeFilesContent = includeFiles.Select(x => File.ReadAllText(Path.Join(projectDir, "include", x))).ToList();
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
    var includeFilesContent = includeFiles.Select(x => File.ReadAllText(Path.Join(projectDir, "include", x))).ToList();
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

void RunProcess(string processPath, string arguments, string workDir, bool throwNonZeroExit = true)
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

    var output = new StringBuilder();

    var process = new Process();
    process.StartInfo = psi;
    process.ErrorDataReceived += (sender, e) =>
    {
        if (e.Data != null) output.AppendLine(e.Data);
    };
    process.OutputDataReceived += (sender, e) =>
    {
        if (e.Data != null) output.AppendLine(e.Data);
    };

    process.Start();
    process.BeginErrorReadLine();
    process.BeginOutputReadLine();
    process.WaitForExit();

    if (output.ToString().Trim().Length > 0)
        Console.WriteLine(output.ToString());

    if (process.ExitCode != 0)
    {
        throw new Exception($"Process exited with code {process.ExitCode}");
    }
}

string FindExecutableInPath(string executable)
{
    if (File.Exists(executable))
        return Path.GetFullPath(executable);

    var extensions = new[] { ".exe", ".cmd", ".bat" };

    var pathVar = Environment.GetEnvironmentVariable("PATH");
    var paths = pathVar.Split(Path.PathSeparator);
    foreach (var path in paths)
    {
        var fullPath = Path.Combine(path, executable);
        if (File.Exists(fullPath) && extensions.Contains(Path.GetExtension(fullPath)))
            return fullPath;

        foreach (var ext in extensions)
        {
            fullPath = Path.Combine(path, executable + ext);
            if (File.Exists(fullPath))
                return fullPath;
        }
    }

    throw new Exception("Unable to find binary: " + executable);
}

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