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
  describe.only('GET /api/tags', function () {
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


});
