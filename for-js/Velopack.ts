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

let electron;
let is_electron = false;
try {
  electron = require("electron");
  is_electron = true;
} catch {}

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

function nativeCurrentProcessId(): number {
  if (is_electron && !electron.app) {
    return electron.ipcRenderer.sendSync("velopack-get-pid");
  } else {
    return process.pid;
  }
}

function nativeGetCurrentProcessPath(): string {
  return process.execPath;
}

function nativeCurrentOsName(): string {
  return process.platform;
}

function nativeExitProcess(code: number): void {
  if (is_electron) {
    if (electron.app) {
      electron.app.quit(code);
      // app.quit does not exit fast enough, the browser window might still show in hooks
      process.exit(code);
    } else if (electron.remote) {
      electron.remote.app.quit(code);
    } else if (electron.ipcRenderer) {
      electron.ipcRenderer.send("velopack-quit", code);
    } else {
      throw new Error(
        "Could not find a way to exit the process, electron.app, electron.remote.app, and electron.ipcRenderer are all undefined.",
      );
    }
  } else {
    process.exit(code);
  }
}

function nativeRegisterElectron(): void {
  if (is_electron) {
    electron.ipcMain.on("velopack-quit", (event, code) => {
      electron.app.quit(code);
    });
    electron.ipcMain.on("velopack-get-pid", (event) => {
      event.returnValue = process.pid;
    });
  }
}

function nativeStartProcessFireAndForget(
  command_line: readonly string[],
): void {
  const child = spawn(command_line[0], command_line.slice(1), {
    encoding: "utf8",
    detached: true,
    stdio: "ignore",
  });
  // Detach the child process so it can run independently and outlive the parent process
  child.unref();
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
    const process = spawn(command_line[0], command_line.slice(1), {
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
        resolve(output.trim());
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
      throw new Error("Cannot call InitBool on JsonNode which is not null.");
    }
    this.#type = JsonNodeType.BOOL;
    this.#boolValue = value;
  }

  initArray(): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new Error("Cannot call InitArray on JsonNode which is not null.");
    }
    this.#type = JsonNodeType.ARRAY;
  }

  addArrayChild(child: JsonNode): void {
    if (this.#type != JsonNodeType.ARRAY) {
      throw new Error(
        "Cannot call AddArrayChild on JsonNode which is not an array.",
      );
    }
    this.#arrayValue.push(child);
  }

  initObject(): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new Error("Cannot call InitObject on JsonNode which is not null.");
    }
    this.#type = JsonNodeType.OBJECT;
  }

  addObjectChild(key: string, child: JsonNode): void {
    if (this.#type != JsonNodeType.OBJECT) {
      throw new Error(
        "Cannot call AddObjectChild on JsonNode which is not an object.",
      );
    }
    this.#objectValue[key] = child;
  }

  initNumber(value: number): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new Error("Cannot call InitNumber on JsonNode which is not null.");
    }
    this.#type = JsonNodeType.NUMBER;
    this.#numberValue = value;
  }

  initString(value: string): void {
    if (this.#type != JsonNodeType.NULL) {
      throw new Error("Cannot call InitString on JsonNode which is not null.");
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
      throw new Error("Unexpected end of input");
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
      throw new Error("Invalid boolean");
    }
  }

  public parseNumber(): JsonNode {
    let node: JsonNode = new JsonNode();
    node.initNumber(Platform.parseDouble(this.readWord()));
    return node;
  }

  public parseString(): JsonNode {
    this.#builder.clear();
    this.read();
    while (true) {
      if (this.endReached()) {
        throw new Error("Unterminated string");
      }
      let c: number = this.read();
      switch (c) {
        case 34:
          let node: JsonNode = new JsonNode();
          node.initString(this.#builder.toString());
          return node;
        case 92:
          if (this.endReached()) {
            throw new Error("Unterminated string");
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
              this.#builder.writeChar(Platform.parseHex(this.readN(4)));
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
          throw new Error("Unterminated object");
        case JsonToken.COMMA:
          this.read();
          continue;
        case JsonToken.CURLY_CLOSE:
          this.read();
          return node;
        default:
          let name: JsonNode = this.parseString();
          if (this.#peekToken() != JsonToken.COLON)
            throw new Error("Expected colon");
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
          throw new Error("Unterminated array");
        case JsonToken.COMMA:
          if (!expectComma) {
            throw new Error("Unexpected comma in array");
          }
          expectComma = false;
          this.read();
          continue;
        case JsonToken.SQUARE_CLOSE:
          this.read();
          return node;
        default:
          if (expectComma) {
            throw new Error("Expected comma");
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
        throw new Error("Invalid token");
    }
  }
}

class Platform {
  private constructor() {}

  public static startProcessBlocking(command_line: readonly string[]): string {
    if (command_line.length == 0) {
      throw new Error("Command line is empty");
    }
    let ret: string = "";
    ret = nativeStartProcessBlocking(command_line);
    return Platform.strTrim(ret);
  }

  public static startProcessFireAndForget(
    command_line: readonly string[],
  ): void {
    if (command_line.length == 0) {
      throw new Error("Command line is empty");
    }
    nativeStartProcessFireAndForget(command_line);
  }

  public static getCurrentProcessId(): number {
    let ret: number = 0;
    ret = nativeCurrentProcessId();
    return ret;
  }

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
    let exeName: string = "";
    if (Platform.isWindows()) {
      exeName = "Vfusion.exe";
    } else if (Platform.isLinux()) {
      exeName = "VfusionNix";
    } else if (Platform.isOsx()) {
      exeName = "VfusionMac";
    } else {
      throw new Error("Unsupported OS");
    }
    let libraryDir: string = "";
    libraryDir = __dirname;
    libraryDir = libraryDir.replaceAll("\\app.asar\\", "\\app.asar.unpacked\\");
    libraryDir = libraryDir.replaceAll("/app.asar/", "/app.asar.unpacked/");
    return Platform.pathJoin(Platform.pathJoin(libraryDir, "bin"), exeName);
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

  public static parseDouble(str: string): number {
    let d: number = 0;
    if (!isNaN((d = parseFloat(str)))) {
      return d;
    }
    throw new Error("ParseDouble failed, string is not a valid double");
  }

  public static toLower(str: string): string {
    let result: string = "";
    result = str.toLowerCase();
    return result;
  }

  public static toUpper(str: string): string {
    let result: string = "";
    result = str.toLowerCase();
    return result;
  }

  public static parseHex(str: string): number {
    let i: number = 0;
    if (!isNaN((i = parseInt(str, 16)))) {
      return i;
    }
    throw new Error(
      "ParseHex failed, string is not a valid hexidecimal number",
    );
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

/**
 * An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.
 */
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

  /**
   * Parses a JSON string into a VelopackAsset object.
   */
  public static fromJson(json: string): VelopackAsset {
    let node: JsonNode = JsonNode.parse(json);
    return VelopackAsset.fromNode(node);
  }

  /**
   * Parses a JSON node into a VelopackAsset object.
   */
  public static fromNode(node: JsonNode): VelopackAsset {
    let asset: VelopackAsset = new VelopackAsset();
    for (const [k, v] of Object.entries(node.asObject())) {
      switch (Platform.toLower(k)) {
        case "id":
          asset.packageId = v.asString();
          break;
        case "version":
          asset.version = v.asString();
          break;
        case "type":
          asset.type =
            Platform.toLower(v.asString()) == "full"
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

/**
 * Holds information about the current version and pending updates, such as how many there are, and access to release notes.
 */
export class UpdateInfo {
  /**
   * The available version that we are updating to.
   */
  targetFullRelease: VelopackAsset;
  /**
   * True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).
   * In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
   * deleted.
   */
  isDowngrade: boolean = false;

  /**
   * Parses a JSON string into an UpdateInfo object.
   */
  public static fromJson(json: string): UpdateInfo {
    let node: JsonNode = JsonNode.parse(json);
    let updateInfo: UpdateInfo | null = new UpdateInfo();
    for (const [k, v] of Object.entries(node.asObject())) {
      switch (Platform.toLower(k)) {
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
   * Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).
   * This could happen if a release has bugs and was retracted from the release feed, or if you're using
   * ExplicitChannel to switch channels to another channel where the latest version on that
   * channel is lower than the current version.
   */
  public setAllowDowngrade(allowDowngrade: boolean): void {
    this.#_allowDowngrade = allowDowngrade;
  }

  /**
   * This option should usually be left null. Overrides the default channel used to fetch updates.
   * The default channel will be whatever channel was specified on the command line when building this release.
   * For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
   * This allows users to automatically receive updates from the same channel they installed from. This options
   * allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
   * without having to reinstall the application.
   */
  public setExplicitChannel(explicitChannel: string): void {
    this.#_explicitChannel = explicitChannel;
  }

  /**
   * Returns the command line arguments to get the current version of the application.
   */
  protected getCurrentVersionCommand(): string[] {
    const command: string[] = [];
    command.push(Platform.getFusionExePath());
    command.push("get-version");
    return command;
  }

  /**
   * Returns the command line arguments to check for updates.
   */
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

  /**
   * Returns the command line arguments to download the specified update.
   */
  protected getDownloadUpdatesCommand(toDownload: VelopackAsset): string[] {
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
    command.push("--name");
    command.push(toDownload.fileName);
    if (this.#_explicitChannel.length > 0) {
      command.push("--channel");
      command.push(this.#_explicitChannel);
    }
    return command;
  }

  /**
   * Returns the command line arguments to apply the specified update.
   */
  protected getUpdateApplyCommand(
    toApply: VelopackAsset | null,
    silent: boolean,
    restart: boolean,
    wait: boolean,
    restartArgs: readonly string[] | null = null,
  ): string[] {
    const command: string[] = [];
    command.push(Platform.getUpdateExePath());
    command.push("apply");
    if (silent) {
      command.push("--silent");
    }
    if (wait) {
      command.push("--waitPid");
      command.push(`${Platform.getCurrentProcessId()}`);
    }
    if (toApply != null) {
      let packagesDir: string = this.getPackagesDir();
      let assetPath: string = Platform.pathJoin(packagesDir, toApply.fileName);
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
    return command;
  }

  /**
   * Returns the path to the app's packages directory. This is where updates are downloaded to.
   */
  protected getPackagesDir(): string {
    const command: string[] = [];
    command.push(Platform.getFusionExePath());
    command.push("get-packages");
    return Platform.startProcessBlocking(command);
  }

  /**
   * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in
   * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
   */
  public isInstalled(): boolean {
    return Platform.isInstalled();
  }

  /**
   * Get the currently installed version of the application.
   * If the application is not installed, this function will throw an exception.
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
  public downloadUpdates(toDownload: VelopackAsset): void {
    const command: string[] = this.getDownloadUpdatesCommand(toDownload);
    Platform.startProcessBlocking(command);
  }

  /**
   * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
   * restart arguments. If you need to save state or clean up, you should do that before calling this method.
   * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
   */
  public applyUpdatesAndExit(toApply: VelopackAsset | null): void {
    const command: string[] = this.getUpdateApplyCommand(
      toApply,
      false,
      false,
      false,
    );
    Platform.startProcessFireAndForget(command);
    Platform.exit(0);
  }

  /**
   * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
   * restart arguments. If you need to save state or clean up, you should do that before calling this method.
   * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
   */
  public applyUpdatesAndRestart(
    toApply: VelopackAsset | null,
    restartArgs: readonly string[] | null = null,
  ): void {
    const command: string[] = this.getUpdateApplyCommand(
      toApply,
      false,
      true,
      false,
      restartArgs,
    );
    Platform.startProcessFireAndForget(command);
    Platform.exit(0);
  }

  /**
   * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
   * You should then clean up any state and exit your app. The updater will apply updates and then
   * optionally restart your app. The updater will only wait for 60 seconds before giving up.
   */
  public waitExitThenApplyUpdates(
    toApply: VelopackAsset | null,
    silent: boolean,
    restart: boolean,
    restartArgs: readonly string[] | null = null,
  ): void {
    const command: string[] = this.getUpdateApplyCommand(
      toApply,
      silent,
      restart,
      true,
      restartArgs,
    );
    Platform.startProcessFireAndForget(command);
  }
}

/**
 * The main VelopackApp struct. This is the main entry point for your app.
 */
export class VelopackApp {
  /**
   * Create a new VelopackApp instance.
   */
  public static build(): VelopackApp {
    const app: VelopackApp = new VelopackApp();
    return app;
  }

  /**
   * Runs the Velopack startup logic. This should be the first thing to run in your app.
   * In some circumstances it may terminate/restart the process to perform tasks.
   */
  public run(): void {
    nativeRegisterElectron();
    const args: string[] = [];
    Array.prototype.push.apply(args, process.argv);
    for (let i: number = 0; i < args.length; i++) {
      let val: string = Platform.toLower(Platform.strTrim(args[i]));
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

/**
 * This class is used to check for updates, download updates, and apply updates.
 * It provides the asynchronous functions of the UpdateManager class.
 * @extends UpdateManagerSync
 */
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
    toDownload: VelopackAsset,
    progress: (arg: number) => void,
  ): Promise<void> {
    const command: string[] = this.getDownloadUpdatesCommand(toDownload);
    await nativeStartProcessAsyncReadLine(command, (data: string) => {
      if (progress && progress instanceof Function) {
        const p = parseInt(data);
        if (!isNaN(p) && p > 0) {
          progress(p);
        }
      }
    });
  }
}