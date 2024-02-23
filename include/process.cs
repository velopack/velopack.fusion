
namespace Velopack {
static class ProcessNative
{
    public static string StartProcessBlocking(List<string> command_line)
    {
        var psi = new System.Diagnostics.ProcessStartInfo()
        {
            CreateNoWindow = true,
            FileName = command_line[0],
            RedirectStandardError = true,
            RedirectStandardOutput = true,
            UseShellExecute = false,
        };
        foreach (var arg in command_line.Skip(1)) psi.ArgumentList.Add(arg);

        System.Text.StringBuilder output = new System.Text.StringBuilder();

        var process = new System.Diagnostics.Process();
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
            throw new System.Exception($"Process exited with code {process.ExitCode}");
        }

        return output.ToString();
    }

    public static void StartProcessFireAndForget(List<string> command_line)
    {
        var psi = new System.Diagnostics.ProcessStartInfo()
        {
            CreateNoWindow = true,
            FileName = command_line[0],
        };
        foreach (var arg in command_line.Skip(1)) psi.ArgumentList.Add(arg);
        System.Diagnostics.Process.Start(psi);
    }

    public static System.Threading.Tasks.Task<string> StartUpdateDownloadAsync(List<string> command_line, System.Action<int> progress = null)
    {
        var source = new System.Threading.Tasks.TaskCompletionSource<string>();
        var psi = new System.Diagnostics.ProcessStartInfo()
        {
            CreateNoWindow = true,
            FileName = command_line[0],
            RedirectStandardOutput = true,
            UseShellExecute = false,
        };

        foreach (var arg in command_line.Skip(1))
        {
            psi.ArgumentList.Add(arg);
        }

        var process = new System.Diagnostics.Process();
        process.StartInfo = psi;
        process.OutputDataReceived += (sender, e) =>
        {
            if (e.Data == null) return;
            try
            {
                var evt = ProgressEvent.FromJson(e.Data);
                if (evt.Error != null) source.TrySetException(new System.Exception(evt.Error));
                else if (evt.Complete && !string.IsNullOrEmpty(evt.File)) source.TrySetResult(evt.File);
                else if (evt.Progress > 0) progress?.Invoke(evt.Progress);
            }
            catch (System.Exception)
            { }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.WaitForExitAsync().ContinueWith(t => System.Threading.Tasks.Task.Delay(1000)).ContinueWith(t =>
        {
            if (t.IsFaulted) source.TrySetException(t.Exception);
            else if (t.IsCanceled) source.TrySetCanceled();
            else if (process.ExitCode != 0) source.TrySetException(new System.Exception($"Process exited with code {process.ExitCode}"));
            else source.TrySetException(new System.Exception($"Process ran successfully but provided no output."));
        });

        return source.Task;
    }
}
}