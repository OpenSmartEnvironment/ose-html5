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

  //console.log('view ENTRY', view.stateObj);

  this.view = view;
  view.socket = this;

  if (entry) {
    return entry.track(this);
  }

  return O.data.trackEntry(view.stateObj.ident, this);
}

exports.open = function(entry) {  // {{{2
//  console.log('VIEW ENTRY OPEN', entry.toString());

  var view = this.view;
  if (! (view && view.el)) return O.link.close(this);

  return view.setEntry(entry);
};

exports.close = function(req) {  // {{{2
//  console.log('view ENTRY CLOSE', arguments);

  if (this.view && this.view.el) {
    delete this.view.socket;
    delete this.view.entry;

    this.view.afterDisplay();

    delete this.view;
  }
};

exports.error = function(err) {  // {{{2
//  console.log('ENTRY VIEW ERROR');
//  O.log.error(err);

  if (this.view && this.view.el) {
    this.view.socketError(err);
    this.close();
  }
};

exports.home = function(req) {  // {{{2
//  console.log('view ENTRY SOCKET HOME', this.view.id, JSON.stringify(req));

  if (! (this.view && this.view.el)) return O.link.close(this);

  this.view.markHome(req);

  return this.view.afterDisplay();
};

exports.patch = function(req) {  // {{{2
//  console.log('view ENTRY SOCKET PATCH', this.view.id, JSON.stringify(req));

  var view = this.view;
  if (! (view && view.el)) return O.link.close(this);

  view.updating = true;
  if (('drev' in req) && view.updateData) {
    view.updateData(req.dpatch);
  }
  if (('srev' in req) && view.updateState) {
    view.updateState(req.spatch);
  }
  delete view.updating;

  return view.afterDisplay();
};

// }}}1
