'use strict';

var O = require('ose').module(module);

// Public {{{1
exports.template = '<span class="buttons"></span>';  // {{{2

exports.extend = function(buttons, params, cb) {  // {{{2
  if (! params) params = {};

  var res = this.tree('span', 'buttons').hook();
  if (params.char) {
    res.addClass('char');
  } else {
    res.addClass('text');
  }

  if (params.readonly) res.attr('readonly', true);
  if (params.relation) res.relation = params.relation;

  if (! Array.isArray(buttons)) {
    throw O.log.todo();
  }

  buttons.forEach(function(btn) {
    var i = res.append('i')
//      .text(btn)
//      .text(params.char ?
//        exports.buttonActions[btn] || btn :
//        btn
//      )
      .attr('act', btn)
      .on('click', function(ev) {
        res.stop(ev);

        if (! res.attr('readonly')) cb(btn);
      })
    ;

    if (! params.char) {
      i.text(btn);
    }

    / *
    if (params.char) {
      i.attr('data-icon', btn);
      i.attr('data-l10n-id', btn);
    } else {
      i.text(btn);
    }
    * /

    if (! params.readonly) {
      i.attr('focusable', true);
    }
  });

  if (params.default) {
    buttonsVal(res, [params.default]);
  }

  return this;
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
    that.el.textContent(val.text);
    delete val.text;
  }

  if ('icon' in val) {
    that.el.setAttribute('data-icon', val.icon);
    delete val.icon;
  }

  return val;
};


