
namespace Velopack 
{
    static class NativeMethods
    {
        public static void NativeExitProcess(int code)
        {
            Environment.Exit(code);
        }

        public static string NativeCurrentOsName()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) {
                return "win32";
            } else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) {
                return "linux";
            } else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) {
                return "darwin";
            } else {
                throw new NotSupportedException("Unsupported platform");
            }
        }

        public static bool NativeDoesFileExist(string file)
        {
            return File.Exists(file);
        }

        public static string NativeGetCurrentProcessPath()
        {
            return Process.GetCurrentProcess().MainModule.FileName;
        }

        public static string NativeStartProcessBlocking(List<string> command_line)
        {
            var psi = new ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
            };
            psi.AppendArgumentListSafe(command_line.Skip(1));

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

            if (process.ExitCode != 0)
            {
                throw new Exception($"Process exited with code {process.ExitCode}");
            }

            return output.ToString();
        }

        public static void NativeStartProcessFireAndForget(List<string> command_line)
        {
            var psi = new ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
            };
            psi.AppendArgumentListSafe(command_line.Skip(1));
            Process.Start(psi);
        }

        public static Task NativeStartProcessAsyncReadline(List<string> command_line, ProcessReadLineHandler handler)
        {
            var source = new TaskCompletionSource<bool>();
            var psi = new ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
                RedirectStandardOutput = true,
                UseShellExecute = false,
            };
            psi.AppendArgumentListSafe(command_line.Skip(1));

            var process = new Process();
            process.StartInfo = psi;
            process.OutputDataReceived += (sender, e) =>
            {
                if (e.Data == null) return;
                try
                {
                    handler.HandleProcessOutputLine(e.Data);
                }
                catch (Exception)
                { }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.WaitForExitAsync().ContinueWith(t => Task.Delay(1000)).ContinueWith(t =>
            {
                if (t.IsFaulted) source.TrySetException(t.Exception);
                else if (t.IsCanceled) source.TrySetCanceled();
                else if (process.ExitCode != 0) source.TrySetException(new Exception($"Process exited with code {process.ExitCode}"));
                else source.TrySetResult(true);
            });

            return source.Task;
        }

        private static void AppendArgumentListSafe(this ProcessStartInfo psi, IEnumerable<string> args)
        {
            foreach (var a in args) {
                psi.ArgumentList.Add(a);
            }
        }
    }
}