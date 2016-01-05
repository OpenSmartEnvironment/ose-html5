'use strict';

var O = require('ose').class(module, './index');

var Socket = O.class('./entry');
var Wraps = O.class('ose/lib/orm/wraps');

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption Detail view
 *
 * @readme
 * View for displaying entry detail
 *
 * @class html5.lib.view.detail
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
exports.layout = 'detail';  // {{{2

exports.post = function(name, val, socket) {  // {{{2
/**
 * Post command to displayed entry's home
 *
 * @copyParams ose.lib.entry/post
 *
 * @method post
 */

  if (this.entry) {
    this.entry.post(name, val, socket);
  } else {
    O.link.error(socket, O.error(this, 'UNEXPECTED', 'Entry is not initialized!'));
  }
};

exports.patch = function(val) {  // {{{2
/**
 * Update the information displayed with data patch
 *
 * @param val {Object} Entry patch
 *
 * @method patch
 */

  this.startUpdate();

  if (val.dpatch && this.entry.kind.ddef && this.dwrap) {
    this.entry.kind.ddef.iterPatch(this.dwrap, val.dpatch, this.entry.dval);
  }

  if (val.spatch && this.entry.kind.sdef && this.swrap) {
    this.entry.kind.sdef.iterPatch(this.swrap, val.spatch, this.entry.sval);
  }

  this.displayHeader();

  this.endUpdate();
};

exports.displayHeader = function() {  // {{{2
  if (this.header) {
    this.header.empty().h2(this.entry.getCaption());
  }
};

// Internal {{{1
exports.loadData = function(cb, entry) {  // {{{2
  this.startUpdate(cb);

  if (this.socket) {
    throw O.log.error(this, 'Socket was already registered', O.subjectToString(this.socket));
  }

  if (this.so.new) {
    newEntry(this);
    return;
  }

  new Socket(this, entry);
  return;
};

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'detail') return false;

  if (val.layout && (this.so.layout !== val.layout)) return false;

  return this.entry && this.entry.isIdentified(val.ident);
};

exports.getIdent = function() {  // {{{2
  if (! this.entry) return undefined;

  var res = this.entry.identify();
  res.schema = this.entry.shard.schema.name;
  res.peer = (this.entry.shard.home || this.entry.shard.space.home).name;
  res.kind = this.entry.kind.name;

  return res;
};

exports.startEdit = function(wrap) {  // {{{2
  this.hideButton('drawer');

  //this.buttons && this.buttons.drawer && this.buttons.drawer.hide();

  if (this.entry.embryo) {
    this.addButton('commit', 'tick', commitNew.bind(this));
  } else {
    this.addButton('commit', 'tick', commit.bind(this));
  }
  this.addButton('cancel', 'close', onCancel.bind(this));
};

exports.stopEdit = function(wrap) {  // {{{2
  this.removeButton('commit');
  this.removeButton('cancel');

  this.showButton('drawer');
//  this.buttons.drawer && this.buttons.drawer.show();
};

exports.setEntry = function(entry) {  // {{{2
/**
 * @param entry {Object} Entry to be displayed
 *
 * @method setEntry
 * @internal
 */

  if (! entry) {
    delete this.entry;
    return this.endUpdate('Missing entry');
  }

  if (! entry.kind) {
    throw O.log.error(this, 'Entry is not yet initialized!', entry.toString());
  }

  O._.extend(this, entry.kind.getLayout(this.layout, this.so.layout));

  this.entry = entry;

  this.display();
};

exports.display = function() {  // {{{2
  var that = this;

  this.empty();

  var fieldsLayout = this.so.fieldsLayout || this.fieldsLayout || this.so.layout || this.layout;

  this.fields = new Wraps(this);
  if (this.entry.kind.ddef) {
    this.dwrap = this.entry.kind.ddef.iterLayout(this.fields, fieldsLayout, this.entry.dval);
  }
  if (this.entry.kind.sdef) {
    this.swrap = this.entry.kind.sdef.iterLayout(this.fields, fieldsLayout, this.entry.sval);
  }
  this.fields.sort();
  this.fields.each(function(fieldWrap) {
    if (! fieldWrap.layout) return;

    if (fieldWrap.layout.display) {
      fieldWrap.layout.display(that, fieldWrap);
      return;
    }

    if (fieldWrap.layout.order === 'header') {
      that.displayHeader = O._.noop;
      that.header.tree('h2').setField(fieldWrap);
      return;
    }

    fieldWrap.field.displayDetail(that, fieldWrap);
    return;
  });

  this.displayHeader();
  this.displayLayout && this.displayLayout();
  this.markHome(this.entry.isAtHome() || this.entry.masterState === this.entry.MASTER_STATE.HOME);

  this.endUpdate();
};

exports.removed = function() {  // {{{2
/**
 * @method removed
 * @internal
 */

//  console.log('ENTRY view REMOVED', this.id);

  if (this.socket) {
    O.link.close(this.socket);
    delete this.socket;
  }
};

exports.markHome = function(val) {  // {{{2
/**
 * @method markHome
 * @internal
 */

  if (this.header) {
    this.header.style('color', val ? 'white' : 'gray');
  }
};

// Private {{{1
function newEntry(that) {  // {{{2
  return O.log.todo();

  O.findShard(that.so.ident, function(err, shard) {
    if (err) return that.endUpdate(err);

    shard.embryo(that.so.ident.id, that.so.ident.kind, that.so.dval, function(err, entry) {
      if (err) return that.endUpdate(err);

      that.setEntry(entry);
      that.fields.startEdit(true);
      return;
    });
    return;
  });
}

// }}}1
// Event Handlers {{{1
function onDrawer(ev) {  // {{{2
  this.new('html5-drawer').appendTo(document.body).el.toggle();
}

function commitNew() {  // {{{2
  var that = this;
  var e = this.entry;

  var val = this.fields.getVal(e.kind.ddef, e.dval);

  e.shard.saveEmbryo(e, val, function(err) {
    if (err) {
      O.log.error(err);
      return;
    }

    that.fields.stopEdit('save');
    return;
  });
}

function commit() {  // {{{2
  var that = this;
  var e = this.entry;

  var patch = this.fields.getPatch(e.kind.ddef, e.dval);

  O.link.send(this.socket, 'put', {
    rev: e.drev,
    patch: patch,
  }, function(err, resp) {
    if (err) {
      O.log.error(err);
      return;
    }

    that.fields.stopEdit('save');
    return;
  });
}

function onCancel() {  // {{{2
  if (this.entry.embryo) {
    this.entry.remove();
    window.history.back();
  } else {
    this.fields.stopEdit('cancel');
  }
}

function updateState(val) {  // {{{2
  for (var key in val) {
    var result = this.updateStateKey(key, val[key], val);

    if (result === false) {
      O.log.unhandled('Invalid state key!', {entry: this.entry.toString(), kind: this.entry.kind.name, key: key});
    }
  }
}

