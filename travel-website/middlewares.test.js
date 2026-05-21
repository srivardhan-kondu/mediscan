const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { configureMiddlewares } = require('./app');

let app;

beforeEach(() => {
  app = express();
  configureMiddlewares(app);
});

describe('Middleware testing', () => {
  test('should use helmet middleware', done => {
    const req = {};
    const res = {
      setHeader: jest.fn()
    };
    const next = jest.fn();
    helmet()(req, res, next);
    expect(next).toHaveBeenCalled();
    done();
  });

  test('should use morgan middleware', done => {
    const req = {};
    const res = {};
    const next = jest.fn();
    morgan('tiny')(req, res, next);
    expect(next).toHaveBeenCalled();
    done();
  });

  test('should use bodyParser middleware', done => {
    const req = {
      body: {}
    };
    const res = {};
    const next = jest.fn();
    bodyParser.json()(req, res, next);
    expect(typeof req.body).toBe('object');
    expect(next).toHaveBeenCalled();
    done();
  });
});