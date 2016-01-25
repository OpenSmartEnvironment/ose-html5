'use strict';

const O = require('ose')(module)
  .class(init, './detail')
;

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

function init(tag) {  // {{{2
/**
 * View constructor
 *
 * @copyParams ose-html5.lib.wrap/constructor
 *
 * @method constructor
 */

  O.inherited(this)('li');
};

exports.verifyDemand = function(val) {  // {{{2
  if (val.view !== 'listItem') return false;

  if (val.layout && (this.demand.layout !== val.layout)) return false;

  return this.entry.isIdentified(val.ident);
};

exports.display = function() {  // {{{2
  this
    .empty()
    .h3(this.entry.getCaption())
    .on('tap', this.tapItem.bind(this))
  ;

  this.displayLayout && this.displayLayout();

  this.endUpdate();
};

exports.patch = function() {  // {{{2
//  O.log.todo();
};

exports.tapItem = function(ev) {  // {{{2
/**
 * Called when user taps on a list item
 *
 * @prop ev {Object} Tap event object
 *
 * @method tapItem
 */

  this.parentBox().display({
    view: 'detail',
    ident: this.entry.getIdent(),
  }, 'user');

  return false;
};

exports.markHome = function(val) {  // {{{2
//  O.log.todo();
};

