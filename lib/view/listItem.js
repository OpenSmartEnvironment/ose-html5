'use strict';

var O = require('ose').class(module, C, './index');

var Detail = require('./detail');

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption Entry list item view
 *
 * @readme
 * View for displaying a list item
 *
 * @class html5.lib.view.listItem
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
exports.layout = 'listItem';
exports.loadData = Detail.loadData;
exports.setEntry = Detail.setEntry;
exports.post = Detail.post;
exports.removed = Detail.removed;
exports.socketError = Detail.socketError;

function C(tag) {  // {{{2
/**
 * View constructor
 *
 * @copyParams ose-html5.lib.wrap/constructor
 *
 * @method constructor
 */

  O.super.call(this, 'li');

  this.on('removed', Detail.removed.bind(this));
};

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'listItem') return false;

  if (val.layout && (this.stateObj.layout !== val.layout)) return false;

  return this.entry.isIdentified(val.ident);
};

exports.displayLayout = function() {  // {{{2
  this
    .empty()
    .append('h3').text(this.entry.getCaption())
    .on('click', this.tapItem.bind(this))
  ;
};

exports.tapItem = function(ev) {  // {{{2
/**
 * Called when user taps on a list item
 *
 * @prop ev {Object} Tap event object
 *
 * @method tapItem
 */

  O.ui.display({content: {
    view: 'detail',
    ident: this.entry.identify(),
  }});

  this.stop(ev);
};

exports.markHome = function(val) {  // {{{2
//  O.log.todo();
};

// }}}1
