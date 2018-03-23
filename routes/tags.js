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


module.exports = router;

