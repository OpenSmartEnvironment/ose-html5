'use strict';

const O = require('ose')(module)
  .singleton('./wrap')
;

exports = O.init(document.head).hook();

exports.loadCss = function(filename) {
  return this.tree('link', {
    rel: 'stylesheet',
    type: 'text/css',
    href: filename,
  });
};

exports.loadJs = function(filename) {
  return this.tree('script', {
    rel: 'stylesheet',
    type: 'text/javascript',
    src: filename,
  });
};

