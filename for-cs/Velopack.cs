//
//  INTRODUCTION
//
//  This is a library to help developers integrate https://velopack.io into their 
//  applications. Velopack is an update/installer framework for cross-platform 
//  desktop applications. 
//  
//  This library is auto-generated using https://github.com/fusionlanguage/fut
//  and this source file should not be directly modified.
//
//  MIT LICENSE
//
//  Copyright (c) 2024 Caelan Sayler
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//

using System.Threading.Tasks;
using System.Diagnostics;
using System.Text;
using System.Runtime.InteropServices;
using System.Linq;

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
        public JsonNodeType GetKind()
        {
            return this.Type;
        }

        /// <summary>Check if the JSON value is null.</summary>
        public bool IsNull()
        {
            return this.Type == JsonNodeType.Null;
        }

        /// <summary>Check if the JSON value is empty - eg. an empty string, array, or object.</summary>
        public bool IsEmpty()
        {
            return this.Type == JsonNodeType.Null || (this.Type == JsonNodeType.String && this.StringValue.Length == 0) || (this.Type == JsonNodeType.Array && this.ArrayValue.Count == 0) || (this.Type == JsonNodeType.Object && this.ObjectValue.Count == 0);
        }

        /// <summary>Reinterpret a JSON value as an object. Throws exception if the value type was not an object.</summary>
        public Dictionary<string, JsonNode> AsObject()
        {
            if (this.Type != JsonNodeType.Object)
            {
                throw new Exception("Cannot call AsObject on JsonNode which is not an object.");
            }
            return this.ObjectValue;
        }

        /// <summary>Reinterpret a JSON value as an array. Throws exception if the value type was not an array.</summary>
        public List<JsonNode> AsArray()
        {
            if (this.Type != JsonNodeType.Array)
            {
                throw new Exception("Cannot call AsArray on JsonNode which is not an array.");
            }
            return this.ArrayValue;
        }

        /// <summary>Reinterpret a JSON value as a number. Throws exception if the value type was not a double.</summary>
        public double AsNumber()
        {
            if (this.Type != JsonNodeType.Number)
            {
                throw new Exception("Cannot call AsNumber on JsonNode which is not a number.");
            }
            return this.NumberValue;
        }

        /// <summary>Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.</summary>
        public bool AsBool()
        {
            if (this.Type != JsonNodeType.Bool)
            {
                throw new Exception("Cannot call AsBool on JsonNode which is not a boolean.");
            }
            return this.BoolValue;
        }

        /// <summary>Reinterpret a JSON value as a string. Throws exception if the value type was not a string.</summary>
        public string AsString()
        {
            if (this.Type != JsonNodeType.String)
            {
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

        public void InitBool(bool value)
        {
            if (this.Type != JsonNodeType.Null)
            {
                throw new Exception("Cannot call InitBool on JsonNode which is not null.");
            }
            this.Type = JsonNodeType.Bool;
            this.BoolValue = value;
        }

        public void InitArray()
        {
            if (this.Type != JsonNodeType.Null)
            {
                throw new Exception("Cannot call InitArray on JsonNode which is not null.");
            }
            this.Type = JsonNodeType.Array;
        }

        public void AddArrayChild(JsonNode child)
        {
            if (this.Type != JsonNodeType.Array)
            {
                throw new Exception("Cannot call AddArrayChild on JsonNode which is not an array.");
            }
            this.ArrayValue.Add(child);
        }

        public void InitObject()
        {
            if (this.Type != JsonNodeType.Null)
            {
                throw new Exception("Cannot call InitObject on JsonNode which is not null.");
            }
            this.Type = JsonNodeType.Object;
        }

        public void AddObjectChild(string key, JsonNode child)
        {
            if (this.Type != JsonNodeType.Object)
            {
                throw new Exception("Cannot call AddObjectChild on JsonNode which is not an object.");
            }
            this.ObjectValue[key] = child;
        }

        public void InitNumber(double value)
        {
            if (this.Type != JsonNodeType.Null)
            {
                throw new Exception("Cannot call InitNumber on JsonNode which is not null.");
            }
            this.Type = JsonNodeType.Number;
            this.NumberValue = value;
        }

        public void InitString(string value)
        {
            if (this.Type != JsonNodeType.Null)
            {
                throw new Exception("Cannot call InitString on JsonNode which is not null.");
            }
            this.Type = JsonNodeType.String;
            this.StringValue = value;
        }
    }

    class JsonParser
    {

        string text = "";

        int position = 0;

        readonly StringStream builder = new StringStream();

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
            if (this.position + n > this.text.Length)
            {
                throw new Exception("Unexpected end of input");
            }
            string result = this.text.Substring(this.position, n);
            this.position += n;
            return result;
        }

        public int Read()
        {
            if (this.position >= this.text.Length)
            {
                return -1;
            }
            int c = this.text[this.position];
            this.position++;
            return c;
        }

        public int Peek()
        {
            if (this.position >= this.text.Length)
            {
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
            switch (Peek())
            {
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
                    if (Peek() == '/')
                    {
                        while (!EndReached() && Peek() != '\n')
                        {
                            Read();
                        }
                        return PeekToken();
                    }
                    else if (Peek() == '*')
                    {
                        Read();
                        while (!EndReached())
                        {
                            if (Read() == '*' && Peek() == '/')
                            {
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
            while (!EndReached() && PeekWhitespace())
            {
                Read();
            }
        }

        public string ReadWord()
        {
            this.builder.Clear();
            while (!EndReached() && !PeekWordbreak())
            {
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
            if (boolValue == "true")
            {
                JsonNode node = new JsonNode();
                node.InitBool(true);
                return node;
            }
            else if (boolValue == "false")
            {
                JsonNode node = new JsonNode();
                node.InitBool(false);
                return node;
            }
            else
            {
                throw new Exception("Invalid boolean");
            }
        }

        public JsonNode ParseNumber()
        {
            double d;
            if (double.TryParse(ReadWord(), out d))
            {
                JsonNode node = new JsonNode();
                node.InitNumber(d);
                return node;
            }
            throw new Exception("Invalid number");
        }

        public JsonNode ParseString()
        {
            this.builder.Clear();
            Read();
            while (true)
            {
                if (EndReached())
                {
                    throw new Exception("Unterminated string");
                }
                int c = Read();
                switch (c)
                {
                    case '"':
                        JsonNode node = new JsonNode();
                        node.InitString(this.builder.ToString());
                        return node;
                    case '\\':
                        if (EndReached())
                        {
                            throw new Exception("Unterminated string");
                        }
                        c = Read();
                        switch (c)
                        {
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
                                if (int.TryParse(ReadN(4), NumberStyles.HexNumber, null, out i))
                                {
                                    this.builder.WriteChar(i);
                                }
                                else
                                {
                                    throw new Exception("Invalid unicode escape");
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
            while (true)
            {
                switch (PeekToken())
                {
                    case JsonToken.None:
                        throw new Exception("Unterminated object");
                    case JsonToken.Comma:
                        Read();
                        continue;
                    case JsonToken.CurlyClose:
                        Read();
                        return node;
                    default:
                        JsonNode name = ParseString();
                        if (PeekToken() != JsonToken.Colon)
                            throw new Exception("Expected colon");
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
            while (true)
            {
                switch (PeekToken())
                {
                    case JsonToken.None:
                        throw new Exception("Unterminated array");
                    case JsonToken.Comma:
                        if (!expectComma)
                        {
                            throw new Exception("Unexpected comma in array");
                        }
                        expectComma = false;
                        Read();
                        continue;
                    case JsonToken.SquareClose:
                        Read();
                        return node;
                    default:
                        if (expectComma)
                        {
                            throw new Exception("Expected comma");
                        }
                        expectComma = true;
                        node.AddArrayChild(ParseValue());
                        break;
                }
            }
        }

        public JsonNode ParseValue()
        {
            switch (PeekToken())
            {
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
                    throw new Exception("Invalid token");
            }
        }
    }

    static class Platform
    {

        public static string StartProcessBlocking(List<string> command_line)
        {
            if (command_line.Count == 0)
            {
                throw new Exception("Command line is empty");
            }
            string ret = "";
            ret = NativeMethods.NativeStartProcessBlocking(command_line); return StrTrim(ret);
        }

        public static void StartProcessFireAndForget(List<string> command_line)
        {
            if (command_line.Count == 0)
            {
                throw new Exception("Command line is empty");
            }
            NativeMethods.NativeStartProcessFireAndForget(command_line);
        }

        public static int GetCurrentProcessId()
        {
            int ret = 0;
            ret = NativeMethods.NativeCurrentProcessId(); return ret;
        }

        public static string GetCurrentProcessPath()
        {
            string ret = "";
            ret = NativeMethods.NativeGetCurrentProcessPath(); return ret;
        }

        public static bool FileExists(string path)
        {
            bool ret = false;
            ret = NativeMethods.NativeDoesFileExist(path); return ret;
        }

        public static bool IsInstalled()
        {
            return FileExists(Impl_GetFusionExePath()) && FileExists(Impl_GetUpdateExePath());
        }

        public static string GetFusionExePath()
        {
            string path = Impl_GetFusionExePath();
            if (!FileExists(path))
            {
                throw new Exception("Is the app installed? Fusion is not at: " + path);
            }
            return path;
        }

        public static string GetUpdateExePath()
        {
            string path = Impl_GetUpdateExePath();
            if (!FileExists(path))
            {
                throw new Exception("Is the app installed? Update is not at: " + path);
            }
            return path;
        }

        static string Impl_GetFusionExePath()
        {
            string exePath = GetCurrentProcessPath();
            if (IsWindows())
            {
                exePath = PathJoin(PathParent(exePath), "Vfusion.exe");
            }
            else if (IsLinux())
            {
                exePath = PathJoin(PathParent(exePath), "VfusionNix");
            }
            else if (IsOsx())
            {
                exePath = PathJoin(PathParent(exePath), "VfusionMac");
            }
            else
            {
                throw new NotImplementedException("Unsupported OS");
            }
            return exePath;
        }

        static string Impl_GetUpdateExePath()
        {
            string exePath = GetCurrentProcessPath();
            if (IsWindows())
            {
                exePath = PathJoin(PathParent(PathParent(exePath)), "Update.exe");
            }
            else if (IsLinux())
            {
                exePath = PathJoin(PathParent(exePath), "UpdateNix");
            }
            else if (IsOsx())
            {
                exePath = PathJoin(PathParent(exePath), "UpdateMac");
            }
            else
            {
                throw new NotImplementedException("Unsupported OS");
            }
            return exePath;
        }

        public static string StrTrim(string str)
        {
            Match match;
            if ((match = Regex.Match(str, "(\\S.*\\S|\\S)")).Success)
            {
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
            while (s1.EndsWith("/") || s1.EndsWith("\\"))
            {
                s1 = s1.Substring(0, s1.Length - 1);
            }
            while (s2.StartsWith("/") || s2.StartsWith("\\"))
            {
                s2 = s2.Substring(1);
            }
            return s1 + PathSeparator() + s2;
        }

        public static string PathSeparator()
        {
            if (IsWindows())
            {
                return "\\";
            }
            else
            {
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

        public static string GetOsName()
        {
            string ret = "";
            ret = NativeMethods.NativeCurrentOsName(); return ret;
        }

        public static void Exit(int code)
        {
            NativeMethods.NativeExitProcess(code);
        }
    }

    class StringStream
    {

        readonly StringWriter builder = new StringWriter();

        TextWriter writer;

        bool initialised;

        public void Clear()
        {
            this.builder.GetStringBuilder().Clear();
        }

        public void Write(string s)
        {
            Init();
            this.writer.Write(s);
        }

        public void WriteLine(string s)
        {
            Init();
            Write(s);
            WriteChar('\n');
        }

        public void WriteChar(int c)
        {
            Init();
            this.writer.Write((char)c);
        }

        public override string ToString()
        {
            return this.builder.ToString();
        }

        void Init()
        {
            if (!this.initialised)
            {
                this.writer = this.builder;
                this.initialised = true;
            }
        }
    }

    public enum VelopackAssetType
    {
        Unknown,
        Full,
        Delta
    }

    /// <summary>An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.</summary>
    public class VelopackAsset
    {

        /// <summary>The name or Id of the package containing this release.</summary>
        public string PackageId = "";

        /// <summary>The version of this release.</summary>
        public string Version = "";

        /// <summary>The type of asset (eg. full or delta).</summary>
        public VelopackAssetType Type = VelopackAssetType.Unknown;

        /// <summary>The filename of the update package containing this release.</summary>
        public string FileName = "";

        /// <summary>The SHA1 checksum of the update package containing this release.</summary>
        public string Sha1 = "";

        /// <summary>The size in bytes of the update package containing this release.</summary>
        public long Size = 0;

        /// <summary>The release notes in markdown format, as passed to Velopack when packaging the release.</summary>
        public string NotesMarkdown = "";

        /// <summary>The release notes in HTML format, transformed from Markdown when packaging the release.</summary>
        public string NotesHTML = "";

        /// <summary>Parses a JSON string into a VelopackAsset object.</summary>
        public static VelopackAsset FromJson(string json)
        {
            JsonNode node = JsonNode.Parse(json);
            return FromNode(node);
        }

        /// <summary>Parses a JSON node into a VelopackAsset object.</summary>
        public static VelopackAsset FromNode(JsonNode node)
        {
            VelopackAsset asset = new VelopackAsset();
            foreach ((string k, JsonNode v) in node.AsObject())
            {
                switch (k.ToLower())
                {
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
                        asset.Size = (long)v.AsNumber();
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

    /// <summary>Holds information about the current version and pending updates, such as how many there are, and access to release notes.</summary>
    public class UpdateInfo
    {

        /// <summary>The available version that we are updating to.</summary>
        public VelopackAsset TargetFullRelease;

        /// <summary>True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).</summary>
        /// <remarks>In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
        /// deleted.</remarks>
        public bool IsDowngrade = false;

        /// <summary>Parses a JSON string into an UpdateInfo object.</summary>
        public static UpdateInfo FromJson(string json)
        {
            JsonNode node = JsonNode.Parse(json);
            UpdateInfo updateInfo = new UpdateInfo();
            foreach ((string k, JsonNode v) in node.AsObject())
            {
                switch (k.ToLower())
                {
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

    /// <summary>This class is used to check for updates, download updates, and apply updates. It is a synchronous version of the UpdateManager class.</summary>
    /// <remarks>This class is not recommended for use in GUI applications, as it will block the main thread, so you may want to use the async 
    /// UpdateManager class instead, if it is supported for your programming language.</remarks>
    public class UpdateManagerSync
    {

        bool _allowDowngrade = false;

        string _explicitChannel = "";

        string _urlOrPath = "";

        /// <summary>Set the URL or local file path to the update server. This is required before calling CheckForUpdates or DownloadUpdates.</summary>
        public void SetUrlOrPath(string urlOrPath)
        {
            this._urlOrPath = urlOrPath;
        }

        /// <summary>Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).</summary>
        /// <remarks>This could happen if a release has bugs and was retracted from the release feed, or if you're using
        /// ExplicitChannel to switch channels to another channel where the latest version on that
        /// channel is lower than the current version.</remarks>
        public void SetAllowDowngrade(bool allowDowngrade)
        {
            this._allowDowngrade = allowDowngrade;
        }

        /// <summary>This option should usually be left null. Overrides the default channel used to fetch updates.</summary>
        /// <remarks>The default channel will be whatever channel was specified on the command line when building this release.
        /// For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
        /// This allows users to automatically receive updates from the same channel they installed from. This options
        /// allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
        /// without having to reinstall the application.</remarks>
        public void SetExplicitChannel(string explicitChannel)
        {
            this._explicitChannel = explicitChannel;
        }

        /// <summary>Returns the command line arguments to get the current version of the application.</summary>
        protected List<string> GetCurrentVersionCommand()
        {
            List<string> command = new List<string>();
            command.Add(Platform.GetFusionExePath());
            command.Add("get-version");
            return command;
        }

        /// <summary>Returns the command line arguments to check for updates.</summary>
        protected List<string> GetCheckForUpdatesCommand()
        {
            if (this._urlOrPath.Length == 0)
            {
                throw new Exception("Please call SetUrlOrPath before trying to check for updates.");
            }
            List<string> command = new List<string>();
            command.Add(Platform.GetFusionExePath());
            command.Add("check");
            command.Add("--url");
            command.Add(this._urlOrPath);
            if (this._allowDowngrade)
            {
                command.Add("--downgrade");
            }
            if (this._explicitChannel.Length > 0)
            {
                command.Add("--channel");
                command.Add(this._explicitChannel);
            }
            return command;
        }

        /// <summary>Returns the command line arguments to download the specified update.</summary>
        protected List<string> GetDownloadUpdatesCommand(VelopackAsset toDownload)
        {
            if (this._urlOrPath.Length == 0)
            {
                throw new Exception("Please call SetUrlOrPath before trying to download updates.");
            }
            List<string> command = new List<string>();
            command.Add(Platform.GetFusionExePath());
            command.Add("download");
            command.Add("--url");
            command.Add(this._urlOrPath);
            command.Add("--name");
            command.Add(toDownload.FileName);
            if (this._explicitChannel.Length > 0)
            {
                command.Add("--channel");
                command.Add(this._explicitChannel);
            }
            return command;
        }

        /// <summary>Returns the path to the app's packages directory. This is where updates are downloaded to.</summary>
        protected string GetPackagesDir()
        {
            List<string> command = new List<string>();
            command.Add(Platform.GetFusionExePath());
            command.Add("get-packages");
            return Platform.StartProcessBlocking(command);
        }

        /// <summary>Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in 
        /// UpdateManager may throw exceptions, so you may want to check this before calling other functions.</summary>
        public bool IsInstalled()
        {
            return Platform.IsInstalled();
        }

        /// <summary>Get the currently installed version of the application. </summary>
        /// <remarks>If the application is not installed, this function will throw an exception.</remarks>
        public string GetCurrentVersion()
        {
            List<string> command = GetCurrentVersionCommand();
            return Platform.StartProcessBlocking(command);
        }

        /// <summary>This function will check for updates, and return information about the latest 
        /// available release. This function runs synchronously and may take some time to
        /// complete, depending on the network speed and the number of updates available.</summary>
        public UpdateInfo CheckForUpdates()
        {
            List<string> command = GetCheckForUpdatesCommand();
            string output = Platform.StartProcessBlocking(command);
            if (output.Length == 0 || output == "null")
            {
                return null;
            }
            return UpdateInfo.FromJson(output);
        }

        /// <summary>Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false, 
        /// this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta 
        /// packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
        /// so may fail if there is already another update operation in progress.</summary>
        public void DownloadUpdates(VelopackAsset toDownload)
        {
            List<string> command = GetDownloadUpdatesCommand(toDownload);
            Platform.StartProcessBlocking(command);
        }

        /// <summary>This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified 
        /// restart arguments. If you need to save state or clean up, you should do that before calling this method. </summary>
        /// <remarks>The user may be prompted during the update, if the update requires additional frameworks to be installed etc.</remarks>
        public void ApplyUpdatesAndExit(VelopackAsset toApply)
        {
            List<string> args = new List<string>();
            WaitExitThenApplyUpdates(toApply, false, false, args);
            Platform.Exit(0);
        }

        /// <summary>This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified 
        /// restart arguments. If you need to save state or clean up, you should do that before calling this method. </summary>
        /// <remarks>The user may be prompted during the update, if the update requires additional frameworks to be installed etc.</remarks>
        public void ApplyUpdatesAndRestart(VelopackAsset toApply, List<string> restartArgs = null)
        {
            WaitExitThenApplyUpdates(toApply, false, true, restartArgs);
            Platform.Exit(0);
        }

        /// <summary>This will launch the Velopack updater and tell it to wait for this program to exit gracefully.</summary>
        /// <remarks>You should then clean up any state and exit your app. The updater will apply updates and then
        /// optionally restart your app. The updater will only wait for 60 seconds before giving up.</remarks>
        public void WaitExitThenApplyUpdates(VelopackAsset toApply, bool silent, bool restart, List<string> restartArgs = null)
        {
            List<string> command = new List<string>();
            command.Add(Platform.GetUpdateExePath());
            if (silent)
            {
                command.Add("--silent");
            }
            command.Add("apply");
            command.Add("--waitPid");
            command.Add($"{Platform.GetCurrentProcessId()}");
            if (toApply != null)
            {
                string packagesDir = GetPackagesDir();
                string assetPath = Platform.PathJoin(packagesDir, toApply.FileName);
                command.Add("--package");
                command.Add(assetPath);
            }
            if (restart)
            {
                command.Add("--restart");
            }
            if (restart && restartArgs != null && restartArgs.Count > 0)
            {
                command.Add("--");
                command.AddRange(restartArgs);
            }
            Platform.StartProcessFireAndForget(command);
        }
    }

    /// <summary>The main VelopackApp struct. This is the main entry point for your app.</summary>
    public class VelopackApp
    {

        /// <summary>Create a new VelopackApp instance.</summary>
        public static VelopackApp Build()
        {
            VelopackApp app = new VelopackApp();
            return app;
        }

        /// <summary>Runs the Velopack startup logic. This should be the first thing to run in your app.</summary>
        /// <remarks>In some circumstances it may terminate/restart the process to perform tasks.</remarks>
        public void Run()
        {
            List<string> args = new List<string>();
            args = Environment.GetCommandLineArgs().ToList(); for (int i = 0; i < args.Count; i++)
            {
                string val = Platform.StrTrim(args[i]).ToLower();
                if (val == "--veloapp-install")
                {
                    Platform.Exit(0);
                }
                if (val == "--veloapp-updated")
                {
                    Platform.Exit(0);
                }
                if (val == "--veloapp-obsolete")
                {
                    Platform.Exit(0);
                }
                if (val == "--veloapp-uninstall")
                {
                    Platform.Exit(0);
                }
            }
        }
    }
}

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
        public async Task DownloadUpdatesAsync(VelopackAsset toDownload, Action<int> progress = null)
        {
            var command_line = GetDownloadUpdatesCommand(toDownload);
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
                if (e.Data == null)
                {
                    return;
                }
                if (int.TryParse(e.Data, out var p))
                {
                    progress?.Invoke(p);
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"Process returned non-zero exit code ({process.ExitCode}). Check the log for more details.");
            }
        }
    }

    static class NativeMethods
    {
        public static int NativeCurrentProcessId()
        {
            return Process.GetCurrentProcess().Id;
        }

        public static void NativeExitProcess(int code)
        {
            Environment.Exit(code);
        }

        public static string NativeCurrentOsName()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return "win32";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return "linux";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                return "darwin";
            }
            else
            {
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
            foreach (var a in args)
            {
                psi.ArgumentList.Add(a);
            }
        }
    }
}