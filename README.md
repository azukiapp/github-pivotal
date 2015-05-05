# github-pivotal

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

#### Add webhooks of new repository

- Get secret to configure in Github :

    ```
    $ heroku config:get GITHUB_SECRET_KEY
    ```

- Configure repository to send webhooks to app:

    1. Access `Settings > Webhooks & Services` of your repository and click in `Add Webhook`:

        i.g.: https://github.com/azukiapp/github-pivotal/settings/hooks/new (change `github-pivotal` with name of your project).

    2. And fill out the form with your information, including `GITHUB_SECRET_KEY` you took the heroku and save:

       ![Add Webhook](https://raw.githubusercontent.com/azukiapp/github-pivotal/master/docs/add_webhook.jpg)


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

## dev

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
