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
    public async downloadUpdatesAsync(toDownload: VelopackAsset, progress: (arg: number) => void): Promise<void> {
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