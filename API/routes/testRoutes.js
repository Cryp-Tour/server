'use strict';
module.exports = function(app) {
    var testFunc = require('../controllers/testControllers');

    //test routes
    app.route('/api')
        .get(testFunc.testGet)
        .head(testFunc.testHead);
};