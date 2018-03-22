'use strict';

'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHttp);

describe.only('Noteful API - Folders', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET all folders tests
  describe('GET /api/folders', function () {

    it('should return the correct number of Folders and correct fields', function () {
      const dbPromise = Folder.find();
      //console.log(dbPromise);
      const apiPromise = chai.request(app).get('/api/folders');
      //console.log(apiPromise);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          console.log(data);
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id', 'name');
          });
        });
    });

  });

//GET folder by id test

  describe('GET /api/notes/:id', function () {

    it('should return correct folder for a given id', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) => {
          console.log(res.body);
          console.log(data);
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      const badId = 'xyz';

      return chai.request(app)
        .get(`/api/folders/${badId}`)
        .catch(err => err.response)
        .then(res => {
          console.log(res.status);
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('Not a valid `id`');
        });
    });

    it('should respond with a 404 for non-existent id', function () {

      return chai.request(app)
        .get('/api/folders/AAAAAAAAAAAAAAAAAAAAAAAA')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/notes', function () {

    it('should create and return a new folder when provided valid data', function () {
      const newFolder = {
        'name': 'My throw-away folder!'
      };
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          console.log(data);
          console.log(res.body);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
        });
    });

    it('should return an error when posting an object with a missing "name" field', function () {
      const newFolder = {
        'name': ''
      };

      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
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

  describe.only('PUT /api/folders/:id', function () {

    it('should update the folder when provided proper valid data', function () {
      const updateFolder = {
        'name': 'New name'
      };
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateFolder);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateFolder.name);
        });
    });


    it('should respond with a 400 for improperly formatted id', function () {
      const updateFolder = {
        'name': 'New name'
      };
      const badId = '99-99-99';

      return chai.request(app)
        .put(`/api/folders/${badId}`)
        .send(updateFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateFolder = {
        'name': 'New name'
      };

      return chai.request(app)
        .put('/api/folders/AAAAAAAAAAAAAAAAAAAAAAAA')
        .send(updateFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateFolder = {
        'up': 'down'
      };

      return chai.request(app)
        .put('/api/folders/111111111111111111111102')
        .send(updateFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

  });

//   describe('DELETE  /api/notes/:id', function () {

//     it('should delete an item by id', function () {
//       let data;
//       return Note.findOne()
//         .then(_data => {
//           data = _data;
//           return chai.request(app).delete(`/api/notes/${data.id}`);
//         })
//         .then(function (res) {
//           expect(res).to.have.status(204);
//         });
//     });

//   });

});

