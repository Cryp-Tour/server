var DBO = require("./db/dbo");
const dao = new DBO("./db/db/web.sqlite");

module.exports.checkAuthorizationHeader = async (header) => {
    if (!header) {
        console.log("UserManager: missing Authorization header");
        return false;
    }
    var splittedHash = Buffer.from(header.split("Basic ")[1], "base64").toString().split(":");
    var username = splittedHash[0];
    var password = splittedHash[1];

    var answer = await Promise.resolve(dao.get(`SELECT pwdHash from user WHERE username = ?`, username));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid user ${username}`);
        return false;
    }

    var passwordFromDb = answer[0].pwdHash;
    // TODO: use password hashing
    if (password == passwordFromDb){
        console.log("User authenticated!");
        return username;
    } else {
        console.log(`UserManager: Someone tried to authenticate as ${username} but used the wrong password`);
        return false;
    }
};
