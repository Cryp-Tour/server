const { download, get } = require('express/lib/response');
const ServerError = require('../lib/error');
const FileNotFoundError = require('../lib/error');

const FileResult = require('../lib/fileResult');
const gpxManager = require("../../gpxManager");
const imageManager = require("../../imageManager");
const folderManager = require("../../folderManager");
var DBO = require("../../db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const fs = require('fs');
const userManager = require("../../userManager");

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
	console.log("getting Tours");

	var sqlQuery = "";
	try{
		if(JSON.stringify(options) != "{}"){
			sqlQuery += "WHERE "
			if(options.minDifficulty != undefined){
				if(isNaN(options.minDifficulty)) throw "Expected number for minDifficulty";
				sqlQuery += (" difficulty >= " + options.minDifficulty + " AND");
			}
			if(options.maxDifficulty != undefined){
				if(isNaN(options.maxDifficulty)) throw "Expected number for maxDifficulty";
				sqlQuery += (" difficulty <=  " + options.maxDifficulty + " AND");
			}
			if(options.minDistance != undefined){
				if(isNaN(options.minDistance)) throw "Expected number for minDistance";
				sqlQuery += (" distance >= " + options.minDistance + " AND");
			}
			if(options.maxDistance != undefined){
				if(isNaN(options.maxDistance)) throw "Expected number for maxDistance";
				sqlQuery += (" distance <=  " + options.maxDistance + " AND");
			}
			if(options.minDuration != undefined){
				if(isNaN(options.minDuration)) throw "Expected number for minDuration";
				sqlQuery += (" duration >= " + options.minDuration + " AND");
			}
			if(options.maxDuration != undefined){
				if(isNaN(options.maxDuration)) throw "Expected number for maxDuration";
				sqlQuery += (" duration <=  " + options.maxDuration + " AND");
			}
			if(options.location != undefined){
				sqlQuery += (" location =  '" + options.location + "' AND");
			}
			sqlQuery = sqlQuery.substring(0, sqlQuery.length-3);
		}
	} catch (e){
		console.log("Error: Expected number")
		return{
			status: 400,
			data: {
				Error: e
			}
		}
	}


  console.log(options)

  
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
	var expected = ['title', 'difficulty', 'location', 'distance', 'duration', 'description', 'creatorID'];
	var keys = Object.keys(options.body);
	try {
		if(keys.length != expected.length) throw new Error;
		for(var i=0; i < keys.length; i++){
			if(keys[i] != expected[i]){
				throw new Error;
			}
		}
	} catch (e){
		return{
			status: 400,
			data: {
				Error: "body is not properly formatted! Please reference the YAML"
			}
		}
	}

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
    data: 'Created tour with title: ' + options.body.title

  };
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTour = async (options) => {

	console.log("getting Tour");

	if(options.TID != undefined){
		if(isNaN(options.TID)) {
			return {
				status: 400,
				data: {
					Error: "Expected Number for TID"
				}
			}
		};
	}

	var returnData = [];
  await dao
  .get('SELECT * from tour WHERE tID = ' + options.TID).then(function(value){
			console.log(value);
      returnData = value;
    });
	
	if(returnData.length == 0){
		return {
			status: 404,
			data: {
				Error: "Could not find tour with id: " + options.TID
			}
		}
	}

  return {
    status: 200,
    data: returnData[0]
  };

};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to delete
 * @param {String} options.username username of the currently logged in user
 * @throws {Error}
 * @return {Promise}
 */
module.exports.deleteTour = async (options) => {
  var uID = await userManager.getUserId(options.username);

  // check if user owns tour
  var getQuery = await dao.get(`SELECT creatorID from tour WHERE tID = ?`, [options.TID]);
  // tour does not exists
  if (getQuery.length == 0) {
    return {
      status: 404,
      data: "Tour not found"
    }
  }

  // check if user owns tour
  if (getQuery[0].creatorID != uID) {
    return {
      status: 401,
      data: "User does not own tour"
    }
  }

  // check if someone owns the tour
  var tourOwners = await dao.get(`SELECT userID from userTours WHERE tourID = ?`, [options.TID]);
  if (tourOwners.length > 0) {
    console.log("Tour is already bought and therefore cannot be deleted.");
    return {
      status: 403,
      data: "Tour is already bought and therefore cannot be deleted."
    }
  }

  // DELETE tour
  console.log("Deleting tour with id " + options.TID);
  await dao.run(
    `DELETE FROM tour WHERE tID = ?`, [options.TID]
  );

  return {
    status: 204
  }
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

  if(fs.existsSync(filePath)){
    return new FileResult(filePath);
  }
  else {
    var errorInput = {
      status: 404,
      error:"Could not find image with ID: " + options.IID + " for tour with ID:" + options.TID
    };
    throw new FileNotFoundError(errorInput);
  }
  
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @param {Integer} options.username username of the currently logged in user
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourGpx = async (options) => {
  //check if user bought tour
  var currentUid = await userManager.getUserId(options.username);
  try {
    var result = await dao.get("SELECT userID FROM userTours WHERE tourID = ? AND userID = ?", [options.TID, currentUid]);
  } catch {
    return {
      status: 401,
      data: "User not allowed to download gpx file"
    }
  }

  var filePath = gpxManager.getTourGpxPath(options.TID);
  if(fs.existsSync(filePath)){
    return new FileResult(filePath);
  }
  else {
    var errorInput = {
      status: 404,
      error:"Could not find GPX Data for Tour with ID: " + options.TID
    };
    throw new FileNotFoundError(errorInput);
  }
  
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to delete
 * @throws {Error}
 * @return {Promise}
 */
module.exports.uploadGpx = async (options) => {
  const mimetypes = ["application/gpx+xml"];

  if (mimetypes.includes(options.file.mimetype)){
    //check if tour exist
    return await dao.get("SELECT COUNT(*) as count FROM tour WHERE tid = ?", [options.TID]).then(
      async (value) => {
        if(value[0].count > 0){
              let filePath = gpxManager.getTourGpxPath(options.TID);
              let folderPath = folderManager.getFolderPath(options.TID);
              folderManager.createFolderIfNotExists(folderPath);
              fs.writeFileSync(filePath, options.file.buffer);
              return {
                status: 200,
                data: 'uploadGPX ok!'
              };
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

