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

	/**
	 * Returns the path of the current process.
	 */
	static getCurrentProcessPath()
	{
		let ret = "";
		 ret = app.getAppPath(); return ret;
	}

	static fileExists(path)
	{
		let ret = false;
		 ret = fs.existsSync(path); return ret;
	}

	static getUpdateExePath()
	{
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

	static strTrim(str)
	{
		let match;
		if ((match = /(\S.*\S|\S)/.exec(str)) != null) {
			return match[1];
		}
		return str;
	}

	static strToLower(str)
	{
		let res = "";
		 res = str.toLowerCase(); return res;
	}

	static pathParent(str)
	{
		let ix_win = str.lastIndexOf("\\");
		let ix_nix = str.lastIndexOf("/");
		let ix = Math.max(ix_win, ix_nix);
		return str.substring(0, ix);
	}

	static pathJoin(s1, s2)
	{
		while (s1.endsWith("/") || s1.endsWith("\\")) {
			s1 = s1.substring(0, s1.length - 1);
		}
		while (s2.startsWith("/") || s2.startsWith("\\")) {
			s2 = s2.substring(1);
		}
		return s1 + Util.pathSeparator() + s2;
	}

	static pathSeparator()
	{
		if (Util.isWindows()) {
			return "\\";
		}
		else {
			return "/";
		}
	}

	static isWindows()
	{
		return Util.getOsName() == "win32";
	}

	static isLinux()
	{
		return Util.getOsName() == "linux";
	}

	static isOsx()
	{
		return Util.getOsName() == "darwin";
	}

	/**
	 * Returns the name of the operating system.
	 */
	static getOsName()
	{
		let ret = "";
		 ret = process.platform; return ret;
	}

	static exit(code)
	{
		 process.exit(code) }
}

export class VelopackApp
{

	static build()
	{
		const app = new VelopackApp();
		return app;
	}

	run()
	{
		const args = [];
		 args = process.argv; this.#handleArgs(args);
	}

	#handleArgs(args)
	{
		for (let i = 0; i < args.length; i++) {
			let val = Util.strToLower(Util.strTrim(args[i]));
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

export const VelopackAssetType = {
	UNKNOWN : 0,
	FULL : 1,
	DELTA : 2
}

export class VelopackAsset
{
	/**
	 * The name or Id of the package containing this release.
	 */
	packageId = "";
	/**
	 * The version of this release.
	 */
	version = "";
	/**
	 * The type of asset (eg. full or delta).
	 */
	type = VelopackAssetType.UNKNOWN;
	/**
	 * The filename of the update package containing this release.
	 */
	fileName = "";
	/**
	 * The SHA1 checksum of the update package containing this release.
	 */
	sha1 = "";
	/**
	 * The size in bytes of the update package containing this release.
	 */
	size = 0n;
	/**
	 * The release notes in markdown format, as passed to Velopack when packaging the release.
	 */
	notesMarkdown = "";
	/**
	 * The release notes in HTML format, transformed from Markdown when packaging the release.
	 */
	notesHTML = "";

	static fromJson(json)
	{
		let id = "";
		let version = "";
		let type = "";
		let filename = "";
		let sha1 = "";
		let size = "";
		let markdown = "";
		let html = "";
		
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
        const asset = new VelopackAsset();
		asset.packageId = id;
		asset.version = version;
		asset.fileName = filename;
		asset.sha1 = sha1;
		asset.notesMarkdown = markdown;
		asset.notesHTML = html;
		let i;
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
	targetFullRelease = new VelopackAsset();
	isDowngrade = false;

	static fromJson(json)
	{
		let assetJson = "";
		let isDowngrade = false;
		
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
		let updateInfo = new UpdateInfo();
		updateInfo.targetFullRelease = VelopackAsset.fromJson(assetJson);
		updateInfo.isDowngrade = isDowngrade;
		return updateInfo;
	}
}

export class ProgressEvent
{
	file = "";
	complete = false;
	progress = 0;
	error = "";

	static fromJson(json)
	{
		let file = "";
		let complete = false;
		let progress = 0;
		let error = "";
		
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
        let progressEvent = new ProgressEvent();
		progressEvent.file = file;
		progressEvent.complete = complete;
		progressEvent.progress = progress;
		progressEvent.error = error;
		return progressEvent;
	}
}

export class Platform
{

	/**
	 * Starts a new process and sychronously reads/returns its output.
	 */
	startProcessBlocking(command_line)
	{
		let ret = "";
		 ret = execSync(command, { encoding: "utf8" }); return Util.strTrim(ret);
	}

	/**
	 * Starts a new process and sychronously reads/returns its output.
	 */
	startProcessFireAndForget(command_line)
	{
		 execSync(command, { encoding: "utf8" }); }

	/**
	 * In the current process, starts a new process and asychronously reads its output line by line.
	 * When a line is read, HandleProcessOutputLine is called with the line. 
	 * If HandleProcessOutputLine returns true, the reading loop is terminated.
	 * This method is non-blocking and returns immediately.
	 */
	startProcessAsyncReadLine(command_line)
	{
		 
            const child = spawn(command, args);
            emitLines(child.stdout);
            child.stdout.resume()
            child.stdout.setEncoding("utf8")
            child.stdout.on("line", (data) => {
                handleProcessOutputLine(data)
            });
        }
}

export class ProgressHandler
{
}

export class UpdateOptions
{
	#_allowDowngrade = false;
	#_explicitChannel = "";
	#_urlOrPath = "";
	#_progress;

	setUrlOrPath(urlOrPath)
	{
		this.#_urlOrPath = urlOrPath;
	}

	getUrlOrPath()
	{
		return this.#_urlOrPath;
	}

	setAllowDowngrade(allowDowngrade)
	{
		this.#_allowDowngrade = allowDowngrade;
	}

	getAllowDowngrade()
	{
		return this.#_allowDowngrade;
	}

	setExplicitChannel(explicitChannel)
	{
		this.#_explicitChannel = explicitChannel;
	}

	getExplicitChannel()
	{
		return this.#_explicitChannel;
	}

	setProgressHandler(progress)
	{
		this.#_progress = progress;
	}

	getProgressHandler()
	{
		return this.#_progress;
	}
}

export class UpdateManager extends Platform
{
	#_options;

	setOptions(options)
	{
		this.#_options = options;
	}

	/**
	 * This function will return the current installed version of the application
	 * or throw, if the application is not installed.
	 */
	getCurrentVersion()
	{
		const command = [];
		command.push(Util.getUpdateExePath());
		command.push("get-version");
		return this.startProcessBlocking(command);
	}

	/**
	 * This function will check for updates, and return information about the latest available release.
	 */
	checkForUpdates()
	{
		if (this.#_options == null) {
			throw new Error("Please call SetOptions before trying to check for updates.");
		}
		const command = [];
		command.push(Util.getUpdateExePath());
		command.push("check");
		command.push("--url");
		command.push(this.#_options.getUrlOrPath());
		command.push("--format");
		command.push("json");
		if (this.#_options.getAllowDowngrade()) {
			command.push("--downgrade");
		}
		let explicitChannel = this.#_options.getExplicitChannel();
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
	downloadUpdateAsync(updateInfo)
	{
		if (this.#_options == null) {
			throw new Error("Please call SetOptions before trying to download updates.");
		}
		const command = [];
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

	applyUpdatesAndExit(assetPath)
	{
		const args = [];
		this.waitExitThenApplyUpdates(assetPath, false, false, args);
		Util.exit(0);
	}

	applyUpdatesAndRestart(assetPath, restartArgs)
	{
		this.waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
		Util.exit(0);
	}

	waitExitThenApplyUpdates(assetPath, silent, restart, restartArgs)
	{
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

	handleProcessOutputLine(line)
	{
		let ev = ProgressEvent.fromJson(line);
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
