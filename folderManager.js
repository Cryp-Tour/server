const fs = require('fs');

module.exports.getFolderPath = (tID) => {
    if (!Number.isInteger(tID)) {
        return "";
    }
    // return different path if server is running inside docker
    if (process.env.IN_DOCKER == 1){
        return `/data/${tID}`;
    }
    return __dirname + `/data/${tID}`;
};

module.exports.createFolderIfNotExists = (path) => {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
};

module.exports.deleteFolder = (path) => {
    fs.rmdirSync(path, { recursive: true });
}
