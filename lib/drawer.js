'use strict';

var O = require('ose').class(module, C, './wrap');

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
function C() {  // {{{2
/**
 * Drawer initialization
 *
 * @method init
 */

  O.super.call(this, 'section', 'drawer');

  this.hook();
  this.hide(true);

  this.append('header', 'drawer row')
    .button('left', 'Menu', function() {
      O.ui.globalDrawer.hide();
    })
  ;

  this.append('ul', 'navigation');

  document.body.appendChild(this.el);
};

exports.addLink = function(caption, name, onTap) {  // {{{2
/**
 * Append menu item to drawer
 *
 * @param caption {String} Text to display
 * @param name {Object} Name of menu item
 * @param onTap {Function} Handler for click event
 *
 * @method addLink
 */

  var that = this;

  return this.find('ul.navigation').li({tabindex: 0})
    .h3(caption)
    .on('click', function(ev) {
      that.stop(ev);
      onTap();
    })
  ;
};

exports.visible = function() {  // {{{2
/** TODO: Rename to isVisible
 * Tell whether the drawer is visible.
 *
 * @returns {Boolean} Visibility state
 *
 * @method visible
 */

  return ! this.hidden;
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

  O.inherited(this, 'show');
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

  O.inherited(this, 'hide');
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
