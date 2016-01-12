'use strict';

var O = require('ose').class(module, C, './wrap');

/** Docs {{{1
 * @module html5
 */

/**
 * @caption Header
 *
 * @readme
 * Class handling displaying of header
 *
 * It is placed right in the `<body>` and contains the header.
 *
 * @class html5.lib.header
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
function C() {  // {{{2
/**
 * Header initialization
 *
 * @method init
 */

  O.super.call(this, 'header', 'main row');

  this.hook();

  this
    .button('char', 'menu', function(ev) {
      O.ui.drawer.show();
    })
    .span('', 'stretch')
    .button('char', 'menu', function(ev) {
      O.ui.localDrawer.show();
    })
  ;

//  document.body.appendChild(this.el);
};

exports.newHeader = function() {  // {{{2
/**
 * Create view header
 *
 * @returns {Object} Header element wrap
 *
 * @method newHeader
 */

  return this.find('span').tree('span');
};

// }}}1
