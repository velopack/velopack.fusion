// Generated automatically with "fut". Do not edit.
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
var _JsonNode_type, _JsonNode_objectValue, _JsonNode_arrayValue, _JsonNode_stringValue, _JsonNode_numberValue, _JsonNode_boolValue, _StringAppendable_builder, _StringAppendable_writer, _StringAppendable_initialised, _JsonParser_instances, _JsonParser_text, _JsonParser_position, _JsonParser_builder, _JsonParser_peekToken, _VelopackApp_instances, _VelopackApp_handleArgs, _UpdateOptions__allowDowngrade, _UpdateOptions__explicitChannel, _UpdateOptions__urlOrPath, _UpdateOptions__progress, _UpdateManager__options, _StringWriter_buf;
const app = require("electron").remote.app;
const fs = require("fs");
const { spawn, spawnSync } = require("child_process");
function emitLines(stream) {
    var backlog = "";
    stream.on("data", function (data) {
        backlog += data;
        var n = backlog.indexOf('\n');
        // got a \n? emit one or more 'line' events
        while (~n) {
            stream.emit("line", backlog.substring(0, n));
            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }
    });
    stream.on("end", function () {
        if (backlog) {
            stream.emit("line", backlog);
        }
    });
}
export var JsonNodeType;
(function (JsonNodeType) {
    JsonNodeType[JsonNodeType["NULL"] = 0] = "NULL";
    JsonNodeType[JsonNodeType["BOOL"] = 1] = "BOOL";
    JsonNodeType[JsonNodeType["ARRAY"] = 2] = "ARRAY";
    JsonNodeType[JsonNodeType["OBJECT"] = 3] = "OBJECT";
    JsonNodeType[JsonNodeType["NUMBER"] = 4] = "NUMBER";
    JsonNodeType[JsonNodeType["STRING"] = 5] = "STRING";
})(JsonNodeType || (JsonNodeType = {}));
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
export class JsonParseException extends Error {
    constructor() {
        super(...arguments);
        this.name = "JsonParseException";
    }
}
export class JsonNode {
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
    getType() {
        return __classPrivateFieldGet(this, _JsonNode_type, "f");
    }
    /**
     * Check if the JSON value is null.
     */
    isNull() {
        return __classPrivateFieldGet(this, _JsonNode_type, "f") == JsonNodeType.NULL;
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
            throw new JsonParseException("Cannot call InitBool on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.BOOL, "f");
        __classPrivateFieldSet(this, _JsonNode_boolValue, value, "f");
    }
    initArray() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new JsonParseException("Cannot call InitArray on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.ARRAY, "f");
    }
    addArrayChild(child) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.ARRAY) {
            throw new JsonParseException("Cannot call AddArrayChild on JsonNode which is not an array.");
        }
        __classPrivateFieldGet(this, _JsonNode_arrayValue, "f").push(child);
    }
    initObject() {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new JsonParseException("Cannot call InitObject on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.OBJECT, "f");
    }
    addObjectChild(key, child) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.OBJECT) {
            throw new JsonParseException("Cannot call AddObjectChild on JsonNode which is not an object.");
        }
        __classPrivateFieldGet(this, _JsonNode_objectValue, "f")[key] = child;
    }
    initNumber(value) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new JsonParseException("Cannot call InitNumber on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.NUMBER, "f");
        __classPrivateFieldSet(this, _JsonNode_numberValue, value, "f");
    }
    initString(value) {
        if (__classPrivateFieldGet(this, _JsonNode_type, "f") != JsonNodeType.NULL) {
            throw new JsonParseException("Cannot call InitString on JsonNode which is not null.");
        }
        __classPrivateFieldSet(this, _JsonNode_type, JsonNodeType.STRING, "f");
        __classPrivateFieldSet(this, _JsonNode_stringValue, value, "f");
    }
}
_JsonNode_type = new WeakMap(), _JsonNode_objectValue = new WeakMap(), _JsonNode_arrayValue = new WeakMap(), _JsonNode_stringValue = new WeakMap(), _JsonNode_numberValue = new WeakMap(), _JsonNode_boolValue = new WeakMap();
class StringAppendable {
    constructor() {
        _StringAppendable_builder.set(this, new StringWriter());
        _StringAppendable_writer.set(this, void 0);
        _StringAppendable_initialised.set(this, void 0);
    }
    clear() {
        __classPrivateFieldGet(this, _StringAppendable_builder, "f").clear();
    }
    writeChar(c) {
        if (!__classPrivateFieldGet(this, _StringAppendable_initialised, "f")) {
            __classPrivateFieldSet(this, _StringAppendable_writer, __classPrivateFieldGet(this, _StringAppendable_builder, "f"), "f");
            __classPrivateFieldSet(this, _StringAppendable_initialised, true, "f");
        }
        __classPrivateFieldGet(this, _StringAppendable_writer, "f").write(String.fromCharCode(c));
    }
    toString() {
        return __classPrivateFieldGet(this, _StringAppendable_builder, "f").toString();
    }
}
_StringAppendable_builder = new WeakMap(), _StringAppendable_writer = new WeakMap(), _StringAppendable_initialised = new WeakMap();
class JsonParser {
    constructor() {
        _JsonParser_instances.add(this);
        _JsonParser_text.set(this, "");
        _JsonParser_position.set(this, 0);
        _JsonParser_builder.set(this, new StringAppendable());
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
            throw new JsonParseException("Unexpected end of input");
        }
        let result = __classPrivateFieldGet(this, _JsonParser_text, "f").substring(__classPrivateFieldGet(this, _JsonParser_position, "f"), __classPrivateFieldGet(this, _JsonParser_position, "f") + n);
        __classPrivateFieldSet(this, _JsonParser_position, __classPrivateFieldGet(this, _JsonParser_position, "f") + n, "f");
        return result;
    }
    read() {
        var _a;
        if (__classPrivateFieldGet(this, _JsonParser_position, "f") >= __classPrivateFieldGet(this, _JsonParser_text, "f").length) {
            return -1;
        }
        let c = __classPrivateFieldGet(this, _JsonParser_text, "f").charCodeAt(__classPrivateFieldGet(this, _JsonParser_position, "f"));
        __classPrivateFieldSet(this, _JsonParser_position, (_a = __classPrivateFieldGet(this, _JsonParser_position, "f"), _a++, _a), "f");
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
        return c == 32 || c == 44 || c == 58 || c == 34 || c == 123 || c == 125 || c == 91 || c == 93 || c == 9 || c == 10 || c == 13 || c == 47;
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
            throw new JsonParseException("Invalid boolean");
        }
    }
    parseNumber() {
        let d;
        if (!isNaN(d = parseFloat(this.readWord()))) {
            let node = new JsonNode();
            node.initNumber(d);
            return node;
        }
        throw new JsonParseException("Invalid number");
    }
    parseString() {
        __classPrivateFieldGet(this, _JsonParser_builder, "f").clear();
        this.read();
        while (true) {
            if (this.endReached()) {
                throw new JsonParseException("Unterminated string");
            }
            let c = this.read();
            switch (c) {
                case 34:
                    let node = new JsonNode();
                    node.initString(__classPrivateFieldGet(this, _JsonParser_builder, "f").toString());
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
                            if (!isNaN(i = parseInt(this.readN(4), 16))) {
                                __classPrivateFieldGet(this, _JsonParser_builder, "f").writeChar(i);
                            }
                            else {
                                throw new JsonParseException("Invalid unicode escape");
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
                    throw new JsonParseException("Unterminated object");
                case JsonToken.COMMA:
                    this.read();
                    continue;
                case JsonToken.CURLY_CLOSE:
                    this.read();
                    return node;
                default:
                    let name = this.parseString();
                    if (__classPrivateFieldGet(this, _JsonParser_instances, "m", _JsonParser_peekToken).call(this) != JsonToken.COLON)
                        throw new JsonParseException("Expected colon");
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
                throw new JsonParseException("Invalid token");
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
export class Util {
    constructor() {
    }
    /**
     * Returns the path of the current process.
     */
    static getCurrentProcessPath() {
        let ret = "";
        ret = app.getAppPath();
        return ret;
    }
    static fileExists(path) {
        let ret = false;
        ret = fs.existsSync(path);
        return ret;
    }
    static getUpdateExePath() {
        let exePath = Util.getCurrentProcessPath();
        if (Util.isWindows()) {
            exePath = Util.pathJoin(Util.pathParent(Util.pathParent(exePath)), "Update.exe");
        }
        else if (Util.isLinux()) {
            exePath = Util.pathJoin(Util.pathParent(exePath), "UpdateNix");
        }
        else if (Util.isOsx()) {
            exePath = Util.pathJoin(Util.pathParent(exePath), "UpdateMac");
        }
        else {
            throw new Error("Unsupported platform");
        }
        if (!Util.fileExists(exePath)) {
            throw new Error("Update executable not found: " + exePath);
        }
        return exePath;
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
        return s1 + Util.pathSeparator() + s2;
    }
    static pathSeparator() {
        if (Util.isWindows()) {
            return "\\";
        }
        else {
            return "/";
        }
    }
    static isWindows() {
        return Util.getOsName() == "win32";
    }
    static isLinux() {
        return Util.getOsName() == "linux";
    }
    static isOsx() {
        return Util.getOsName() == "darwin";
    }
    /**
     * Returns the name of the operating system.
     */
    static getOsName() {
        let ret = "";
        ret = process.platform;
        return ret;
    }
    static exit(code) {
        process.exit(code);
    }
}
export class VelopackApp {
    constructor() {
        _VelopackApp_instances.add(this);
    }
    static build() {
        const app = new VelopackApp();
        return app;
    }
    run() {
        const args = [];
        Array.prototype.push.apply(args, process.argv);
        __classPrivateFieldGet(this, _VelopackApp_instances, "m", _VelopackApp_handleArgs).call(this, args);
    }
}
_VelopackApp_instances = new WeakSet(), _VelopackApp_handleArgs = function _VelopackApp_handleArgs(args) {
    for (let i = 0; i < args.length; i++) {
        let val = Util.strTrim(args[i]).toLowerCase();
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
};
export var VelopackAssetType;
(function (VelopackAssetType) {
    VelopackAssetType[VelopackAssetType["UNKNOWN"] = 0] = "UNKNOWN";
    VelopackAssetType[VelopackAssetType["FULL"] = 1] = "FULL";
    VelopackAssetType[VelopackAssetType["DELTA"] = 2] = "DELTA";
})(VelopackAssetType || (VelopackAssetType = {}));
export class VelopackAsset {
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
    static fromJson(json) {
        let node = JsonNode.parse(json);
        return VelopackAsset.fromNode(node);
    }
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
                    asset.type = v.asString().toLowerCase() == "full" ? VelopackAssetType.FULL : VelopackAssetType.DELTA;
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
    constructor() {
        this.isDowngrade = false;
    }
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
export class ProgressEvent {
    constructor() {
        this.file = "";
        this.complete = false;
        this.progress = 0;
        this.error = "";
    }
    static fromJson(json) {
        let node = JsonNode.parse(json);
        let progressEvent = new ProgressEvent();
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
export class Platform {
    /**
     * Starts a new process and sychronously reads/returns its output.
     */
    startProcessBlocking(command_line) {
        if (command_line.length == 0) {
            throw new Error("Command line is empty");
        }
        let ret = "";
        ret = spawnSync(command_line[0], command_line.slice(1), { encoding: "utf8" }).stdout;
        return Util.strTrim(ret);
    }
    /**
     * Starts a new process and sychronously reads/returns its output.
     */
    startProcessFireAndForget(command_line) {
        if (command_line.length == 0) {
            throw new Error("Command line is empty");
        }
        spawn(command_line[0], command_line.slice(1), { encoding: "utf8" });
    }
    /**
     * In the current process, starts a new process and asychronously reads its output line by line.
     * When a line is read, HandleProcessOutputLine is called with the line.
     * If HandleProcessOutputLine returns true, the reading loop is terminated.
     * This method is non-blocking and returns immediately.
     */
    startProcessAsyncReadLine(command_line) {
        if (command_line.length == 0) {
            throw new Error("Command line is empty");
        }
        const child = spawn(command_line[0], command_line.slice(1), { encoding: "utf8" });
        emitLines(child.stdout);
        child.stdout.resume();
        child.stdout.setEncoding("utf8");
        child.stdout.on("line", (data) => {
            this.handleProcessOutputLine(data);
        });
    }
}
export class ProgressHandler {
}
export class UpdateOptions {
    constructor() {
        _UpdateOptions__allowDowngrade.set(this, false);
        _UpdateOptions__explicitChannel.set(this, "");
        _UpdateOptions__urlOrPath.set(this, "");
        _UpdateOptions__progress.set(this, void 0);
    }
    setUrlOrPath(urlOrPath) {
        __classPrivateFieldSet(this, _UpdateOptions__urlOrPath, urlOrPath, "f");
    }
    getUrlOrPath() {
        return __classPrivateFieldGet(this, _UpdateOptions__urlOrPath, "f");
    }
    setAllowDowngrade(allowDowngrade) {
        __classPrivateFieldSet(this, _UpdateOptions__allowDowngrade, allowDowngrade, "f");
    }
    getAllowDowngrade() {
        return __classPrivateFieldGet(this, _UpdateOptions__allowDowngrade, "f");
    }
    setExplicitChannel(explicitChannel) {
        __classPrivateFieldSet(this, _UpdateOptions__explicitChannel, explicitChannel, "f");
    }
    getExplicitChannel() {
        return __classPrivateFieldGet(this, _UpdateOptions__explicitChannel, "f");
    }
    setProgressHandler(progress) {
        __classPrivateFieldSet(this, _UpdateOptions__progress, progress, "f");
    }
    getProgressHandler() {
        return __classPrivateFieldGet(this, _UpdateOptions__progress, "f");
    }
}
_UpdateOptions__allowDowngrade = new WeakMap(), _UpdateOptions__explicitChannel = new WeakMap(), _UpdateOptions__urlOrPath = new WeakMap(), _UpdateOptions__progress = new WeakMap();
export class UpdateManager extends Platform {
    constructor() {
        super(...arguments);
        _UpdateManager__options.set(this, void 0);
    }
    setOptions(options) {
        __classPrivateFieldSet(this, _UpdateManager__options, options, "f");
    }
    /**
     * This function will return the current installed version of the application
     * or throw, if the application is not installed.
     */
    getCurrentVersion() {
        const command = [];
        command.push(Util.getUpdateExePath());
        command.push("get-version");
        return this.startProcessBlocking(command);
    }
    /**
     * This function will check for updates, and return information about the latest available release.
     */
    checkForUpdates() {
        if (__classPrivateFieldGet(this, _UpdateManager__options, "f") == null) {
            throw new Error("Please call SetOptions before trying to check for updates.");
        }
        const command = [];
        command.push(Util.getUpdateExePath());
        command.push("check");
        command.push("--url");
        command.push(__classPrivateFieldGet(this, _UpdateManager__options, "f").getUrlOrPath());
        command.push("--format");
        command.push("json");
        if (__classPrivateFieldGet(this, _UpdateManager__options, "f").getAllowDowngrade()) {
            command.push("--downgrade");
        }
        let explicitChannel = __classPrivateFieldGet(this, _UpdateManager__options, "f").getExplicitChannel();
        if (explicitChannel.length > 0) {
            command.push("--channel");
            command.push(explicitChannel);
        }
        let output = this.startProcessBlocking(command);
        if (output.length == 0 || output == "null") {
            return null;
        }
        return UpdateInfo.fromJson(output);
    }
    /**
     * This function will request the update download, and then return immediately.
     * To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.
     */
    downloadUpdateAsync(updateInfo) {
        if (__classPrivateFieldGet(this, _UpdateManager__options, "f") == null) {
            throw new Error("Please call SetOptions before trying to download updates.");
        }
        const command = [];
        command.push(Util.getUpdateExePath());
        command.push("download");
        command.push("--url");
        command.push(__classPrivateFieldGet(this, _UpdateManager__options, "f").getUrlOrPath());
        command.push("--clean");
        command.push("--format");
        command.push("json");
        command.push("--name");
        command.push(updateInfo.targetFullRelease.fileName);
        this.startProcessAsyncReadLine(command);
    }
    applyUpdatesAndExit(assetPath) {
        const args = [];
        this.waitExitThenApplyUpdates(assetPath, false, false, args);
        Util.exit(0);
    }
    applyUpdatesAndRestart(assetPath, restartArgs) {
        this.waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
        Util.exit(0);
    }
    waitExitThenApplyUpdates(assetPath, silent, restart, restartArgs) {
        const command = [];
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
        if (restart && restartArgs.length > 0) {
            command.push("--");
            command.push(...restartArgs);
        }
        this.startProcessFireAndForget(command);
    }
    handleProcessOutputLine(line) {
        let ev = ProgressEvent.fromJson(line);
        if (ev == null) {
            return true;
        }
        if (__classPrivateFieldGet(this, _UpdateManager__options, "f").getProgressHandler() == null) {
            return true;
        }
        if (ev.complete) {
            __classPrivateFieldGet(this, _UpdateManager__options, "f").getProgressHandler().onComplete(ev.file);
            return true;
        }
        else if (ev.error.length > 0) {
            __classPrivateFieldGet(this, _UpdateManager__options, "f").getProgressHandler().onError(ev.error);
            return true;
        }
        else {
            __classPrivateFieldGet(this, _UpdateManager__options, "f").getProgressHandler().onProgress(ev.progress);
            return false;
        }
    }
}
_UpdateManager__options = new WeakMap();
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
