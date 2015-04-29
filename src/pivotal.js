import { log } from "./utils";

// Dependencies
var R         = require('ramda');
var BPromise  = require("bluebird");
var PivotalJs = require('pivotaljs');

// Log
var chalk = require('chalk');

class PivotalTracker extends PivotalJs {
  getStories(projectId, callback) {
    this.api('get', 'projects/' + projectId + '/stories', {}, callback);
  }

  deleteStory(projectId, storyId, callback) {
    this.api('delete', 'projects/' + projectId + '/stories/' + storyId, {}, callback);
  }

  search(projectId, query, callback) {
    var url = 'projects/' + projectId + '/search?query=' + query;
    this.api('get', url, {}, callback);
  }

  // Promised
  createComment(projectId, storyId, params) {
    var url = 'projects/' + projectId + '/stories/' + storyId + '/comments';
    return this.apiAsync('post', url, { body: params });
  }
}

export class Pivotal {
  constructor(api_key, options) {
    options = options || {};

    if (R.isNil(api_key) || R.isEmpty(api_key)) {
      throw new Error('`api_key` is required');
    }

    this.client      = BPromise.promisifyAll(new PivotalTracker(api_key));
    this.project_id  = options.project_id;
    this.max_retries = 3;
  }

  searchByExternalId(external_id) {
    var query = encodeURIComponent(`external_id:"${external_id}"`);
    return BPromise.coroutine(function* () {
      return yield this.client.searchAsync(this.project_id, query)
        .then((result) => {
          var stories = result && result.stories && result.stories.stories;
          if (!R.isNil(stories) && !R.isEmpty(stories)) {
            return R.head(stories);
          } else {
            console.error(`No find story with query:`, { external_id: external_id });
            console.error('  ', result);
          }
        });
    }.bind(this))();
  }

  createStory(story) {
    return BPromise.coroutine(function* () {
      var msg = "Push to project " + chalk.green(story.project_id) + " story ";
      msg += chalk.green(story.name);
      log(msg);

      var result = yield this.client.createStoryAsync(story.project_id, story);

      if (result.kind === 'error') {
        console.error('Error:', result);
        log(JSON.stringify(story));
      } else {
        log(`  ${chalk.green("Success")}: ${result.url}\n`);
      }

      return result;
    }.bind(this))();
  }

  createStories(stories) {
    return BPromise.coroutine(function* () {
      log("Push", chalk.green(stories.length), "stories");
      var result_stories = [];
      var to_send;

      var retries = 0;

      do {
        to_send = [];

        for (var i = 0; i < stories.length; i++) {
          var result = yield this.createStory(stories[i]);
          if (result.kind === 'error') {
            to_send.push(stories[i]);
          } else {
            result_stories.push(result);
          }
        }

        stories = to_send;
        retries++;
      } while (!R.isEmpty(to_send) && this.max_retries < retries);

      return result_stories;
    }.bind(this))();
  }

  updateStory(story) {
    return BPromise.coroutine(function* () {
      var msg = "Update to project " + chalk.green(story.project_id) + " story ";
      msg += chalk.green(story.name);
      log(msg);
      var project_id = story.project_id;

      delete(story.project_id);
      story = yield this.client.updateStoryAsync(project_id, story.id, story);

      if (story.kind === 'error') {
        console.error('Error:', story);
      } else {
        log(`  ${chalk.green("Success")}: ${story.url}\n`);
      }

      return story;
    }.bind(this))();
  }

  createComment(comment, story) {
    return BPromise.coroutine(function* () {
      var msg = "Create comment to project " + chalk.green(comment.project_id) + " story ";
      msg += chalk.green(story.name);
      log(msg);

      comment = yield this.client.createComment(story.project_id, story.id, comment);

      if (comment.kind === 'error') {
        console.error('Error:', comment);
      } else {
        log(`  ${chalk.green("Success")}: ${story.url}\n`);
      }

      return comment;
    }.bind(this))();
  }

  deleteAllStories() {
    return BPromise.coroutine(function* () {
      var project_id = project_id || this.project_id;
      log("Clean all tasks from project", chalk.green(project_id));

      var stories = yield this.client.getStoriesAsync(project_id)
        .then((stories) => {
          return stories;
        });

      if (!stories.code) {
        for (var ix in stories) {
          var story = stories[ix];
          log("  Remove task", chalk.green(story.id), "-", chalk.green(story.name));
          yield this.client.deleteStoryAsync(project_id, story.id);
        }
      } else {
        log("  No tasks to remove!");
      }
    }.bind(this))();
  }
}
