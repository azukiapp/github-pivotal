import h from './spec-helper';
import { camelize } from "../src/utils";
import { Mentor } from "../src/mentor";

var BPromise = require("bluebird");

describe('class Mentor', function() {
  var options = {
    github : { secret : process.env.GITHUB_SECRET_KEY },
    pivotal: {
      api_key       : process.env.PIVOTAL_API_KEY,
      project_id    : process.env.PIVOTAL_PROJECT_ID,
      integration_id: process.env.PIVOTAL_INTEGRATION_ID
    }
  };
  var mentor = new Mentor(options);

  it('should new pull_request story', function() {
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

  it('should new issue story', function() {
    return BPromise.coroutine(function* () {
      var event_name = "issues_opened";
      var payload    = yield h.mockPayload(event_name);

      var [action, data] = mentor[camelize(event_name)](payload);

      var description = [
        "[@gullitmiranda](https://github.com/gullitmiranda):",
        "teste issue comment",
        "",
        "-------------------",
        "[gullitmiranda/github-pivotal#1](https://github.com/" +
          "gullitmiranda/github-pivotal/issues/1)",
      ].join('\n');

      var project_id     = options.pivotal.project_id;
      var integration_id = parseInt(options.pivotal.integration_id);
      var labels         = [ 'issue', 'github-pivotal', 'bug', 'enhancement', 'question' ];

      h.expect(action).to.eql("createStory");
      h.expect(data.name          ).to.deep.equal("#1 teste issue");
      h.expect(data.external_id   ).to.deep.equal("gullitmiranda/github-pivotal/issues/1");
      h.expect(data.labels        ).to.deep.equal(labels);
      h.expect(data.project_id    ).to.deep.equal(project_id);
      h.expect(data.integration_id).to.deep.equal(integration_id);
      h.expect(data.description   ).to.deep.equal(description);
    })();
  });

  it('should new issue or pull_request comment', function() {
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
        "[gullitmiranda/github-pivotal#1-95806316](https://github.com/" +
          "gullitmiranda/github-pivotal/issues/1#issuecomment-95806316)",
      ].join('\n');

      var project_id     = options.pivotal.project_id;

      h.expect(action).to.eql("createComment");
      h.expect(data.story_id  ).to.deep.equal(story_id);
      h.expect(data.project_id).to.deep.equal(project_id);
      h.expect(data.text      ).to.deep.equal(description);
    })();
  });
});
