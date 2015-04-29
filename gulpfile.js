var args     = require('yargs').argv;
var shell    = require('gulp-shell')
var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  lint: [ "bin/**/*.js" ], // Extra files for the lint analyzer
});

var gulp = azk_gulp.gulp;

gulp.task(
  'github:pivotal',
  'Get Github repositories data and send to Pivotal ' +
    '(i.g.: `gulp github:pivotal --repos=azukiapp/azk,azukiapp/homebrew-azk`',
  function() {
    var repos = (!!args.repos) ? args.repos.replace(',', ' ') : '';
    var bin_path = 'bin/github_pivotal';
    var command  = [bin_path, repos].join(' ');

    return gulp.src(bin_path, { read: false })
      .pipe(shell(command));
  }
);
