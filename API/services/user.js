const ServerError = require("../lib/error");
var DBO = require("../../db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const bcrypt = require ('bcrypt');
const saltRounds = 10;

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUser = async (options) => {
  return await dao
    .get(
      `SELECT uID, firstName, surName, userName, eMail, walletID FROM user WHERE userName = ?`, [options.username]
    )
    .then(
      (value) => {
        if(value.length > 0){
          user = value["0"]
          console.log("Getting information about user with username " + user.firstName);
          return {
            status: 200,
            data: {
              id: user.uID,
              firstName: user.firstName,
              surname: user.surName,
              username: user.userName,
              email: user.eMail,
              walletId: user.walletID
            },
          };
        } else {
          return {
            status: 400,
          };
        }
      }, (err) => {
        return {
          status: 400,
        };
      });
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUser = async (options) => {
  emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (options.body.password.trim() == ""){
    return {
      status: 400,
      data: "password must be set"
    };
  } else if(options.body.firstname.trim() == ""){
    return {
      status: 400,
      data: "Firstname must be set"
    };
  } else if(options.body.surname.trim() == ""){
    return {
      status: 400,
      data: "Surname must be set"
    };
  } else if(options.body.username.trim() == ""){
    return {
      status: 400,
      data: "Username must be set"
    };
  } else if(!emailRegexp.test(options.body.email)){
    return {
      status: 400,
      data: "invalid email address"
    };
  } else {
    return await bcrypt.hash(options.body.password,saltRounds).then(async function(hash){
      return await dao
      .run(
        `INSERT INTO user(firstName,surName,pwdHash,eMail,userName,walletID) VALUES(?,?,?,?,?,?)`,
        [
          options.body.firstname,
          options.body.surname,
          hash,
          options.body.email,
          options.body.username,
          options.body['wallet-id']
        ]
      )
      .then((value) => {
        console.log("Creating user with username " + options.body.username);
        return {
          status: 201,
          data: {
            "id": value.id,
            "firstname": options.body.firstname,
            "surname": options.body.surname,
            "username": options.body.username,
            "email": options.body.email,
            "wallet-id": options.body['wallet-id']
          }
        };
      }, (err) =>{
        if(err.code == 'SQLITE_CONSTRAINT'){
          return {
            status: 400,
            data: "Username already exists"
          };
        } else {
          return {
            status: 400,
            data: "unknown error"
          };
        }
      });
    },(err)=>{
      return {
        status: 400,
        data: "unknown error"
      };
    })  
  }
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.patchUser = async (options) => {
  emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if(options.body.firstname.trim() == ""){
    return {
      status: 400,
      data: "Firstname must be set"
    };
  } else if(options.body.surname.trim() == ""){
    return {
      status: 400,
      data: "Surname must be set"
    };
  } else if(options.body.username.trim() == ""){
    return {
      status: 400,
      data: "Username must be set"
    };
  } else if(!emailRegexp.test(options.body.email)){
    return {
      status: 400,
      data: "invalid email address"
    };
  } else {
    return await dao
      .get(`SELECT uID from user WHERE username = ?`, [options.username])
      .then(async (value) => {
        if (value.length > 0){
          return await dao.run(`UPDATE user SET username = ?, firstName = ?, surName = ?, eMail = ?, walletID = ? WHERE uID = ?`,
          [
            options.body.username,
            options.body.firstname,
            options.body.surname,
            options.body.email,
            options.body['wallet-id'],
            value[0].uID
          ]).then((value) => {
            console.log("Updating user " + options.body.username);
            return {status: 200,
              data: {
                "id": value.id,
                "firstname": options.body.firstname,
                "surname": options.body.surname,
                "username": options.body.username,
                "email": options.body.email,
                "walletid": options.body['wallet-id']
              }
            };
          }, (err) => {
            if(err.code == 'SQLITE_CONSTRAINT'){
              return {
                status: 400,
                data: "Username already exists"
              };
            } else {
              return {
                status: 400,
                data: "unknown error"
              };
            }
          });
        } else {
          return {
            status: 400,
            data: "unknown error"
          };
        }
      }, (err) => {
        return {
          status: 400,
          data: "unknown error"
        };
      });
  }
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.connectWallet = async (options) => {
  return await dao
    .run(`UPDATE user SET walletID = ? WHERE username = ?`, [
      options.body.walletAddress,
      options.username,
    ])
    .then((value) => {
      if (value.changes > 0){
        console.log("Updating wallet address for user " + options.username);
        return{
          status: 201,
        };
      } else {
        return{
          status: 401,
        };
      }
    }, (err) => {
      return{
        status: 401,
      };
    });
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
 module.exports.updatePassword = async (options) => {
  console.log(options);
  if (options.body.password.trim() == ""){
    return {
      status: 400,
      data: "password must be set"
    };
  } else {
    return await bcrypt.hash(options.body.password,saltRounds).then(async function(hash){
      return await dao
      .run(`UPDATE user SET pwdHash = ? WHERE username = ?`, [
        hash,
        options.username,
      ])
      .then((value) => {
        if (value.changes > 0){
          console.log("Updating password address for user " + options.username);
          return{
            status: 201,
          };
        } else {
          return{
            status: 401,
            data: "unkwown error"
          };
        }
      }, (err) => {
        return{
          status: 401,
          data: "unkwown error"
        };
      });
    },(err)=>{
      return {
        status: 400,
        data: "unknown error"
      };
    })  
  }
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
 module.exports.getCreatedTours = async (options) => {
  var returnData = [];
  await dao
  .get('SELECT uID FROM user WHERE userName = ?', [options.username]).then(async (value) => { 
      if (value.length > 0) {
        console.log("Getting created tours for user " + options.username);
        await dao.get(`SELECT * FROM tour WHERE creatorID = ?`, [value[0].uID]).then(async (value) => {
          returnData = value
        }).then(async () => { 
          if (returnData.length > 0) {
            for (i = 0; i < returnData.length; i++) {
              await dao.get(`SELECT tiID from tourImage WHERE tourID = ?`, [returnData[i]["tID"]]).then((value) => {
                returnData[i].tourImages = value
              })
            }
          }
        });
      }
    });

  return {
    status: 200,
    data: returnData,
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
 module.exports.getBoughtTours = async (options) => {
  return await dao.get('SELECT t.tid, t.description, t.title, t.duration, t.distance, t.difficulty, t.location, t.creatorID FROM userTours u left join tour t ON t.tid == u.tourID WHERE u.userID == ?', [options.uid]).then(
    async (value) => { 
      if (value.length > 0) {
        for (i = 0; i < value.length; i++) {
          await dao.get(`SELECT tiID from tourImage WHERE tourID = ?`, [value[i]["tID"]]).then((valueImage) => {
            value[i].tourImages = valueImage
          })
        }
      }
      return {
        status: 200,
        data: value,
      };
    }, (err) => {
      return {
        status: 500
      }
    }
  );
};
