const ServerError = require("../lib/error");
var DBO = require("../../db/dbo");
const dao = new DBO("./db/db/web.sqlite");
/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUser = async (options) => {
  var user =null;
  await dao
    .get(
      `SELECT uID, firstName, surName, userName, eMail, walletID FROM user WHERE userName = ?`, [options.username]
    )
    .then(
      (value) => {
        user = value["0"]
        console.log("Getting information about user with username " + user.firstName);
      });
  
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
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUser = async (options) => {
  return await dao
    .run(
      `INSERT INTO user(firstName,surName,pwdHash,eMail,userName,walletID) VALUES(?,?,?,?,?,?)`,
      [
        options.body.firstname,
        options.body.surname,
        options.body.password,
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
      return {
        status: 401,
      };
    });
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.patchUser = async (options) => {
  await dao
    .get(`SELECT uID from user WHERE username = ?`, [options.username])
    .then(async (value) => {
      await dao.run(`UPDATE user SET username = ?, firstName = ?, surName = ?, pwdHash = ?, eMail = ? WHERE uID = ?`,
        [
          options.body.username,
          options.body.firstname,
          options.body.surname,
          options.body.password,
          options.body.email,
          value[0].uID
        ]).then(() => {
          console.log("Updating user " + options.body.username);
        });
    });

  return {
    status: 201,
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.connectWallet = async (options) => {
  await dao
    .run(`UPDATE user SET walletID = ? WHERE username = ?`, [
      options.body.walletAddress,
      options.username,
    ])
    .then((value) => {
      console.log("Updating wallet address for user " + options.username);
    });

  return {
    status: 201,
  };
};
