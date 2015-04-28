import { R } from '../utils';

var GithubHandler = require('github-webhook-handler');

export class GithubWebhook {
  constructor(api_secret, options) {
    options = R.merge({
      secret: api_secret
    }, options);

    this.handler = GithubHandler(options);
  }
}
