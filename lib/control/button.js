'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<i class="button" focusable></i>';  // {{{2

exports.extend = function(type, val, params, attrs) {  // {{{2
  if (! params) {
    params = {};
  } else if (typeof params === 'function') {
    params = {
      input: params,
    };
  }

  params.type = type;

  switch (type) {
  case 'char':
    params.icon = val;
    break;
  case 'text':
    params.text = val;
    break;
  }

  return this.stub('button', attrs, params);
};

exports.init = function(that) {  // {{{2
  that.on('click', function(ev) {
    that.stop(ev);

    if (that.input) {
      that.input(ev);
    }
  });
};

exports.params = function(that, val) {  // {{{2
  if (! val) return val;

  if (val.type) {
    if (that.type) {
      that.removeClass(that.type);
    }

    that.addClass(val.type);
  }

  if ('text' in val) {
    that.el.textContent = val.text;
    delete val.text;
  }

  if ('icon' in val) {
    that.el.setAttribute('data-icon', val.icon);
    delete val.icon;
  }

  return val;
};

exports.getVal = function(that) {  // {{{2
  return that.el.getAttribute('value');
};

exports.setVal = function(that, val) {  // {{{2
  return that.el.setAttribute('value', val);
};

