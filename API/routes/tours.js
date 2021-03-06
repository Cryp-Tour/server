const express = require('express');
const tours = require('../services/tours');
const fs = require('fs');
const router = new express.Router();
var multer  = require('multer');
const upload = multer();
const userManager = require("../../userManager");
const { response } = require('express');
const FileNotFoundError = require('../lib/error');


/**
 * List all tours
 */
router.get('/', async (req, res, next) => {
  const options = {
    searchQuery: req.query['searchQuery'],
    minDifficulty: req.query['minDifficulty'],
    maxDifficulty: req.query['maxDifficulty'],
    minDistance: req.query['minDistance'],
    maxDistance: req.query['maxDistance'],
    minDuration: req.query['minDuration'],
    maxDuration: req.query['maxDuration'],
    location: req.query['location']
  };

  try {
    const result = await tours.listTours(options);
    res.header(result.header);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Create a tour
 */
router.post('/', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    body: req.body
  };

  try {
    const result = await tours.createTour(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get a specific tour
 */
router.get('/:TID', async (req, res, next) => {
  const options = {
    TID: req.params['TID'],
  };

  try {
    const result = await tours.getTour(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Delete a specific tour
 */
router.delete('/:TID', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    TID: req.params['TID'],
    username: userLogin.username
  };

  try {
    const result = await tours.deleteTour(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Upload an image file
 */
router.post('/:TID/image', upload.single('file'), async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    file: req.file,
    TID: req.params['TID'],
    uID: await userManager.getUserId(userLogin.username)
  };

  try {
    const result = await tours.uploadImage(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get a tour image
 */
router.get('/:TID/image/:IID', (req, res, next) => {
  const options = {
    TID: req.params['TID'],
    IID: req.params['IID']
  };

  try {
    const result = tours.getTourImage(options);
    var file = fs.readFileSync(result.filename);

    // return file
    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
  } catch (err) {
    if (err instanceof FileNotFoundError) {
      res.status(err.status).send(err.error);
    }
    else {
      next(err);
    }
  }
});

/**
 * Get a tour gpx file
 */
router.get('/:TID/gpx', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    TID: req.params['TID'],
    username: userLogin.username
  };

  try {
    const result = await tours.getTourGpx(options);
    if (result.filename) {
      var file = fs.readFileSync(result.filename);
  
      // return file
      res.setHeader('Content-Length', file.length);
      res.write(file, 'binary');
      res.end();
      return;
    } else {
      res.status(result.status || 200).send(result.data);
    }
  } catch (err) {
    if (err instanceof FileNotFoundError) {
      res.status(err.status).send(err.error);
    }
    else {
      next(err);
    }
  }
});

/**
 * Upload a gpx file
 */
router.post('/:TID/gpx', upload.single('file'), async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    file: req.file,
    TID: req.params['TID'],
    uID: await userManager.getUserId(userLogin.username)
  };

  try {
    const result = await tours.uploadGpx(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Rate a tour
 */
router.post('/:TID/rating', async (req, res, next) => {
  var userLogin = await userManager.checkAuthorizationHeader(req.headers.authorization, req.session);
  if (!userLogin.username){
    res.status(userLogin.status).send(userLogin.message);
    return;
  }

  const options = {
    TID: req.params['TID'],
    body: req.body,
    uID: await userManager.getUserId(userLogin.username)
  };

  try {
    const result = await tours.rateTour(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get a tour rating
 */
router.get('/:TID/rating', async (req, res, next) => {
  const options = {
    TID: req.params['TID']
  };

  try {
    const result = await tours.getTourRating(options);
    res.header(result.header);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get the tour creator
 */
 router.get('/:TID/creator', async (req, res, next) => {
  const options = {
    TID: req.params['TID']
  };

  try {
    const result = await tours.getTourCreator(options);
    res.header(result.header);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
