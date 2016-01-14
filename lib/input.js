'use strict';

var O = require('ose').class(module, C);

var Consts = O.consts('html5');
Consts.tapTimeout = 200;
Consts.tapThreshold = 5;
//Consts.holdTimeout = 800;
Consts.dragThreshold = 10;

// Class {{{1
function C() {
  document.addEventListener('visibilitychange', visibilityChange.bind(this));

  window.onpopstate = popState.bind(this);
  window.onbeforeunload = beforeUnload.bind(this);

//  window.addEventListener('blur', blur.bind(this), true);
  window.addEventListener('focus', focus.bind(this), true);
  window.addEventListener('keydown', keyDown.bind(this));
//  window.addEventListener('keyup', keyUp.bind(this), true);
  window.addEventListener('mousedown', mouseDown.bind(this), true);
  window.addEventListener('mouseout', mouseOut.bind(this), true);
  window.addEventListener('mouseover', mouseOver.bind(this), true);
  window.addEventListener('mouseup', mouseUp.bind(this), true);
  window.addEventListener('scroll', scroll.bind(this), true);
  window.addEventListener('touchend', touchEnd.bind(this), true);
  window.addEventListener('touchstart', touchStart.bind(this), true);
}

// Event handlers {{{1
function visibilityChange(ev) {  // {{{2
  var that = this;

  if (this.visibilityTimeout) {
    clearTimeout(this.visibilityTimeout);
    this.visibilityTimeout = undefined;
  }

  switch (document.visibilityState) {
  case 'hidden':
//    console.log('DOCUMENT HIDE');

    // Wait 10 seconds before peer disconnect.
    this.visibilityTimeout = setTimeout(function() {
      that.visibilityTimeout = undefined;
      O.gw.disconnect();
    }, 10 * 1000);
    return;
  case 'visible':
//    console.log('DOCUMENT SHOW');

    if (! O.gw.isConnected()) {
      O.gw.connect();
    }
    return;
  }
}

function popState(ev) {  // {{{2
//  console.log('POP STATE', window.history.state);

  O.ui.display(window.history.state, 'history', function(err) {
    if (err) O.log.error(err);
  });
};

function beforeUnload(ev) {  // {{{2
  O.ui.updateHistory();
}

function blur(ev) {  // {{{2
//  console.log('BLUR', ev);

//  activate(this, undefined);
}

function focus(ev) {  // {{{2
//  console.log('FOCUS', ev);

  activate(this, document.activeElement);
}

function keyDown(ev) {  // {{{2
//  console.log('KEYDOWN', ev.code, ev.key);

  if (this.mouseActivity) return;

  // Trigger active wrap key event handlers
  if (bubble(this.active, 'key', ev)) {
    stop(ev);
    return;
  }

  switch (ev.code) {
  case 'Tab':
    stop(ev);
    if (ev.shiftKey) {
      focusPrev(this);
    } else {
      focusNext(this);
    }
    return;
  case 'Escape':
    stop(ev);
    if (! O.ui.drawer.hidden) {
      O.ui.drawer.hide();
    }

    var sel = window.getSelection();
    sel.removeAllRanges();

    return;
  case 'Enter':
  case 'Space':
    if (bubble(this.active, 'tap', ev)) {
      stop(ev);
    }
    return;
  case 'ArrowUp':
    stop(ev);
    focusPrev(this);
    return;
  case 'ArrowDown':
    stop(ev);
    focusNext(this);
    return;
  }
}

function keyUp(ev) {  // {{{2
//  console.log('KEYUP', ev);
}

function mouseDown(ev) {  // {{{2
//  console.log('MOUSE DOWN', ev, ev.target);

  if (! this.active) return;

  if (this.mouseActivity) return;

  beginMouse(this, 'mouse', ev);

  if (this.mouseActivity.draggable) {
    stop(ev);
  }
}

function mouseMove(ma, ev) {  // {{{2
//  console.log('MOUSE MOVE', ev);

  if (! ma) return;

  switch (ma.type) {
  case 'mouse':
    ma.last = {
      x: ev.clientX,
      y: ev.clientY,
    };
    break;
  case 'touch':
    ma.last = {
      x: ev.touches[0].clientX,
      y: ev.touches[0].clientY,
    };
    break;
  default:
    throw O.log.error('INVALID_ARGS', 'Mouse activity type', ma.type);
  }

  switch (typeof ma.drag) {
  case 'boolean':
    if (ma.drag) stop(ev);
    return;
  case 'function':
    ma.drag(ma);
    return stop(ev);
  case 'undefined':
    // Recognize drag
    if (! ma.draggable) {
      ma.drag = false;
      return;
    }

    if (
      Math.abs(ma.last.x - ma.begin.x) < Consts.dragThreshold &&
      Math.abs(ma.last.y - ma.begin.y) < Consts.dragThreshold
    ) {
      return;
    }

    if (ma.draggable.trigger('drag', ma) === false) {
      stop(ev);
    }
    return;
  }
}

function mouseOut(ev) {  // {{{2
//  console.log('MOUSE OUT', ev);

  this.mouseOutTimer = setTimeout((function() {
    this.mouseOutTimer = undefined;

    if (! this.mouseActivity) {
      activate(this, undefined);
    }
  }).bind(this), 250);
}

function mouseOver(ev) {  // {{{2
//  console.log('MOUSE OVER', ev);

  if (this.mouseOutTimer) {
    clearTimeout(this.mouseOutTimer);
    this.mouseOutTimer = undefined;
  }

  if (this.mouseActivity) return;

  activate(this, ev.target);
}

function mouseUp(ev) {  // {{{2
//  console.log('MOUSE UP', ev);

  endMouse(this, 'mouse', ev);
}

function scroll(ev) {  // {{{2
//  console.log('SCROLL', ev);

  if (ev.target === O.ui.main.el) {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    this.scrollTimer = setTimeout((function() {
      this.scrollTimer = undefined;
    }).bind(this), 200);
  }
}

function touchEnd(ev) {  // {{{2
//  console.log('TOUCH END', ev);

  endMouse(this, 'touch', ev);

  markActive(this, undefined);
}

function touchStart(ev) {  // {{{2
  if (ev.touches.length !== 1) return;

//  console.log('TOUCH START', ev, ev.touches[0].target);

  activate(this, ev.touches[0].target);

  beginMouse(this, 'touch', ev.touches[0]);
}

// Private {{{1
function activate(that, el) {  // Try to find appropriate wrap and call `setActive()` {{{2
//  console.log('ACTIVATE', el && el.tagName);

  if (that.scrollTimer) {
    clearTimeout(that.scrollTimer);
    that.scrollTimer = undefined;
    return;
  }

  while (el && el !== document.body) {
    if (canActivate(el)) {
      return setActive(that, el.ose);
    }

    el = el.parentElement;
  }

  return setActive(that, undefined);
}

function setActive(that, wrap, focus) {  // Set wrap as active {{{2
//  console.log('SET ACTIVE', wrap);

  that.active = wrap;

  markActive(that, wrap);

  if (! (wrap && focus)) return;

  if (document.activeElement === wrap.el) return;

  wrap.el.focus();

  if (document.activeElement && document.activeElement === wrap.el) {
    return;
  }

  document.body.focus();

  // Check whether wrap is visible
  var top = wrap.offset().y;

  // Wrap top is too up
  if (top < 44) return scrollMain(that, top - 44);

  var height = wrap.height();
  var mainHeight = O.ui.main.height();

  // Wrap bottom is too down
  if (top + height > mainHeight + 36) {

    // Wrap.height is bigger than Main.height
    if (height < mainHeight - 8) {
      return scrollMain(that, top + height - mainHeight - 36);
    }

    return scrollMain(that, top - 44);
  }

  return;
}

function scrollMain(that, delta) {  // {{{2
  O.ui.main.el.scrollTop += delta;
}

function markActive(that, wrap) {  // Mark wrap as active {{{2
//  console.log('MARK ACTIVE', wrap);

  if (that.markActiveTimeout) {
    clearTimeout(that.markActiveTimeout);
    that.markActiveTimeout = undefined;
  }

  if (wrap === that.markedActive) return;

  if (wrap && ! that.markedActive) {
    return doit();
  }

  that.markActiveTimeout = setTimeout(doit, wrap ? 10 : 250);

  function doit() {
    that.markActiveTimeout = undefined;

    if (that.markedActive) {
      if (that.markedActive.el) {
        that.markedActive.el.removeAttribute('active');
      }
      that.markedActive = undefined;
    }

    if (! wrap) return;

    that.markedActive = wrap;
    wrap.el.setAttribute('active', '');
  };
}

function stop(ev) {  // {{{2
  ev.stopPropagation();
  ev.stopImmediatePropagation();
  ev.preventDefault();
};

function focusNext(that) {  // {{{2
  var el = that.active && that.active.el || document.body;

  while (el) {
    if (el.firstChild) {
      el = el.firstChild;
    } else if (el.nextSibling) {
      el = el.nextSibling;
    } else {
      el = parent(el);
    }

    if (! el) return;

    if (canActivate(el)) {
      setActive(that, el.ose, true);
      return;
    }
  }

  return;

  function parent(e) {
    if (e.parentNode) e = e.parentNode;

    if (e.nextSibling) return e.nextSibling;

    if (e === document.body) return e;

    return parent(e);
  }
}

function focusPrev(that) {  // {{{2
  var el = that.active && that.active.el || document.body;

  while (el) {
    if (el.previousSibling) {
      el = el.previousSibling;

      while (el.lastChild) {
        el = el.lastChild;
      }
    } else {
      el = el.parentNode;
    }

    if (! el) return;

    if (canActivate(el)) {
      setActive(that, el.ose, true);
      return;
    }
  }

  return;
}

function bubble(wrap, name, ev) {  // {{{2
  while (wrap) {
    if (! wrap.el) return false;

    if (wrap.trigger(name, ev) === false) {
      return true;
    }

    var el = wrap.el.parentElement;

    while (el && el !== document.body && ! el.ose) {
      el = el.parentElement;
    }

    wrap = el && el.ose;
  }

  return false;
}

function testTap(ma) {  // {{{2
  if (! ma) return false;
  if (! ma.tappable) return false;

  switch (ma.drag) {
  case undefined:
  case false:
    break
  default:
    return false;
  }

  if (Date.now() - ma.at > Consts.tapTimeout) return false;

  if (
    Math.abs(ma.begin.x - ma.last.x) > Consts.tapThreshold ||
    Math.abs(ma.begin.y - ma.last.y) > Consts.tapThreshold
  ) {
    return false;
  }

  return bubble(ma.tappable, 'tap', ma);
}

function beginMouse(that, type, coord) {  // {{{2
  if (! that.active) return;

  var ma = that.mouseActivity = {
    type: type,
    at: Date.now(),
    begin: {
      x: coord.clientX,
      y: coord.clientY,
    },
    target: coord.target,
  };

  ma.move = mouseMove.bind(that, ma),
  ma.last = ma.begin;

  window.addEventListener(type + 'move', ma.move, true);

  if (that.active) {
    ma.active = that.active;

    var el = ma.target;
    while (el && el !== document.body) {
      if (el.ose) {
        if (! ma.draggable) {
          if (el.ose._on_drag || el.ose.control && el.ose.control.drag) {
            ma.draggable = el.ose;
            if (ma.tappable) break;
          }
        }

        if (! ma.tappable) {
          if (el.ose._on_tap || el.ose._on_hold || el.ose.control && (el.ose.control.tap || el.ose.control.hold)) {
            ma.tappable = el.ose;
            if (ma.draggable) break;
          }
        }
      }

      el = el.parentElement;
    }
  }

  return;
}

function endMouse(that, type, ev) {  // {{{2
  var ma = that.mouseActivity;

  if (! ma) return;
  if (ma.type !== type) return;

  if (testTap(ma)) {
    return end(true);
  }

  if (typeof ma.drop === 'function') {
    if (ma.drop(ma) === false) {
      return end(true);
    }
  }

  return end();

  function end(doStop) {
    if (doStop) stop(ev);

    window.removeEventListener(ma.type + 'move', ma.move, true);

    that.mouseActivity = undefined;
  }
}

function canActivate(el) {  // {{{2
  if (! el) return false;
  if (! el.ose) return false;
  if (isReadOnly(el)) return false;

  if (el.ose._on_key || el.ose._on_tap || el.ose._on_hold || el.ose._on_drag) return true;

  if (! el.ose.control) return false;

  return Boolean(el.ose.control.key || el.ose.control.tap || el.ose.control.hold || el.ose.control.drag);

  function isReadOnly(el) {
    while (el && el !== document.body) {
      if (el.hasAttribute('readonly')) {
        switch (el.getAttribute('readonly').toLowerCase()) {
        case '':
        case '1':
        case 'yes':
        case 'true':
          return true;
        case '0':
        case 'no':
        case 'false':
          return false;
        }
      }

      el = el.parentElement;
    }

    return false;
  }
};

