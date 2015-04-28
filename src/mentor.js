import { defaults } from "./utils";
import { GithubWebhook } from "./github/webhooks";
import { Pivotal } from "./pivotal";

var R = require("ramda");

export class Mentor {
  constructor(options) {
    this.options = this.defaults(options);
  }

  // normalize options
  defaults(options) {
    options = defaults({
      github: { path  : '/webhooks/github' },
      pivotal: {
        // required:
        // api_key   : api_key,
        // project_id: project_id
      },
      state: {
        issues      : 'unstarted',
        pull_request: 'unstarted'
      }
    }, options);

    if (!R.is(Number, options.pivotal.integration_id)) {
      options.pivotal.integration_id = parseInt(options.pivotal.integration_id);
    }

    this.github_webhook = new GithubWebhook(this.options.github);
    this.pivotal        = new Pivotal(this.options.pivotal);
    return options;
  }

  pullRequestOpened(payload) {
    var pull_request = payload.pull_request;
    var labels = this._parseIssueLabels('pull_request', payload);
    var description = [
      `[@${pull_request.user.login}](${pull_request.user.html_url}):`,
      `${pull_request.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${pull_request.number}](${pull_request.html_url})`,
    ].join('\n');

    var data = {
      name          : `#${pull_request.number} ${pull_request.title}`,
      external_id   : `${payload.repository.full_name}/pull/${pull_request.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "createStory", data ];
  }

  pullRequestClosed(payload) {
    var pull_request = payload.pull_request;
    var labels = this._parseIssueLabels('pull_request', payload);
    var description = [
      `[@${pull_request.user.login}](${pull_request.user.html_url}):`,
      `${pull_request.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${pull_request.number}](${pull_request.html_url})`,
    ].join('\n');
    var action = 'Closed';
    if (!!payload.pull_request.merged) { action = 'Merged'; }

    var data = {
      name          : `#${pull_request.number} ${pull_request.title}`,
      current_state : `delivered`,
      estimate      : 1,
      external_id   : `${payload.repository.full_name}/pull/${pull_request.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "updateStory", data ];
  }

  pullRequestReopened(payload) {
    var pull_request = payload.pull_request;
    var labels = this._parseIssueLabels('pull_request', payload);
    var description = [
      `[@${pull_request.user.login}](${pull_request.user.html_url}):`,
      `${pull_request.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${pull_request.number}](${pull_request.html_url})`,
    ].join('\n');
    var action = 'Closed';
    if (!!payload.pull_request.merged) { action = 'Merged'; }

    var data = {
      name          : `#${pull_request.number} ${pull_request.title}`,
      current_state : `unstarted`,
      estimate      : 1,
      external_id   : `${payload.repository.full_name}/pull/${pull_request.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "updateStory", data ];
  }

  issuesOpened(payload) {
    var issue = payload.issue;
    var labels = this._parseIssueLabels('issue', payload);
    var description = [
      `[@${issue.user.login}](${issue.user.html_url}):`,
      `${issue.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${issue.number}](${issue.html_url})`,
    ].join('\n');

    var data = {
      name          : `#${issue.number} ${issue.title}`,
      external_id   : `${payload.repository.full_name}/issues/${issue.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "createStory", data ];
  }

  issuesClosed(payload) {
    var issue = payload.issue;
    var labels = this._parseIssueLabels('issue', payload);
    var description = [
      `[@${issue.user.login}](${issue.user.html_url}):`,
      `${issue.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${issue.number}](${issue.html_url})`,
    ].join('\n');
    var action = 'Closed';
    if (!!payload.issue.merged) { action = 'Merged'; }

    var data = {
      name          : `#${issue.number} ${issue.title}`,
      current_state : `delivered`,
      estimate      : 1,
      external_id   : `${payload.repository.full_name}/issues/${issue.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "updateStory", data ];
  }

  issuesReopened(payload) {
    var issue = payload.issue;
    var labels = this._parseIssueLabels('issue', payload);
    var description = [
      `[@${issue.user.login}](${issue.user.html_url}):`,
      `${issue.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${issue.number}](${issue.html_url})`,
    ].join('\n');

    var data = {
      name          : `#${issue.number} ${issue.title}`,
      current_state : `unstarted`,
      estimate      : 1,
      external_id   : `${payload.repository.full_name}/issues/${issue.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    return [ "updateStory", data ];
  }

  issueCommentCreated(story_id, payload) {
    var comment = payload.comment;
    var issue   = payload.issue;

    var text = [
      `[@${issue.user.login}](${issue.user.html_url}):`,
      `${comment.body}`,
      ``,
      `-------------------`,
      `[${payload.repository.full_name}#${issue.number}-${comment.id}](${comment.html_url})`,
    ].join('\n');

    var data = {
      story_id  : story_id,
      project_id: `${this.options.pivotal.project_id}`,
      text
    };

    return [ "createComment", data ];
  }

  // TODO
  // Issues: assigned, unassigned, labeled or unlabeled.
  // Pull Requests: assigned, unassigned, labeled, unlabeled, or synchronized.
  // issuesLabeled(payload) {
  //   return [];
  // }

  _parseIssueLabels(kind, payload) {
    var labels      = [ kind, payload.repository.name ];
    if (payload && payload.hasOwnProperty(kind)) {
      var kind_labels = payload[kind].labels || [];
      if (payload[kind].state === 'closed') { labels = labels.concat(['closed']); }
      if (!!payload[kind].merged          ) { labels = labels.concat(['merged']); }
      labels = labels.concat(R.map((label) => label.name, kind_labels));
    }

    return R.uniq(labels);
  }

}
