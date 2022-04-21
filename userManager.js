var DBO = require("./db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const bcrypt = require ('bcrypt');

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
    return await bcrypt.compare(password, passwordFromDb).then(function(result) {
        console.log("User authenticated!");
        return username;
    },function(err){
        console.log(`UserManager: Someone tried to authenticate as ${username} but used the wrong password`);
        return false;
    });
};

module.exports.getUserId = async (username) => {
    var answer = await Promise.resolve(dao.get(`SELECT uID from user WHERE userName = ?`, username));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid user ${username}`);
        return undefined;
    }

    return answer[0].uID;
};
