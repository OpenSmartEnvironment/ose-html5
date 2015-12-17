'use strict';

var O = require('ose').class(module, './index');

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption Dashboard view
 *
 * @readme
 * View for creating dashboard content.
 *
 * @class html5.lib.view.dashboard
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
exports.loadData = function(cb) {  // {{{2
  if (cb) {
    this.doAfterDisplay = cb;
  }

  this.header.h2('Dashboard');

  this.empty();

  if (O.ui.configData.dashboard) {
    this.addContent(O.ui.configData.dashboard);
  }

  if (O.ui.dashboard) {
    O.ui.dashboard(this, this.afterDisplay.bind(this));
  } else {
    this.afterDisplay();
  }

  this.on('keypress', onKeypress.bind(this));
};

exports.addStateObj = function(so) {  // {{{2
/**
 * Adds an item defined by `so` to the dashboard.
 *
 * @param caption {String} Text to be displayed
 * @param so {Object} State object that should be displayed when the user taps on this item
 *
 * @returns {Object} Added item
 *
 * @method addStateObj
 */

  return this.addItem(so.caption, O.ui.bindContent(so));
};

exports.addContent = function(val) {  // {{{2
/**
 * Add multiple [State objects] to the dashboard.
 *
 * @param val {Array} Array of items
 *
 * @method addContent
 */

  for (var i = 0; i < val.length; i++) {
    this.addStateObj(val[i]);
  }
};

exports.addItem = function(caption, onTap) {  // {{{2
/**
 * Add an item to the dashboard.
 *
 * @param caption {String} Text to be displayed
 * @param onTap {Function} Function to be called when the user taps on this item
 *
 * @returns {Object} [Element wrapper] of added item
 *
 * @method additem
 */

  return this.li({tabindex: 0})
    .on('click', onTap)
    .h3(caption)
  ;
};

exports.verifyStateObj = function(val) {  // {{{2
  return val.view === 'dashboard';
};

// }}}1
// Event handlers {{{1
function onKeypress(ev) {  // {{{2
  switch (ev.keyCode) {
  case 13:  // ENTER
    var el = document.activeElement;
    console.log('KEYPRESS', ev.keyCode, ev, el);
    if (el && el.tagName === 'LI') {
      el.click();
      this.stop(ev);
    }
    break;
  }
}

// }}}1
