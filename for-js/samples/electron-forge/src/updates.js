const { UpdateManager, UpdateOptions } = require("../../../Velopack.js");

const url = "C:\\Source\\velopack.fusion\\for-js\\test\\releases";

const options = new UpdateOptions();
options.setUrlOrPath(url);

const manager = new UpdateManager();
manager.setOptions(options);

export default manager;