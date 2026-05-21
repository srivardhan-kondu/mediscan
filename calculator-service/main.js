"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { arithmeticRouter } = require('./routes/arithmetic');
const { authRouter } = require('./routes/auth');

/**
 * Configures HTTP routes for the application.
 * @param {Object} app - The express application instance.
 */
function configureRoutes(app) {
    app.use(bodyParser.json());
    app.use(cookieParser());

    // Mount routers
    app.use('/api/arithmetic', arithmeticRouter);
    app.use('/api/auth', authRouter);
}

/**
 * Starts the HTTP server.
 * @param {number} port - The port number on which the server will listen.
 */
function startServer(port) {
    const app = express();
    configureRoutes(app);

    // Generic error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send({ error: 'Internal Server Error' });
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = {
    startServer,
    configureRoutes
};
