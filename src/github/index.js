import { R, BPromise, log, chalk, promisifyAll } from '../utils';

var GithubApi = require("github");

class Github {
  constructor(api_key) {
    this.api_key = api_key;
    this.api = new GithubApi({
      version: '3.0.0',
      // debug: true
    });
    this.api.authenticate({
      type: "basic",
      username: 'gullitmiranda',
      password: api_key
    });

    this.client  = promisifyAll(this.api);
  }

  repoByUrl(url) {
    var params = this.parseUrl(url);
    log("Get repository data by url", chalk.green(url));

    return BPromise.coroutine(function* () {
      var repo = yield this.client.repos.getAsync(params);

      return repo;
    }.bind(this))();
  }

  issues(params) {
    var msg_arr = [
      "  Get issues (and pull_request) to repository",
      chalk.green(`${params.user}/${params.repo}`)
    ];
    if (params.state) { msg_arr.push("with state", params.state); }
    log(...msg_arr);

    return this.client.issues.repoIssuesAsync(params);
  }

  getCommentsByIssue(issue, params) {
    var params_with_issue = R.merge(params, { number: issue.number });
    log("    Get comments to issue", chalk.green(`#${issue.number}`), issue.title);

    return this.client.issues.getCommentsAsync(params_with_issue);
  }

  issuesWithCommentsByRepo(repo, params) {
    return BPromise.coroutine(function* () {
      var params_with_repo = R.merge({
          user: repo.owner.login,
          repo: repo.name
        }, params);
      var issues = yield this.issues(params_with_repo);

      for (var i = 0; i < issues.length; i++) {
        issues[i].comments = yield this.getCommentsByIssue(issues[i], params_with_repo);
      }
      return issues;
    }.bind(this))();
  }

  parseUrl(url) {
    var regex  = /^(?:.*\/)?([\w-_]*)\/([\w-_]*)$/g;
    var params = regex.exec(url);
    if (!params) {
      throw new Error(`Invalid url to parse: ${url}`);
    }
    return {
      user: params[1],
      repo: params[2]
    };
  }
}

module.exports = {
  __esModule: true,

  get default        () { return Github; },
  get Github         () { return Github; },
  get GithubToPivotal() { return require('./to/pivotal').GithubToPivotal; }
};
