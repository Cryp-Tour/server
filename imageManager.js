module.exports.getImagePath = (tID, imageID) => {
    // return different path if server is running inside docker
    if (process.env.IN_DOCKER == 1){
        return `/data/${tID}/${imageID}.jpg`;
    }
    return __dirname + `/data/${tID}/${imageID}.jpg`;
};