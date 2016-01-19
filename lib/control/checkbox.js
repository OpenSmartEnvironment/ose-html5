'use strict';

const O = require('ose')(module);

// Public {{{1
exports.template = '<span class="checkbox" focusable="true"></span>';  // {{{2

exports.extend = function(params) {  // {{{2
  return this.stub('checkbox', null, params);
};

exports.tap = function(that, ev) {  // {{{2
  that.trigger('input', {value: ! exports.getVal(that)});
  return false;
};

exports.patch = function(that, wrap, patch) {  // {{{2
  exports.setVal(that, wrap.field.asBoolean(wrap.value));
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

