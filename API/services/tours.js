const { download } = require('express/lib/response');
const ServerError = require('../lib/error');
const FileResult = require('../lib/fileResult');
const gpxManager = require("../../gpxManager");
const imageManager = require("../../imageManager");
const folderManager = require("../../folderManager");
var DBO = require("../../db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const fs = require('fs');
/**
 * @param {Object} options
 * @param {String} options.searchQuery Search by title of the tour
 * @param {Integer} options.minDifficulty Search by minimum tour difficulty
 * @param {Integer} options.maxDifficulty Search by maximum tour difficulty
 * @param {Integer} options.minLength Search by minimum tour length
 * @param {Integer} options.maxLength Search by maximum tour length
 * @param {String} options.location Search by tour location
 * @throws {Error}
 * @return {Promise}
 */
module.exports.listTours = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'listTours ok!'
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createTour = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 201,
    data: 'createTour ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTour = async (options) => {
  return await dao.get(
    `SELECT tID, title, difficulty, location, distance, duration, description, creatorID FROM tour WHERE tID = ?`, 
    [options.TID]

  )
  .then(
    (value) =>  {
      if (value.length > 0){
        tour = value["0"]
        console.log("Getting information about tour " + tour.tID)
        return {
          status: 200,
          data: {
            id: tour.tID,
            title: tour.title,
            difficulty: tour.difficulty,
            location: tour.location,
            distance: tour.distance,
            duration: tour.duration,
            description: tour.description,
            creatorID: tour.creatorID
          }
        };
      } else {
        return {
          status: 400
        }
      }
    });
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to delete
 * @throws {Error}
 * @return {Promise}
 */
module.exports.deleteTour = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'deleteTour ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to delete
 * @throws {Error}
 * @return {Promise}
 */
module.exports.uploadImage = async (options) => {
  const mimetypes = ["image/jpeg", "image/svg+xml", "image/png"];

  if (mimetypes.includes(options.file.mimetype)){
    //check if tour exist
    return await dao.get("SELECT COUNT(*) as count FROM tour WHERE tid = ?", [options.TID]).then(
      async (value) => {
        if(value[0].count > 0){
          return await dao.run("INSERT INTO tourImage(tourID) VALUES (?)", [options.TID]).then(
            (value) => {
              let filePath = imageManager.getImagePath(options.TID, value.id);
              let folderPath = folderManager.getFolderPath(options.TID);
              folderManager.createFolderIfNotExists(folderPath);
              fs.writeFileSync(filePath, options.file.buffer);
              return {
                status: 200,
                data: 'uploadImage ok!'
              };
            }, (err) => {
              return {
                status: 400
              }
            }
          )
        } else {
          return {
            status: 400
          };
        }
      }, (err) => {
        return {
          status: 400
        };
      }
    );
  } else {
    return {
      status: 400,
    }
  }
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @param {Integer} options.IID The ID of the image of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourImage = (options) => {
  var filePath = imageManager.getImagePath(options.TID, options.IID);

  return new FileResult(filePath);
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourGpx = (options) => {
  var filePath = gpxManager.getTourGpxPath(options.TID);

  return new FileResult(filePath);
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to delete
 * @throws {Error}
 * @return {Promise}
 */
module.exports.uploadGpx = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'uploadGpx ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.rateTour = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'rateTour ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourRating = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'getTourRating ok!'
  };
};

