'use strict';

var O = require('ose').class(module, C);

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
function C(view, entry) {  // {{{2
/**
 * Socket constructor
 *
 * @param view {Object} View
 * @param entry {Object} Entry
 *
 * @method constructor
 */

  //console.log('view ENTRY', view.so);

  this.view = view;
  view.socket = this;

  if (entry) {
    return entry.track(this);
  }

  return O.data.trackEntry(view.so.ident, this);
}

exports.open = function(entry) {  // {{{2
//  console.log('VIEW ENTRY OPEN', entry.toString());

  if (! (this.view && this.view.el)) return O.link.close(this);

  return this.view.setEntry(entry);
};

exports.close = function(req) {  // {{{2
//  console.log('view ENTRY CLOSE', arguments);

  if (this.view && this.view.el) {
    delete this.view.socket;
    delete this.view.entry;
    delete this.view;
  }
};

exports.error = function(err) {  // {{{2
//  console.log('ENTRY VIEW ERROR');
//  O.log.error(err);

  this.view && this.view.endUpdate(err);

  this.close();
};

exports.home = function(req) {  // {{{2
//  console.log('VIEW ENTRY SOCKET HOME', req);

  if (! (this.view && this.view.el)) return O.link.close(this);

  this.view.markHome(req);
};

exports.patch = function(req) {  // {{{2
//  console.log('view ENTRY SOCKET PATCH', JSON.stringify(req));

  if (this.view && this.view.el) {
    this.view.patch(req);
  } else {
    O.link.close(this);
  }
};

