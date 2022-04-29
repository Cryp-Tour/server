module.exports.getTourGpxPath = (tID) => {
    if (!Number.isInteger(tID)) {
        return "";
    }
    // return different path if server is running inside docker
    if (process.env.IN_DOCKER == 1){
        return `/data/${tID}/tour.gpx`;
    }
    return __dirname + `/data/${tID}/tour.gpx`;
};
