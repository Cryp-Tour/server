const express = require('express');
const tours = require('../services/tours');
const fs = require('fs');
const router = new express.Router();
var multer  = require('multer');
const upload = multer();


/**
 * List all tours
 */
router.get('/', async (req, res, next) => {
  const options = {
    searchQuery: req.query['searchQuery'],
    minDifficulty: req.query['minDifficulty'],
    maxDifficulty: req.query['maxDifficulty'],
    minLength: req.query['minLength'],
    maxLength: req.query['maxLength'],
    location: req.query['location']
  };

  try {
    const result = await tours.listTours(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Create a tour
 */
router.post('/', async (req, res, next) => {
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
  const options = {
    TID: req.params['TID']
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
  const options = {
    file: req.file,
    TID: req.params['TID']
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
    next(err);
  }
});

/**
 * Get a tour gpx file
 */
router.get('/:TID/gpx', (req, res, next) => {
  // TODO: check if user bought tour
  const options = {
    TID: req.params['TID']
  };

  try {
    const result = tours.getTourGpx(options);
    var file = fs.readFileSync(result.filename);

    // return file
    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
  } catch (err) {
    next(err);
  }
});

/**
 * Upload a gpx file
 */
router.post('/:TID/gpx', async (req, res, next) => {
  const options = {
    body: req.body,
    TID: req.params['TID']
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
  const options = {
    TID: req.params['TID']
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
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
