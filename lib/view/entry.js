'use strict';

const O = require('ose')(module)
  .class(init)
;

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption Entry view client socket
 *
 * @readme
 * Extension for entry view classes.
 *
 * @class html5.lib.view.entry
 * @type class
 * @internal
 */

// }}}1
// Public {{{1
function init(view, entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param view {Object} View
 * @param entry {Object} Entry
 *
 * @method constructor
 */

  this.view = view;
  view.socket = this;

  if (entry) {
    return entry.track(this);
  }

  return O.data.trackEntry(view.so.ident, this);
}

exports.open = function(entry) {  // {{{2
  if (! (this.view && this.view.el)) return O.link.close(this);

  return this.view.setEntry(entry);
};

exports.close = function(req) {  // {{{2
  if (this.view && this.view.el) {
    delete this.view.socket;
    delete this.view.entry;
    delete this.view;
  }
};

exports.error = function(err) {  // {{{2
  this.view && this.view.endUpdate(err);

  this.close();
};

exports.home = function(req) {  // {{{2
  if (! (this.view && this.view.el)) return O.link.close(this);

  this.view.markHome(req);
};

exports.patch = function(req) {  // {{{2
  if (this.view && this.view.el) {
    this.view.patch(req);
  } else {
    O.link.close(this);
  }
};

