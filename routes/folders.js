'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Folder = require('../models/folder');
const Note = require('../models/note');

//GET all /folders
// Sort the response by name
router.get('/folders', (req, res, next) => {

  Folder.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// GET /folders by id
// Add validation that protects against invalid Mongo ObjectIds and prevents unnecessary database queries.
// Add condition that checks the results and returns a 200 response or a 404 Not Found

router.get('/folders/:id', (req, res, next) => {
  const {id} = req.params;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Not a valid `id`');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err =>{
      next(err);
    });
});


// POST /folders to create a new folder
// Add validation which protects against missing name field
// Add condition that checks for a duplicate key error code 11000 and responds with a helpful error message (see below)
// A successful insert returns a location header and a 201 status

router.post('/folders', (req, res, next) => {
  const {name} = req.body;
  
  const newFolder = {name};
  console.log(newFolder);

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create(newFolder)
  //.insert(newFolder)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// PUT /folders by id to update a folder name
// Add validation which protects against missing name field
// Add validation which protects against invalid Mongo ObjectIds and prevents needless database queries.
// Add condition error check which catches duplicate folder names and provides helpful user feedback

router.put('/folders/:id', (req, res, next) => {
  const {id} = req.params;
  console.log(id);

  const {name} = req.body;
  
  console.log(name);

  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const updatedFolder = {name};
  console.log(updatedFolder);

  return Folder.findByIdAndUpdate(id, updatedFolder, {new: true})
    .then(result => {
      console.log(res.body);
      if (result) {
        res.json(result);
        console.log(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


// DELETE /folders by id which deletes the folder AND the notes contents
// A successful delete returns a 204 status


module.exports = router;

