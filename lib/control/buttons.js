'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<span class="buttons"></span>';  // {{{2

exports.extend = function(type, buttons, params, input) {  // {{{2
  if (typeof params === 'function') {
    params = {
      input: params,
    };
  }

  if (! params) params = {};

  if (type) params.type = type;
  if (buttons) params.buttons = buttons;
  if (input) params.input = input;

  return this.tree('buttons', 'buttons', params);
};

exports.params = function(that, val) {  // {{{2
  if (! (val && typeof val === 'object')) return val;

  if (val.type) {
    if (that.type) {
      that.removeClass(that.type);
    }

    that.addClass(val.type);

    that.type = val.type;
    delete val.type;
  }

  if ('buttons' in val) {
    if (! Array.isArray(val.buttons)) {
      throw O.log.error(that, 'INVALID_ARGS', 'val.buttons', val.buttons);
    }

    val.buttons.forEach(function(btn) {
      var i = that.tree('i').on('tap', function(ev) {
        that.trigger('input', {value: btn});
        return false;
      });

      switch (that.type) {
      case 'char':
        i.attr('data-icon', btn)
        break;
      case 'text':
        i.text(btn);
        break;
      }
    });

    delete val.buttons;
  }

  return val;
};


