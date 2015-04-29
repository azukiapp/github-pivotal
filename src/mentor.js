import { defaults } from "./utils";

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
        issue       : 'unstarted',
        pull_request: 'unstarted'
      }
    }, options);

    if (!R.is(Number, options.pivotal.integration_id)) {
      options.pivotal.integration_id = parseInt(options.pivotal.integration_id);
    }
    return options;
  }

  pullRequestOpened(payload) {
    var data = this.normalizeIssue('pull', payload.pull_request, payload.repository);
    return [ "createStory", data ];
  }

  pullRequestClosed(payload) {
    var data = this.normalizeIssue('pull', payload.pull_request, payload.repository);
    return [ "updateStory", data ];
  }

  pullRequestReopened(payload) {
    var data = this.normalizeIssue('pull', payload.pull_request, payload.repository, {
      current_state : `unstarted`,
      estimate      : 1,
    });
    return [ "updateStory", data ];
  }

  issuesOpened(payload) {
    var data = this.normalizeIssue('issues', payload.issue, payload.repository);
    return [ "createStory", data ];
  }

  issuesClosed(payload) {
    var data = this.normalizeIssue('issues', payload.issue, payload.repository);
    return [ "updateStory", data ];
  }

  issuesReopened(payload) {
    var data = this.normalizeIssue('issues', payload.issue, payload.repository, {
      current_state : `unstarted`,
      estimate      : 1,
    });
    return [ "updateStory", data ];
  }

  issueCommentCreated(story_id, payload) {
    var comment = payload.comment;
    var issue   = payload.issue;
    var repo    = payload.repository;

    var text = this.normalizeComment(comment, issue, repo);

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

  normalizeIssue(kind, issue, repo, append) {
    var kind_full = (kind === 'pull') ? 'pull_request' : 'issue';

    var labels = [ 'github', kind_full, repo.name ].concat(this._parseIssueLabels(issue));

    var description = [
      `[@${issue.user.login}](${issue.user.html_url}):`,
      `${issue.body}`,
      ``,
      `-------------------`,
      `[${repo.full_name}#${issue.number}](${issue.html_url})`,
    ].join('\n');

    var story = {
      name          : `#${issue.number} ${issue.title}`,
      external_id   : `${repo.full_name}/${kind}/${issue.number}`,
      project_id    : `${this.options.pivotal.project_id}`,
      integration_id: parseInt(this.options.pivotal.integration_id),
      labels,
      description
    };

    if (issue.state === 'closed') {
      story.current_state = `delivered`;
      story.estimate      = 1;
    } else if (!R.isNil(this.options.state[kind_full])) {
      story.current_state = this.options.state[kind_full];
    }
    if (!R.isNil(append) && R.is(Object, append)) {
      story = R.merge(story, append);
    }

    if (issue.comments && R.is(Array, issue.comments)) {
      story.comments = this.normalizeAllComments(issue.comments, issue, repo);
    }

    return story;
  }

  normalizeComment(comment, issue, repo) {
    var text = [
      `[@${comment.user.login}](${comment.user.html_url}):`,
      `${comment.body}`,
      ``,
      `-------------------`,
      `[${repo.full_name}#${issue.number}-${comment.id}](${comment.html_url})`,
    ].join('\n');

    return text;
  }

  normalizeAllIssue(issues, repo) {
    var stories = [];
    for (var i = 0; i < issues.length; i++) {
      var kind  = !!issues[i].pull_request ? 'pull' : 'issues';
      var story = this.normalizeIssue(kind, issues[i], repo);
      stories.push(story);
    }
    return stories;
  }

  normalizeAllComments(comments, issue, repo) {
    var story_comments = [];
    for (var i = 0; i < comments.length; i++) {
      var comment = {
        text: this.normalizeComment(comments[i], issue, repo)
      };
      story_comments.push(comment);
    }
    return story_comments;
  }

  _parseIssueLabels(issue) {
    var labels = [];
    if (  issue.state === 'closed') { labels = labels.concat(['closed']); }
    if (!!issue.merged            ) { labels = labels.concat(['merged']); }
    labels = labels.concat(R.map((label) => label.name, issue.labels || []));

    return R.uniq(labels);
  }
}
