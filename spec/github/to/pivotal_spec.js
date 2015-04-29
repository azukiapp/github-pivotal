import h from '../../spec-helper';
import { GithubToPivotal } from "../../../src/github";
import { BPromise } from '../../../src/utils';

describe('class GithubToPivotal', function() {
  var keys = {
    github_secret_key: process.env.GITHUB_SECRET_KEY,
    pivotal_api_key  : process.env.PIVOTAL_API_KEY
  };
  var options = {
    pivotal: {
      project_id    : process.env.PIVOTAL_PROJECT_ID,
      integration_id: process.env.PIVOTAL_INTEGRATION_ID
    }
  };

  var repositories = ['azukiapp/azk', 'azukiapp/homebrew-azk'];
  var githubToPivotal = new GithubToPivotal(keys, options);

  // it('call run', function () {
  //   return BPromise.coroutine(function* () {
  //     this.timeout(0);
  //     yield githubToPivotal.run(repositories);
  //   }.bind(this))();
  // })

});
