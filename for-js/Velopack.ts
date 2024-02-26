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

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");

function emitLines(stream) {
  var backlog = "";
  stream.on("data", function (data) {
    backlog += data;
    var n = backlog.indexOf("\n");
    // got a \n? emit one or more 'line' events
    while (~n) {
      stream.emit("line", backlog.substring(0, n));
      backlog = backlog.substring(n + 1);
      n = backlog.indexOf("\n");
    }
  });
  stream.on("end", function () {
    if (backlog) {
      stream.emit("line", backlog);
    }
  });
}

function nativeDoesFileExist(path: string): boolean {
  return fs.existsSync(path);
}

function nativeGetCurrentProcessPath(): string {
  return process.execPath;
}

function nativeCurrentOsName(): string {
  return process.platform;
}

function nativeExitProcess(code: number): void {
  process.exit(code);
}

function nativeStartProcessFireAndForget(
  command_line: readonly string[],
): void {
  spawn(command_line[0], command_line.slice(1), { encoding: "utf8" });
}

function nativeStartProcessBlocking(command_line: readonly string[]): string {
  const child = spawnSync(command_line[0], command_line.slice(1), {
    encoding: "utf8",
  });
  if (child.status !== 0) {
    throw new Error(
      `Process returned non-zero exit code (${child.status}). Check the log for more details.`,
    );
  }
  return child.stdout;
}

function nativeStartProcessAsync(
  command_line: readonly string[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawnSync(command_line[0], command_line.slice(1), {
      encoding: "utf8",
    });

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Process exited with code: ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}

function nativeStartProcessAsyncReadLine(
  command_line: readonly string[],
  handler: Function,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command_line[0], command_line.slice(1), {
      encoding: "utf8",
    });

    // Emitting lines for each stdout data event
    emitLines(child.stdout);

    child.stdout.resume();
    child.stdout.setEncoding("utf8");
    child.stdout.on("line", (data) => {
      handler(data);
    });

    // Handling the process exit
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(); // Process completed successfully
      } else {
        reject(new Error(`Process exited with code: ${code}`)); // Process failed
      }
    });

    // Handling process errors (e.g., if the process could not be spawned, killed or sending a message to it fails)
    child.on("error", (err) => {
      reject(err); // Process encountered an error
    });
  });
}

export enum JsonNodeType {
  NULL,
  BOOL,
  ARRAY,
  OBJECT,
  NUMBER,
  STRING,
}

enum JsonToken {
  NONE,
  CURLY_OPEN,
  CURLY_CLOSE,
  SQUARE_OPEN,
  SQUARE_CLOSE,
  COLON,
  COMMA,
  STRING,
  NUMBER,
  BOOL,
  NULL,
}

export class JsonParseException extends Error {
  name = "JsonParseException";
}

export class JsonNode {
  #type: JsonNodeType = JsonNodeType.NULL;
  readonly #objectValue: Record<string, JsonNode> = {};
  readonly #arrayValue: JsonNode[] = [];
  #stringValue: string;
  #numberValue: number;
  #boolValue: boolean;

  /**
   * Get the type of this node, such as string, object, array, etc.
   * You should use this function and then call the corresponding
   * AsObject, AsArray, AsString, etc. functions to get the actual
   * parsed json information.
   */
  public getKind(): JsonNodeType {
    return this.#type;
  }

  /**
   * Check if the JSON value is null.
   */
  public isNull(): boolean {
    return this.#type == JsonNodeType.NULL;
  }

  /**
   * Check if the JSON value is empty - eg. an empty string, array, or object.
   */
  public isEmpty(): boolean {
    return (
      this.#type == JsonNodeType.NULL ||
      (this.#type == JsonNodeType.STRING && this.#stringValue.length == 0) ||
      (this.#type == JsonNodeType.ARRAY && this.#arrayValue.length == 0) ||
      (this.#type == JsonNodeType.OBJECT &&
        Object.keys(this.#objectValue).length == 0)
    );
  }

  /**
   * Reinterpret a JSON value as an object. Throws exception if the value type was not an object.
   */
  public asObject(): Readonly<Record<string, JsonNode>> {
    if (this.#type != JsonNodeType.OBJECT) {
      throw new Error(
        "Cannot call AsObject on JsonNode which is not an object.",
      );
    }
    return this.#objectValue;
  }

  /**
   * Reinterpret a JSON value as an array. Throws exception if the value type was not an array.
   */
  public asArray(): readonly JsonNode[] {
    if (this.#type != JsonNodeType.ARRAY) {
      throw new Error("Cannot call AsArray on JsonNode which is not an array.");
    }
    return this.#arrayValue;
  }

  /**
   * Reinterpret a JSON value as a number. Throws exception if the value type was not a double.
   */
  public asNumber(): number {
    if (this.#type != JsonNodeType.NUMBER) {
      throw new Error(
        "Cannot call AsNumber on JsonNode which is not a number.",
      );
    }
    return this.#numberValue;
  }

  /**
   * Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.
   */
  public asBool(): boolean {
    if (this.#type != JsonNodeType.BOOL) {
      throw new Error("Cannot call AsBool on JsonNode which is not a boolean.");
    }
    return this.#boolValue;
  }

  /**
   * Reinterpret a JSON value as a string. Throws exception if the value type was not a string.
   */
  public asString(): string {
    if (this.#type != JsonNodeType.STRING) {
      throw new Error(
        "Cannot call AsString on JsonNode which is not a string.",
      );
    }
    return this.#stringValue;
  }

  public static parse(text: string): JsonNode {
    let parser: JsonParser = new JsonParser();
    parser.load(text);
    return parser.parseValue();
  }

  initBool(value: boolean): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new JsonParseException(
        "Cannot call InitBool on JsonNode which is not null.",
      );
    }
    this.#type = JsonNodeType.BOOL;
    this.#boolValue = value;
  }

  initArray(): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new JsonParseException(
        "Cannot call InitArray on JsonNode which is not null.",
      );
    }
    this.#type = JsonNodeType.ARRAY;
  }

  addArrayChild(child: JsonNode): void {
    if (this.#type != JsonNodeType.ARRAY) {
      throw new JsonParseException(
        "Cannot call AddArrayChild on JsonNode which is not an array.",
      );
    }
    this.#arrayValue.push(child);
  }

  initObject(): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new JsonParseException(
        "Cannot call InitObject on JsonNode which is not null.",
      );
    }
    this.#type = JsonNodeType.OBJECT;
  }

  addObjectChild(key: string, child: JsonNode): void {
    if (this.#type != JsonNodeType.OBJECT) {
      throw new JsonParseException(
        "Cannot call AddObjectChild on JsonNode which is not an object.",
      );
    }
    this.#objectValue[key] = child;
  }

  initNumber(value: number): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new JsonParseException(
        "Cannot call InitNumber on JsonNode which is not null.",
      );
    }
    this.#type = JsonNodeType.NUMBER;
    this.#numberValue = value;
  }

  initString(value: string): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new JsonParseException(
        "Cannot call InitString on JsonNode which is not null.",
      );
    }
    this.#type = JsonNodeType.STRING;
    this.#stringValue = value;
  }
}

class JsonParser {
  #text: string = "";
  #position: number = 0;
  readonly #builder: StringStream = new StringStream();

  public load(text: string): void {
    this.#text = text;
    this.#position = 0;
  }

  public endReached(): boolean {
    return this.#position >= this.#text.length;
  }

  public readN(n: number): string {
    if (this.#position + n > this.#text.length) {
      throw new JsonParseException("Unexpected end of input");
    }
    let result: string = this.#text.substring(
      this.#position,
      this.#position + n,
    );
    this.#position += n;
    return result;
  }

  public read(): number {
    if (this.#position >= this.#text.length) {
      return -1;
    }
    let c: number = this.#text.charCodeAt(this.#position);
    this.#position++;
    return c;
  }

  public peek(): number {
    if (this.#position >= this.#text.length) {
      return -1;
    }
    return this.#text.charCodeAt(this.#position);
  }

  public peekWhitespace(): boolean {
    let c: number = this.peek();
    return c == 32 || c == 9 || c == 10 || c == 13;
  }

  public peekWordbreak(): boolean {
    let c: number = this.peek();
    return (
      c == 32 ||
      c == 44 ||
      c == 58 ||
      c == 34 ||
      c == 123 ||
      c == 125 ||
      c == 91 ||
      c == 93 ||
      c == 9 ||
      c == 10 ||
      c == 13 ||
      c == 47
    );
  }

  #peekToken(): JsonToken {
    this.eatWhitespace();
    if (this.endReached()) return JsonToken.NONE;
    switch (this.peek()) {
      case 123:
        return JsonToken.CURLY_OPEN;
      case 125:
        return JsonToken.CURLY_CLOSE;
      case 91:
        return JsonToken.SQUARE_OPEN;
      case 93:
        return JsonToken.SQUARE_CLOSE;
      case 44:
        return JsonToken.COMMA;
      case 34:
        return JsonToken.STRING;
      case 58:
        return JsonToken.COLON;
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
      case 45:
        return JsonToken.NUMBER;
      case 116:
      case 102:
        return JsonToken.BOOL;
      case 110:
        return JsonToken.NULL;
      case 47:
        this.read();
        if (this.peek() == 47) {
          while (!this.endReached() && this.peek() != 10) {
            this.read();
          }
          return this.#peekToken();
        } else if (this.peek() == 42) {
          this.read();
          while (!this.endReached()) {
            if (this.read() == 42 && this.peek() == 47) {
              this.read();
              return this.#peekToken();
            }
          }
        }
        return JsonToken.NONE;
      default:
        return JsonToken.NONE;
    }
  }

  public eatWhitespace(): void {
    while (!this.endReached() && this.peekWhitespace()) {
      this.read();
    }
  }

  public readWord(): string {
    this.#builder.clear();
    while (!this.endReached() && !this.peekWordbreak()) {
      this.#builder.writeChar(this.read());
    }
    return this.#builder.toString();
  }

  public parseNull(): JsonNode {
    this.readWord();
    let node: JsonNode = new JsonNode();
    return node;
  }

  public parseBool(): JsonNode {
    let boolValue: string = this.readWord();
    if (boolValue == "true") {
      let node: JsonNode = new JsonNode();
      node.initBool(true);
      return node;
    } else if (boolValue == "false") {
      let node: JsonNode = new JsonNode();
      node.initBool(false);
      return node;
    } else {
      throw new JsonParseException("Invalid boolean");
    }
  }

  public parseNumber(): JsonNode {
    let d: number;
    if (!isNaN((d = parseFloat(this.readWord())))) {
      let node: JsonNode = new JsonNode();
      node.initNumber(d);
      return node;
    }
    throw new JsonParseException("Invalid number");
  }

  public parseString(): JsonNode {
    this.#builder.clear();
    this.read();
    while (true) {
      if (this.endReached()) {
        throw new JsonParseException("Unterminated string");
      }
      let c: number = this.read();
      switch (c) {
        case 34:
          let node: JsonNode = new JsonNode();
          node.initString(this.#builder.toString());
          return node;
        case 92:
          if (this.endReached()) {
            throw new JsonParseException("Unterminated string");
          }
          c = this.read();
          switch (c) {
            case 34:
            case 92:
            case 47:
              this.#builder.writeChar(c);
              break;
            case 98:
              this.#builder.writeChar(8);
              break;
            case 102:
              this.#builder.writeChar(12);
              break;
            case 110:
              this.#builder.writeChar(10);
              break;
            case 114:
              this.#builder.writeChar(13);
              break;
            case 116:
              this.#builder.writeChar(9);
              break;
            case 117:
              let i: number;
              if (!isNaN((i = parseInt(this.readN(4), 16)))) {
                this.#builder.writeChar(i);
              } else {
                throw new JsonParseException("Invalid unicode escape");
              }
              break;
          }
          break;
        default:
          this.#builder.writeChar(c);
          break;
      }
    }
  }

  public parseObject(): JsonNode {
    this.read();
    let node: JsonNode = new JsonNode();
    node.initObject();
    while (true) {
      switch (this.#peekToken()) {
        case JsonToken.NONE:
          throw new JsonParseException("Unterminated object");
        case JsonToken.COMMA:
          this.read();
          continue;
        case JsonToken.CURLY_CLOSE:
          this.read();
          return node;
        default:
          let name: JsonNode = this.parseString();
          if (this.#peekToken() != JsonToken.COLON)
            throw new JsonParseException("Expected colon");
          this.read();
          node.addObjectChild(name.asString(), this.parseValue());
          break;
      }
    }
  }

  public parseArray(): JsonNode {
    this.read();
    let node: JsonNode = new JsonNode();
    node.initArray();
    let expectComma: boolean = false;
    while (true) {
      switch (this.#peekToken()) {
        case JsonToken.NONE:
          throw new JsonParseException("Unterminated array");
        case JsonToken.COMMA:
          if (!expectComma) {
            throw new JsonParseException("Unexpected comma in array");
          }
          expectComma = false;
          this.read();
          continue;
        case JsonToken.SQUARE_CLOSE:
          this.read();
          return node;
        default:
          if (expectComma) {
            throw new JsonParseException("Expected comma");
          }
          expectComma = true;
          node.addArrayChild(this.parseValue());
          break;
      }
    }
  }

  public parseValue(): JsonNode {
    switch (this.#peekToken()) {
      case JsonToken.STRING:
        return this.parseString();
      case JsonToken.NUMBER:
        return this.parseNumber();
      case JsonToken.BOOL:
        return this.parseBool();
      case JsonToken.NULL:
        return this.parseNull();
      case JsonToken.CURLY_OPEN:
        return this.parseObject();
      case JsonToken.SQUARE_OPEN:
        return this.parseArray();
      default:
        throw new JsonParseException("Invalid token");
    }
  }
}

class Platform {
  private constructor() {}

  /**
   * Starts a new process and sychronously reads/returns its output.
   */
  public static startProcessBlocking(command_line: readonly string[]): string {
    if (command_line.length == 0) {
      throw new Error("Command line is empty");
    }
    let ret: string = "";
    ret = nativeStartProcessBlocking(command_line);
    return Platform.strTrim(ret);
  }

  /**
   * Starts a new process and returns immediately.
   */
  public static startProcessFireAndForget(
    command_line: readonly string[],
  ): void {
    if (command_line.length == 0) {
      throw new Error("Command line is empty");
    }
    nativeStartProcessFireAndForget(command_line);
  }

  /**
   * Returns the path of the current process.
   */
  public static getCurrentProcessPath(): string {
    let ret: string = "";
    ret = nativeGetCurrentProcessPath();
    return ret;
  }

  public static fileExists(path: string): boolean {
    let ret: boolean = false;
    ret = nativeDoesFileExist(path);
    return ret;
  }

  public static isInstalled(): boolean {
    return (
      Platform.fileExists(Platform.#impl_GetFusionExePath()) &&
      Platform.fileExists(Platform.#impl_GetUpdateExePath())
    );
  }

  public static getFusionExePath(): string {
    let path: string = Platform.#impl_GetFusionExePath();
    if (!Platform.fileExists(path)) {
      throw new Error("Is the app installed? Fusion is not at: " + path);
    }
    return path;
  }

  public static getUpdateExePath(): string {
    let path: string = Platform.#impl_GetUpdateExePath();
    if (!Platform.fileExists(path)) {
      throw new Error("Is the app installed? Update is not at: " + path);
    }
    return path;
  }

  static #impl_GetFusionExePath(): string {
    let exePath: string = Platform.getCurrentProcessPath();
    if (Platform.isWindows()) {
      exePath = Platform.pathJoin(Platform.pathParent(exePath), "Vfusion.exe");
    } else if (Platform.isLinux()) {
      exePath = Platform.pathJoin(Platform.pathParent(exePath), "VfusionNix");
    } else if (Platform.isOsx()) {
      exePath = Platform.pathJoin(Platform.pathParent(exePath), "VfusionMac");
    } else {
      throw new Error("Unsupported OS");
    }
    return exePath;
  }

  static #impl_GetUpdateExePath(): string {
    let exePath: string = Platform.getCurrentProcessPath();
    if (Platform.isWindows()) {
      exePath = Platform.pathJoin(
        Platform.pathParent(Platform.pathParent(exePath)),
        "Update.exe",
      );
    } else if (Platform.isLinux()) {
      exePath = Platform.pathJoin(Platform.pathParent(exePath), "UpdateNix");
    } else if (Platform.isOsx()) {
      exePath = Platform.pathJoin(Platform.pathParent(exePath), "UpdateMac");
    } else {
      throw new Error("Unsupported OS");
    }
    return exePath;
  }

  public static strTrim(str: string): string {
    let match: RegExpMatchArray | null;
    if ((match = /(\S.*\S|\S)/.exec(str)) != null) {
      return match[1];
    }
    return str;
  }

  public static pathParent(str: string): string {
    let ix_win: number = str.lastIndexOf("\\");
    let ix_nix: number = str.lastIndexOf("/");
    let ix: number = Math.max(ix_win, ix_nix);
    return str.substring(0, ix);
  }

  public static pathJoin(s1: string, s2: string): string {
    while (s1.endsWith("/") || s1.endsWith("\\")) {
      s1 = s1.substring(0, s1.length - 1);
    }
    while (s2.startsWith("/") || s2.startsWith("\\")) {
      s2 = s2.substring(1);
    }
    return s1 + Platform.pathSeparator() + s2;
  }

  public static pathSeparator(): string {
    if (Platform.isWindows()) {
      return "\\";
    } else {
      return "/";
    }
  }

  public static isWindows(): boolean {
    return Platform.getOsName() == "win32";
  }

  public static isLinux(): boolean {
    return Platform.getOsName() == "linux";
  }

  public static isOsx(): boolean {
    return Platform.getOsName() == "darwin";
  }

  /**
   * Returns the name of the operating system.
   */
  public static getOsName(): string {
    let ret: string = "";
    ret = nativeCurrentOsName();
    return ret;
  }

  public static exit(code: number): void {
    nativeExitProcess(code);
  }
}

class StringStream {
  readonly #builder: StringWriter = new StringWriter();
  #writer: StringWriter;
  #initialised: boolean;

  public clear(): void {
    this.#builder.clear();
  }

  public write(s: string): void {
    this.#init();
    this.#writer.write(s);
  }

  public writeLine(s: string): void {
    this.#init();
    this.write(s);
    this.writeChar(10);
  }

  public writeChar(c: number): void {
    this.#init();
    this.#writer.write(String.fromCharCode(c));
  }

  public toString(): string {
    return this.#builder.toString();
  }

  #init(): void {
    if (!this.#initialised) {
      this.#writer = this.#builder;
      this.#initialised = true;
    }
  }
}

export enum VelopackAssetType {
  UNKNOWN,
  FULL,
  DELTA,
}

export class VelopackAsset {
  /**
   * The name or Id of the package containing this release.
   */
  packageId: string = "";
  /**
   * The version of this release.
   */
  version: string = "";
  /**
   * The type of asset (eg. full or delta).
   */
  type: VelopackAssetType = VelopackAssetType.UNKNOWN;
  /**
   * The filename of the update package containing this release.
   */
  fileName: string = "";
  /**
   * The SHA1 checksum of the update package containing this release.
   */
  sha1: string = "";
  /**
   * The size in bytes of the update package containing this release.
   */
  size: bigint = 0n;
  /**
   * The release notes in markdown format, as passed to Velopack when packaging the release.
   */
  notesMarkdown: string = "";
  /**
   * The release notes in HTML format, transformed from Markdown when packaging the release.
   */
  notesHTML: string = "";

  public static fromJson(json: string): VelopackAsset {
    let node: JsonNode = JsonNode.parse(json);
    return VelopackAsset.fromNode(node);
  }

  public static fromNode(node: JsonNode): VelopackAsset {
    let asset: VelopackAsset = new VelopackAsset();
    for (const [k, v] of Object.entries(node.asObject())) {
      switch (k.toLowerCase()) {
        case "id":
          asset.packageId = v.asString();
          break;
        case "version":
          asset.version = v.asString();
          break;
        case "type":
          asset.type =
            v.asString().toLowerCase() == "full"
              ? VelopackAssetType.FULL
              : VelopackAssetType.DELTA;
          break;
        case "filename":
          asset.fileName = v.asString();
          break;
        case "sha1":
          asset.sha1 = v.asString();
          break;
        case "size":
          asset.size = BigInt(Math.trunc(v.asNumber()));
          break;
        case "markdown":
          asset.notesMarkdown = v.asString();
          break;
        case "html":
          asset.notesHTML = v.asString();
          break;
      }
    }
    return asset;
  }
}

export class UpdateInfo {
  targetFullRelease: VelopackAsset;
  isDowngrade: boolean = false;

  public static fromJson(json: string): UpdateInfo {
    let node: JsonNode = JsonNode.parse(json);
    let updateInfo: UpdateInfo | null = new UpdateInfo();
    for (const [k, v] of Object.entries(node.asObject())) {
      switch (k.toLowerCase()) {
        case "targetfullrelease":
          updateInfo.targetFullRelease = VelopackAsset.fromNode(v);
          break;
        case "isdowngrade":
          updateInfo.isDowngrade = v.asBool();
          break;
      }
    }
    return updateInfo;
  }
}

export class ProgressEvent {
  file: string = "";
  complete: boolean = false;
  progress: number = 0;
  error: string = "";

  public static fromJson(json: string): ProgressEvent {
    let node: JsonNode = JsonNode.parse(json);
    let progressEvent: ProgressEvent = new ProgressEvent();
    for (const [k, v] of Object.entries(node.asObject())) {
      switch (k.toLowerCase()) {
        case "file":
          progressEvent.file = v.asString();
          break;
        case "complete":
          progressEvent.complete = v.asBool();
          break;
        case "progress":
          progressEvent.progress = Math.trunc(v.asNumber());
          break;
        case "error":
          progressEvent.error = v.asString();
          break;
      }
    }
    return progressEvent;
  }
}

/**
 * This class is used to check for updates, download updates, and apply updates. It is a synchronous version of the UpdateManager class.
 * This class is not recommended for use in GUI applications, as it will block the main thread, so you may want to use the async
 * UpdateManager class instead, if it is supported for your programming language.
 */
export class UpdateManagerSync {
  #_allowDowngrade: boolean = false;
  #_explicitChannel: string = "";
  #_urlOrPath: string = "";

  /**
   * Set the URL or local file path to the update server. This is required before calling CheckForUpdates or DownloadUpdates.
   */
  public setUrlOrPath(urlOrPath: string): void {
    this.#_urlOrPath = urlOrPath;
  }

  /**
   * Set whether to allow downgrades to an earlier version. If this is false, the app will only update to a newer version.
   */
  public setAllowDowngrade(allowDowngrade: boolean): void {
    this.#_allowDowngrade = allowDowngrade;
  }

  /**
   * Set the explicit channel to use when checking for updates. If this is not set, the default channel will be used.
   * You usually should not set this, unless you are intending for the user to switch to a different channel.
   */
  public setExplicitChannel(explicitChannel: string): void {
    this.#_explicitChannel = explicitChannel;
  }

  protected getCurrentVersionCommand(): string[] {
    const command: string[] = [];
    command.push(Platform.getFusionExePath());
    command.push("get-version");
    return command;
  }

  protected getCheckForUpdatesCommand(): string[] {
    if (this.#_urlOrPath.length == 0) {
      throw new Error(
        "Please call SetUrlOrPath before trying to check for updates.",
      );
    }
    const command: string[] = [];
    command.push(Platform.getFusionExePath());
    command.push("check");
    command.push("--url");
    command.push(this.#_urlOrPath);
    if (this.#_allowDowngrade) {
      command.push("--downgrade");
    }
    if (this.#_explicitChannel.length > 0) {
      command.push("--channel");
      command.push(this.#_explicitChannel);
    }
    return command;
  }

  protected getDownloadUpdatesCommand(updateInfo: UpdateInfo): string[] {
    if (this.#_urlOrPath.length == 0) {
      throw new Error(
        "Please call SetUrlOrPath before trying to download updates.",
      );
    }
    const command: string[] = [];
    command.push(Platform.getFusionExePath());
    command.push("download");
    command.push("--url");
    command.push(this.#_urlOrPath);
    if (this.#_allowDowngrade) {
      command.push("--downgrade");
    }
    if (this.#_explicitChannel.length > 0) {
      command.push("--channel");
      command.push(this.#_explicitChannel);
    }
    return command;
  }

  /**
   * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in
   * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
   */
  public isInstalled(): boolean {
    return Platform.isInstalled();
  }

  /**
   * Checks for updates, returning null if there are none available. If there are updates available, this method will return an
   * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
   */
  public getCurrentVersion(): string {
    const command: string[] = this.getCurrentVersionCommand();
    return Platform.startProcessBlocking(command);
  }

  /**
   * This function will check for updates, and return information about the latest
   * available release. This function runs synchronously and may take some time to
   * complete, depending on the network speed and the number of updates available.
   */
  public checkForUpdates(): UpdateInfo | null {
    const command: string[] = this.getCheckForUpdatesCommand();
    let output: string = Platform.startProcessBlocking(command);
    if (output.length == 0 || output == "null") {
      return null;
    }
    return UpdateInfo.fromJson(output);
  }

  /**
   * Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false,
   * this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
   * packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
   * so may fail if there is already another update operation in progress.
   */
  public downloadUpdates(updateInfo: UpdateInfo): void {
    const command: string[] = this.getDownloadUpdatesCommand(updateInfo);
    Platform.startProcessBlocking(command);
  }

  /**
   * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
   * restart arguments. If you need to save state or clean up, you should do that before calling this method.
   * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
   */
  public applyUpdatesAndExit(assetPath: string): void {
    const args: string[] = [];
    this.waitExitThenApplyUpdates(assetPath, false, false, args);
    Platform.exit(0);
  }

  /**
   * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
   * restart arguments. If you need to save state or clean up, you should do that before calling this method.
   * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
   */
  public applyUpdatesAndRestart(
    assetPath: string,
    restartArgs: readonly string[] | null = null,
  ): void {
    this.waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
    Platform.exit(0);
  }

  /**
   * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
   * You should then clean up any state and exit your app. The updater will apply updates and then
   * optionally restart your app. The updater will only wait for 60 seconds before giving up.
   */
  public waitExitThenApplyUpdates(
    assetPath: string,
    silent: boolean,
    restart: boolean,
    restartArgs: readonly string[] | null = null,
  ): void {
    const command: string[] = [];
    command.push(Platform.getUpdateExePath());
    if (silent) {
      command.push("--silent");
    }
    command.push("apply");
    command.push("--wait");
    if (assetPath.length > 0) {
      command.push("--package");
      command.push(assetPath);
    }
    if (restart) {
      command.push("--restart");
    }
    if (restart && restartArgs != null && restartArgs.length > 0) {
      command.push("--");
      command.push(...restartArgs);
    }
    Platform.startProcessFireAndForget(command);
  }
}

export class VelopackApp {
  public static build(): VelopackApp {
    const app: VelopackApp = new VelopackApp();
    return app;
  }

  public run(): void {
    const args: string[] = [];
    Array.prototype.push.apply(args, process.argv);
    this.#handleArgs(args);
  }

  #handleArgs(args: readonly string[]): void {
    for (let i: number = 0; i < args.length; i++) {
      let val: string = Platform.strTrim(args[i]).toLowerCase();
      if (val == "--veloapp-install") {
        Platform.exit(0);
      }
      if (val == "--veloapp-updated") {
        Platform.exit(0);
      }
      if (val == "--veloapp-obsolete") {
        Platform.exit(0);
      }
      if (val == "--veloapp-uninstall") {
        Platform.exit(0);
      }
    }
  }
}

class StringWriter {
  #buf = "";

  write(s) {
    this.#buf += s;
  }

  clear() {
    this.#buf = "";
  }

  toString() {
    return this.#buf;
  }
}

type ProgressFn = (arg: number) => void;

export class UpdateManager extends UpdateManagerSync {
  /**
   * Checks for updates, returning null if there are none available. If there are updates available, this method will return an
   * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
   */
  public getCurrentVersionAsync(): Promise<string> {
    const command: string[] = this.getCurrentVersionCommand();
    return nativeStartProcessAsync(command);
  }

  /**
   * This function will check for updates, and return information about the latest
   * available release. This function runs synchronously and may take some time to
   * complete, depending on the network speed and the number of updates available.
   */
  public async checkForUpdatesAsync(): Promise<UpdateInfo | null> {
    const command: string[] = this.getCheckForUpdatesCommand();
    let output: string = await nativeStartProcessAsync(command);
    if (output.length == 0 || output == "null") {
      return null;
    }
    return UpdateInfo.fromJson(output);
  }

  /**
   * Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false,
   * this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
   * packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
   * so may fail if there is already another update operation in progress.
   */
  public async downloadUpdatesAsync(
    updateInfo: UpdateInfo,
    progress: ProgressFn,
  ): Promise<void> {
    const command: string[] = this.getDownloadUpdatesCommand(updateInfo);
    let error: string = "";
    await nativeStartProcessAsyncReadLine(command, (data: string) => {
      let msg: ProgressEvent = ProgressEvent.fromJson(data);
      if (msg.progress > 0) {
        progress(msg.progress);
      }
      if (msg.error) {
        error = msg.error;
      }
    });
    if (error.length > 0) {
      throw new Error(error);
    }
  }
}