#!/usr/bin/env node
require('source-map-support').install();

require('dotenv').load({ silent: true });

var Server = require('./lib/src/server.js');

(new Server(process.env.HTTP_PORT, {
  github: {
    secret: process.env.GITHUB_SECRET_KEY
  }
}));
