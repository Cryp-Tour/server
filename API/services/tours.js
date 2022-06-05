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
const { disable } = require('express/lib/application');
const res = require('express/lib/response');

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
      if(options.searchQuery != undefined){
        sqlQuery += (" title LIKE '%" + options.searchQuery + "%' AND");
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

  
  var returnData = [];
  await dao
  .get('SELECT * from tour ' + sqlQuery).then(function(value){
			console.log(value);
      returnData = value;
    }).then(async () => { 
      if (returnData.length > 0) {
        for (i = 0; i < returnData.length; i++) {
          await dao.get(`SELECT tiID from tourImage WHERE tourID = ?`, [returnData[i]["tID"]]).then((value) => {
            returnData[i].tourImages = value
          })
        }
      }
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

  var insert_result = await dao
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
    );

    console.log("Created tour with id", insert_result.id);


  return {
    status: 200,
    data: {
      tID: insert_result.id
    }

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
    }).then(async () => {
      return await dao.get(`SELECT tiID from tourImage WHERE tourID = ?`, [options.TID]).then((value) => {
        console.log(value)
        returnData[0].tourImages = value
      })
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
      data: {
        Error: "Tour not found"
      }
    }
  }

  // check if user owns tour
  if (getQuery[0].creatorID != uID) {
    return {
      status: 403,
      data: {
        Error: "User does not own tour"
      }
    }
  }

  // check if someone owns the tour
  var tourOwners = await dao.get(`SELECT userID from userTours WHERE tourID = ?`, [options.TID]);
  if (tourOwners.length > 0) {
    console.log("Tour is already bought and therefore cannot be deleted.");
    return {
      status: 403,
      data: {
        Error: "Tour is already bought and therefore cannot be deleted."
      }
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
              let filePath = imageManager.getImagePath(options.TID, value.id, options.file.mimetype);
              let folderPath = folderManager.getFolderPath(options.TID);
              folderManager.createFolderIfNotExists(folderPath);
              fs.writeFileSync(filePath, options.file.buffer);
              return {
                status: 201
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
  var filePath = imageManager.getImagePath(parseInt(options.TID), parseInt(options.IID));

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
  } catch (error) {
    console.log("Error checking if user bought tour", error);
    return {
      status: 500,
      data: "Internal Server Error checkig if user bought tour"
    }
  }

  var allowDownload = false;

  if (result.length != 0) {
    allowDownload = true;
  } else {
    var tour = await dao.get("SELECT creatorID from tour WHERE tID = ?", [options.TID]);
    if (tour.length == 1 && tour[0].creatorID == currentUid) {
      // user created tour, allow download
      allowDownload = true;
    }
  }

  if (!allowDownload) {
    return {
      status: 403,
      data: "User not allowed to download gpx file"
    }
  }

  var filePath = gpxManager.getTourGpxPath(parseInt(options.TID));
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
                status: 201
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
  if(options.body.rating >= 1 && options.body.rating <= 5 ){
    return await dao.get("SELECT COUNT(*) as count FROM tour WHERE tid = ?", [options.TID]).then(
      async (value) => {
        if(value[0].count > 0){
          return await dao.get("SELECT COUNT(*) as count FROM rating WHERE tourID = ? and ownerID = ?",[options.TID,options.uID]).then(
            async (value) => {
              if(value[0].count == 0){
                return await dao.run("INSERT INTO rating(rating,timestamp,ownerID,tourID) VALUES (?,?,?,?)", [options.body.rating,Date.now(),options.uID,options.TID]).then(
                  (value) => {
                    return {
                      status: 200,
                      data: 'rating added'
                    };
                  }, (err) => {
                    return {
                      status: 500
                    }
                  }
                );
              } else {
                return await dao.run("UPDATE rating SET rating = ?, timestamp = ? WHERE ownerID = ? AND tourID = ?", [options.body.rating,Date.now(),options.uID,options.TID]).then(
                  (value) => {
                    return {
                      status: 200,
                      data: 'rating updated'
                    };
                  }, (err) => {
                    return {
                      status: 500
                    }
                  }
                );
              }
            }, (err) => {
              return {
                status: 500
              };
            }
          );
        } else {
          return {
            status: 404,
            data: 'wrong tid'
          };
        }
      }, (err) => {
        return {
          status: 500
        };
      }
    );
  } else {
    return {
      status: 406,
      data: 'int value between 1 and 5 allowed'
    };
  }
};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourRating = async (options) => {

  console.log("Getting Tour Rating");
  var status = 200;
  return await dao
  .get('SELECT * FROM tour WHERE tID = ' + options.TID).then( async (value) =>{
    //console.log(value);
    if(value.length == 0){
      return {
        status: 404,
        data: "Error: Could not Find Tour with ID " +options.TID
      }
    }
    else {
      return await dao
      .get('SELECT * from rating WHERE tourID = ' + options.TID).then( (value) =>{
        console.log(value);
        var returnData = value;
        if(returnData.length == 0){
          return {
            status: 400,
            data: {
              Error: "no ratings submitted for this tour"
            },
            header: {
              NumberOfResults: returnData.length
            }
          }
        }
        var ratingAvg = 0;
        for(var i=0; i<value.length; i++){
          ratingAvg += value[i]["rating"];
        }
        ratingAvg = ratingAvg / value.length;
        return {
          status: 200,
          data: {
            tourRating: ratingAvg
          },
          header: {
            NumberOfResults: returnData.length
          }
        };
      })
    }
  });

};

/**
 * @param {Object} options
 * @param {Integer} options.TID The ID of the tour to retrieve
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getTourCreator = async (options) => {
  var tour = await dao.get("SELECT creatorID from tour WHERE tID = ?", [options.TID]);
  if (tour.length == 0) {
    return {
      status: 404,
      data: "Tour not found"
    }
  }
  
  var username = await userManager.getUsername(tour[0].creatorID);
  return {
    status: 200,
    data: username
  }
}

