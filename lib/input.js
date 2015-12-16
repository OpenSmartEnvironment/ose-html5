'use strict';

var O = require('ose').class(module, C);

var Drag = O.class('./drag');

// Public {{{1
function C() {  // {{{2
  document.body.addEventListener('mouseout', mouseOut.bind(this));
  document.body.addEventListener('mouseover', mouseOver.bind(this));
  window.onkeyup = onKeyup.bind(this);
}

exports.startDrag = function(ev) {  // {{{2
  return new Drag(this, ev);
};

// Event handlers {{{1
function mouseOut(ev) {  // {{{2
//  console.log('MOUSE OUT', ev);

  hover(this, 'out', ev.target);
}

function mouseOver(ev) {  // {{{2
//  console.log('MOUSE OVER', ev);

  hover(this, 'in', ev.target);
}

function onKeyup(ev) {  // {{{2
//  console.log('KEY UP', ev);

  if (ev.defaultPrevented) return;

  switch (ev.keyCode || ev.which) {
  case 27: // Escape
    O.ui.main.stop(ev);

    if (O.ui.globalDrawer.visible()) {
      O.ui.globalDrawer.hide();
    }
    return;
  case 38:  // Up
    O.ui.main.stop(ev);
    O.ui.main.focusPrev(null);
    return;
  case 40:  // Down
    O.ui.main.stop(ev);
    O.ui.main.focusNext(null);
    return;
  }
}

// Private {{{1
function hover(that, direction, target) {  // {{{2
  if (that.hoverTimeout) {
    clearTimeout(that.hoverTimeout);
    delete that.hoverTimeout;
  }

  switch (direction) {
  case 'in':
  case 'out':
    break;
  default:
    throw O.log.error(that, 'INVALID_ARGS', direction);
  }

  that.hoverTimeout = setTimeout(function() {
    delete that.hoverTimeout;

    if (direction !== 'in' || target === document.activeElement) {
      return;
    }

    while (target && target !== document.body) {
      target.focus();
      if (document.activeElement === target) {
        return;
      }

      target = target.parentElement;
    }

    document.activeElement && document.activeElement.blur();
  }, 30);
}

