const ServerError = require("../lib/error");
var DBO = require("../../db/dbo");
const dao = new DBO("./db/db/web.sqlite");
/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUser = async (options) => {
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
    data: "getUser ok!",
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUser = async (options) => {
  await dao
    .run(
      `INSERT INTO user(firstName,surName,pwdHash,eMail,userName) VALUES(?,?,?,?,?)`,
      [
        options.body.firstname,
        options.body.surname,
        options.body.password,
        options.body.email,
        options.body.username,
      ]
    )
    .then(
      (value) => {
        console.log("Creating user with username " + options.body.username);
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
module.exports.patchUser = async (options) => {
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
    data: "patchUser ok!",
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.connectWallet = async (options) => {
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
    data: "connectWallet ok!",
  };
};
