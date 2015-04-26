require('source-map-support').install();

var path     = require("path");
var BPromise = require("bluebird");
var fs       = BPromise.promisifyAll(require("fs"));

var Helpers = {
  expect : require('azk-dev/chai').expect,

  fixture_path(...fixture) {
    return path.resolve(
      '.', 'spec', 'fixtures', ...fixture
    );
  },

  mockPayload(event) {
    return BPromise.coroutine(function* () {
      var filepath = Helpers.fixture_path('github', `${event}.json`);

      return yield fs.readFileAsync(filepath)
        .then(function (data) {
          return JSON.parse(data.toString());
        });
    })();
  }
};

export default Helpers;
