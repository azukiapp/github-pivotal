var Utils = {
  __esModule: true,
  get default () { return Utils },

  // options
  verbose: true,

  // Helpers
  get R       () { return require("ramda"); },
  get BPromise() { return require("bluebird"); },
  get defaults() { return require('deep-extend'); },
  get chalk   () { return require('chalk'); },
  get path    () { return require('path'); },
  get fs      () { return Utils.BPromise.promisifyAll(require('fs')); },
  get argv    () { return require('yargs').argv },
  get args    () { return Utils.argv },

  promisifyAll(obj, options, depth) {
    depth = depth || 1;
    options = Utils.R.merge({
      depth: 2
    }, options);

    obj = Utils.R.mapObjIndexed((value, key, _obj) => {
      if (depth < options.depth) {
        value = Utils.promisifyAll(value, options, depth + 1);
      }
      return value;
    }, obj);

    if (depth <= options.depth) {
      obj = Utils.BPromise.promisifyAll(obj, options);
    }

    return obj;
  },

  camelize(str, first_low = true) {
    str = str.replace(/(?:[-_ ])(\w)/g, (_, c) => {
      return c ? c.toUpperCase() : '';
    });

    if (first_low) {
      str = str.replace(/(?:^[A-Z])/g, (c) => { return c.toLowerCase(); });
    }
    return str;
  },

  log: function(...args) {
    if (!!Utils.verbose) {
      console.log(...args);
    }
  }
};

module.exports = Utils;
