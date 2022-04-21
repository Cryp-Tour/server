const mime = require('mime-types');
const fs = require('fs');

/**
 * Get image path for tour id and image id
 * @param {int} tID the id of the tour
 * @param {int} imageID the id of the image
 * @param {string} mimetype optional. used for uploading. if passed, image with extension according to mimetype is created. if not passed, there will be a search for all extensions
 * @returns the image path
 */
module.exports.getImagePath = (tID, imageID, mimetype = "") => {
    // return different path if server is running inside docker
    var prefix = "";
    if (process.env.IN_DOCKER != 1){
        prefix = __dirname;
    }

    var path;
    var supported_extensions = ["jpg", "jpeg", "png", "svg"];
    // get path with mimetype
    if (mimetype) {
        var extension = mime.extension(mimetype);
        path = `${prefix}/data/${tID}/${imageID}.${extension}`;
    } else {
        supported_extensions.every(extension => {
            path = `${prefix}/data/${tID}/${imageID}.${extension}`
            if (fs.existsSync(path)) {
                // returning false will stop the "every" loop
                // see: https://masteringjs.io/tutorials/fundamentals/foreach-break
                return false;
            };
            return true;
        });
    }

    return path;
};