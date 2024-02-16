// Generated automatically with "fut". Do not edit.

    const app = require("electron").remote.app;
    const fs = require("fs");

    const { execSync, spawn } = require("child_process");
    function emitLines (stream) {
        var backlog = "";
        stream.on("data", function (data) {
            backlog += data
            var n = backlog.indexOf('\n')
            // got a \n? emit one or more 'line' events
            while (~n) {
                stream.emit("line", backlog.substring(0, n))
                backlog = backlog.substring(n + 1)
                n = backlog.indexOf('\n')
            }
        })
        stream.on("end", function () {
            if (backlog) {
                stream.emit("line", backlog)
            }
        })
    }

export class Util
{
	private constructor()
	{
	}

	/**
	 * Returns the path of the current process.
	 */
	public static getCurrentProcessPath(): string
	{
		let ret: string = "";
		 ret = app.getAppPath(); return ret;
	}

	public static fileExists(path: string): boolean
	{
		let ret: boolean = false;
		 ret = fs.existsSync(path); return ret;
	}

	public static getUpdateExePath(): string
	{
		let exePath: string = Util.getCurrentProcessPath();
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

	public static strTrim(str: string): string
	{
		let match: RegExpMatchArray;
		if ((match = /(\S.*\S|\S)/.exec(str)) != null) {
			return match[1];
		}
		return str;
	}

	public static strToLower(str: string): string
	{
		let res: string = "";
		 res = str.toLowerCase(); return res;
	}

	public static pathParent(str: string): string
	{
		let ix_win: number = str.lastIndexOf("\\");
		let ix_nix: number = str.lastIndexOf("/");
		let ix: number = Math.max(ix_win, ix_nix);
		return str.substring(0, ix);
	}

	public static pathJoin(s1: string, s2: string): string
	{
		while (s1.endsWith("/") || s1.endsWith("\\")) {
			s1 = s1.substring(0, s1.length - 1);
		}
		while (s2.startsWith("/") || s2.startsWith("\\")) {
			s2 = s2.substring(1);
		}
		return s1 + Util.pathSeparator() + s2;
	}

	public static pathSeparator(): string
	{
		if (Util.isWindows()) {
			return "\\";
		}
		else {
			return "/";
		}
	}

	public static isWindows(): boolean
	{
		return Util.getOsName() == "win32";
	}

	public static isLinux(): boolean
	{
		return Util.getOsName() == "linux";
	}

	public static isOsx(): boolean
	{
		return Util.getOsName() == "darwin";
	}

	/**
	 * Returns the name of the operating system.
	 */
	public static getOsName(): string
	{
		let ret: string = "";
		 ret = process.platform; return ret;
	}

	public static exit(code: number): void
	{
		 process.exit(code) }
}

export class VelopackApp
{

	public static build(): VelopackApp
	{
		const app: VelopackApp = new VelopackApp();
		return app;
	}

	public run(): void
	{
		const args: string[] = [];
		 Array.prototype.push.apply(args, process.argv); this.#handleArgs(args);
	}

	#handleArgs(args: readonly string[]): void
	{
		for (let i: number = 0; i < args.length; i++) {
			let val: string = Util.strToLower(Util.strTrim(args[i]));
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

export enum VelopackAssetType {
	UNKNOWN,
	FULL,
	DELTA,
}

export class VelopackAsset
{
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

	public static fromJson(json: string): VelopackAsset
	{
		let id: string = "";
		let version: string = "";
		let type: string = "";
		let filename: string = "";
		let sha1: string = "";
		let size: string = "";
		let markdown: string = "";
		let html: string = "";
		
            const obj = JSON.parse(json);
            Object.keys(obj).forEach(key => {
                // Convert both key and field names to lowercase for case-insensitive comparison
                switch (key.toLowerCase()) {
                    case "id":
                        id = obj[key];
                        break;
                    case "version":
                        version = obj[key];
                        break;
                    case "type":
                        type = obj[key];
                        break;
                    case "filename":
                        filename = obj[key];
                        break;
                    case "sha1":
                        sha1 = obj[key];
                        break;
                    case "size":
                        size = obj[key];
                        break;
                    case "markdown":
                        markdown = obj[key];
                        break;
                    case "html":
                        html = obj[key];
                        break;
                    // Add more cases as needed
                }
            });
        const asset: VelopackAsset = new VelopackAsset();
		asset.packageId = id;
		asset.version = version;
		asset.fileName = filename;
		asset.sha1 = sha1;
		asset.notesMarkdown = markdown;
		asset.notesHTML = html;
		let i: number;
		if (!isNaN(i = parseInt(size, 10))) {
			asset.size = BigInt(i);
		}
		if (type == "full" || type == "Full") {
			asset.type = VelopackAssetType.FULL;
		}
		else if (type == "delta" || type == "Delta") {
			asset.type = VelopackAssetType.DELTA;
		}
		return asset;
	}
}

export class UpdateInfo
{
	readonly targetFullRelease: VelopackAsset = new VelopackAsset();
	isDowngrade: boolean = false;

	public static fromJson(json: string): UpdateInfo | null
	{
		let assetJson: string = "";
		let isDowngrade: boolean = false;
		
            const obj = JSON.parse(json);
            Object.keys(obj).forEach(key => {
                if (key.toLowerCase() === "targetfullrelease") {
                    assetJson = JSON.stringify(obj[key]);
                } else if (key.toLowerCase() === "isdowngrade") {
                    isDowngrade = obj[key];
                }
            });
        if (assetJson.length == 0) {
			return null;
		}
		let updateInfo: UpdateInfo | null = new UpdateInfo();
		updateInfo.targetFullRelease = VelopackAsset.fromJson(assetJson);
		updateInfo.isDowngrade = isDowngrade;
		return updateInfo;
	}
}

export class ProgressEvent
{
	file: string = "";
	complete: boolean = false;
	progress: number = 0;
	error: string = "";

	public static fromJson(json: string): ProgressEvent | null
	{
		let file: string = "";
		let complete: boolean = false;
		let progress: number = 0;
		let error: string = "";
		
            const obj = JSON.parse(json);
            Object.keys(obj).forEach(key => {
                if (key.toLowerCase() === "file") {
                    file = obj[key];
                } else if (key.toLowerCase() === "complete") {
                    complete = obj[key];
                } else if (key.toLowerCase() === "progress") {
                    progress = obj[key];
                } else if (key.toLowerCase() === "error") {
                    error = obj[key];
                }
            });
        let progressEvent: ProgressEvent | null = new ProgressEvent();
		progressEvent.file = file;
		progressEvent.complete = complete;
		progressEvent.progress = progress;
		progressEvent.error = error;
		return progressEvent;
	}
}

export abstract class Platform
{

	/**
	 * Starts a new process and sychronously reads/returns its output.
	 */
	protected startProcessBlocking(command_line: readonly string[]): string
	{
		let ret: string = "";
		 ret = execSync(command, { encoding: "utf8" }); return Util.strTrim(ret);
	}

	/**
	 * Starts a new process and sychronously reads/returns its output.
	 */
	protected startProcessFireAndForget(command_line: readonly string[]): void
	{
		 execSync(command, { encoding: "utf8" }); }

	/**
	 * In the current process, starts a new process and asychronously reads its output line by line.
	 * When a line is read, HandleProcessOutputLine is called with the line. 
	 * If HandleProcessOutputLine returns true, the reading loop is terminated.
	 * This method is non-blocking and returns immediately.
	 */
	protected startProcessAsyncReadLine(command_line: readonly string[]): void
	{
		 
            const child = spawn(command, args);
            emitLines(child.stdout);
            child.stdout.resume()
            child.stdout.setEncoding("utf8")
            child.stdout.on("line", (data) => {
                this.handleProcessOutputLine(data)
            });
        }

	/**
	 * Called when a line is read from the process started by StartProcessReadLineThread.
	 * If this method returns true, the reading loop is terminated.
	 */
	protected abstract handleProcessOutputLine(line: string): boolean;
}

export abstract class ProgressHandler
{

	public abstract onProgress(progress: number): void;

	public abstract onComplete(assetPath: string): void;

	public abstract onError(error: string): void;
}

export class UpdateOptions
{
	#_allowDowngrade: boolean = false;
	#_explicitChannel: string = "";
	#_urlOrPath: string = "";
	#_progress: ProgressHandler | null;

	public setUrlOrPath(urlOrPath: string): void
	{
		this.#_urlOrPath = urlOrPath;
	}

	public getUrlOrPath(): string
	{
		return this.#_urlOrPath;
	}

	public setAllowDowngrade(allowDowngrade: boolean): void
	{
		this.#_allowDowngrade = allowDowngrade;
	}

	public getAllowDowngrade(): boolean
	{
		return this.#_allowDowngrade;
	}

	public setExplicitChannel(explicitChannel: string): void
	{
		this.#_explicitChannel = explicitChannel;
	}

	public getExplicitChannel(): string
	{
		return this.#_explicitChannel;
	}

	public setProgressHandler(progress: ProgressHandler | null): void
	{
		this.#_progress = progress;
	}

	public getProgressHandler(): ProgressHandler | null
	{
		return this.#_progress;
	}
}

export class UpdateManager extends Platform
{
	#_options: UpdateOptions | null;

	public setOptions(options: UpdateOptions | null): void
	{
		this.#_options = options;
	}

	/**
	 * This function will return the current installed version of the application
	 * or throw, if the application is not installed.
	 */
	public getCurrentVersion(): string
	{
		const command: string[] = [];
		command.push(Util.getUpdateExePath());
		command.push("get-version");
		return this.startProcessBlocking(command);
	}

	/**
	 * This function will check for updates, and return information about the latest available release.
	 */
	public checkForUpdates(): UpdateInfo | null
	{
		if (this.#_options == null) {
			throw new Error("Please call SetOptions before trying to check for updates.");
		}
		const command: string[] = [];
		command.push(Util.getUpdateExePath());
		command.push("check");
		command.push("--url");
		command.push(this.#_options.getUrlOrPath());
		command.push("--format");
		command.push("json");
		if (this.#_options.getAllowDowngrade()) {
			command.push("--downgrade");
		}
		let explicitChannel: string = this.#_options.getExplicitChannel();
		if (explicitChannel.length > 0) {
			command.push("--channel");
			command.push(explicitChannel);
		}
		let output: string = this.startProcessBlocking(command);
		if (output.length == 0 || output == "null") {
			return null;
		}
		return UpdateInfo.fromJson(output);
	}

	/**
	 * This function will request the update download, and then return immediately.
	 * To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.
	 */
	public downloadUpdateAsync(updateInfo: UpdateInfo): void
	{
		if (this.#_options == null) {
			throw new Error("Please call SetOptions before trying to download updates.");
		}
		const command: string[] = [];
		command.push(Util.getUpdateExePath());
		command.push("download");
		command.push("--url");
		command.push(this.#_options.getUrlOrPath());
		command.push("--clean");
		command.push("--format");
		command.push("json");
		command.push("--name");
		command.push(updateInfo.targetFullRelease.fileName);
		this.startProcessAsyncReadLine(command);
	}

	public applyUpdatesAndExit(assetPath: string): void
	{
		const args: string[] = [];
		this.waitExitThenApplyUpdates(assetPath, false, false, args);
		Util.exit(0);
	}

	public applyUpdatesAndRestart(assetPath: string, restartArgs: readonly string[]): void
	{
		this.waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
		Util.exit(0);
	}

	public waitExitThenApplyUpdates(assetPath: string, silent: boolean, restart: boolean, restartArgs: readonly string[]): void
	{
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
		if (restart && restartArgs.length > 0) {
			command.push("--");
			command.push(...restartArgs);
		}
		this.startProcessFireAndForget(command);
	}

	protected handleProcessOutputLine(line: string): boolean
	{
		let ev: ProgressEvent | null = ProgressEvent.fromJson(line);
		if (ev == null) {
			return true;
		}
		if (this.#_options.getProgressHandler() == null) {
			return true;
		}
		if (ev.complete) {
			this.#_options.getProgressHandler().onComplete(ev.file);
			return true;
		}
		else if (ev.error.length > 0) {
			this.#_options.getProgressHandler().onError(ev.error);
			return true;
		}
		else {
			this.#_options.getProgressHandler().onProgress(ev.progress);
			return false;
		}
	}
}
