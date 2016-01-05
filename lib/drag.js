'use strict';

var O = require('ose').class(module, C);

// Public {{{1
function C(input, ev, offset) {  // {{{2
  switch (ev.type) {
  case 'mousedown':
    this.type = 'mouse';
    this.start = {
      x: ev.clientX,
      y: ev.clientY,
    };
    break;
  case 'touchstart':
    this.type = 'touch';
    this.start = {
      x: ev.touches[0].clientX,
      y: ev.touches[0].clientY,
    };
    break;
  default:
    throw O.log.error('Invalid event type');
  }

  if (input.drag) {
    input.drag.stop();
    this._ondrop && this._ondrop();
  }
  input.drag = this;
  this.input = input;

  if (offset) {
    this.offset = offset;
    this.start.x -= offset.x;
    this.start.y -= offset.y;
  }

  this.last = this.start;

  registerDrop(this);
}

exports.cleanup = function() {  // {{{2
  if (this._move) {
    document.body.removeEventListener(this.type === 'mouse' ? 'mousemove' : 'touchmove', this._move);
    delete this._move;
  }

  if (this._drop) {
    document.body.removeEventListener(this.type === 'mouse' ? 'mouseup' : 'touchend', this._drop);
    delete this._drop;
  }

  delete this.input.drag;
  delete this.input;
};

exports.onmove = function(cb) {  // {{{2
  var that = this;

  this._onmove = cb;

  if (this._move) return;

  document.body.addEventListener(this.type === 'mouse' ? 'mousemove' : 'touchmove', this._move = function(ev) {
    if (that.type === 'mouse') {
      var point = {
        x: ev.clientX,
        y: ev.clientY,
      };
    } else {
      var point = {
        x: ev.touches[0].clientX,
        y: ev.touches[0].clientY,
      };
    }

    if (that.offset) {
      point.x -= that.offset.x;
      point.y -= that.offset.y;
    }

    if (! that.dragged) {
      if (
        Math.abs(point.x - that.last.x) < 5 &&
        Math.abs(point.y - that.last.y) < 5
      ) {
        return;
      }

      that.dragged = true;
    }

    return that._onmove && that._onmove(ev, point);

    that.last = point;
  });
};

exports.ondrop = function(cb) {  // {{{2
  this._ondrop = cb;
};

// Private {{{1
function registerDrop(that) {  // {{{2
  document.body.addEventListener(that.type === 'mouse' ? 'mouseup' : 'touchend', that._drop = function(ev) {
    var res = that._ondrop && that._ondrop(ev);

    that.cleanup();

    return res;
  });
}

