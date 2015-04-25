var Utils = {
  // options
  verbose: true,

  // Helpers
  defaults: require('deep-extend'),

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
    if (!!this.verbose) {
      console.log(...args);
    }
  }
};

module.exports = Utils;
