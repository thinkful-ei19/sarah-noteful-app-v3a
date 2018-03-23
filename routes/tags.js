'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// const Folder = require('../models/folder');
const Note = require('../models/note');
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

//POST new tag 
// Add validation that protects against missing name field
// A successful insert returns a location header and a 201 status
// Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.post('/tags', (req, res, next) => {
  const {name} = req.body;
  console.log({name});

  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = {name};
  
  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});

//PUT tags update tag by id
// Add validation which protects against missing name field
// Add validation which protects against an invalid ObjectId
// Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
// Ensure you are returning the updated/modified document, not the document prior to the update
// Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.put('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  const{name} = req.body;
  const updateTag = {name};

  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Not a valid id');
    err.status = 400;
    next(err);
  }

  const options = {new: true};
  Tag.findByIdAndUpdate(id, updateTag, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

//DELETE tags endpoint delete tags by id
// Remove the tag
// Using $pull, remove the tag from the tags array in the notes collection.
// Add condition that checks the result and returns a 200 response with the result or a 204 status
router.delete('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  console.log({id});

  Tag.findByIdAndRemove(id)
    .then(() => {
      Note.update({},
        {$pull: {tags: id}}, {multi: true});
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
  // const deleteTagPromise = Tag.findByIdAndRemove({ _id: id });
  // const deleteInNotesPromise = Note.update(
  //   { },
  //   { $pull: { tags: { _id: id } } },
  //   { multi: true }
  // );

  // Promise.all([deleteTagPromise, deleteInNotesPromise])
  // .then(() => {
  //   res.status(204).end();
  // })
});

module.exports = router;

