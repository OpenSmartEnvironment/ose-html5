'use strict';

var O = require('ose').class(module, C, './index');

var Detail = require('./detail');

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption Gesture view
 *
 * @readme
 * View for displaying an entry with the gesture interface.
 *
 * This view creates a canvas on which, for example, gesture traces
 * can be drawn. A transparent `<div>` placed over this canvas is a
 * Hammer.js element registering touch gestures.
 *
 * @class html5.lib.view.gesture
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
exports.layout = 'gesture';
exports.loadData = Detail.loadData;
exports.setEntry = Detail.setEntry;
exports.post = Detail.post;
exports.removed = Detail.removed;
exports.markHome = Detail.markHome;

function C(tag, attrs) {  // {{{2
  O.super.call(this, 'div');
}

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'touch') return false;

  return Entry.verifyStateObj.call(this, val);
};

exports.display = function() {  // {{{2
  var that = this;

  if (this.header) {
    this.new('span', 'bitCaption')
      .text(this.entry.getCaption() + ' Touch Control')
      .appendTo(this.header)
    ;
  }

  this
    .empty()
    .addClass('handleResize')
    .on('resize', onResize.bind(this))
    .style('overflow', 'hidden')
    .add([
      '<canvas class="touchCanvas">',
      '<div class="touchKeyarea">',
      '<menu class="buttonsRight">',
    ])
  ;

  this.canvas = this.find('canvas').el.getContext('2d');

  setTimeout(onResize.bind(this), 100);
};

exports.clearCanvas = function() {
/**
 * Clears the canvas
 *
 * @method clearCanvas
 */

  var canvas = this.find('canvas.touchCanvas');

  this.canvas.clearRect(0, 0, canvas.width(), canvas.height());
}

exports.log = function(message, val) {  // {{{2
/**
 * Debug aid method
 *
 * @param message {String}
 * @param val {Object}
 *
 * @method log
 */

  this.add('<br>');
  this.append('span').text('Message: ' + message);

  if (val) {
    this.append('span').text('val: ' + JSON.stringify(val));
  }
};

// }}}1
// Event Handlers {{{1
function onResize() {  // {{{2
  this.offset = {
    top: O.ui.main.header.height(),
    left: 0
  };

  var w = this.width();
  var h = this.height();

  console.log('RESIZE', this.offset.top);

  var canvas = this.find('canvas.touchCanvas');
  canvas.top(this.offset.top);
  canvas.width(w);
  canvas.height(h);

  // This looks strange but is actually necessary.
  canvas.attr('width', w + 'px');
  canvas.attr('height', h + 'px');

  this.clearCanvas();

  var m = this.find('menu');
  var l = w - m.width();
  m.top(this.offset.top);
  m.left(l);
  this.find('div.touchKeyarea')
    .top(this.offset.top)
    .width(w)
    .height(h)
  ;
};

// }}}1
