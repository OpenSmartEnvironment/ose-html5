'use strict';

const O = require('ose')(module)
  .class(C, './wrap')
;

var Field = O.getClass('./field');

// Public {{{1
function C(type) {  // {{{2
  O.ui.updateHistory();

  O.super.call(this, 'html5-dialog' + (type ? '-' + type : ''));

  this.appendTo(document.body);

  O.ui.newHistory();
  this.lastHistory = O.ui.lastHistory;

  this.hook();

  this.type = type;

  if (! O.ui.dialogs) {
    O.ui.dialogs = [];
  }
  O.ui.dialogs.push(this);

  this.on('removed', removed.bind(this));
  this.on('closed', closed.bind(this));
}

exports.open = function() {  // {{{2
  this.el.open();
};

exports.editDef = function(def, val, cb) {  // {{{2
  var that = this;
  var header = this.append('h1').text(def.caption || def.name);

  var list = this.append('html5-list');

  this.fields = O.new('ose/lib/orm/list')(this);
  this.fields.add(def, val, true);

  this.fields.sort();

  this.fields.each(function(fw) {
    if (fw.profile.order === 'header') {
      new Field(fw, header);
    } else {
      fw.li = list.append('li').hook();
      var div = fw.li.append('div');
      fw.header = div.append('h3').text(fw.field.name + (fw.field.unit ? ' (' + fw.field.unit + ')' : '')).hook();
      var fe = new Field(fw);
      div.append(fe);
      if (fe.getAside) fw.li.add(fe.getAside());
    }

    fw.update();
  });

  this.addButton('cancel', 'close', function() {
    cb(O.error(that, 'CLOSE', 'Dialog closed'));
    that.remove();
  });

  this.addButton('select', 'tick', function() {
    var val = that.fields.getVal(def);

    that.remove();

    cb(null, val);
  });
};

exports.addButton = function(name, icon, tap) {  // {{{2
  if (! this.buttons) {
    this.buttons = {};
    this.append('<fieldset>');
  }

  if (name in this.buttons) return this.buttons[name];

  return this.buttons[name] = this.new('button', {'data-icon': icon})
    .text(name)
    .on('tap', tap)
    .appendTo(this.find('fieldset'));
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

exports.startEdit = O._.noop;
exports.stopEdit = O._.noop;

// }}}1
// Event handlers {{{1
function removed() {  // {{{2
  if (O.ui.dialogs[O.ui.dialogs.length - 1] === this) {
    O.ui.dialogs.pop();

    if (this.lastHistory === O.ui.lastHistory) {
      history.back();
    }

    if (! O.ui.dialogs.length) {
      delete O.ui.dialogs;
    }
  }
}

function closed() {  // {{{2
  this.remove();
}

// }}}1
