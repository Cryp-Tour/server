const ServerError = require('../lib/error');
var DBO = require('../../db/dbo'); //module for db requests and db creation
const dao = new DBO('./db/db/web.sqlite');
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
  var sqlQuery = "";
  
  

  
  var returnData = [];
  await dao
  .get('SELECT * from tour ' + sqlQuery).then(function(value){
      console.log(value);
      returnData = value;
    });

  return {
    status: 200,
    data: returnData,
    header: {
      "NumberOfResults": returnData.length,
    }
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

  await dao
    .run(
      `INSERT INTO tour(title,difficulty,distance,duration,description,location,creatorID) VALUES(?,?,?,?,?,?,?)`,
      [
        options.body.title,
        options.body.difficulty,
        options.body.distance,
        options.body.duration,
        options.body.description,
        options.body.location,
        options.body.creatorID,
      ]
    ).then(
      function(){
        console.log("Creating tour with title: " + options.body.title);
      });


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
    data: 'getTour ok!'
  };
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
    data: 'uploadImage ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourImage = async (options) => {
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
    data: 'getTourImage ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourGpx = async (options) => {
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
    data: 'getTourGpx ok!'
  };
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

