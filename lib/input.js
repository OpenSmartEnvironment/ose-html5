'use strict';

var O = require('ose').class(module, C);

var Drag = O.class('./drag');

// Public {{{1
function C() {  // {{{2
  window.addEventListener('mouseout', mouseOut.bind(this), true);
  window.addEventListener('mouseover', mouseOver.bind(this), true);
  window.addEventListener('focus', focus.bind(this), true);
  window.addEventListener('blur', blur.bind(this), true);
  window.addEventListener('keyUp', keyUp.bind(this), true);
}

exports.startDrag = function(ev) {  // {{{2
  return new Drag(this, ev);
};

// Event handlers {{{1
function mouseOut(ev) {  // {{{2
//  console.log('MOUSE OUT', ev);

  hover(this);
}

function mouseOver(ev) {  // {{{2
//  console.log('MOUSE OVER', ev);

  hover(this, ev.target);
}

function blur(ev) {  // {{{2
  hover(this);
}

function focus(ev) {  // {{{2
//  console.log('FOCUS', ev);

  hover(this, document.activeElement);
}

function keyUp(ev) {  // {{{2
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
function hover(that, target) {  // {{{2
  if (that.hoverTimeout) {
    clearTimeout(that.hoverTimeout);
    delete that.hoverTimeout;
  }

  that.hoverTimeout = setTimeout(function() {
    delete that.hoverTimeout;

    if (target === that.focused) return;

    if (that.focused) {
      that.focused.removeAttribute('focus');
      delete that.focused;
    }

    while (target && target !== document.body) {
      if (canFocus(target)) {
        that.focused = target;
        target.setAttribute('focus', 1);
        return;
      }

      target = target.parentElement;
    }

    return;
  }, 30);
}

function canFocus(el) {  // {{{2
  if (el.hasAttribute('readonly')) return false;

  switch (el.tagName) {
  case 'INPUT':
    return true;
  }

  if (el.hasAttribute('focusable')) return true;
  if (el.hasAttribute('tabindex')) return true;
  if (el.hasAttribute('contentEditable')) return true;

  return false;
}
