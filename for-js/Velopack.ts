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
  return child.stdout;
}
function nativeStartProcessAsyncReadLine(
  command_line: readonly string[],
  handler,
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
      handler.handleProcessOutputLine(data);
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
  public getType(): JsonNodeType {
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
class StringAppendable {
  readonly #builder: StringWriter = new StringWriter();
  #writer: StringWriter;
  #initialised: boolean;
  public clear(): void {
    this.#builder.clear();
  }
  public writeChar(c: number): void {
    if (!this.#initialised) {
      this.#writer = this.#builder;
      this.#initialised = true;
    }
    this.#writer.write(String.fromCharCode(c));
  }
  public toString(): string {
    return this.#builder.toString();
  }
}
class JsonParser {
  #text: string = "";
  #position: number = 0;
  readonly #builder: StringAppendable = new StringAppendable();
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
export abstract class ProgressHandler {
  public abstract onProgress(progress: number): void;
  public abstract onComplete(assetPath: string): void;
  public abstract onError(error: string): void;
}
class ProcessReadLineHandler {
  #_progress: ProgressHandler;
  public setProgressHandler(progress: ProgressHandler): void {
    this.#_progress = progress;
  }
  public handleProcessOutputLine(line: string): boolean {
    let ev: ProgressEvent = ProgressEvent.fromJson(line);
    if (ev.complete) {
      this.#_progress.onComplete(ev.file);
      return true;
    } else if (ev.error.length > 0) {
      this.#_progress.onError(ev.error);
      return true;
    } else {
      this.#_progress.onProgress(ev.progress);
      return false;
    }
  }
}
class DefaultProgressHandler extends ProgressHandler {
  public onProgress(progress: number): void {}
  public onComplete(assetPath: string): void {}
  public onError(error: string): void {}
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
export class UpdateManager {
  #_allowDowngrade: boolean = false;
  #_explicitChannel: string = "";
  #_urlOrPath: string = "";
  public setUrlOrPath(urlOrPath: string): void {
    this.#_urlOrPath = urlOrPath;
  }
  public setAllowDowngrade(allowDowngrade: boolean): void {
    this.#_allowDowngrade = allowDowngrade;
  }
  public setExplicitChannel(explicitChannel: string): void {
    this.#_explicitChannel = explicitChannel;
  }
  /**
   * This function will return the current installed version of the application
   * or throw, if the application is not installed.
   */
  public getCurrentVersion(): string {
    const command: string[] = [];
    command.push(Util.getUpdateExePath());
    command.push("get-version");
    return Util.startProcessBlocking(command);
  }
  /**
   * This function will check for updates, and return information about the latest available release.
   */
  public checkForUpdates(): UpdateInfo | null {
    if (this.#_urlOrPath.length == 0) {
      throw new Error(
        "Please call SetUrlOrPath before trying to check for updates.",
      );
    }
    const command: string[] = [];
    command.push(Util.getUpdateExePath());
    command.push("check");
    command.push("--url");
    command.push(this.#_urlOrPath);
    command.push("--format");
    command.push("json");
    if (this.#_allowDowngrade) {
      command.push("--downgrade");
    }
    if (this.#_explicitChannel.length > 0) {
      command.push("--channel");
      command.push(this.#_explicitChannel);
    }
    let output: string = Util.startProcessBlocking(command);
    if (output.length == 0 || output == "null") {
      return null;
    }
    return UpdateInfo.fromJson(output);
  }
  /**
   * This function will request the update download, and then return immediately.
   * To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.
   */
  public downloadUpdateAsync(
    updateInfo: UpdateInfo,
    progressHandler: ProgressHandler | null = null,
  ): Promise<void> {
    if (this.#_urlOrPath.length == 0) {
      throw new Error(
        "Please call SetUrlOrPath before trying to download updates.",
      );
    }
    const command: string[] = [];
    command.push(Util.getUpdateExePath());
    command.push("download");
    command.push("--url");
    command.push(this.#_urlOrPath);
    command.push("--clean");
    command.push("--format");
    command.push("json");
    command.push("--name");
    command.push(updateInfo.targetFullRelease.fileName);
    let def: DefaultProgressHandler = new DefaultProgressHandler();
    let handler: ProcessReadLineHandler = new ProcessReadLineHandler();
    handler.setProgressHandler(progressHandler == null ? def : progressHandler);
    return Util.startProcessAsyncReadLine(command, handler);
  }
  public applyUpdatesAndExit(assetPath: string): void {
    const args: string[] = [];
    this.waitExitThenApplyUpdates(assetPath, false, false, args);
    Util.exit(0);
  }
  public applyUpdatesAndRestart(
    assetPath: string,
    restartArgs: readonly string[] | null = null,
  ): void {
    this.waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
    Util.exit(0);
  }
  public waitExitThenApplyUpdates(
    assetPath: string,
    silent: boolean,
    restart: boolean,
    restartArgs: readonly string[] | null = null,
  ): void {
    const command: string[] = [];
    command.push(Util.getUpdateExePath());
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
    Util.startProcessFireAndForget(command);
  }
}
class Util {
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
    return Util.strTrim(ret);
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
  public static startProcessAsyncReadLine(
    command_line: readonly string[],
    handler: ProcessReadLineHandler,
  ): Promise<void> {
    if (command_line.length == 0) {
      throw new Error("Command line is empty");
    }
    return nativeStartProcessAsyncReadLine(command_line, handler);
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
  public static getUpdateExePath(): string {
    let exePath: string = Util.getCurrentProcessPath();
    if (Util.isWindows()) {
      exePath = Util.pathJoin(
        Util.pathParent(Util.pathParent(exePath)),
        "Update.exe",
      );
    } else if (Util.isLinux()) {
      exePath = Util.pathJoin(Util.pathParent(exePath), "UpdateNix");
    } else if (Util.isOsx()) {
      exePath = Util.pathJoin(Util.pathParent(exePath), "UpdateMac");
    } else {
      throw new Error("Unsupported platform");
    }
    if (!Util.fileExists(exePath)) {
      throw new Error("Update executable not found: " + exePath);
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
    return s1 + Util.pathSeparator() + s2;
  }
  public static pathSeparator(): string {
    if (Util.isWindows()) {
      return "\\";
    } else {
      return "/";
    }
  }
  public static isWindows(): boolean {
    return Util.getOsName() == "win32";
  }
  public static isLinux(): boolean {
    return Util.getOsName() == "linux";
  }
  public static isOsx(): boolean {
    return Util.getOsName() == "darwin";
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
      let val: string = Util.strTrim(args[i]).toLowerCase();
      if (val == "--veloapp-install") {
        Util.exit(0);
      }
      if (val == "--veloapp-updated") {
        Util.exit(0);
      }
      if (val == "--veloapp-obsolete") {
        Util.exit(0);
      }
      if (val == "--veloapp-uninstall") {
        Util.exit(0);
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