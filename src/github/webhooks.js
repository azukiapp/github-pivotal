var GithubHandler = require('github-webhook-handler');

export class GithubWebhook {
  constructor(options) {
    this.handler = GithubHandler(options);
  }
}
