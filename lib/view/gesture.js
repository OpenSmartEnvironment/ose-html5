'use strict';

const O = require('ose')(module)
  .class(init, './detail')
;

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
 * can be drawn. A transparent `<section>` placed over this canvas is
 * an element registering touch and key gestures.
 *
 * @class html5.lib.view.gesture
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
function init() {  // {{{2
  O.inherited(this)('section', 'gesture');
}

exports.layout = 'gesture';  // {{{2

exports.verifyDemand = function(val) {  // {{{2
  if (val.view !== 'gesture') return false;

  return O.inherited(this, 'verifyDemand')(val);
};

exports.display = function() {  // {{{2
  this.empty();

  this.canvas = this.tree('canvas').el.getContext('2d');
  this.section('touchArea')
    .span(undefined, {contenteditable: undefined})
    .section('buttons')
  ;

  this.displayHeader();

  this.markHome(this.entry.isAtHome() || this.entry.masterState === this.entry.MASTER_STATE.HOME);

  this.offset = {
    x: 0,
    y: O.ui.header.height(),
  };

  this.onResize = O._.debounce(onResize.bind(this), 100);
  window.addEventListener('resize', this.onResize);
  this.onResize();

  this.onSelection = O._.debounce(onSelection.bind(this), 100, true);
  document.addEventListener('selectstart', this.onSelection);
  document.addEventListener('selectionchange', this.onSelection);

  this.displayLayout && this.displayLayout();

  var that = this;
  this.on('removed', function() {
    window.removeEventListener('resize', that.onResize);
    document.removeEventListener('selectstart', that.onSelection);
    document.removeEventListener('selectionchange', that.onSelection);
  });

  this.endUpdate();
};

exports.displayHeader = function() {  // {{{2
  if (this.header) {
    this.header.empty().h2(this.entry.getCaption() + ' Touch Control');
  }
};

exports.clearCanvas = function() {
/**
 * Clears the canvas
 *
 * @method clearCanvas
 */

  this.canvas.clearRect(0, 0, this.width(), this.height());
};

exports.log = function(message, val) {  // {{{2
/**
 * Debug aid method
 *
 * @param message {String}
 * @param val {Object}
 *
 * @method log
 */

  var wrap = this.find('.touchArea');

  wrap.append2('<br><span>' + message + '</span>');

  if (val) {
    wrap.tree('span').text(JSON.stringify(val));
  }
};

// Event Handlers {{{1
function onSelection(ev) {  // {{{2
  if (ev) {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();
  }

  setTimeout(function() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
  });

  return false;
}

function onResize() {  // {{{2
  var w = this.width();
  var h = this.height();

  var canvas = this.find('canvas');

  // This looks strange but is actually necessary.
  canvas.attr('width', w + 'px');
  canvas.attr('height', h + 'px');

  this.clearCanvas();
};

