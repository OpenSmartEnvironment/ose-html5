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
  var res = this.tree('slider', undefined, params);

  if (input) this.on('input', input);

  return this;
};

exports.init = function(that) {  // {{{2
  that.min = 0;
  that.max = 1;
  that.value = 0;

  that.find('span>span>div').on('drag', function(ma) {
    ma.drag = O._.debounce(drag, 10);
    return drag(ma);
  });

  function drag(ma) {
    if (Math.abs(ma.last.y - ma.begin.y) > 20) {
      ma.drag = false;
      return;
    }

    var val = (ma.last.x - that.left() - SLIDER_PADDING) / (that.width() - SLIDER_PADDING * 2) * that.max + that.min;
    if (val < that.min) val = that.min;
    if (val > that.max) val = that.max;

    that.trigger('input', {value: val});
    return false;
  }
};

exports.key = function(that, ev) {  // {{{2
  var val = 1;

  switch (ev.code) {
  case 'ArrowLeft':
    val = -1;
    // NO BREAK
  case 'ArrowRight':
    val = that.value + val * (that.max - that.min) / 100;
    if (val > that.max) val = that.max;
    if (val < that.min) val = that.min;
    that.trigger('input', {value: val});
    return false;
  }
};

exports.tap = function(that, ev) {  // {{{2
  if (! ev.last) return;

  var val = (ev.last.x - that.left() - SLIDER_PADDING) / (that.width() - SLIDER_PADDING * 2) * that.max + that.min;

  if (val < that.min) val = that.min;
  if (val > that.max) val = that.max;

  that.trigger('input', {value: val});
  return false;
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
    that.value = that.min;
    break;
  case 'number':
    if (isNaN(val)) return;

    that.value = val;
    break;
  case 'string':
    val = parseInt(val);
    if (isNaN(val)) return;

    that.value = val;
    break;
  case 'object':
    if ('min' in val) exports.params(that, {min: val.min});
    if ('max' in val) exports.params(that, {max: val.max});
    if ('aim' in val) exports.params(that, {aim: val.aim});
    if ('duration' in val) exports.params(that, {duration: val.duration});

    if ('value' in val) {
      exports.setVal(that, val.value, dontRefresh);
    }

    return;
  default:
    throw O.log.error(that, 'INVALID_val', val);
  }

  if (! dontRefresh) {
    exports.refresh(that);
  }
};

exports.patch = function(that, wrap, patch) {  // {{{2
  exports.setVal(that, wrap.field.asNumber(wrap.value));
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
