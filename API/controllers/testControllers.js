'use strict';

exports.testGet = function(req, res) {
    res.status(200);
    res.json({
        message: "Hello World!", 
        Connection: "Success!"
    });
};

exports.testHead = function(req, res) {
    res.status(200);
    res.header({testHeader: "testValue"});
    res.end("");
};