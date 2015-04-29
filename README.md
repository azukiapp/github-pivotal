# github-pivotal

`azk-projects-boilerplate` follow `azk` standards to create new npm packages.
Search for `azk-projects-boilerplate` to find what have to be changed before upload.

- **src**:  all files will transpiled with babel to lib/src
- **spec**: all files will transpiled with babel to lib/spec
- **bin**:  no ocours transpilation here

#### Migrate repository:

- Change the target project in the pivotal:

    ```
    # local (.env file)
    PIVOTAL_PROJECT_ID=0000
    PIVOTAL_INTEGRATION_ID=0000

    # in Heroku
    heroku config:set PIVOTAL_PROJECT_ID=0000 PIVOTAL_INTEGRATION_ID=0000
    ```

- Run script to make migration:

    ```
    heroku run 'bin/github_pivotal azukiapp/azk --states="{ issue: 'unscheduled', pull_request: 'unscheduled' }"'
    ```

    NOTE: changge `azukiapp/azk` to your repository

#### Before start development

- Reset git:

    ```shell
    $ rm -rf .git
    $ git init
    ```

- Install/Update dependencies:

    ```shell
    $ npm install --save-dev azk-dev
    $ gulp editor:config
    $ gulp babel:runtime:install
    $ npm install
    ```

- Commit

    ```shell
    $ git add .
    $ git commit -m 'Start the project based on the `azk-projects-boilerplate`.'
    ```

## azk-dev

Show all gulp tasks:

```shell
$ gulp help
```

#### Tests

```shell
# default (lint + test, no watch)
$ gulp lint test

# test + lint + watch
$ gulp watch:lint:test

# test + watch (no-lint)
$ gulp watch:test
```


#### Deploy npm package

You can deploy package with:

```shell
$ npm run deploy [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

This should run the following steps:

  - Check if not tracked commits in git
  - Run tests with `npm test`
  - Upgrade version in `package.json`, commit and add tag
  - Publish package in npmjs.com
