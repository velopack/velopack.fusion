const { UpdateManager } = require('velopack');
const url = "C:\\Source\\velopack.fusion\\for-js\\samples\\releases";
const um = new UpdateManager();
um.setUrlOrPath(url);

const updateLabel = document.getElementById("app-info");
const updateBtn = document.getElementById("update-btn");

updateLabel.innerHTML = um.isInstalled()
    ? "Installed version: " + um.getCurrentVersion()
    : "Can't check for updates because app is not installed";

if (um.isInstalled()) {
    updateBtn.disabled = false;
}

updateBtn.addEventListener("click", updateBtnClicked);

let updateInfo;
let downloaded;

async function updateBtnClicked() {
    if (!updateInfo) {
        updateBtn.disabled = true;
        updateInfo = await um.checkForUpdatesAsync();
        if (updateInfo) {
            updateLabel.innerHTML = "New version available: " + updateInfo.targetFullRelease.version;
            updateBtn.innerHTML = "Download Updates";
        } else {
            updateLabel.innerHTML = "No updates available";
            updateBtn.innerHTML = "Check for Updates";
        }
        updateBtn.disabled = false;
    } else if (updateInfo && !downloaded) {
        updateBtn.disabled = true;
        await um.downloadUpdatesAsync(updateInfo.targetFullRelease);
        downloaded = true;
        updateLabel.innerHTML = "Downloaded version: " + updateInfo.targetFullRelease.version;
        updateBtn.innerHTML = "Install Updates";
        updateBtn.disabled = false;
    } else if (downloaded) {
        um.applyUpdatesAndRestart(updateInfo.targetFullRelease);
    }
}