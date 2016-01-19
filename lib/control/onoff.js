'use strict';

const O = require('ose')(module);

// Public {{{1
exports.template = '<span class="buttons char"><i data-icon="brightness"></i><i data-icon="o"></i></span>';  // {{{2

exports.extend = function(params) {  // {{{2
  return this.stub('onoff', undefined, params);
};

exports.init = function(that) {  // {{{2
  that.find('i[data-icon="brightness"]').on('tap', function(ev) {
    that.trigger('input', {value: 1});
    return false;
  });

  that.find('i[data-icon="o"]').on('tap', function(ev) {
    that.trigger('input', {value: 0});
    return false;
  });
};

exports.patch = function(that, wrap, patch) {  // {{{2
  exports.setVal(that, wrap.field.asBoolean(wrap.value));
};

exports.getVal = function(that) {  // {{{2
  return that.value;
};

exports.setVal = function(that, val) {  // {{{2
  if (val === that.value) return;

  that.value = val;

  if (val) {
    that.el.querySelector('i[data-icon="brightness"]').setAttribute('value', 1);
    that.el.querySelector('i[data-icon="o"]').removeAttribute('value');
  } else {
    that.el.querySelector('i[data-icon="o"]').setAttribute('value', 1);
    that.el.querySelector('i[data-icon="brightness"]').removeAttribute('value');
  }
};


