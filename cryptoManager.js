const DBO = require("./db/dbo");
const dao = new DBO("./db/db/web.sqlite");
const crypto_lib = require("provider-js/src/provider");
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
        crypto_lib.initTourTokenFactoryListener("./contracts/TourTokenFactory.json");
        crypto_lib.initBFactoryListener("./contracts/BFactory.json");

        // add all currently in db tours to watching
        // var tours = await dao......
        // for (i = 0; i < tours.length; i++) {
        //     var tokenAddress = tours[i].tokenAddress;
        //     if (tokenAddress == undefined) continue;
        //     provider.addTT('contracts/TourTokenTemplate.json', tokenAddress);
        // }

        provider.registerCallback("TourTokenOrder", (event) => {
            console.log("[CRYPTO]: Someone bought a tour");
            // console.log(event)
        })

        provider.registerCallback("TourTokenFactory", (event) => {
            console.log("[CRYPTO]: Someone created a new TourToken");

            // den neuen Token auch mit Überwachen
            provider.addTT('./contracts/TourTokenTemplate.json', event.tokenAddress)

            // jede tour in der datenbank durchgehen, die ID sha3 hashen und mit event.blob vergleichen
            // wir müssen definieren was wir in den Blob des Token reinschreiben. Meine Idee ist "Crypotur-ID: {tID}"
        })

        provider.registerCallback("BFactory", (event) => {
            // jemand hat einen balancer pool erstellt. die addresse (event.pool) sollte in der Datenbank gespeichert sein
            console.log(`[CRYPTO]: Balancer Pool created at address ${event.pool}`);
        })
    } catch (e) {
        console.log("Error connecting blockchain: ", e);
    }
}
