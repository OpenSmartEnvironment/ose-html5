'use strict';

const O = require('ose')(module)
  .class(init, './wrap')
;

/** Docs {{{1
 * @module html5
 */

/**
 * @caption Drawer
 *
 * @readme
 * Class handling displaying of drawer.
 *
 * It is placed right in the `<body>` and contains the drawer.
 *
 * @class html5.lib.drawer
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
function init() {  // {{{2
/**
 * Drawer initialization
 *
 * @method init
 */

  O.inherited(this)('section', 'drawer');

  this.hook();
  this.hide(true);

  this.tree('header', 'drawer row')
    .button('char', 'left', this.hide.bind(this, false));
  ;

  this.stub('ul', 'navigation');
};

exports.addLink = function(caption, name, onTap) {  // {{{2
/**
 * Append menu item to drawer
 *
 * @param caption {String} Text to display
 * @param name {Object} Name of menu item
 * @param onTap {Function} Handler for tap event
 *
 * @method addLink
 */

  var that = this;

  return this.find('ul.navigation').li()
    .on('tap', function(ev) {
      onTap();
      return false;
    })
    .h3(caption)
  ;
};

exports.show = function() {  // {{{2
/**
 * Show drawer
 *
 * @method show
 */

  this.hidden = false;

  O.ui.newHistory();
  O.ui.updateHistory();

  O.inherited(this, 'show')();
};

exports.hide = function(noBack) {  // {{{2
/**
 * Hide drawer
 *
 * @param noBack {Boolean} If true, do not revert history state.
 *
 * @method hide
 */

  if (! (this.hidden || noBack)) {
    window.history.back();
  }

  this.hidden = true;

  O.inherited(this, 'hide')();
};

exports.toggle = function() {  // {{{2
/**
 * Show or hide the drawer
 *
 * @method toggle
 */

  if (this.hidden) {
    this.show();
  } else {
    this.hide();
  }
};

// }}}1
