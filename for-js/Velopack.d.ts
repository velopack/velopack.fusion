export declare enum JsonNodeType {
    NULL = 0,
    BOOL = 1,
    ARRAY = 2,
    OBJECT = 3,
    NUMBER = 4,
    STRING = 5
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
/**
 * An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.
 */
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
    /**
     * Parses a JSON string into a VelopackAsset object.
     */
    static fromJson(json: string): VelopackAsset;
    /**
     * Parses a JSON node into a VelopackAsset object.
     */
    static fromNode(node: JsonNode): VelopackAsset;
}
/**
 * Holds information about the current version and pending updates, such as how many there are, and access to release notes.
 */
export declare class UpdateInfo {
    /**
     * The available version that we are updating to.
     */
    targetFullRelease: VelopackAsset;
    /**
     * True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).
     * In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
     * deleted.
     */
    isDowngrade: boolean;
    /**
     * Parses a JSON string into an UpdateInfo object.
     */
    static fromJson(json: string): UpdateInfo;
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
     * Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).
     * This could happen if a release has bugs and was retracted from the release feed, or if you're using
     * ExplicitChannel to switch channels to another channel where the latest version on that
     * channel is lower than the current version.
     */
    setAllowDowngrade(allowDowngrade: boolean): void;
    /**
     * This option should usually be left null. Overrides the default channel used to fetch updates.
     * The default channel will be whatever channel was specified on the command line when building this release.
     * For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
     * This allows users to automatically receive updates from the same channel they installed from. This options
     * allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
     * without having to reinstall the application.
     */
    setExplicitChannel(explicitChannel: string): void;
    /**
     * Returns the command line arguments to get the current version of the application.
     */
    protected getCurrentVersionCommand(): string[];
    /**
     * Returns the command line arguments to check for updates.
     */
    protected getCheckForUpdatesCommand(): string[];
    /**
     * Returns the command line arguments to download the specified update.
     */
    protected getDownloadUpdatesCommand(toDownload: VelopackAsset): string[];
    /**
     * Returns the path to the app's packages directory. This is where updates are downloaded to.
     */
    protected getPackagesDir(): string;
    /**
     * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in
     * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
     */
    isInstalled(): boolean;
    /**
     * Get the currently installed version of the application.
     * If the application is not installed, this function will throw an exception.
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
    downloadUpdates(toDownload: VelopackAsset): void;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndExit(toApply: VelopackAsset | null): void;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
     * restart arguments. If you need to save state or clean up, you should do that before calling this method.
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    applyUpdatesAndRestart(toApply: VelopackAsset | null, restartArgs?: readonly string[] | null): void;
    /**
     * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
     * You should then clean up any state and exit your app. The updater will apply updates and then
     * optionally restart your app. The updater will only wait for 60 seconds before giving up.
     */
    waitExitThenApplyUpdates(toApply: VelopackAsset | null, silent: boolean, restart: boolean, restartArgs?: readonly string[] | null): void;
}
/**
 * The main VelopackApp struct. This is the main entry point for your app.
 */
export declare class VelopackApp {
    /**
     * Create a new VelopackApp instance.
     */
    static build(): VelopackApp;
    /**
     * Runs the Velopack startup logic. This should be the first thing to run in your app.
     * In some circumstances it may terminate/restart the process to perform tasks.
     */
    run(): void;
}
/**
 * This class is used to check for updates, download updates, and apply updates.
 * It provides the asynchronous functions of the UpdateManager class.
 * @extends UpdateManagerSync
 */
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
    downloadUpdatesAsync(toDownload: VelopackAsset, progress: (arg: number) => void): Promise<void>;
}
