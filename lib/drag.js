'use strict';

var O = require('ose').class(module, C);

// Public {{{1
function C(input, ev) {  // {{{2
  var that = this;

  if (input.drag) {
    input.drag.stop();
    this._ondrop && this._ondrop();
  }
  input.drag = this;
  this.input = input;

  this.start = {
    x: ev.clientX,
    y: ev.clientY,
  };

  document.body.addEventListener('mouseup', this._drop = function(ev) {
    that.cleanup();
    return that._ondrop && that._ondrop(ev);
  });
}

exports.cleanup = function() {  // {{{2
  if (this._move) {
    document.body.removeEventListener('mousemove', this._move);
    delete this._move;
  }

  if (this._drop) {
    document.body.removeEventListener('mouseup', this._drop);
    delete this._drop;
  }

  delete this.input.drag;
  delete this.input;
};

exports.onmove = function(cb) {  // {{{2
  var that = this;

  this._onmove = cb;

  if (this._move) return;

  document.body.addEventListener('mousemove', this._move = function(ev) {
    return that._onmove && that._onmove(ev);
  });
};

exports.ondrop = function(cb) {  // {{{2
  this._ondrop = cb;
};

