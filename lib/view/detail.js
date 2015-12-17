'use strict';

var O = require('ose').class(module, './index');

var Socket = O.class('./entry');
var Field = O.class('../field');
var Fields = O.class('ose/lib/orm/list');

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

exports.updateData = function(patch) {  // {{{2
/**
 * Update the information displayed with data patch
 *
 * @param patch {Object} Data patch
 *
 * @method updateData
 */

  var that = this;
  var e = this.entry;

  if (e.kind.ddes) {
    this.fields.patch(e.kind.ddes, patch, e.dval);
  }

  this.displayHeader();

  return;
};

exports.displayHeader = function() {  // {{{2
  this.header.h2(this.entry.getCaption());

//  this.addButton('drawer', 'more', onDrawer.bind(this));
};

// }}}1
// Event Handlers {{{1
function onDrawer(ev) {  // {{{2
  this.new('html5-drawer').appendTo(document.body).el.toggle();
}

function commitNew() {  // {{{2
  var that = this;
  var e = this.entry;

  var val = this.fields.getVal(e.kind.ddes, e.dval);

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

  var patch = this.fields.getPatch(e.kind.ddes, e.dval);

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

// }}}1
// Internal {{{1
exports.display = function() {  // {{{2
/**
 * Display entry based on layout profiles. This method gets
 * called once after entry dval are loaded. It can be overridden in
 * the layout file for full custom data display.
 *
 * @method display
 */

  var that = this;
  var k = this.entry.kind;

  this.fields = new Fields(this);

  if (this.dprofile && k.ddes) {
    this.fields.add(k.ddes, this.entry.dval, this.dprofile);
  }

  if (this.sprofile && k.sdes) {
    this.fields.add(k.ddes, this.entry.sval, this.sprofile);
  }

  /* TODO Dividers and custom fields display
  if (layout.oprofile) {
    iter(layout.oprofile);
  }
  */

  this.fields.sort();

  this.empty();

  this.fields.each(function(fw) {
    if (fw.profile.order === 'header') {
      that.displayHeader = O._.noop;
      new Field(fw, that.header);
      that.header = fw.el;
    } else {
      fw.li = that.append('li', 'row').hook();
      var sec = fw.li.section('stretch');
      fw.header = sec.append('h3')
        .hook()
        .text(fw.field.name + (fw.field.unit ? ' (' + fw.field.unit + ')' : ''))
      ;

      var fe = new Field(fw);
      sec.add(fe);

      /*
      fw.li = that.append('li').hook();
      var div = fw.li.append('div');
      fw.header = div.append('h3').text(fw.field.name + (fw.field.unit ? ' (' + fw.field.unit + ')' : '')).hook();
      var fe = new Field(fw);
      div.append(fe);
      if (fe.getAside) fw.li.add(fe.getAside());
      */
    }

    fw.update();
  });

  this.displayHeader();
};

exports.loadData = function(cb, entry) {  // {{{2
  if (cb) {
    this.doAfterDisplay = cb;
  }

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
    return this.afterDisplay(O.error(this, 'Missing entry'));
  }

  if (! entry.kind) {
    throw O.log.error(this, 'Entry is not yet initialized!', entry.toString());
  }

  this.entry = entry;
  this.updating = true;

  var layout = entry.kind.getLayout(this.layout, this.so.layout);

//  console.log('view DETAIL SET ENTRY', entry.id, layout);

  if (layout) {
    for (var key in layout) {
      this[key] = layout[key];
    }
  }

  if (this.updateStateKey && ! this.updateState) {
    this.updateState = updateState;
  }

  this.display();
  this.displayLayout && this.displayLayout();

  /* Data should be updated by display() or displayLayout()
  if (this.updateData && entry.dval) {
    this.updateData(entry.dval);
  }
  */

  if (this.updateState && entry.dval) {
    this.updateState(entry.sval);
  }

  delete this.updating;

  this.markHome(entry.isAtHome() || entry.masterState === entry.MASTER_STATE.HOME);

  return this.afterDisplay();
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

  this.afterDisplay();
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

exports.socketError = function(err)  {  // {{{2
/**
 * @method socketError
 * @internal
 */

  O.log.error(err);

  this.html('<div>' + err.message + '</div>');

  this.afterDisplay();
};

// }}}1
// Private {{{1
function newEntry(that) {  // {{{2
  return O.log.todo();

  O.findShard(that.so.ident, function(err, shard) {
    if (err) return that.afterDisplay(err);

    shard.embryo(that.so.ident.id, that.so.ident.kind, that.so.dval, function(err, entry) {
      if (err) return that.afterDisplay(err);

      that.setEntry(entry);
      that.fields.startEdit(true);
      return;
    });
    return;
  });
}

// }}}1
