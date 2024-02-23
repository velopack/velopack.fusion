export declare enum JsonNodeType {
    NULL = 0,
    BOOL = 1,
    ARRAY = 2,
    OBJECT = 3,
    NUMBER = 4,
    STRING = 5
}
export declare class JsonParseException extends Error {
    name: string;
}
export declare class JsonNode {
    #private;
    /**
     * Get the type of this node, such as string, object, array, etc.
     * You should use this function and then call the corresponding
     * AsObject, AsArray, AsString, etc. functions to get the actual
     * parsed json information.
     */
    getType(): JsonNodeType;
    /**
     * Check if the JSON value is null.
     */
    isNull(): boolean;
    /**
     * Check if the JSON value is empty - eg. an empty string, array, or object.
     */
    isEmpty(): boolean;
    /**
     * Reinterpret a JSON value as an object. Throws exception if the value type was not an object.
     */
    asObject(): Readonly<Record<string, JsonNode>>;
    /**
     * Reinterpret a JSON value as an array. Throws exception if the value type was not an array.
     */
    asArray(): readonly JsonNode[];
    /**
     * Reinterpret a JSON value as a number. Throws exception if the value type was not a double.
     */
    asNumber(): number;
    /**
     * Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.
     */
    asBool(): boolean;
    /**
     * Reinterpret a JSON value as a string. Throws exception if the value type was not a string.
     */
    asString(): string;
    static parse(text: string): JsonNode;
    initBool(value: boolean): void;
    initArray(): void;
    addArrayChild(child: JsonNode): void;
    initObject(): void;
    addObjectChild(key: string, child: JsonNode): void;
    initNumber(value: number): void;
    initString(value: string): void;
}
export declare abstract class ProgressHandler {
    abstract onProgress(progress: number): void;
    abstract onComplete(assetPath: string): void;
    abstract onError(error: string): void;
}
export declare enum VelopackAssetType {
    UNKNOWN = 0,
    FULL = 1,
    DELTA = 2
}
export declare class VelopackAsset {
    /**
     * The name or Id of the package containing this release.
     */
    packageId: string;
    /**
     * The version of this release.
     */
    version: string;
    /**
     * The type of asset (eg. full or delta).
     */
    type: VelopackAssetType;
    /**
     * The filename of the update package containing this release.
     */
    fileName: string;
    /**
     * The SHA1 checksum of the update package containing this release.
     */
    sha1: string;
    /**
     * The size in bytes of the update package containing this release.
     */
    size: bigint;
    /**
     * The release notes in markdown format, as passed to Velopack when packaging the release.
     */
    notesMarkdown: string;
    /**
     * The release notes in HTML format, transformed from Markdown when packaging the release.
     */
    notesHTML: string;
    static fromJson(json: string): VelopackAsset;
    static fromNode(node: JsonNode): VelopackAsset;
}
export declare class UpdateInfo {
    targetFullRelease: VelopackAsset;
    isDowngrade: boolean;
    static fromJson(json: string): UpdateInfo;
}
export declare class ProgressEvent {
    file: string;
    complete: boolean;
    progress: number;
    error: string;
    static fromJson(json: string): ProgressEvent;
}
export declare class UpdateManager {
    #private;
    setUrlOrPath(urlOrPath: string): void;
    setAllowDowngrade(allowDowngrade: boolean): void;
    setExplicitChannel(explicitChannel: string): void;
    setProgressHandler(progress: ProgressHandler | null): void;
    /**
     * This function will return the current installed version of the application
     * or throw, if the application is not installed.
     */
    getCurrentVersion(): string;
    /**
     * This function will check for updates, and return information about the latest available release.
     */
    checkForUpdates(): UpdateInfo | null;
    /**
     * This function will request the update download, and then return immediately.
     * To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.
     */
    downloadUpdateAsync(updateInfo: UpdateInfo): Promise<void>;
    applyUpdatesAndExit(assetPath: string): void;
    applyUpdatesAndRestart(assetPath: string, restartArgs?: readonly string[] | null): void;
    waitExitThenApplyUpdates(assetPath: string, silent: boolean, restart: boolean, restartArgs?: readonly string[] | null): void;
}
export declare class VelopackApp {
    #private;
    static build(): VelopackApp;
    run(): void;
}
