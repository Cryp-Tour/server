const DBO = require("./db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const crypto_lib = require("provider-js/src/provider");
const user_manager = require("./userManager");
const proccess = require("process")

/**
 * Add to database that user with uID has bought tour with tID
 * @param {int} tID the tour id
 * @param {int} uID the user id
 */
module.exports.userBoughtTour = async (tID, uID) => {
    await dao.run('INSERT INTO userTours(tourID, userID) VALUES(?,?)', [tID, uID]);
}

/**
 * Lookup wallet id in user database
 * @param {string} walledId the wallet id to find the user
 * @returns {int} the user id of the user with the specified wallet (or -1 if not found or multiple users found)
 */
module.exports.walletToUser = async (walledId) => {
    var user = await dao.get('SELECT uID from user WHERE walletID = ?', [walledId]);
    if (user.length == 1) {
        return user[0].uID;
    }
    return -1;
}

module.exports.connectBlockchain = async () => {
    try {
        crypto_lib.setProviderURL(proccess.env.CHAIN_PROVIDER_URL);
        crypto_lib.setNetworkId(proccess.env.CHAIN_NETWORK_ID);

        // TODO: add contract files after deploying to correct blockchain
        crypto_lib.initTourTokenFactoryListener(__dirname + "/contracts/TourTokenFactory.json");
        crypto_lib.initBFactoryListener(__dirname + "/contracts/BFactory.json");

        // add all currently in db tours to watching
        var tours = await dao.get("SELECT tokenAddress from tour");
        for (i = 0; i < tours.length; i++) {
            var tokenAddress = tours[i].tokenAddress;
            if (tokenAddress == undefined || tokenAddress == "") continue;
            crypto_lib.addTT(__dirname + '/contracts/TourTokenTemplate.json', tokenAddress);
        }

        crypto_lib.registerCallback("TourTokenOrder", async (event) => {
            console.log("[CRYPTO]: Someone bought a tour");
            var tourId = event.serviceId;
            var userAddress = event.payer;
            var uID = await user_manager.getUserIdFromAddress(userAddress);
            if (uID == undefined) {
                console.log(`[CRYPTO]: Tour payer with address ${userAddress} does not exist in Database`);
                return;
            }

            await this.userBoughtTour(tourId, uID);
        })

        crypto_lib.registerCallback("TourTokenFactory", async (event) => {
            console.log("[CRYPTO]: Someone created a new TourToken");

            // den neuen Token auch mit Überwachen
            crypto_lib.addTT(__dirname + '/contracts/TourTokenTemplate.json', event.tokenAddress)

            var address = event.tokenAddress;
            var tourID = event.tokenName.split("Cryptour-ID:")[1];
            await dao.run("UPDATE tour SET tokenAddress = ? WHERE tID = ?", [address, tourID]);
        })

        crypto_lib.registerCallback("BFactory", (event) => {
            console.log(`[CRYPTO]: Balancer Pool created at address ${event.pool}`);

            // jemand hat einen balancer pool erstellt. Den jetzt überwachen
            crypto_lib.addBPool(__dirname + '/contracts/BPool.json', event.pool)
        })
        
        crypto_lib.registerCallback("BPool", async (event) => {
            console.log(`[CRYPTO]: Balancer Pool finalisiert`);
            var poolAddress = event.pool;
            // token 0 ist immer der Tausch-Token, also z.B. der
            var tokenAddress = event.tokens[1];
            await dao.run("UPDATE tour SET bpoolAddress = ? WHERE tokenAddress = ?", [poolAddress, tokenAddress]);
            console.log(event)
        })
    } catch (e) {
        console.log("Error connecting blockchain:", e);
    }
}
