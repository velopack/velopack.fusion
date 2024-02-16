const { UpdateManager, UpdateOptions } = require('../../Velopack.js');

const um = new UpdateManager();
const options = new UpdateOptions();
options.setUrlOrPath("C:\\Source\\velopack.fusion\\for-js\\test\\electron-quick-start\\releases");
um.setOptions(options);

export function getUpdateManager() {
    return um;
}