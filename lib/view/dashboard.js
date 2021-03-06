'use strict';

const O = require('ose')(module)
  .class('./index')
;

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
  this.startUpdate(cb);

  this.empty();
  this.on('removed', removed.bind(this));

  if (this.header) {
    this.header.h2('Dashboard');

    if (O.gw) {
      this.markHeader = markHeader.bind(null, this);
      markHeader(this, O.gw.isConnected());
      O.gw.on('connected', this.markHeader);
    }
  }

  if (O.ui.configuration.dashboard) {
    this.addContent(O.ui.configuration.dashboard);
  }

  if (O.ui.dashboard) {
    O.ui.dashboard(this, this.endUpdate.bind(this));
  } else {
    this.endUpdate();
  }
};

exports.addDemand = function(demand) {  // {{{2
/**
 * Adds an item defined by `demand` to the dashboard.
 *
 * @param caption {String} Text to be displayed
 * @param demand {Object} Demand that should be displayed when the user taps on this item
 *
 * @returns {Object} Added item
 *
 * @method addDemand
 */

  var that = this;
  return this.addItem(demand.caption, function() {
    that.parentBox().display(demand, 'user');
  });
};

exports.addContent = function(val) {  // {{{2
/**
 * Add multiple demands to the dashboard.
 *
 * @param val {Array} Array of items
 *
 * @method addContent
 */

  for (var i = 0; i < val.length; i++) {
    this.addDemand(val[i]);
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

  return this.li()
    .on('tap', onTap)
    .h3(caption)
  ;
};

exports.verifyDemand = function(val) {  // {{{2
  return val.view === 'dashboard';
};

// Private {{{1
function removed() {  // {{{2
  if (this.markHeader) {
    O.gw.removeListener('connected', this.markHeader);
  }
}

function markHeader(that, val) {
  if (that.header) {
    that.header.style('color', val ? 'white' : 'gray');
  }
}

