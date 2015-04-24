import { defaults } from "./utils";
import { GithubWebhook } from "./github/webhooks";

var R     = require("ramda");
var http  = require("http");

class Server {
  constructor(port, options) {

    var self = this;
    console.log('options:', options);
    this.options = defaults({
      github: {
        path  : '/webhooks/github',
        // secret: process.env.GITHUB_SECRET_KEY
      }
    }, options);

    var github_webhook = new GithubWebhook(this.options.github);

    http.createServer(function (req, res) {

      github_webhook.handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
      })
    }).listen(port || 5000)

    github_webhook.handler.on('error', function (err) {
      console.error('Error:', err.message)
    })

    github_webhook.handler.on('push', function (event) {
      console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref)
    })

    github_webhook.handler.on('issues', function (event) {
      console.log('Received an issue event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title)
    });

    github_webhook.handler.on('issue_comment', function (event) {
      console.log('Received an issue_comment event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title)
      console.log('    %s', event.payload.issue.html_url)
    });
  }
}

module.exports = Server;
