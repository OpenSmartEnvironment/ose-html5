'use strict';

const O = require('ose')(module)
  .class(init)
;

var Consts = O.consts('html5');
Consts.tapTimeout = 200;
Consts.tapThreshold = 5;
Consts.holdTimeout = 800;
Consts.dragThreshold = 10;

/** Docs {{{1
 * @module html5
 */

/**
 * @caption HTML events handler
 *
 * @readme
 * This class handles events on the HTML page
 *
 * @aliases eventHandling
 * @class html5.lib.input
 * @type class
 */


// Class {{{1
function init() {
/**
 * Class constructor
 *
 * @method constructor
 */

  document.addEventListener('visibilitychange', visibilityChange.bind(this));

  window.onpopstate = popState.bind(this);
  window.onbeforeunload = beforeUnload.bind(this);

//  window.addEventListener('blur', blur.bind(this), true);
  window.addEventListener('focus', focus.bind(this), true);
  window.addEventListener('keydown', keyDown.bind(this));
//  window.addEventListener('keyup', keyUp.bind(this), true);
  window.addEventListener('input', input.bind(this), true);
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
//  console.log('POP STATE', ev, window.history.state);

  O.ui.body.display(window.history.state, 'history', function(err) {
    if (err) O.log.error(err);
  });
};

function beforeUnload(ev) {  // {{{2
//  console.log('BEFORE UNLOAD', ev);

  O.ui.updateHistory();

  O.quit();
}

function blur(ev) {  // {{{2
//  console.log('BLUR', ev);

//  activate(this, undefined);
}

function focus(ev) {  // {{{2
//  console.log('FOCUS', ev, document.activeElement);

  activate(this, document.activeElement);
}

function keyDown(ev) {  // {{{2
//  console.log('KEYDOWN', ev.code, ev.key);

  if (this.mouseActivity) return;

  var active = document.activeElement && document.activeElement.ose && document.activeElement !== document.body ?
    document.activeElement.ose :
    this.active
  ;

  // Trigger active wrap key event handlers
  if (bubble(active, 'key', ev)) {
    stop(ev);
    return;
  }

  switch (ev.code) {
  case 'Tab':
    stop(ev);
    if (ev.shiftKey) {
      focusPrev(this, active);
    } else {
      focusNext(this, active);
    }
    return;
  case 'Escape':
    stop(ev);
    // TODO: call O.ui.body.esc()
    if (O.ui.body.drawer && ! O.ui.body.drawer.hidden) {
      O.ui.body.drawer.hide();
    }

    var sel = window.getSelection();
    sel.removeAllRanges();

    return;
  case 'Enter':
  case 'Space':
    if (bubble(active, 'tap', ev)) {
      stop(ev);
    }
    return;
  case 'ArrowUp':
    stop(ev);
    focusPrev(this, active);
    return;
  case 'ArrowDown':
    stop(ev);
    focusNext(this, active);
    return;
  }
}

function keyUp(ev) {  // {{{2
//  console.log('KEYUP', ev);
}

function input(ev) {  // {{{2
  if (ev.target.ose) {
    ev.target.ose.trigger('input', ev);
  }
}

function mouseDown(ev) {  // {{{2
//  console.log('MOUSE DOWN', ev, ev.target);

  if (this.mouseActivity) return;

  beginMouse(this, 'mouse', ev);

  if (this.mouseActivity && this.mouseActivity.draggable) {
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
    if (
      ma.holded ||      // Mouse hold was recognized
      ! ma.draggable    // No draggable wrap found
    ) {
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

    if (ma.drag && ma.holdTimer) {  // Hold is waiting for trigger
      clearTimeout(ma.holdTimer);
      delete ma.holdTimer;
    }

    return;
  }

  throw O.log.error(this, 'Invalid mouse activity `drag`', ma.drag);
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

  activate(ev.target);
}

function scroll(ev) {  // {{{2
//  console.log('SCROLL', ev);

  if (ev.target === O.ui.body.el) {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scollTimer = undefined;
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
  if (top < 44) return scrollBody(that, top - 44);

  var height = wrap.height();
  var bodyHeight = O.ui.body.height();

  // Wrap bottom is too down
  if (top + height > bodyHeight + 36) {

    // Wrap.height is bigger than Main.height
    if (height < bodyHeight - 8) {
      return scrollBody(that, top + height - bodyHeight - 36);
    }

    return scrollBody(that, top - 44);
  }

  return;
}

function scrollBody(that, delta) {  // {{{2
  console.log('SCROLL BODY', delta);

  O.ui.body.el.scrollTop += delta;
}

function markActive(that, wrap) {  // Mark wrap as active {{{2
//  console.log('MARK ACTIVE', wrap);

  if (that.toBeMarkedActive === wrap) return;

  that.toBeMarkedActive = wrap;

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

function focusNext(that, el) {  // {{{2
  el = el && el.el || document.body;

  while (el) {
    if (el.firstChild && el.firstChild.style && el.firstChild.style.display !== 'hidden') {
      el = el.firstChild;
    } else if (el.nextSibling) {  // TODO skip hidden
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

function focusPrev(that, el) {  // {{{2
  el = el && el.el || document.body;

  while (el) {
    if (el.previousSibling) {  // TODO skip hidden
      el = el.previousSibling;

      while (el.lastChild && el.lastChild.style && el.lastChild.style.display !== 'hidden') {
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

function beginMouse(that, type, coord) {  // {{{2
  var ma = {
    type: type,
    at: Date.now(),
    begin: {
      x: coord.clientX,
      y: coord.clientY,
    },
    target: coord.target,
  };

  var el = ma.target;
  while (el && el !== document.body) {
    if (el.ose) {
      if (! ma.draggable) {
        if (el.ose._on_drag || el.ose.control && el.ose.control.drag) {
          if (! ma.wrap) ma.wrap = el.ose;
          ma.draggable = el.ose;
        }
      }

      if (! ma.tappable) {
        if (el.ose._on_tap || el.ose.control && el.ose.control.tap) {
          if (! ma.wrap) ma.wrap = el.ose;
          ma.tappable = el.ose;
        }
      }

      if (! ma.holdable) {
        if (el.ose._on_hold || el.ose.control && el.ose.control.hold) {
          if (! ma.wrap) ma.wrap = el.ose;
          ma.holdable = el.ose;
        }
      }

      if (! ma.wrap && el.ose._on_key || el.ose.control && el.ose.control.key) {
        ma.wrap = el.ose;
      }
    }

    el = el.parentElement;
  }

  if (ma.wrap) {
    ma.move = mouseMove.bind(that, ma),
    ma.last = ma.begin;

    window.addEventListener(type + 'move', ma.move, true);

    that.mouseActivity = ma;
  }

  if (ma.holdable) {
    ma.holdTimer = setTimeout(function() {
      delete ma.holdTimer;

      if (
        Math.abs(ma.begin.x - ma.last.x) < Consts.tapThreshold &&  // Test mouse position
        Math.abs(ma.begin.y - ma.last.y) < Consts.tapThreshold
      ) {
        if (ma.holdable.trigger('hold', ma) === false) {
          ma.holded = true;
        }
      }
    }, ma.holdable.holdTimeout || Const.holdTimeout);
  }
}

function endMouse(that, type, ev) {  // {{{2
  var ma = that.mouseActivity;

  if (! ma) return;
  if (ma.type !== type) return;

  if (ma.holdTimer) {
    clearTimeout(ma.holdTimer);
    delete ma.holdTimer;
  }

  if (ma.drag) {
    if (typeof ma.drop === 'function') {
      if (ma.drop(ma) === false) {
        return end(true);
      }
    }
    return end();
  }

  if (
    Math.abs(ma.begin.x - ma.last.x) > Consts.tapThreshold ||
    Math.abs(ma.begin.y - ma.last.y) > Consts.tapThreshold
  ) {
    return end();
  }

  if (ma.holded) {
    return end(ma.holdable.trigger('release', ma) === false);
  }

  if (Date.now() - ma.at > Consts.tapTimeout) return end();
  if (ma.tappable) {
    return end(bubble(ma.tappable, 'tap', ma));
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
  if (el.style.display === 'hidden') return false;
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

