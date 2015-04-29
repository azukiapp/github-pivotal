import { R, BPromise } from "../../utils";
import { Github } from "../../github";
import { Mentor } from "../../mentor";
import { Pivotal } from "../../pivotal";

export class GithubToPivotal {
  constructor(keys, options) {
    this.mentor  = new Mentor (options);
    this.pivotal = new Pivotal(keys.pivotal_api_key, this.mentor.options.pivotal);
    this.github  = new Github (keys.github_secret_key);
  }

  run(repositories) {
    if (R.isNil(repositories) && R.isEmpty(repositories)) {
      throw new Error(`\`repositories\` undefined or invalid: ${repositories}`);
    }

    return BPromise.coroutine(function* () {
      for (var i in repositories) {
        var repository = yield this.github.repoByUrl(repositories[i]);
        var params     = { state: 'open', per_page: '1' };
        var issues     = yield this.github.issuesWithCommentsByRepo(repository, params);
        var stories    = this.mentor.normalizeAllIssue(issues, repository);
        stories = yield this.pivotal.createStories(stories);

        // console.log(JSON.stringify(stories, null, 2));
        console.log('Success sent', stories.length, 'stories.');
      }
    }.bind(this))();
  }
}
