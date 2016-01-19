'use strict';

const O = require('ose')(module);

// Public {{{1
exports.config = function(name, val, deps) {  // {{{2
  if (val.init) {
    require(val.init)(deps);
  }

  var that = this;
  deps.add({after: 'finish'}, function(cb) {
    cb();

    O.async.setImmediate(function() {
      require('./body').run(val);
//      that.run();
    });
  });
};

