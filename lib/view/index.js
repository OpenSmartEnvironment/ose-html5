'use strict';

var O = require('ose').class(module, C, '../wrap');

/** Docs {{{1
 * @caption Views
 *
 * @readme
 * A view is a part of a page.
 *
 * Each view is a descendant of the [Element wrapper class]. There
 * are several types of views (see `lib/view` directory). TODO:
 * Insert link

 * The dashboard view defines the dashboard of the application.
 * The two other basic views are the detail view (displays the
 * detail of one entry) and the list view (displays a list of
 * entries).
 *
 * Each [entry kind] can define own UI layout and behaviour for any
 * view type displaying entry in an individual file.
 *
 * Views can contain other views.
 *
 * @module html5
 * @submodule html5.view
 * @main html5.view
 */

/**
 * @caption View class
 *
 * @readme
 * Not every view is necessarily a descendant of this class. Some
 * are direct descendants of the [Element wrapper class].
 *
 * @class html5.lib.view
 * @type class
 * @extends html5.lib.wrap
 */

/**
 * Each View descendant should define a `loadData` method. This
 * method should be called by the code creating the view and should
 * ensure that data displayed by the view are loaded.
 *
 * @param [cb] {Function} Callback to be called after view is displayed
 *
 * @method loadData
 * @abstract
 */

/* TODO: Implement search functionality
 * Views can define an `onSearch` method, which gets called when
 * the user performs a search. The searchbox is not displayed if there
 * is no `onSearch` method on the active view.
 *
 * @param value {String} Search string
 *
 * @method onSearch
 * @abstract
 */

/**
 * Each View descendant should define a "verifyStateObj"
 * method. This method compares the supplied state object with the
 * currently displayed one.
 *
 * @param data {Object} State object to be compared
 *
 * @returns {Boolean} Whether data correspond to the displayed view
 *
 * @method verifyStateObj
 * @abstract
 */

/**
 * Defines the layout which extends this view. Layouts are defined
 * in modules located in the "html5" subdirectory of the entry kind
 * directory.
 *
 * @property layout
 * @type String
 * @abstract
 */

// Public {{{1
function C(tag, attrs) {  // {{{2
/**
 * View constructor
 *
 * @copyParams ose-html5.lib.wrap/constructor
 *
 * @method constructor
 */

  O.super.call(this, tag || 'ul', attrs);

  this.hook();

  this.text('Loading ...');
  this.on('removed', removed.bind(this));
};

exports.show = function() {  // {{{2
  this.header && this.header.show();

  return O.super.prototype.show.call(this);
};

exports.hide = function() {  // {{{2
  this.header && this.header.hide();

  return O.super.prototype.hide.call(this);
};

exports.afterDisplay = function(err) {  // {{{2
/**
 * Is called after a view is displayed.
 *
 * The function creating a view receives a callback as one of its
 * parameters. This callback is assigned to
 * "this.doAfterDisplay". This method ensures that
 * "this.doAfterDisplay" is called only once.
 *
 * @param [err] {Object} Error
 *
 * @returns {Boolean} Whether "this.doAfterDisplay" has run.
 *
 * @method afterDisplay
 */

//  console.log('VIEW AFTER DISPLAY', typeof this.doAfterDisplay, arguments);

  if (this.doAfterDisplay) {
    this.doAfterDisplay(err);

    delete this.doAfterDisplay;

    return true;
  }

  if (err) {
    O.log.error(err);
  }

  return false;
};

exports.extend = function(obj) {  // {{{2
/**
 *
 * @param obj {Object} Layout to extend `this` object
 *
 * @method extend
 */

  if (! obj || typeof obj.getLayout !== 'function') {
    return;
  }

  var layout = obj.getLayout(this.layout, this.so.layout);

  if (! layout) return;

  for (var key in layout) {
    this[key] = layout[key];
  }
};

exports.addButton = function(name, icon, tap) {  // {{{2
  if (! this.buttons) this.buttons = {};

  if (name in this.buttons) return this.buttons[name];

  return this.buttons[name] = this.new('button', {'data-icon': icon})
    .on('click', tap)
    .appendTo(this.header.parent())
  ;
};

exports.removeButton = function(name) {  // {{{2
  if (this.buttons && name in this.buttons) {
    this.buttons[name].remove();
    delete this.buttons[name];
  }
};

exports.hideButton = function(name) {  // {{{2
  if (this.buttons && name in this.buttons) {
    this.buttons[name].hide();
  }
};

exports.showButton = function(name) {  // {{{2
  if (this.buttons && name in this.buttons) {
    this.buttons[name].show();
  }
};

// }}}1
// Event Handlers {{{1
function removed(ev) {  // {{{2
  this.header && this.header.remove();
  delete this.header;

  if (this.buttons) {
    for (var key in this.buttons) {
      this.buttons[key].remove();
    }
    delete this.buttons;
  }

  if (typeof this.removed === 'function') {
    this.removed();
  }

  this.afterDisplay();
}

// }}}1
