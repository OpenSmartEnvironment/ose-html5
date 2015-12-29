'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<span class="buttons char"><i focusable data-icon="brightness"></i><i focusable data-icon="o"></i></span>';  // {{{2

exports.extend = function(params) {  // {{{2
  return this.stub('onoff', null, params);
};

exports.init = function(that) {  // {{{2
  that.find('i[data-icon="brightness"]').on('click', function(ev) {
    that.stop(ev);
    doit(1);
  });

  that.find('i[data-icon="o"]').on('click', function(ev) {
    that.stop(ev);
    doit(0);
  });

  function doit(val) {
    if (that.input) that.input(val);

    if (that.post && that.field) {
      that.field.owner.view.post(that.post, val);
    }
  }
};

exports.fieldUpdated = function(that, patch) {  // {{{2
  exports.setVal(that.field.field.asBoolean(that.field.value));
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


