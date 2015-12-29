'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<span class="buttons"></span>';  // {{{2

exports.extend = function(type, buttons, params, input) {  // {{{2
  if (! params) params = {};

  if (type) params.type = type;
  if (buttons) params.buttons = buttons;
  if (input) params.input = input;

  var res = this.tree('buttons', 'buttons', params);
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

  if ('readonly' in val) {
    if (val.readonly) {
      this.attr('readonly', undefined);
    } else {
      this.attr('readonly', null);
    }

    delete val.readonly;
  }

  if ('buttons' in val) {
    if (! Array.isArray(val.buttons)) {
      throw O.log.error(that, 'INVALID_ARGS', 'val.buttons', val.buttons);
    }

    val.buttons.forEach(function(btn) {
      var i = that.tree('i').on('click', function(ev) {
        that.stop(ev);

        if (that.hasClass('readonly')) return;
        if (i.hasClass('readonly')) return;

        if (that.input) that.input(btn);

        if (that.post && that.field) {
          that.field.owner.view.post(that.post, btn);
        }
      });

      switch (that.type) {
      case 'char':
        i.attr('data-icon', btn)
        break;
      case 'text':
        i.text(btn);
        break;
      }

      if (! val.readonly) {
        i.attr('focusable', true);
      }
    });

    delete val.buttons;
  }

  return val;
};


