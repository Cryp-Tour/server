const express = require('express');
const user = require('../services/user');

const router = new express.Router();


/**
 * Get info about myself
 */
router.get('/', async (req, res, next) => {
  const options = {
    body: req.body,
    username: Buffer.from(req.headers.authorization.split("Basic ")[1], "base64").toString().split(":")[0]
  };

  try {
    const result = await user.getUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * create a new User
 */
router.post('/', async (req, res, next) => {
  const options = {
    body: req.body
  };

  try {
    const result = await user.createUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * edit the information of an existing user
 */
router.patch('/', async (req, res, next) => {
  const options = {
    body: req.body,
    username: Buffer.from(req.headers.authorization.split("Basic ")[1], "base64").toString().split(":")[0]
  };

  try {
    const result = await user.patchUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * connect an Ethereum wallet to the user
 */
router.post('/connectWallet', async (req, res, next) => {
  const options = {
    body: req.body,
    username: Buffer.from(req.headers.authorization.split("Basic ")[1], "base64").toString().split(":")[0]
  };

  try {
    const result = await user.connectWallet(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
