// Generated automatically with "fut". Do not edit.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
namespace Velopack
{

	public enum JsonNodeType
	{
		Null,
		Bool,
		Array,
		Object,
		Number,
		String
	}

	enum JsonToken
	{
		None,
		CurlyOpen,
		CurlyClose,
		SquareOpen,
		SquareClose,
		Colon,
		Comma,
		String,
		Number,
		Bool,
		Null
	}

	public class JsonParseException : Exception
	{
		public JsonParseException() { }
		public JsonParseException(String message) : base(message) { }
		public JsonParseException(String message, Exception innerException) : base(message, innerException) { }
	}

	public class JsonNode
	{

		JsonNodeType Type = JsonNodeType.Null;

		readonly Dictionary<string, JsonNode> ObjectValue = new Dictionary<string, JsonNode>();

		readonly List<JsonNode> ArrayValue = new List<JsonNode>();

		string StringValue;

		double NumberValue;

		bool BoolValue;

		/// <summary>Get the type of this node, such as string, object, array, etc.</summary>
		/// <remarks>You should use this function and then call the corresponding
		/// AsObject, AsArray, AsString, etc. functions to get the actual
		/// parsed json information.</remarks>
		public JsonNodeType GetType()
		{
			return this.Type;
		}

		/// <summary>Check if the JSON value is null.</summary>
		public bool IsNull()
		{
			return this.Type == JsonNodeType.Null;
		}

		/// <summary>Reinterpret a JSON value as an object. Throws exception if the value type was not an object.</summary>
		public Dictionary<string, JsonNode> AsObject()
		{
			if (this.Type != JsonNodeType.Object) {
				throw new Exception("Cannot call AsObject on JsonNode which is not an object.");
			}
			return this.ObjectValue;
		}

		/// <summary>Reinterpret a JSON value as an array. Throws exception if the value type was not an array.</summary>
		public List<JsonNode> AsArray()
		{
			if (this.Type != JsonNodeType.Array) {
				throw new Exception("Cannot call AsArray on JsonNode which is not an array.");
			}
			return this.ArrayValue;
		}

		/// <summary>Reinterpret a JSON value as a number. Throws exception if the value type was not a double.</summary>
		public double AsNumber()
		{
			if (this.Type != JsonNodeType.Number) {
				throw new Exception("Cannot call AsNumber on JsonNode which is not a number.");
			}
			return this.NumberValue;
		}

		/// <summary>Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.</summary>
		public bool AsBool()
		{
			if (this.Type != JsonNodeType.Bool) {
				throw new Exception("Cannot call AsBool on JsonNode which is not a boolean.");
			}
			return this.BoolValue;
		}

		/// <summary>Reinterpret a JSON value as a string. Throws exception if the value type was not a string.</summary>
		public string AsString()
		{
			if (this.Type != JsonNodeType.String) {
				throw new Exception("Cannot call AsString on JsonNode which is not a string.");
			}
			return this.StringValue;
		}

		public static JsonNode Parse(string text)
		{
			JsonParser parser = new JsonParser();
			parser.Load(text);
			return parser.ParseValue();
		}

		internal void InitBool(bool value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitBool on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Bool;
			this.BoolValue = value;
		}

		internal void InitArray()
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitArray on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Array;
		}

		internal void AddArrayChild(JsonNode child)
		{
			if (this.Type != JsonNodeType.Array) {
				throw new JsonParseException("Cannot call AddArrayChild on JsonNode which is not an array.");
			}
			this.ArrayValue.Add(child);
		}

		internal void InitObject()
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitObject on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Object;
		}

		internal void AddObjectChild(string key, JsonNode child)
		{
			if (this.Type != JsonNodeType.Object) {
				throw new JsonParseException("Cannot call AddObjectChild on JsonNode which is not an object.");
			}
			this.ObjectValue[key] = child;
		}

		internal void InitNumber(double value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitNumber on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.Number;
			this.NumberValue = value;
		}

		internal void InitString(string value)
		{
			if (this.Type != JsonNodeType.Null) {
				throw new JsonParseException("Cannot call InitString on JsonNode which is not null.");
			}
			this.Type = JsonNodeType.String;
			this.StringValue = value;
		}
	}

	class StringAppendable
	{

		readonly StringWriter builder = new StringWriter();

		TextWriter writer;

		bool initialised;

		public void Clear()
		{
			this.builder.GetStringBuilder().Clear();
		}

		public void WriteChar(int c)
		{
			if (!this.initialised) {
				this.writer = this.builder;
				this.initialised = true;
			}
			this.writer.Write((char) c);
		}

		public override string ToString()
		{
			return this.builder.ToString();
		}
	}

	class JsonParser
	{

		string text = "";

		int position = 0;

		readonly StringAppendable builder = new StringAppendable();

		public void Load(string text)
		{
			this.text = text;
			this.position = 0;
		}

		public bool EndReached()
		{
			return this.position >= this.text.Length;
		}

		public string ReadN(int n)
		{
			if (this.position + n > this.text.Length) {
				throw new JsonParseException("Unexpected end of input");
			}
			string result = this.text.Substring(this.position, n);
			this.position += n;
			return result;
		}

		public int Read()
		{
			if (this.position >= this.text.Length) {
				return -1;
			}
			int c = this.text[this.position];
			this.position++;
			return c;
		}

		public int Peek()
		{
			if (this.position >= this.text.Length) {
				return -1;
			}
			return this.text[this.position];
		}

		public bool PeekWhitespace()
		{
			int c = Peek();
			return c == ' ' || c == '\t' || c == '\n' || c == '\r';
		}

		public bool PeekWordbreak()
		{
			int c = Peek();
			return c == ' ' || c == ',' || c == ':' || c == '"' || c == '{' || c == '}' || c == '[' || c == ']' || c == '\t' || c == '\n' || c == '\r' || c == '/';
		}

		JsonToken PeekToken()
		{
			EatWhitespace();
			if (EndReached())
				return JsonToken.None;
			switch (Peek()) {
			case '{':
				return JsonToken.CurlyOpen;
			case '}':
				return JsonToken.CurlyClose;
			case '[':
				return JsonToken.SquareOpen;
			case ']':
				return JsonToken.SquareClose;
			case ',':
				return JsonToken.Comma;
			case '"':
				return JsonToken.String;
			case ':':
				return JsonToken.Colon;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '-':
				return JsonToken.Number;
			case 't':
			case 'f':
				return JsonToken.Bool;
			case 'n':
				return JsonToken.Null;
			case '/':
				Read();
				if (Peek() == '/') {
					while (!EndReached() && Peek() != '\n') {
						Read();
					}
					return PeekToken();
				}
				else if (Peek() == '*') {
					Read();
					while (!EndReached()) {
						if (Read() == '*' && Peek() == '/') {
							Read();
							return PeekToken();
						}
					}
				}
				return JsonToken.None;
			default:
				return JsonToken.None;
			}
		}

		public void EatWhitespace()
		{
			while (!EndReached() && PeekWhitespace()) {
				Read();
			}
		}

		public string ReadWord()
		{
			this.builder.Clear();
			while (!EndReached() && !PeekWordbreak()) {
				this.builder.WriteChar(Read());
			}
			return this.builder.ToString();
		}

		public JsonNode ParseNull()
		{
			ReadWord();
			JsonNode node = new JsonNode();
			return node;
		}

		public JsonNode ParseBool()
		{
			string boolValue = ReadWord();
			if (boolValue == "true") {
				JsonNode node = new JsonNode();
				node.InitBool(true);
				return node;
			}
			else if (boolValue == "false") {
				JsonNode node = new JsonNode();
				node.InitBool(false);
				return node;
			}
			else {
				throw new JsonParseException("Invalid boolean");
			}
		}

		public JsonNode ParseNumber()
		{
			double d;
			if (double.TryParse(ReadWord(), out d)) {
				JsonNode node = new JsonNode();
				node.InitNumber(d);
				return node;
			}
			throw new JsonParseException("Invalid number");
		}

		public JsonNode ParseString()
		{
			this.builder.Clear();
			Read();
			while (true) {
				if (EndReached()) {
					throw new JsonParseException("Unterminated string");
				}
				int c = Read();
				switch (c) {
				case '"':
					JsonNode node = new JsonNode();
					node.InitString(this.builder.ToString());
					return node;
				case '\\':
					if (EndReached()) {
						throw new JsonParseException("Unterminated string");
					}
					c = Read();
					switch (c) {
					case '"':
					case '\\':
					case '/':
						this.builder.WriteChar(c);
						break;
					case 'b':
						this.builder.WriteChar(8);
						break;
					case 'f':
						this.builder.WriteChar(12);
						break;
					case 'n':
						this.builder.WriteChar('\n');
						break;
					case 'r':
						this.builder.WriteChar('\r');
						break;
					case 't':
						this.builder.WriteChar('\t');
						break;
					case 'u':
						int i;
						if (int.TryParse(ReadN(4), NumberStyles.HexNumber, null, out i)) {
							this.builder.WriteChar(i);
						}
						else {
							throw new JsonParseException("Invalid unicode escape");
						}
						break;
					}
					break;
				default:
					this.builder.WriteChar(c);
					break;
				}
			}
		}

		public JsonNode ParseObject()
		{
			Read();
			JsonNode node = new JsonNode();
			node.InitObject();
			while (true) {
				switch (PeekToken()) {
				case JsonToken.None:
					throw new JsonParseException("Unterminated object");
				case JsonToken.Comma:
					Read();
					continue;
				case JsonToken.CurlyClose:
					Read();
					return node;
				default:
					JsonNode name = ParseString();
					if (PeekToken() != JsonToken.Colon)
						throw new JsonParseException("Expected colon");
					Read();
					node.AddObjectChild(name.AsString(), ParseValue());
					break;
				}
			}
		}

		public JsonNode ParseArray()
		{
			Read();
			JsonNode node = new JsonNode();
			node.InitArray();
			bool expectComma = false;
			while (true) {
				switch (PeekToken()) {
				case JsonToken.None:
					throw new JsonParseException("Unterminated array");
				case JsonToken.Comma:
					if (!expectComma) {
						throw new JsonParseException("Unexpected comma in array");
					}
					expectComma = false;
					Read();
					continue;
				case JsonToken.SquareClose:
					Read();
					return node;
				default:
					if (expectComma) {
						throw new JsonParseException("Expected comma");
					}
					expectComma = true;
					node.AddArrayChild(ParseValue());
					break;
				}
			}
		}

		public JsonNode ParseValue()
		{
			switch (PeekToken()) {
			case JsonToken.String:
				return ParseString();
			case JsonToken.Number:
				return ParseNumber();
			case JsonToken.Bool:
				return ParseBool();
			case JsonToken.Null:
				return ParseNull();
			case JsonToken.CurlyOpen:
				return ParseObject();
			case JsonToken.SquareOpen:
				return ParseArray();
			default:
				throw new JsonParseException("Invalid token");
			}
		}
	}

	static class Util
	{

		/// <summary>Returns the path of the current process.</summary>
		public static string GetCurrentProcessPath()
		{
			string ret = "";
			 ret = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName; return ret;
		}

		public static bool FileExists(string path)
		{
			bool ret = false;
			 ret = System.IO.File.Exists(path); return ret;
		}

		public static string GetUpdateExePath()
		{
			string exePath = GetCurrentProcessPath();
			if (IsWindows()) {
				exePath = PathJoin(PathParent(PathParent(exePath)), "Update.exe");
			}
			else if (IsLinux()) {
				exePath = PathJoin(PathParent(exePath), "UpdateNix");
			}
			else if (IsOsx()) {
				exePath = PathJoin(PathParent(exePath), "UpdateMac");
			}
			else {
				throw new Exception("Unsupported platform");
			}
			if (!FileExists(exePath)) {
				throw new Exception("Update executable not found: " + exePath);
			}
			return exePath;
		}

		public static string StrTrim(string str)
		{
			Match match;
			if ((match = Regex.Match(str, "(\\S.*\\S|\\S)")).Success) {
				return match.Groups[1].Value;
			}
			return str;
		}

		public static string PathParent(string str)
		{
			int ix_win = str.LastIndexOf('\\');
			int ix_nix = str.LastIndexOf('/');
			int ix = Math.Max(ix_win, ix_nix);
			return str.Substring(0, ix);
		}

		public static string PathJoin(string s1, string s2)
		{
			while (s1.EndsWith("/") || s1.EndsWith("\\")) {
				s1 = s1.Substring(0, s1.Length - 1);
			}
			while (s2.StartsWith("/") || s2.StartsWith("\\")) {
				s2 = s2.Substring(1);
			}
			return s1 + PathSeparator() + s2;
		}

		public static string PathSeparator()
		{
			if (IsWindows()) {
				return "\\";
			}
			else {
				return "/";
			}
		}

		public static bool IsWindows()
		{
			return GetOsName() == "win32";
		}

		public static bool IsLinux()
		{
			return GetOsName() == "linux";
		}

		public static bool IsOsx()
		{
			return GetOsName() == "darwin";
		}

		/// <summary>Returns the name of the operating system.</summary>
		public static string GetOsName()
		{
			string ret = "";
			 
            if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows)) {
                ret = "win32";
            } else if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Linux)) {
                ret = "linux";
            } else if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.OSX)) {
                ret = "darwin";
            } else {
                throw new System.NotSupportedException("Unsupported platform");
            }
        return ret;
		}

		public static void Exit(int code)
		{
			 Environment.Exit(code); }
	}

	public class VelopackApp
	{

		public static VelopackApp Build()
		{
			VelopackApp app = new VelopackApp();
			return app;
		}

		public void Run()
		{
			List<string> args = new List<string>();
			 args = Environment.GetCommandLineArgs().ToList(); HandleArgs(args);
		}

		void HandleArgs(List<string> args)
		{
			for (int i = 0; i < args.Count; i++) {
				string val = Util.StrTrim(args[i]).ToLower();
				if (val == "--veloapp-install") {
					Util.Exit(0);
				}
				if (val == "--veloapp-updated") {
					Util.Exit(0);
				}
				if (val == "--veloapp-obsolete") {
					Util.Exit(0);
				}
				if (val == "--veloapp-uninstall") {
					Util.Exit(0);
				}
			}
		}
	}

	public enum VelopackAssetType
	{
		Unknown,
		Full,
		Delta
	}

	public class VelopackAsset
	{

		/// <summary>The name or Id of the package containing this release.</summary>
		internal string PackageId = "";

		/// <summary>The version of this release.</summary>
		internal string Version = "";

		/// <summary>The type of asset (eg. full or delta).</summary>
		internal VelopackAssetType Type = VelopackAssetType.Unknown;

		/// <summary>The filename of the update package containing this release.</summary>
		internal string FileName = "";

		/// <summary>The SHA1 checksum of the update package containing this release.</summary>
		internal string Sha1 = "";

		/// <summary>The size in bytes of the update package containing this release.</summary>
		internal long Size = 0;

		/// <summary>The release notes in markdown format, as passed to Velopack when packaging the release.</summary>
		internal string NotesMarkdown = "";

		/// <summary>The release notes in HTML format, transformed from Markdown when packaging the release.</summary>
		internal string NotesHTML = "";

		public static VelopackAsset FromJson(string json)
		{
			JsonNode node = JsonNode.Parse(json);
			return FromNode(node);
		}

		public static VelopackAsset FromNode(JsonNode node)
		{
			VelopackAsset asset = new VelopackAsset();
			foreach ((string k, JsonNode v) in node.AsObject()) {
				switch (k.ToLower()) {
				case "id":
					asset.PackageId = v.AsString();
					break;
				case "version":
					asset.Version = v.AsString();
					break;
				case "type":
					asset.Type = v.AsString().ToLower() == "full" ? VelopackAssetType.Full : VelopackAssetType.Delta;
					break;
				case "filename":
					asset.FileName = v.AsString();
					break;
				case "sha1":
					asset.Sha1 = v.AsString();
					break;
				case "size":
					asset.Size = (long) v.AsNumber();
					break;
				case "markdown":
					asset.NotesMarkdown = v.AsString();
					break;
				case "html":
					asset.NotesHTML = v.AsString();
					break;
				}
			}
			return asset;
		}
	}

	public class UpdateInfo
	{

		internal VelopackAsset TargetFullRelease;

		internal bool IsDowngrade = false;

		public static UpdateInfo FromJson(string json)
		{
			JsonNode node = JsonNode.Parse(json);
			UpdateInfo updateInfo = new UpdateInfo();
			foreach ((string k, JsonNode v) in node.AsObject()) {
				switch (k.ToLower()) {
				case "targetfullrelease":
					updateInfo.TargetFullRelease = VelopackAsset.FromNode(v);
					break;
				case "isdowngrade":
					updateInfo.IsDowngrade = v.AsBool();
					break;
				}
			}
			return updateInfo;
		}
	}

	public class ProgressEvent
	{

		internal string File = "";

		internal bool Complete = false;

		internal int Progress = 0;

		internal string Error = "";

		public static ProgressEvent FromJson(string json)
		{
			JsonNode node = JsonNode.Parse(json);
			ProgressEvent progressEvent = new ProgressEvent();
			foreach ((string k, JsonNode v) in node.AsObject()) {
				switch (k.ToLower()) {
				case "file":
					progressEvent.File = v.AsString();
					break;
				case "complete":
					progressEvent.Complete = v.AsBool();
					break;
				case "progress":
					progressEvent.Progress = (int) v.AsNumber();
					break;
				case "error":
					progressEvent.Error = v.AsString();
					break;
				}
			}
			return progressEvent;
		}
	}

	public abstract class ProcessReadLineHandler
	{

		/// <summary>Called when a line of output is read from the process.</summary>
		/// <remarks>If this method returns true, the reading loop is terminated.</remarks>
		public abstract bool HandleProcessOutputLine(string line);
	}

	static class Process
	{

		/// <summary>Starts a new process and sychronously reads/returns its output.</summary>
		public static string StartProcessBlocking(List<string> command_line)
		{
			if (command_line.Count == 0) {
				throw new Exception("Command line is empty");
			}
			string ret = "";
			
            var psi = new System.Diagnostics.ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
                RedirectStandardError = true, 
                RedirectStandardInput = true, 
                UseShellExecute = false,
            };

            foreach (var arg in command_line.Skip(1))
            {
                psi.ArgumentList.Add(arg);
            }

            System.Text.StringBuilder output = new System.Text.StringBuilder();

            var process = new System.Diagnostics.Process();
            process.StartInfo = psi;
            process.ErrorDataReceived += (sender, e) => {
                if (e.Data != null) output.AppendLine(e.Data);
            };
            process.OutputDataReceived += (sender, e) => {
                if (e.Data != null) output.AppendLine(e.Data);
            };

            process.Start();
            process.BeginErrorReadLine();
            process.BeginOutputReadLine();
            process.WaitForExit();
            ret = output.ToString();
        return Util.StrTrim(ret);
		}

		/// <summary>Starts a new process and returns immediately.</summary>
		public static void StartProcessFireAndForget(List<string> command_line)
		{
			if (command_line.Count == 0) {
				throw new Exception("Command line is empty");
			}
			
            var psi = new System.Diagnostics.ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
            };
            foreach (var arg in command_line.Skip(1)) psi.ArgumentList.Add(arg);
            System.Diagnostics.Process.Start(psi);
        }

		/// <summary>In the current process, starts a new process and asychronously reads its output line by line.</summary>
		/// <remarks>When a line is read, HandleProcessOutputLine is called with the line. 
		/// If HandleProcessOutputLine returns true, the reading loop is terminated.
		/// This method is non-blocking and returns immediately.</remarks>
		public static void StartProcessAsyncReadLine(List<string> command_line, ProcessReadLineHandler handler)
		{
			if (command_line.Count == 0) {
				throw new Exception("Command line is empty");
			}
			
            var psi = new System.Diagnostics.ProcessStartInfo()
            {
                CreateNoWindow = true,
                FileName = command_line[0],
                RedirectStandardError = true, 
                RedirectStandardInput = true, 
                UseShellExecute = false,
            };

            foreach (var arg in command_line.Skip(1))
            {
                psi.ArgumentList.Add(arg);
            }

            var process = new System.Diagnostics.Process();
            process.StartInfo = psi;
            process.ErrorDataReceived += (sender, e) => {
                if (e.Data != null) handler.HandleProcessOutputLine(e.Data);
            };
            process.OutputDataReceived += (sender, e) => {
                if (e.Data != null) handler.HandleProcessOutputLine(e.Data);
            };

            process.Start();
            process.BeginErrorReadLine();
            process.BeginOutputReadLine();
        }
	}

	public abstract class ProgressHandler : ProcessReadLineHandler
	{

		public abstract void OnProgress(int progress);

		public abstract void OnComplete(string assetPath);

		public abstract void OnError(string error);

		public override bool HandleProcessOutputLine(string line)
		{
			ProgressEvent ev = ProgressEvent.FromJson(line);
			if (ev.Complete) {
				OnComplete(ev.File);
				return true;
			}
			else if (ev.Error.Length > 0) {
				OnError(ev.Error);
				return true;
			}
			else {
				OnProgress(ev.Progress);
				return false;
			}
		}
	}

	class DefaultProgressHandler : ProgressHandler
	{

		public override void OnProgress(int progress)
		{
		}

		public override void OnComplete(string assetPath)
		{
		}

		public override void OnError(string error)
		{
		}
	}

	public class UpdateManager
	{

		bool _allowDowngrade = false;

		string _explicitChannel = "";

		string _urlOrPath = "";

		ProgressHandler _progress = new DefaultProgressHandler();

		public void SetUrlOrPath(string urlOrPath)
		{
			this._urlOrPath = urlOrPath;
		}

		public void SetAllowDowngrade(bool allowDowngrade)
		{
			this._allowDowngrade = allowDowngrade;
		}

		public void SetExplicitChannel(string explicitChannel)
		{
			this._explicitChannel = explicitChannel;
		}

		public void SetProgressHandler(ProgressHandler progress)
		{
			this._progress = progress;
		}

		/// <summary>This function will return the current installed version of the application
		/// or throw, if the application is not installed.</summary>
		public string GetCurrentVersion()
		{
			List<string> command = new List<string>();
			command.Add(Util.GetUpdateExePath());
			command.Add("get-version");
			return Process.StartProcessBlocking(command);
		}

		/// <summary>This function will check for updates, and return information about the latest available release.</summary>
		public UpdateInfo CheckForUpdates()
		{
			if (this._urlOrPath.Length == 0) {
				throw new Exception("Please call SetUrlOrPath before trying to check for updates.");
			}
			List<string> command = new List<string>();
			command.Add(Util.GetUpdateExePath());
			command.Add("check");
			command.Add("--url");
			command.Add(this._urlOrPath);
			command.Add("--format");
			command.Add("json");
			if (this._allowDowngrade) {
				command.Add("--downgrade");
			}
			if (this._explicitChannel.Length > 0) {
				command.Add("--channel");
				command.Add(this._explicitChannel);
			}
			string output = Process.StartProcessBlocking(command);
			if (output.Length == 0 || output == "null") {
				return null;
			}
			return UpdateInfo.FromJson(output);
		}

		/// <summary>This function will request the update download, and then return immediately.</summary>
		/// <remarks>To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.</remarks>
		public void DownloadUpdateAsync(UpdateInfo updateInfo)
		{
			if (this._urlOrPath.Length == 0) {
				throw new Exception("Please call SetUrlOrPath before trying to download updates.");
			}
			List<string> command = new List<string>();
			command.Add(Util.GetUpdateExePath());
			command.Add("download");
			command.Add("--url");
			command.Add(this._urlOrPath);
			command.Add("--clean");
			command.Add("--format");
			command.Add("json");
			command.Add("--name");
			command.Add(updateInfo.TargetFullRelease.FileName);
			Process.StartProcessAsyncReadLine(command, this._progress);
		}

		public void ApplyUpdatesAndExit(string assetPath)
		{
			List<string> args = new List<string>();
			WaitExitThenApplyUpdates(assetPath, false, false, args);
			Util.Exit(0);
		}

		public void ApplyUpdatesAndRestart(string assetPath, List<string> restartArgs = null)
		{
			WaitExitThenApplyUpdates(assetPath, false, true, restartArgs);
			Util.Exit(0);
		}

		public void WaitExitThenApplyUpdates(string assetPath, bool silent, bool restart, List<string> restartArgs = null)
		{
			List<string> command = new List<string>();
			command.Add(Util.GetUpdateExePath());
			if (silent) {
				command.Add("--silent");
			}
			command.Add("apply");
			command.Add("--wait");
			if (assetPath.Length > 0) {
				command.Add("--package");
				command.Add(assetPath);
			}
			if (restart) {
				command.Add("--restart");
			}
			if (restart && restartArgs != null && restartArgs.Count > 0) {
				command.Add("--");
				command.AddRange(restartArgs);
			}
			Process.StartProcessFireAndForget(command);
		}
	}
}
