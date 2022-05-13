const express = require('express');
const user = require('../services/user');
const userManager = require('../../userManager');

const router = new express.Router();


/**
 * Get info about myself
 */
router.get('/', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body,
    username: userLogin.username
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
    if(result.status == 201){
      req.session.loggedIn = true;
      req.session.username = req.body.username;
    }
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * edit the information of an existing user
 */
router.patch('/', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body,
    username: userLogin.username
  };

  try {
    const result = await user.patchUser(options);
    if(result.status == 200){
      req.session.username = req.body.username;
    }
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get my created tours
 */
 router.get('/createdTours', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body,
    username: userLogin.username
  };

  try {
    const result = await user.getCreatedTours(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * user login
 */
 router.post('/login', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  } else {
    res.status(200).send();
  }
});

/**
 *check if the user is logged in
 */
 router.get('/loggedin', async (req, res, next) => {
  if (req.session.loggedIn){
    res.status(200).send();
    return;
  } else {
    res.status(401).send({"code:":"401","message":"not logged in"});
  }
});

/**
 *user logout
 */
 router.post('/logout', async (req, res, next) => {
  if (!userManager.destroySessionCookie(req.session)){
    res.status(401).send({"code:":"401","message":"sessioncookie couldn't be destroyed!"});
    return;
  } else {
    res.status(200).send();
  }
});

/**
 * Get my created tours
 */
 router.get('/boughtTours', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }
  const options = {
    body: req.body,
    uid: await userManager.getUserId(userLogin.username)
  };

  try {
    const result = await user.getBoughtTours(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * connect an Ethereum wallet to the user
 */
router.post('/connectWallet', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body,
    username: userLogin.username
  };

  try {
    const result = await user.connectWallet(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * update password
 */
router.patch('/updatePassword', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body,
    username: userLogin.username
  };

  try {
    const result = await user.updatePassword(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
