import h from './spec-helper';
import { camelize } from "../src/utils";
import { Mentor } from "../src/mentor";

var BPromise = require("bluebird");

describe('class Mentor', function() {
  var options = {
    pivotal: {
      project_id    : process.env.PIVOTAL_PROJECT_ID,
      integration_id: process.env.PIVOTAL_INTEGRATION_ID
    }
  };
  var mentor = new Mentor(options);

  describe('data received through api', function() {
    var repository;
    var should_comment = [
      "[@nuxlli](https://github.com/nuxlli):",
      "@fearenales, this a weird error once `azk shell` is parsing these options at:  " +
        "https://github.com/azukiapp/azk/blob/master/src%2Fcmds%2Fshell.js#L51-L53.\r",
      "\r",
      "A problem may be happening when merging options from command line with the ones in Azkfile.js " +
      "when building parameters to pass over to Docker: https://github.com/azukiapp/azk/blob/master/src%2F" +
      "system%2Findex.js#L491-L528",
      "",
      "-------------------",
      "[azukiapp/azk#378-97166767](https://github.com/" +
        "azukiapp/azk/issues/378#issuecomment-97166767)",
    ].join('\n');

    before(() => {
      return BPromise.coroutine(function* () {
        repository = yield h.mockPayload('repository');
      })();
    });

    it('should issue normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "issue";
        var issue = yield h.mockPayload(event_name);

        var story = mentor.normalizeIssue('issue', issue, repository);

        var description = [
          "[@synox](https://github.com/synox):",
          "my setup: digitalocean with ubuntu 14.04 64bit\r\n\r",
          "\tubuntu@ubuntu:~/azkdemo$ azk agent start --no-daemon\r",
          "\tazk: Wait, this process may take several minutes\r",
          "\tazk: Loading settings and checking dependencies.\r",
          "\tazk: Checking version...\r",
          "\tubuntu@ubuntu:~/azkdemo$ azk agent status\r",
          "\tazk: Agent is not running (try: `azk agent start`).\r\n\r",
          "\t$ service docker status\r",
          "\tdocker start/running, process 4058\r\n\r",
          "any clue?",
          "",
          "-------------------",
          "[azukiapp/azk#369](https://github.com/" +
            "azukiapp/azk/issues/369)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'issue', 'azk' ];

        h.expect(story.name          ).to.deep.equal("#369 azk agent does not start");
        h.expect(story.external_id   ).to.deep.equal("azukiapp/azk/issue/369");
        h.expect(story.labels        ).to.deep.equal(labels);
        h.expect(story.project_id    ).to.deep.equal(project_id);
        h.expect(story.integration_id).to.deep.equal(integration_id);
        h.expect(story.description   ).to.deep.equal(description);
      })();
    });

    it('should pull_request normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "pull_request_opened";
        var payload    = yield h.mockPayload(event_name);

        var story = mentor.normalizeIssue('pull', payload.pull_request, payload.repository);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#2](https://github.com/" +
            "azukiapp/github-pivotal/pull/2)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'pull_request', 'github-pivotal', 'enhancement' ];

        h.expect(story.name          ).to.deep.equal("#2 Adding `github-webhook-handler`");
        h.expect(story.external_id   ).to.deep.equal("azukiapp/github-pivotal/pull/2");
        h.expect(story.labels        ).to.deep.equal(labels);
        h.expect(story.project_id    ).to.deep.equal(project_id);
        h.expect(story.integration_id).to.deep.equal(integration_id);
        h.expect(story.description   ).to.deep.equal(description);
      })();
    });

    it('should issue with comments normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "issue_with_comment";
        var issue = yield h.mockPayload(event_name);

        var story = mentor.normalizeIssue('issue', issue, repository);

        h.expect(story.name    ).to.deep.equal("#378 [cli] azk shell --mount option isn't working");
        h.expect(story.comments).to.have.length(1);
        h.expect(story.comments[0].text).to.deep.equal(should_comment);
      })();
    });

    it('should normalized comment', function() {
      return BPromise.coroutine(function* () {
        var event_name = "comment";
        var comment    = yield h.mockPayload(event_name);
        var issue      = yield h.mockPayload('issue_with_comment');

        var data = mentor.normalizeComment(comment, issue, repository);

        h.expect(data).to.deep.equal(should_comment);
      })();
    });
  });

  describe('data received through webhook', function() {
    it('should new pull_request normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "pull_request_opened";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#2](https://github.com/" +
            "azukiapp/github-pivotal/pull/2)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'pull_request', 'github-pivotal', 'enhancement' ];

        h.expect(action).to.eql("createStory");
        h.expect(data.name          ).to.deep.equal("#2 Adding `github-webhook-handler`");
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/pull/2");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should closed pull_request normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "pull_request_closed";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "Reverts azukiapp/github-pivotal#2",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#5](https://github.com/" +
            "azukiapp/github-pivotal/pull/5)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'pull_request', 'github-pivotal', 'closed' ];

        h.expect(action).to.eql("updateStory");
        h.expect(data.name          ).to.deep.equal("#5 Revert \"Adding `github-webhook-handler`\"");
        h.expect(data.current_state ).to.deep.equal('delivered');
        h.expect(data.estimate      ).to.deep.equal(1);
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/pull/5");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should merged pull_request normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "pull_request_closed";
        var payload    = yield h.mockPayload("pull_request_merged");

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "change description",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#2](https://github.com/" +
            "azukiapp/github-pivotal/pull/2)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'pull_request', 'github-pivotal', 'closed', 'merged' ];

        h.expect(action).to.eql("updateStory");
        h.expect(data.name          ).to.deep.equal("#2 Adding `github-webhook-handler`");
        h.expect(data.current_state ).to.deep.equal('delivered');
        h.expect(data.estimate      ).to.deep.equal(1);
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/pull/2");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should reopened pull_request normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "pull_request_reopened";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "Reverts azukiapp/github-pivotal#2",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#5](https://github.com/" +
            "azukiapp/github-pivotal/pull/5)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'pull_request', 'github-pivotal' ];

        h.expect(action).to.eql("updateStory");
        h.expect(data.name          ).to.deep.equal("#5 Revert \"Adding `github-webhook-handler`\"");
        h.expect(data.current_state ).to.deep.equal('unstarted');
        h.expect(data.estimate      ).to.deep.equal(1);
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/pull/5");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should new issue normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "issues_opened";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "teste issue comment",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#1](https://github.com/" +
            "azukiapp/github-pivotal/issues/1)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'issue', 'github-pivotal', 'bug', 'enhancement', 'question' ];

        h.expect(action).to.eql("createStory");
        h.expect(data.name          ).to.deep.equal("#1 teste issue");
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/issues/1");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should closed issue normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "issues_closed";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          ["Change comment description.",
            "-----",
            "Comment now contains upload.",
            "",
            "![image](https://cloud.githubusercontent.com/assets/2034678/7328367/" +
              "65a9d968-eaab-11e4-88fb-49267eada932.png)", "\n"
           ].join("\r\n"),
          "-------------------",
          "[azukiapp/github-pivotal#1](https://github.com/" +
            "azukiapp/github-pivotal/issues/1)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'issue', 'github-pivotal', 'closed' ];

        h.expect(action).to.eql("updateStory");
        h.expect(data.name          ).to.deep.equal("#1 teste issue");
        h.expect(data.current_state ).to.deep.equal('delivered');
        h.expect(data.estimate      ).to.deep.equal(1);
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/issues/1");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should reopened issue normalized to story', function() {
      return BPromise.coroutine(function* () {
        var event_name = "issues_reopened";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          ["Change comment description.",
            "-----",
            "Comment now contains upload.",
            "",
            "![image](https://cloud.githubusercontent.com/assets/2034678/7328367/" +
              "65a9d968-eaab-11e4-88fb-49267eada932.png)", "\n"
           ].join("\r\n"),
          "-------------------",
          "[azukiapp/github-pivotal#1](https://github.com/" +
            "azukiapp/github-pivotal/issues/1)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;
        var integration_id = parseInt(options.pivotal.integration_id);
        var labels         = [ 'issue', 'github-pivotal' ];

        h.expect(action).to.eql("updateStory");
        h.expect(data.name          ).to.deep.equal("#1 teste issue");
        h.expect(data.current_state ).to.deep.equal('unstarted');
        h.expect(data.estimate      ).to.deep.equal(1);
        h.expect(data.external_id   ).to.deep.equal("azukiapp/github-pivotal/issues/1");
        h.expect(data.labels        ).to.deep.equal(labels);
        h.expect(data.project_id    ).to.deep.equal(project_id);
        h.expect(data.integration_id).to.deep.equal(integration_id);
        h.expect(data.description   ).to.deep.equal(description);
      })();
    });

    it('should new issue or pull_request comment normalized to story', function() {
      return BPromise.coroutine(function* () {
        var story_id   = 1;
        var event_name = "issue_comment_created";
        var payload    = yield h.mockPayload(event_name);

        var [action, data] = mentor[camelize(event_name)](story_id, payload);

        var description = [
          "[@gullitmiranda](https://github.com/gullitmiranda):",
          "teste",
          "",
          "-------------------",
          "[azukiapp/github-pivotal#1-95806316](https://github.com/" +
            "azukiapp/github-pivotal/issues/1#issuecomment-95806316)",
        ].join('\n');

        var project_id     = options.pivotal.project_id;

        h.expect(action).to.eql("createComment");
        h.expect(data.story_id  ).to.deep.equal(story_id);
        h.expect(data.project_id).to.deep.equal(project_id);
        h.expect(data.text      ).to.deep.equal(description);
      })();
    });
  });
});
