'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;

chai.use(chaiHttp);

// describe('Reality Check', () => {

//   it('true should be true', () => {
//     expect(true).to.be.true;
//   });

//   it('2 + 2 should equal 4 (except in 1984)', () => {
//     expect(2 + 2).to.equal(4);
//   });

// });

// describe('Environment', () => {

//   it('NODE_ENV should be "test"', () => {
//     expect(process.env.NODE_ENV).to.equal('test');
//   });

// });

describe.only('Noteful API - Tags', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
    console.log('connected');
  });

  beforeEach(function () {
    return Tag.insertMany(seedTags);
    console.log('seeded');
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET all tags tests
  describe('GET /api/tags', function () {
    it('should return the correct number of Folders and correct fields', function () {
      const dbPromise = Tag.find();
      //console.log(dbPromise);
      const apiPromise = chai.request(app).get('/api/tags');
      //console.log(apiPromise);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          console.log(data);
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (tag) {
            expect(tag).to.be.a('object');
            expect(tag).to.have.keys('id', 'name');
          });
        });
    });

  });

  //GET tags by id tests
  describe('GET tags by id /api/tags/:id', function() {
    it('should return the correct tag for a given id', function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          console.log(res.body);
          console.log(data);
          expect(res.body).to.be.a('object');
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should return a 400 error if id is not valid', function() {
      const badId = 'sarah';
      return chai.request(app)
        .get(`/api/tags/${badId}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Not a valid `id`');
        });
    });

    it('should respond with a 404 for non-existent id', function () {

      return chai.request(app)
        .get('/api/tags/AAAAAAAAAAAAAAAAAAAAAAAA')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  //POST tags tests
  describe.only('POST new tags', function() {
    it('should POST new tags with the right fields', function() {
      const newTag = {'name': 'Test tag'};
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          console.log(data);
          console.log(res.body);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
        });
    });

    it('should return an error when posting an object missing "name" field', function () {
      const newTag = {
        'name': ''
      };

      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
          console.log(res.body.message);
        });
    });
  });
});
