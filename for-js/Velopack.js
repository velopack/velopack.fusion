"use strict";
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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _JsonNode_type, _JsonNode_objectValue, _JsonNode_arrayValue, _JsonNode_stringValue, _JsonNode_numberValue, _JsonNode_boolValue, _JsonParser_instances, _JsonParser_text, _JsonParser_position, _JsonParser_builder, _JsonParser_peekToken, _a, _Platform_impl_GetFusionExePath, _Platform_impl_GetUpdateExePath, _StringStream_instances, _StringStream_builder, _StringStream_writer, _StringStream_initialised, _StringStream_init, _UpdateManagerSync__allowDowngrade, _UpdateManagerSync__explicitChannel, _UpdateManagerSync__urlOrPath, _StringWriter_buf;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManager = exports.VelopackApp = exports.UpdateManagerSync = exports.UpdateInfo = exports.VelopackAsset = exports.VelopackAssetType = exports.JsonNode = exports.JsonNodeType = void 0;
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
let electron;
let is_electron = false;
try {
    electron = require("electron");
    is_electron = true;
}
catch { }
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
function nativeDoesFileExist(path) {
    return fs.existsSync(path);
}
function nativeCurrentProcessId() {
    if (is_electron && !electron.app) {
        return electron.ipcRenderer.sendSync("velopack-get-pid");
    }
    else {
        return process.pid;
    }
}
function nativeGetCurrentProcessPath() {
    return process.execPath;
}
function nativeCurrentOsName() {
    return process.platform;
}
function nativeExitProcess(code) {
    if (is_electron) {
        if (electron.app) {
            electron.app.quit(code);
            process.exit(code);
        }
        else if (electron.remote) {
            electron.remote.app.quit(code);
        }
        else if (electron.ipcRenderer) {
            electron.ipcRenderer.send("velopack-quit", code);
        }
        else {
            throw new Error("Could not find a way to exit the process, electron.app, electron.remote.app, and electron.ipcRenderer are all undefined.");
        }
    }
    else {
        process.exit(code);
    }
}
function nativeRegisterElectron() {
    if (is_electron) {
        electron.ipcMain.on("velopack-quit", (event, code) => {
            electron.app.quit(code);
        });
        electron.ipcMain.on("velopack-get-pid", (event) => {
            event.returnValue = process.pid;
        });
        electron.ipcMain.on("velopack-exec-fire-forget", (event, command) => {
            nativeStartProcessFireAndForget(command);
        });
        electron.ipcMain.on("velopack-exec-blocking", (event, command) => {
            event.returnValue = nativeStartProcessBlocking(command);
        });
    }
}
function nativeStartProcessFireAndForget(command_line) {
    if (is_electron && !electron.app) {
        electron.ipcRenderer.send("velopack-exec-fire-forget", command_line);
    }
    else {
        spawn(command_line[0], command_line.slice(1), { encoding: "utf8" });
    }
}
function nativeStartProcessBlocking(command_line) {
    if (is_electron && !electron.app) {
        return electron.ipcRenderer.sendSync("velopack-exec-blocking", command_line);
    }
    else {
        const child = spawnSync(command_line[0], command_line.slice(1), {
            encoding: "utf8",
        });
        if (child.status !== 0) {
            throw new Error(`Process returned non-zero exit code (${child.status}). Check the log for more details.`);
        }
        return child.stdout;
    }
}
function nativeStartProcessAsync(command_line) {
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
                resolve(output.trim());
            }
            else {
                reject(new Error(`Process exited with code: ${code}`));
            }
        });
        process.on("error", (err) => {
            reject(err);
        });
    });
}
function nativeStartProcessAsyncReadLine(command_line, handler) {
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
            }
            else {
                reject(new Error(`Process exited with code: ${code}`)); // Process failed
            }
        });
        // Handling process errors (e.g., if the process could not be spawned, killed or sending a message to it fails)
        child.on("error", (err) => {
            reject(err); // Process encountered an error
        });
    });
}
var JsonNodeType;
(function (JsonNodeType) {
    JsonNodeType[JsonNodeType["NULL"] = 0] = "NULL";
    JsonNodeType[JsonNodeType["BOOL"] = 1] = "BOOL";
    JsonNodeType[JsonNodeType["ARRAY"] = 2] = "ARRAY";
    JsonNodeType[JsonNodeType["OBJECT"] = 3] = "OBJECT";
    JsonNodeType[JsonNodeType["NUMBER"] = 4] = "NUMBER";
    JsonNodeType[JsonNodeType["STRING"] = 5] = "STRING";
})(JsonNodeType || (exports.JsonNodeType = JsonNodeType = {}));
var JsonToken;
(function (JsonToken) {
    JsonToken[JsonToken["NONE"] = 0] = "NONE";
    JsonToken[JsonToken["CURLY_OPEN"] = 1] = "CURLY_OPEN";
    JsonToken[JsonToken["CURLY_CLOSE"] = 2] = "CURLY_CLOSE";
    JsonToken[JsonToken["SQUARE_OPEN"] = 3] = "SQUARE_OPEN";
    JsonToken[JsonToken["SQUARE_CLOSE"] = 4] = "SQUARE_CLOSE";
    JsonToken[JsonToken["COLON"] = 5] = "COLON";
    JsonToken[JsonToken["COMMA"] = 6] = "COMMA";
    JsonToken[JsonToken["STRING"] = 7] = "STRING";
    JsonToken[JsonToken["NUMBER"] = 8] = "NUMBER";
    JsonToken[JsonToken["BOOL"] = 9] = "BOOL";
    JsonToken[JsonToken["NULL"] = 10] = "NULL";
})(JsonToken || (JsonToken = {}));
class JsonNode {
    constructor() {
        _JsonNode_type.set(this, JsonNodeType.NULL);
        _JsonNode_objectValue.set(this, {});
        _JsonNode_arrayValue.set(this, []);
        _JsonNode_stringValue.set(this, void 0);
        _JsonNode_numberValue.set(this, void 0);
        _JsonNode_boolValue.set(this, void 0);
    }
    /**
     * Get the type of this node, such as string, object, array, etc.
     * You should use this function and then call the corresponding
     * AsObject, AsArray, AsString, etc. functions to get the actual
     * parsed json information.
     */
    getKind() {
        return __classPrivateFieldGet(this, _JsonNode_type, "f");
    }
    /**
     * Check if the JSON value is null.
     */
    isNull() {
        return __classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.NULL;
    }
    /**
     * Check if the JSON value is empty - eg. an empty string, array, or object.
     */
    isEmpty() {
        return (__classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.NULL ||
            (__classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.STRING && __classPrivateFieldGet(this, _JsonNode_stringValue, "f").length == 0) ||
            (__classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.ARRAY && __classPrivateFieldGet(this, _JsonNode_arrayValue, "f").length == 0) ||
            (__classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.OBJECT &&
                Object.keys(__classPrivateFieldGet(this, _JsonNode_objectValue, "f")).length == 0));
    }
    /**
     * Reinterpret a JSON value as an object. Throws exception if the value type was not an object.
     */
    asObject() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.OBJECT) {
            throw new Error("Cannot call AsObject on JsonNode which is not an object.");
        }
        return __classPrivateFieldGet(this, _JsonNode_objectValue, "f");
    }
    /**
     * Reinterpret a JSON value as an array. Throws exception if the value type was not an array.
     */
    asArray() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.ARRAY) {
            throw new Error("Cannot call AsArray on JsonNode which is not an array.");
        }
        return __classPrivateFieldGet(this, _JsonNode_arrayValue, "f");
    }
    /**
     * Reinterpret a JSON value as a number. Throws exception if the value type was not a double.
     */
    asNumber() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NUMBER) {
            throw new Error("Cannot call AsNumber on JsonNode which is not a number.");
        }
        return __classPrivateFieldGet(this, _JsonNode_numberValue, "f");
    }
    /**
     * Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.
     */
    asBool() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.BOOL) {
            throw new Error("Cannot call AsBool on JsonNode which is not a boolean.");
        }
        return __classPrivateFieldGet(this, _JsonNode_boolValue, "f");
    }
    /**
     * Reinterpret a JSON value as a string. Throws exception if the value type was not a string.
     */
    asString() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.STRING) {
            throw new Error("Cannot call AsString on JsonNode which is not a string.");
        }
        return __classPrivateFieldGet(this, _JsonNode_stringValue, "f");
    }
    static parse(text) {
        let parser = new JsonParser();
        parser.load(text);
        return parser.parseValue();
    }
    initBool(value) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new Error("Cannot call InitBool on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.BOOL, "f");
        __classPrivateFieldSet(this, _JsonNode_boolValue, value, "f");
    }
    initArray() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new Error("Cannot call InitArray on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.ARRAY, "f");
    }
    addArrayChild(child) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.ARRAY) {
            throw new Error("Cannot call AddArrayChild on JsonNode which is not an array.");
        }
        __classPrivateFieldGet(this, _JsonNode_arrayValue, "f").push(child);
    }
    initObject() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new Error("Cannot call InitObject on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.OBJECT, "f");
    }
    addObjectChild(key, child) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.OBJECT) {
            throw new Error("Cannot call AddObjectChild on JsonNode which is not an object.");
        }
        __classPrivateFieldGet(this, _JsonNode_objectValue, "f")[key] = child;
    }
    initNumber(value) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new Error("Cannot call InitNumber on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.NUMBER, "f");
        __classPrivateFieldSet(this, _JsonNode_numberValue, value, "f");
    }
    initString(value) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new Error("Cannot call InitString on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.STRING, "f");
        __classPrivateFieldSet(this, _JsonNode_stringValue, value, "f");
    }
}
exports.JsonNode = JsonNode;
_JsonNode_type = new WeakMap(), _JsonNode_objectValue = new WeakMap(), _JsonNode_arrayValue = new WeakMap(), _JsonNode_stringValue = new WeakMap(), _JsonNode_numberValue = new WeakMap(), _JsonNode_boolValue = new WeakMap();
class JsonParser {
    constructor() {
        _JsonParser_instances.add(this);
        _JsonParser_text.set(this, "");
        _JsonParser_position.set(this, 0);
        _JsonParser_builder.set(this, new StringStream());
    }
    load(text) {
        __classPrivateFieldSet(this, _JsonParser_text, text, "f");
        __classPrivateFieldSet(this, _JsonParser_position, 0, "f");
    }
    endReached() {
        return __classPrivateFieldGet(this, _JsonParser_position, "f") >= __classPrivateFieldGet(this, _JsonParser_text, "f").length;
    }
    readN(n) {
        if (__classPrivateFieldGet(this, _JsonParser_position, "f") + n > __classPrivateFieldGet(this, _JsonParser_text, "f").length) {
            throw new Error("Unexpected end of input");
        }
        let result = __classPrivateFieldGet(this, _JsonParser_text, "f").substring(__classPrivateFieldGet(this, _JsonParser_position, "f"), __classPrivateFieldGet(this, _JsonParser_position, "f") + n);
        __classPrivateFieldSet(this, _JsonParser_position, __classPrivateFieldGet(this, _JsonParser_position, "f") + n, "f");
        return result;
    }
    read() {
        var _b;
        if (__classPrivateFieldGet(this, _JsonParser_position, "f") >= __classPrivateFieldGet(this, _JsonParser_text, "f").length) {
            return -1;
        }
        let c = __classPrivateFieldGet(this, _JsonParser_text, "f").charCodeAt(__classPrivateFieldGet(this, _JsonParser_position, "f"));
        __classPrivateFieldSet(this, _JsonParser_position, (_b = __classPrivateFieldGet(this, _JsonParser_position, "f"), _b++, _b), "f");
        return c;
    }
    peek() {
        if (__classPrivateFieldGet(this, _JsonParser_position, "f") >= __classPrivateFieldGet(this, _JsonParser_text, "f").length) {
            return -1;
        }
        return __classPrivateFieldGet(this, _JsonParser_text, "f").charCodeAt(__classPrivateFieldGet(this, _JsonParser_position, "f"));
    }
    peekWhitespace() {
        let c = this.peek();
        return c == 32 || c == 9 || c == 10 || c == 13;
    }
    peekWordbreak() {
        let c = this.peek();
        return (c == 32 ||
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
            c == 47);
    }
    eatWhitespace() {
        while (!this.endReached() && this.peekWhitespace()) {
            this.read();
        }
    }
    readWord() {
        __classPrivateFieldGet(this, _JsonParser_builder, "f").clear();
        while (!this.endReached() && !this.peekWordbreak()) {
            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(this.read());
        }
        return __classPrivateFieldGet(this, _JsonParser_builder, "f").toString();
    }
    parseNull() {
        this.readWord();
        let node = new JsonNode();
        return node;
    }
    parseBool() {
        let boolValue = this.readWord();
        if (boolValue == "true") {
            let node = new JsonNode();
            node.initBool(true);
            return node;
        }
        else if (boolValue == "false") {
            let node = new JsonNode();
            node.initBool(false);
            return node;
        }
        else {
            throw new Error("Invalid boolean");
        }
    }
    parseNumber() {
        let d;
        if (!isNaN((d = parseFloat(this.readWord())))) {
            let node = new JsonNode();
            node.initNumber(d);
            return node;
        }
        throw new Error("Invalid number");
    }
    parseString() {
        __classPrivateFieldGet(this, _JsonParser_builder, "f").clear();
        this.read();
        while (true) {
            if (this.endReached()) {
                throw new Error("Unterminated string");
            }
            let c = this.read();
            switch (c) {
                case 34:
                    let node = new JsonNode();
                    node.initString(__classPrivateFieldGet(this, _JsonParser_builder, "f").toString());
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
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(c);
                            break;
                        case 98:
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(8);
                            break;
                        case 102:
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(12);
                            break;
                        case 110:
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(10);
                            break;
                        case 114:
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(13);
                            break;
                        case 116:
                            __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(9);
                            break;
                        case 117:
                            let i;
                            if (!isNaN((i = parseInt(this.readN(4), 16)))) {
                                __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(i);
                            }
                            else {
                                throw new Error("Invalid unicode escape");
                            }
                            break;
                    }
                    break;
                default:
                    __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(c);
                    break;
            }
        }
    }
    parseObject() {
        this.read();
        let node = new JsonNode();
        node.initObject();
        while (true) {
            switch (__classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this)) {
                case JsonToken.NONE:
                    throw new Error("Unterminated object");
                case JsonToken.COMMA:
                    this.read();
                    continue;
                case JsonToken.CURLY_CLOSE:
                    this.read();
                    return node;
                default:
                    let name = this.parseString();
                    if (__classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this) != JsonToken.COLON)
                        throw new Error("Expected colon");
                    this.read();
                    node.addObjectChild(name.asString(), this.parseValue());
                    break;
            }
        }
    }
    parseArray() {
        this.read();
        let node = new JsonNode();
        node.initArray();
        let expectComma = false;
        while (true) {
            switch (__classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this)) {
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
    parseValue() {
        switch (__classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this)) {
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
_JsonParser_text = new WeakMap(), _JsonParser_position = new WeakMap(), _JsonParser_builder = new WeakMap(), _JsonParser_instances = new WeakSet(), _JsonParser_peekToken = function _JsonParser_peekToken() {
    this.eatWhitespace();
    if (this.endReached())
        return JsonToken.NONE;
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
                return __classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this);
            }
            else if (this.peek() == 42) {
                this.read();
                while (!this.endReached()) {
                    if (this.read() == 42 && this.peek() == 47) {
                        this.read();
                        return __classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this);
                    }
                }
            }
            return JsonToken.NONE;
        default:
            return JsonToken.NONE;
    }
};
class Platform {
    constructor() { }
    static startProcessBlocking(command_line) {
        if (command_line.length == 0) {
            throw new Error("Command line is empty");
        }
        let ret = "";
        ret = nativeStartProcessBlocking(command_line);
        return _a.strTrim(ret);
    }
    static startProcessFireAndForget(command_line) {
        if (command_line.length == 0) {
            throw new Error("Command line is empty");
        }
        nativeStartProcessFireAndForget(command_line);
    }
    static getCurrentProcessId() {
        let ret = 0;
        ret = nativeCurrentProcessId();
        return ret;
    }
    static getCurrentProcessPath() {
        let ret = "";
        ret = nativeGetCurrentProcessPath();
        return ret;
    }
    static fileExists(path) {
        let ret = false;
        ret = nativeDoesFileExist(path);
        return ret;
    }
    static isInstalled() {
        return (_a.fileExists(__classPrivateFieldGet(_a, _a, "m", _Platform_impl_GetFusionExePath).call(_a)) &&
            _a.fileExists(__classPrivateFieldGet(_a, _a, "m", _Platform_impl_GetUpdateExePath).call(_a)));
    }
    static getFusionExePath() {
        let path = __classPrivateFieldGet(_a, _a, "m", _Platform_impl_GetFusionExePath).call(_a);
        if (!_a.fileExists(path)) {
            throw new Error("Is the app installed? Fusion is not at: " + path);
        }
        return path;
    }
    static getUpdateExePath() {
        let path = __classPrivateFieldGet(_a, _a, "m", _Platform_impl_GetUpdateExePath).call(_a);
        if (!_a.fileExists(path)) {
            throw new Error("Is the app installed? Update is not at: " + path);
        }
        return path;
    }
    static strTrim(str) {
        let match;
        if ((match = /(\S.*\S|\S)/.exec(str)) != null) {
            return match[1];
        }
        return str;
    }
    static pathParent(str) {
        let ix_win = str.lastIndexOf("\\");
        let ix_nix = str.lastIndexOf("/");
        let ix = Math.max(ix_win, ix_nix);
        return str.substring(0, ix);
    }
    static pathJoin(s1, s2) {
        while (s1.endsWith("/") || s1.endsWith("\\")) {
            s1 = s1.substring(0, s1.length - 1);
        }
        while (s2.startsWith("/") || s2.startsWith("\\")) {
            s2 = s2.substring(1);
        }
        return s1 + _a.pathSeparator() + s2;
    }
    static pathSeparator() {
        if (_a.isWindows()) {
            return "\\";
        }
        else {
            return "/";
        }
    }
    static isWindows() {
        return _a.getOsName() == "win32";
    }
    static isLinux() {
        return _a.getOsName() == "linux";
    }
    static isOsx() {
        return _a.getOsName() == "darwin";
    }
    static getOsName() {
        let ret = "";
        ret = nativeCurrentOsName();
        return ret;
    }
    static exit(code) {
        nativeExitProcess(code);
    }
}
_a = Platform, _Platform_impl_GetFusionExePath = function _Platform_impl_GetFusionExePath() {
    let exeName = "";
    if (_a.isWindows()) {
        exeName = "Vfusion.exe";
    }
    else if (_a.isLinux()) {
        exeName = "VfusionNix";
    }
    else if (_a.isOsx()) {
        exeName = "VfusionMac";
    }
    else {
        throw new Error("Unsupported OS");
    }
    let libraryDir = "";
    libraryDir = __dirname;
    libraryDir = libraryDir.replaceAll("\\app.asar\\", "\\app.asar.unpacked\\");
    libraryDir = libraryDir.replaceAll("/app.asar/", "/app.asar.unpacked/");
    return _a.pathJoin(_a.pathJoin(libraryDir, "bin"), exeName);
}, _Platform_impl_GetUpdateExePath = function _Platform_impl_GetUpdateExePath() {
    let exePath = _a.getCurrentProcessPath();
    if (_a.isWindows()) {
        exePath = _a.pathJoin(_a.pathParent(_a.pathParent(exePath)), "Update.exe");
    }
    else if (_a.isLinux()) {
        exePath = _a.pathJoin(_a.pathParent(exePath), "UpdateNix");
    }
    else if (_a.isOsx()) {
        exePath = _a.pathJoin(_a.pathParent(exePath), "UpdateMac");
    }
    else {
        throw new Error("Unsupported OS");
    }
    return exePath;
};
class StringStream {
    constructor() {
        _StringStream_instances.add(this);
        _StringStream_builder.set(this, new StringWriter());
        _StringStream_writer.set(this, void 0);
        _StringStream_initialised.set(this, void 0);
    }
    clear() {
        __classPrivateFieldGet(this, _StringStream_builder, "f").clear();
    }
    write(s) {
        __classPrivateFieldGet(this, _StringStream_instances, "m", _StringStream_init).call(this);
        __classPrivateFieldGet(this, _StringStream_writer, "f").write(s);
    }
    writeLine(s) {
        __classPrivateFieldGet(this, _StringStream_instances, "m", _StringStream_init).call(this);
        this.write(s);
        this.writeChar(10);
    }
    writeChar(c) {
        __classPrivateFieldGet(this, _StringStream_instances, "m", _StringStream_init).call(this);
        __classPrivateFieldGet(this, _StringStream_writer, "f").write(String.fromCharCode(c));
    }
    toString() {
        return __classPrivateFieldGet(this, _StringStream_builder, "f").toString();
    }
}
_StringStream_builder = new WeakMap(), _StringStream_writer = new WeakMap(), _StringStream_initialised = new WeakMap(), _StringStream_instances = new WeakSet(), _StringStream_init = function _StringStream_init() {
    if (!__classPrivateFieldGet(this, _StringStream_initialised, "f")) {
        __classPrivateFieldSet(this, _StringStream_writer, __classPrivateFieldGet(this, _StringStream_builder, "f"), "f");
        __classPrivateFieldSet(this, _StringStream_initialised, true, "f");
    }
};
var VelopackAssetType;
(function (VelopackAssetType) {
    VelopackAssetType[VelopackAssetType["UNKNOWN"] = 0] = "UNKNOWN";
    VelopackAssetType[VelopackAssetType["FULL"] = 1] = "FULL";
    VelopackAssetType[VelopackAssetType["DELTA"] = 2] = "DELTA";
})(VelopackAssetType || (exports.VelopackAssetType = VelopackAssetType = {}));
/**
 * An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.
 */
class VelopackAsset {
    constructor() {
        /**
         * The name or Id of the package containing this release.
         */
        this.packageId = "";
        /**
         * The version of this release.
         */
        this.version = "";
        /**
         * The type of asset (eg. full or delta).
         */
        this.type = VelopackAssetType.UNKNOWN;
        /**
         * The filename of the update package containing this release.
         */
        this.fileName = "";
        /**
         * The SHA1 checksum of the update package containing this release.
         */
        this.sha1 = "";
        /**
         * The size in bytes of the update package containing this release.
         */
        this.size = 0n;
        /**
         * The release notes in markdown format, as passed to Velopack when packaging the release.
         */
        this.notesMarkdown = "";
        /**
         * The release notes in HTML format, transformed from Markdown when packaging the release.
         */
        this.notesHTML = "";
    }
    /**
     * Parses a JSON string into a VelopackAsset object.
     */
    static fromJson(json) {
        let node = JsonNode.parse(json);
        return VelopackAsset.fromNode(node);
    }
    /**
     * Parses a JSON node into a VelopackAsset object.
     */
    static fromNode(node) {
        let asset = new VelopackAsset();
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
exports.VelopackAsset = VelopackAsset;
/**
 * Holds information about the current version and pending updates, such as how many there are, and access to release notes.
 */
class UpdateInfo {
    constructor() {
        /**
         * True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).
         * In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
         * deleted.
         */
        this.isDowngrade = false;
    }
    /**
     * Parses a JSON string into an UpdateInfo object.
     */
    static fromJson(json) {
        let node = JsonNode.parse(json);
        let updateInfo = new UpdateInfo();
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
exports.UpdateInfo = UpdateInfo;
/**
 * This class is used to check for updates, download updates, and apply updates. It is a synchronous version of the UpdateManager class.
 * This class is not recommended for use in GUI applications, as it will block the main thread, so you may want to use the async
 * UpdateManager class instead, if it is supported for your programming language.
 */
class UpdateManagerSync {
    constructor() {
        _UpdateManagerSync__allowDowngrade.set(this, false);
        _UpdateManagerSync__explicitChannel.set(this, "");
        _UpdateManagerSync__urlOrPath.set(this, "");
    }
    /**
     * Set the URL or local file path to the update server. This is required before calling CheckForUpdates or DownloadUpdates.
     */
    setUrlOrPath(urlOrPath) {
        __classPrivateFieldSet(this, _UpdateManagerSync__urlOrPath, urlOrPath, "f");
    }
    /**
     * Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).
     * This could happen if a release has bugs and was retracted from the release feed, or if you're using
     * ExplicitChannel to switch channels to another channel where the latest version on that
     * channel is lower than the current version.
     */
    setAllowDowngrade(allowDowngrade) {
        __classPrivateFieldSet(this, _UpdateManagerSync__allowDowngrade, allowDowngrade, "f");
    }
    /**
     * This option should usually be left null. Overrides the default channel used to fetch updates.
     * The default channel will be whatever channel was specified on the command line when building this release.
     * For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
     * This allows users to automatically receive updates from the same channel they installed from. This options
     * allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
     * without having to reinstall the application.
     */
    setExplicitChannel(explicitChannel) {
        __classPrivateFieldSet(this, _UpdateManagerSync__explicitChannel, explicitChannel, "f");
    }
    /**
     * Returns the command line arguments to get the current version of the application.
     */
    getCurrentVersionCommand() {
        const command = [];
        command.push(Platform.getFusionExePath());
        command.push("get-version");
        return command;
    }
    /**
     * Returns the command line arguments to check for updates.
     */
    getCheckForUpdatesCommand() {
        if (__classPrivateFieldGet(this, _UpdateManagerSync__urlOrPath, "f").length == 0) {
            throw new Error("Please call SetUrlOrPath before trying to check for updates.");
        }
        const command = [];
        command.push(Platform.getFusionExePath());
        command.push("check");
        command.push("--url");
        command.push(__classPrivateFieldGet(this, _UpdateManagerSync__urlOrPath, "f"));
        if (__classPrivateFieldGet(this, _UpdateManagerSync__allowDowngrade, "f")) {
            command.push("--downgrade");
        }
        if (__classPrivateFieldGet(this, _UpdateManagerSync__explicitChannel, "f").length > 0) {
            command.push("--channel");
            command.push(__classPrivateFieldGet(this, _UpdateManagerSync__explicitChannel, "f"));
        }
        return command;
    }
    /**
     * Returns the command line arguments to download the specified update.
     */
    getDownloadUpdatesCommand(toDownload) {
        if (__classPrivateFieldGet(this, _UpdateManagerSync__urlOrPath, "f").length == 0) {
            throw new Error("Please call SetUrlOrPath before trying to download updates.");
        }
        const command = [];
        command.push(Platform.getFusionExePath());
        command.push("download");
        command.push("--url");
        command.push(__classPrivateFieldGet(this, _UpdateManagerSync__urlOrPath, "f"));
        command.push("--name");
        command.push(toDownload.fileName);
        if (__classPrivateFieldGet(this, _UpdateManagerSync__explicitChannel, "f").length > 0) {
            command.push("--channel");
            command.push(__classPrivateFieldGet(this, _UpdateManagerSync__explicitChannel, "f"));
        }
        return command;
    }
    /**
     * Returns the path to the app's packages directory. This is where updates are downloaded to.
     */
    getPackagesDir() {
        const command = [];
        command.push(Platform.getFusionExePath());
        command.push("get-packages");
        return Platform.startProcessBlocking(command);
    }
    /**
     * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in
     * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
     */
    isInstalled() {
        return Platform.isInstalled();
    }
    /**
     * Get the currently installed version of the application.
     * If the application is not installed, this function will throw an exception.
     */
    getCurrentVersion() {
        const command = this.getCurrentVersionCommand();
        return Platform.startProcessBlocking(command);
    }
    /**
     * This function will check for updates, and return information about the latest
     * available release. This function runs synchronously and may take some time to
     * complete, depending on the network speed and the number of updates available.
     */
    checkForUpdates() {
        const command = this.getCheckForUpdatesCommand();
        let output = Platform.startProcessBlocking(command);
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
    downloadUpdates(toDownload) {
        const command = this.getDownloadUpdatesCommand(toDownload);
        Platform.startProcessBlocking(command);
    }
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndExit(toApply) {
        const args = [];
        this.waitExitThenApplyUpdates(toApply, false, false, args);
        Platform.exit(0);
    }
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndRestart(toApply, restartArgs = null) {
        this.waitExitThenApplyUpdates(toApply, false, true, restartArgs);
        Platform.exit(0);
    }
    /**
     * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
     * You should then clean up any state and exit your app. The updater will apply updates and then
     * optionally restart your app. The updater will only wait for 60 seconds before giving up.
     */
    waitExitThenApplyUpdates(toApply, silent, restart, restartArgs = null) {
        const command = [];
        command.push(Platform.getUpdateExePath());
        if (silent) {
            command.push("--silent");
        }
        command.push("apply");
        command.push("--waitPid");
        command.push(`${Platform.getCurrentProcessId()}`);
        if (toApply != null) {
            let packagesDir = this.getPackagesDir();
            let assetPath = Platform.pathJoin(packagesDir, toApply.fileName);
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
exports.UpdateManagerSync = UpdateManagerSync;
_UpdateManagerSync__allowDowngrade = new WeakMap(), _UpdateManagerSync__explicitChannel = new WeakMap(), _UpdateManagerSync__urlOrPath = new WeakMap();
/**
 * The main VelopackApp struct. This is the main entry point for your app.
 */
class VelopackApp {
    /**
     * Create a new VelopackApp instance.
     */
    static build() {
        const app = new VelopackApp();
        return app;
    }
    /**
     * Runs the Velopack startup logic. This should be the first thing to run in your app.
     * In some circumstances it may terminate/restart the process to perform tasks.
     */
    run() {
        nativeRegisterElectron();
        const args = [];
        Array.prototype.push.apply(args, process.argv);
        for (let i = 0; i < args.length; i++) {
            let val = Platform.strTrim(args[i]).toLowerCase();
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
exports.VelopackApp = VelopackApp;
class StringWriter {
    constructor() {
        _StringWriter_buf.set(this, "");
    }
    write(s) {
        __classPrivateFieldSet(this, _StringWriter_buf, __classPrivateFieldGet(this, _StringWriter_buf, "f") + s, "f");
    }
    clear() {
        __classPrivateFieldSet(this, _StringWriter_buf, "", "f");
    }
    toString() {
        return __classPrivateFieldGet(this, _StringWriter_buf, "f");
    }
}
_StringWriter_buf = new WeakMap();
/**
 * This class is used to check for updates, download updates, and apply updates.
 * It provides the asynchronous functions of the UpdateManager class.
 * @extends UpdateManagerSync
 */
class UpdateManager extends UpdateManagerSync {
    /**
     * Checks for updates, returning null if there are none available. If there are updates available, this method will return an
     * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
     */
    getCurrentVersionAsync() {
        const command = this.getCurrentVersionCommand();
        return nativeStartProcessAsync(command);
    }
    /**
     * This function will check for updates, and return information about the latest
     * available release. This function runs synchronously and may take some time to
     * complete, depending on the network speed and the number of updates available.
     */
    async checkForUpdatesAsync() {
        const command = this.getCheckForUpdatesCommand();
        let output = await nativeStartProcessAsync(command);
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
    async downloadUpdatesAsync(toDownload, progress) {
        const command = this.getDownloadUpdatesCommand(toDownload);
        await nativeStartProcessAsyncReadLine(command, (data) => {
            const p = parseInt(data);
            if (!isNaN(p) && p > 0) {
                progress(p);
            }
        });
    }
}
exports.UpdateManager = UpdateManager;
