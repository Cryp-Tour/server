var DBO = require("./db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const bcrypt = require ('bcrypt');

module.exports.checkAuthorizationHeader = async (header, sessionCookie) => {    
    if (!header) {
        if(sessionCookie.loggedIn){
            console.log("UserManager: valid session cookie")
            sessionCookie.touch();
            return {"username" : sessionCookie.username,
                    "status" : 200,
                    "message" : "Authentication via cookie"};
        } else {
            console.log("UserManager: missing Authorization header");
            return {"username" : false,
                    "status" : 400,
                    "message" : "Missing Authorization header"};
        }
    }

    var splittedHash = Buffer.from(header.split("Basic ")[1], "base64").toString().split(":");
    var username = splittedHash[0];
    var password = splittedHash[1];

    var answer = await Promise.resolve(dao.get(`SELECT pwdHash, uID from user WHERE username = ?`, username));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid user ${username}`);
        return {"username" : false,
                "status" : 401,
                "message" : "Invalid credentials"};
    }

    var loginAttempts = await Promise.resolve(dao.get('SELECT COUNT(*) AS count FROM loginAttempts WHERE userID = ? AND timestamp > ?',[answer[0].uID,Date.now()-300000]))
    if (loginAttempts[0].count > 5){
        await dao.run(
            `DELETE FROM loginAttempts WHERE userID = ? AND timestamp < ?`,
            [answer[0].uID,Date.now()-300000]);
        return {"username" : false,
            "status" : 401,
            "message" : "User login blocked for this user for 5 minutes."};
    } else {
        var passwordFromDb = answer[0].pwdHash;
        return await bcrypt.compare(password, passwordFromDb).then(async function(result) {
            if (result){
                console.log("User authenticated!");
                await dao.run(
                    `DELETE FROM loginAttempts WHERE userID = ? AND timestamp < ?`,
                    [answer[0].uID,Date.now()]);
                sessionCookie.loggedIn = true;
                sessionCookie.username = username;
                return {"username" : username,
                        "status" : 200,
                        "message" : "User logged in"};
            } else {
                console.log(`UserManager: Someone tried to authenticate as ${username} but used the wrong password`);
                await dao.run(
                    `INSERT INTO loginAttempts (userID, timestamp)
                      VALUES (?, ?)`,
                    [answer[0].uID,Date.now()]);
                return {"username" : false,
                    "status" : 401,
                    "message" : "Invalid credentials"};
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

module.exports.getUsername = async (uID) => {
    var answer = await Promise.resolve(dao.get(`SELECT userName from user WHERE uID = ?`, uID));
    if (answer.length == 0) {
        console.log(`UserManager: Invalid userid ${username}`);
        return undefined;
    }

    return answer[0].userName;
}

module.exports.destroySessionCookie = async (sessionCookie) => {
    sessionCookie.destroy((err)=>{
        if(err){
            return false;
        } else {
            return true;
        }
    });
};

module.exports.getUserIdFromAddress = async (address) => {
    var users = await dao.get("SELECT uID from user WHERE walletID = ?", address);
    if (users.length == 0) {
        console.log(`UserManager: No user with walletID ${address}`);
        return undefined;
    }

    return users[0].uID;
}
