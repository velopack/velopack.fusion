
namespace Velopack 
{
    public class UpdateManager : UpdateManagerSync
    {
        /// <inheritdoc cref="UpdateManagerSync.GetCurrentVersion"/>
        public Task<string> GetCurrentVersionAsync()
        {
            return Task.Run(() => GetCurrentVersion());
        }

        /// <inheritdoc cref="UpdateManagerSync.CheckForUpdates"/>
        public Task<UpdateInfo> CheckForUpdatesAsync()
        {
            return Task.Run(() => CheckForUpdates());
        }

        /// <inheritdoc cref="UpdateManagerSync.DownloadUpdates"/>
        public Task DownloadUpdatesAsync(UpdateInfo updateInfo, Action<int> progress = null)
        {
            var command_line = GetDownloadUpdatesCommand(updateInfo);
            var source = new TaskCompletionSource<bool>();
            var psi = new ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
                RedirectStandardOutput = true,
                UseShellExecute = false,
            };

            foreach (var a in command_line.Skip(1)) 
            {
                psi.ArgumentList.Add(a);
            }

            var process = new Process();
            process.StartInfo = psi;
            process.OutputDataReceived += (sender, e) =>
            {
                if (e.Data == null) return;
                try 
                { 
                    var msg = ProgressEvent.FromJson(e.Data);
                    if (msg.Complete) source.TrySetResult(true);
                    else if (!String.IsNullOrEmpty(msg.Error)) source.TrySetException(new Exception(msg.Error));
                    else if (msg.Progress > 0) progress?.Invoke(msg.Progress);
                }
                catch (Exception) { }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.WaitForExitAsync().ContinueWith(t => Task.Delay(1000)).ContinueWith(t =>
            {
                if (t.IsFaulted) source.TrySetException(t.Exception);
                else if (t.IsCanceled) source.TrySetCanceled();
                else if (process.ExitCode != 0) source.TrySetException(new Exception($"Process exited with code {process.ExitCode}"));
                else source.TrySetException(new Exception("No completed output from process"));
            });

            return source.Task;
        }
    }

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
                throw new Exception($"Process returned non-zero exit code ({process.ExitCode}). Check the log for more details.");
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

        internal static void AppendArgumentListSafe(this ProcessStartInfo psi, IEnumerable<string> args)
        {
            foreach (var a in args) {
                psi.ArgumentList.Add(a);
            }
        }
    }
}