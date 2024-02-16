export declare class Util {
    private constructor();
    /**
     * Returns the path of the current process.
     */
    static getCurrentProcessPath(): string;
    static fileExists(path: string): boolean;
    static getUpdateExePath(): string;
    static strTrim(str: string): string;
    static pathParent(str: string): string;
    static pathJoin(s1: string, s2: string): string;
    static pathSeparator(): string;
    static isWindows(): boolean;
    static isLinux(): boolean;
    static isOsx(): boolean;
    /**
     * Returns the name of the operating system.
     */
    static getOsName(): string;
    static exit(code: number): void;
}
export declare class VelopackApp {
    #private;
    static build(): VelopackApp;
    run(): void;
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
    static fromJson(json: string): VelopackAsset | null;
}
export declare class UpdateInfo {
    targetFullRelease: VelopackAsset | null;
    isDowngrade: boolean;
    static fromJson(json: string): UpdateInfo | null;
}
export declare class ProgressEvent {
    file: string;
    complete: boolean;
    progress: number;
    error: string;
    static fromJson(json: string): ProgressEvent | null;
}
export declare abstract class Platform {
    /**
     * Starts a new process and sychronously reads/returns its output.
     */
    protected startProcessBlocking(command_line: readonly string[]): string;
    /**
     * Starts a new process and sychronously reads/returns its output.
     */
    protected startProcessFireAndForget(command_line: readonly string[]): void;
    /**
     * In the current process, starts a new process and asychronously reads its output line by line.
     * When a line is read, HandleProcessOutputLine is called with the line.
     * If HandleProcessOutputLine returns true, the reading loop is terminated.
     * This method is non-blocking and returns immediately.
     */
    protected startProcessAsyncReadLine(command_line: readonly string[]): void;
    /**
     * Called when a line is read from the process started by StartProcessReadLineThread.
     * If this method returns true, the reading loop is terminated.
     */
    protected abstract handleProcessOutputLine(line: string): boolean;
}
export declare abstract class ProgressHandler {
    abstract onProgress(progress: number): void;
    abstract onComplete(assetPath: string): void;
    abstract onError(error: string): void;
}
export declare class UpdateOptions {
    #private;
    setUrlOrPath(urlOrPath: string): void;
    getUrlOrPath(): string;
    setAllowDowngrade(allowDowngrade: boolean): void;
    getAllowDowngrade(): boolean;
    setExplicitChannel(explicitChannel: string): void;
    getExplicitChannel(): string;
    setProgressHandler(progress: ProgressHandler | null): void;
    getProgressHandler(): ProgressHandler | null;
}
export declare class UpdateManager extends Platform {
    #private;
    setOptions(options: UpdateOptions | null): void;
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
    downloadUpdateAsync(updateInfo: UpdateInfo): void;
    applyUpdatesAndExit(assetPath: string): void;
    applyUpdatesAndRestart(assetPath: string, restartArgs: readonly string[]): void;
    waitExitThenApplyUpdates(assetPath: string, silent: boolean, restart: boolean, restartArgs: readonly string[]): void;
    protected handleProcessOutputLine(line: string): boolean;
}
