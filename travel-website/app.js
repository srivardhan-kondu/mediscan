'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const { setupRoutes } = require('./routes');

/**
 * Configure all necessary middlewares
 * @param {Object} app - The Express application instance
 */
function configureMiddlewares(app) {
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
}

/**
 * Starts the server to listen on the specified port
 * @param {number} port - The port number to listen on
 */
function startServer(port) {
  const app = express();
  configureMiddlewares(app);
  setupRoutes(app);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = {
  startServer, 
  configureMiddlewares
};
