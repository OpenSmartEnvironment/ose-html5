'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<span class="checkbox" focusable="true"></span>';  // {{{2

exports.extend = function(params) {  // {{{2
  return this.stub('checkbox', null, params);
};

exports.init = function(that) {  // {{{2
  that.on('click', function(ev) {
    that.stop(ev);

    if (that.el.hasAttribute('readonly')) return;

    var val = ! exports.getVal(that);

    if (that.input) that.input(val);

    if (that.post && that.field) {
      that.field.owner.view.post(that.post, val);
    }

    return;
  });
};

exports.fieldUpdated = function(that, patch) {  // {{{2
  exports.setVal(that, that.field.field.asBoolean(that.field.value));
};

exports.getVal = function(that) {  // {{{2
  switch (that.el.getAttribute('value')) {
  case '1':
  case 'yes':
  case 'true':
    return true;
  }
  return false;
};

exports.setVal = function(that, val) {  // {{{2
  if (typeof val === 'string') {
    switch (val.toLowerCase()) {
    case '0':
    case 'no':
    case 'false':
      val = false;
    }
  }

  that.el.setAttribute('value', Boolean(val));
  return that;
};

