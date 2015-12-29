'use strict';

var O = require('ose').module(module);

var SLIDER_PADDING=40;

// Public {{{1
exports.template = `<span class="slider" focusable>
  <span>
    <span style="width: 0">
      \u00A0
      <div></div>
    </span>
  </span>
</span>`;

exports.extend = function(params, input) {  // {{{2
  switch (arguments.length) {
  case 1:
    if (typeof params === 'function') {
      params = {
        input: params
      };
    }
    break;
  case 2:
    params.input = input;
    break;
  }

  return this.stub('slider', undefined, params);
};

exports.init = function(that) {  // {{{2
  that.min = 0;
  that.max = 1;
  that.value = 0;

  that.on('click', function(ev) {
    that.stop(ev);

    if (that.el.hasAttribute('readonly')) return;

    var val = (ev.clientX - that.left() - SLIDER_PADDING) / (that.width() - SLIDER_PADDING * 2) * that.max + that.min;
    if (val < that.min) val = that.min;
    if (val > that.max) val = that.max;

    if (that.input) that.input(val);

    if (that.post && that.field) {
      that.field.owner.view.post(that.post, val);
    }
  });
};

exports.params = function(that, val) {  // {{{2
  if (! val) return val;

  var refresh = false;

  if (typeof val.min === 'number' && ! isNaN(val.min)) {
    that.min = val.min;
    refresh = true;
  }
  delete val.min;

  if (typeof val.max === 'number' && ! isNaN(val.max)) {
    that.max = val.max;
    refresh = true;
  }
  delete val.max;

  if (refresh) {
    exports.refresh(that);
  }

  return val;
};

exports.getVal = function(that) {  // {{{2
  return that.value;
};

exports.setVal = function(that, val, dontRefresh) {  // {{{2
  switch (typeof val) {
  case 'undefined':
    val = that.min;
    break;
  case 'number':
    val = val;
    break;
  case 'string':
    val = parseInt(val);
    break;
  default:
    throw O.log.error(that, 'INVALID_val', val);
  }

  if (! isNaN(val)) {
    that.value = val;
//    O.log.error(that, 'INVALID_ARGS', val);
//    return;
  }

  if (! dontRefresh) {
    exports.refresh(that);
  }
};

exports.fieldUpdated = function(that, patch) {  // {{{2
  exports.setVal(that, that.field.field.asNumber(that.field.value));
};

exports.refresh = function(that) {  // {{{2
  if (that.refreshTimeout) {
    clearTimeout(that.refreshTimeout);
  }

  that.refreshTimeout = setTimeout(function() {
    delete that.refreshTimeout;

    var val = that.value;

    if (val < that.min) val = that.min;
    if (val > that.max) val = that.max;

    var w = (100 * (val - that.min) / (that.max - that.min)) + '%';
    that.find('span>span>span').style('width', w);
  });
};

/* OBSOLETE {{{1
function transitProgress(el, aim, max, duration) {  // {{{2
  setTimeout(function() {
    el.fillTime = duration;
    el.value = aim * 100 / max;
  }, 0);
}

}}}1 */
