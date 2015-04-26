#!/usr/bin/env node
require('source-map-support').install();

require('dotenv').load({ silent: true });

var Server = require('./lib/src/server.js');

(new Server(process.env.HTTP_PORT, {
  github : { secret : process.env.GITHUB_SECRET_KEY },
  pivotal: {
    api_key       : process.env.PIVOTAL_API_KEY,
    project_id    : process.env.PIVOTAL_PROJECT_ID,
    integration_id: process.env.PIVOTAL_INTEGRATION_ID
  }
}));
