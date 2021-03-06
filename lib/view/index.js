'use strict';

const O = require('ose')(module)
  .class(init, '../wrap')
;

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
 * Each View descendant should define a "verifyDemand"
 * method. This method compares the supplied demand with the
 * currently displayed one.
 *
 * @param data {Object} Demand to be compared
 *
 * @returns {Boolean} Whether data correspond to the displayed view
 *
 * @method verifyDemand
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
function init(tag, attrs, params) {  // {{{2
/**
 * View constructor
 *
 * @copyParams ose-html5.lib.wrap/constructor
 *
 * @method constructor
 */

  O.inherited(this)(tag || 'ul', attrs, params);

  this.updating = 0;

  this.hook();
  this.text('Loading ...');
};

// Internal {{{1
exports.bindUpdate = function() {  // {{{2
  if (this._err) return;

  ++this.updating;

  return this.endUpdate.bind(this);
};

exports.startUpdate = function(cb) {  // {{{2
  if (this._err) return;

  if (cb) {
    if (this._endUpdate) {
      throw O.log.error(this, 'End update callback already registered');
    }

    this._endUpdate = cb;
  }

  ++this.updating;
};

exports.endUpdate = function(err) {  // {{{2
  if (this._err) return;

  if (err) {
    if (! (err instanceof Error)) {
      err = O.applyError(this, arguments);
    }
  } else {
    if (--this.updating === 0) {
      if (this._endUpdate) {
        this._endUpdate();
        delete this._endUpdate;
      }
      return;
    }

    if (this.updating > 0) return;

    err = O.error(this, 'Not updating', this.updating);
  }

  delete this.updating;
  this._err = err;

  this.empty().append2('Error: ' + err.code + ' ' + err.message);

  if (this._endUpdate) {
    this._endUpdate(err);
    delete this._endUpdate;
  }

//  return O.log.error(err);
};

exports._removed = function(ev) {  // {{{2
  /*
  if (this.header) {
    this.header.remove();
    delete this.header;
  }
  */

  this.trigger('removed', ev);

  if (this.updating) {
    this.endUpdate('Removed before finishing update');
  }
};

/* OBSOLETE {{{1
exports.show = function() {  // {{{2
  this.header && this.header.show();

  return O.super.prototype.show.call(this);
};

exports.hide = function() {  // {{{2
  this.header && this.header.hide();

  return O.super.prototype.hide.call(this);
};

}}}1 */
