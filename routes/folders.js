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


// POST /folders to create a new folder
// Add validation which protects against missing name field
// Add condition that checks for a duplicate key error code 11000 and responds with a helpful error message (see below)
// A successful insert returns a location header and a 201 status


// PUT /folders by id to update a folder name
// Add validation which protects against missing name field
// Add validation which protects against invalid Mongo ObjectIds and prevents needless database queries.
// Add condition error check which catches duplicate folder names and provides helpful user feedback


// DELETE /folders by id which deletes the folder AND the notes contents
// A successful delete returns a 204 status


module.exports = router;

