'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// const Folder = require('../models/folder');
// const Note = require('../models/note');
const Tag = require('../models/tag');

//GET all tags endpoint
router.get('/tags', (req, res, next) => {
  Tag.find()
    .sort('name')
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});

//GET tag by id
// Add validation that protects against an invalid ObjectId that returns a 400 response and a user-friendly response
// Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
router.get('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Not a valid `id`');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch( err => {
      next(err);
    });
});


module.exports = router;

