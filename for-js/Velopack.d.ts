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
    getKind(): JsonNodeType;
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
/**
 * This class is used to check for updates, download updates, and apply updates. It is a synchronous version of the UpdateManager class.
 * This class is not recommended for use in GUI applications, as it will block the main thread, so you may want to use the async
 * UpdateManager class instead, if it is supported for your programming language.
 */
export declare class UpdateManagerSync {
    #private;
    /**
     * Set the URL or local file path to the update server. This is required before calling CheckForUpdates or DownloadUpdates.
     */
    setUrlOrPath(urlOrPath: string): void;
    /**
     * Set whether to allow downgrades to an earlier version. If this is false, the app will only update to a newer version.
     */
    setAllowDowngrade(allowDowngrade: boolean): void;
    /**
     * Set the explicit channel to use when checking for updates. If this is not set, the default channel will be used.
     * You usually should not set this, unless you are intending for the user to switch to a different channel.
     */
    setExplicitChannel(explicitChannel: string): void;
    protected getCurrentVersionCommand(): string[];
    protected getCheckForUpdatesCommand(): string[];
    protected getDownloadUpdatesCommand(updateInfo: UpdateInfo): string[];
    /**
     * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in
     * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
     */
    isInstalled(): boolean;
    /**
     * Checks for updates, returning null if there are none available. If there are updates available, this method will return an
     * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
     */
    getCurrentVersion(): string;
    /**
     * This function will check for updates, and return information about the latest
     * available release. This function runs synchronously and may take some time to
     * complete, depending on the network speed and the number of updates available.
     */
    checkForUpdates(): UpdateInfo | null;
    /**
     * Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false,
     * this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
     * packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
     * so may fail if there is already another update operation in progress.
     */
    downloadUpdates(updateInfo: UpdateInfo): void;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndExit(assetPath: string): void;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndRestart(assetPath: string, restartArgs?: readonly string[] | null): void;
    /**
     * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
     * You should then clean up any state and exit your app. The updater will apply updates and then
     * optionally restart your app. The updater will only wait for 60 seconds before giving up.
     */
    waitExitThenApplyUpdates(assetPath: string, silent: boolean, restart: boolean, restartArgs?: readonly string[] | null): void;
}
export declare class VelopackApp {
    #private;
    static build(): VelopackApp;
    run(): void;
}
type ProgressFn = (arg: number) => void;
export declare class UpdateManager extends UpdateManagerSync {
    /**
     * Checks for updates, returning null if there are none available. If there are updates available, this method will return an
     * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
     */
    getCurrentVersionAsync(): Promise<string>;
    /**
     * This function will check for updates, and return information about the latest
     * available release. This function runs synchronously and may take some time to
     * complete, depending on the network speed and the number of updates available.
     */
    checkForUpdatesAsync(): Promise<UpdateInfo | null>;
    /**
     * Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false,
     * this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
     * packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
     * so may fail if there is already another update operation in progress.
     */
    downloadUpdatesAsync(updateInfo: UpdateInfo, progress: ProgressFn): Promise<void>;
}
export {};
