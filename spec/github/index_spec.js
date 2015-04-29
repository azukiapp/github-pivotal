import h from '../spec-helper';
import Github from "../../src/github";
import { BPromise } from '../../src/utils';

describe('class Github', function() {
  var github_key  = process.env.GITHUB_SECRET_KEY;

  var repos = ['azukiapp/azk', 'azukiapp/homebrew-azk'];
  var github = new Github(github_key);

  describe('should parsed url of repository', function() {
    it('with short url', function () {
      var url    = `azukiapp/homebrew-azk`;
      var params = github.parseUrl(url);
      h.expect(params).to.have.deep.property('user', 'azukiapp');
      h.expect(params).to.have.deep.property('repo', 'homebrew-azk');
    })
  });

});
