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

    var answer = await Promise.resolve(dao.get(`SELECT pwdHash, uID from user WHERE username = ?`, username));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid user ${username}`);
        return false;
    }

    var loginAttempts = await Promise.resolve(dao.get('SELECT COUNT(*) AS count FROM loginAttempts WHERE userID = ? AND timestamp > ?',[answer[0].uID,Date.now()-300000]))
    if (loginAttempts[0].count > 5){
        await dao.run(
            `DELETE FROM loginAttempts WHERE userID = ? AND timestamp < ?`,
            [answer[0].uID,Date.now()-300000]);
        return false;
    } else {
        var passwordFromDb = answer[0].pwdHash;
        return await bcrypt.compare(password, passwordFromDb).then(async function(result) {
            if (result){
                console.log("User authenticated!");
                await dao.run(
                    `DELETE FROM loginAttempts WHERE userID = ? AND timestamp < ?`,
                    [answer[0].uID,Date.now()]);
                return username;
            } else {
                console.log(`UserManager: Someone tried to authenticate as ${username} but used the wrong password`);
                await dao.run(
                    `INSERT INTO loginAttempts (userID, timestamp)
                      VALUES (?, ?)`,
                    [answer[0].uID,Date.now()]);
                return false;
            }

        });
    }
};

module.exports.getUserId = async (username) => {
    var answer = await Promise.resolve(dao.get(`SELECT uID from user WHERE userName = ?`, username));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid user ${username}`);
        return undefined;
    }

    return answer[0].uID;
};
