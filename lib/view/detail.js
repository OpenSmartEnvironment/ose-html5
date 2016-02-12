'use strict';

const O = require('ose')(module)
  .class('./index')
;

var Socket = O.getClass('./entry');
var Wraps = O.getClass('ose/lib/field/wraps');

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

  this.on('removed', removed.bind(this));

  if (this.socket) {
    throw O.log.error(this, 'Socket was already registered', O.subjectToString(this.socket));
  }

  if (this.demand.new) {
    newEntry(this);
    return;
  }

  new Socket(this, entry);
  return;
};

exports.verifyDemand = function(val) {  // {{{2
//  console.log('VERIFY DEMAND', val);
//  console.log('OLD', this.demand);

  if (val.view !== this.layout) return false;

  if (val.layout && (this.demand.layout !== val.layout)) return false;

  return this.entry && this.entry.isIdentified(val.ident);
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

  O._.extend(this, entry.kind.getLayout(this.layout, this.demand.layout));

  this.entry = entry;

  this.display();
};

exports.display = function() {  // {{{2
  var that = this;

  this.empty();

  var fieldsLayout = this.demand.fieldsLayout || this.fieldsLayout || this.demand.layout || this.layout;

  this.fields = new Wraps(this);
  if (this.entry.kind.ddef) {
    this.dwrap = this.entry.kind.ddef.iterLayout(this.fields, fieldsLayout, this.entry.dval, function(fieldWrap) {
      if (! fieldWrap.isReadonly()) {
// TODO        fieldWrap.on('input', onFieldInput.bind(that, fieldWrap));
      }
    });
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

exports.markHome = function(val) {  // {{{2
/**
 * @method markHome
 * @internal
 */

  if (this.header) {
    this.header.style('color', val ? 'white' : 'gray');
  }
};

// Event Handlers {{{1
function removed() {  // {{{2
  if (this.socket) {
    O.link.close(this.socket);
    delete this.socket;
  }
}

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

// Private {{{1
function newEntry(that) {
  return O.log.todo();

  O.findShard(that.demand.ident, function(err, shard) {
    if (err) return that.endUpdate(err);

    shard.embryo(that.demand.ident.id, that.demand.ident.kind, that.demand.dval, function(err, entry) {
      if (err) return that.endUpdate(err);

      that.setEntry(entry);
      that.fields.startEdit(true);
      return;
    });
    return;
  });
}

/* OBSOLETE {{{1
exports.getIdent = function() {  // {{{2
  if (! this.entry) return undefined;

  var res = this.entry.getIdent();
  res.schema = this.entry.shard.schema.name;
  res.peer = (this.entry.shard.home || this.entry.shard.space.home).name;
  res.kind = this.entry.kind.name;

  return res;
};

}}}1 */
