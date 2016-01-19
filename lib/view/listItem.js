'use strict';

const O = require('ose')(module)
  .class(C, './index')
;

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

function C(tag) {  // {{{2
/**
 * View constructor
 *
 * @copyParams ose-html5.lib.wrap/constructor
 *
 * @method constructor
 */

  O.super.call(this, 'li');
};

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'listItem') return false;

  if (val.layout && (this.so.layout !== val.layout)) return false;

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

  O.ui.display({content: {
    view: 'detail',
    ident: this.entry.identify(),
  }});

  return false;
};

exports.markHome = function(val) {  // {{{2
//  O.log.todo();
};

