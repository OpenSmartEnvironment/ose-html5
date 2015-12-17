'use strict';

var O = require('ose').class(module, C);

/** Docs {{{1
 * @module html5
 */

/**
 * @caption Element wrapper
 *
 * @readme
 * This class provides helper functions for DOM manipulation.
 *
 * @aliases elementWrapper elementWrapperClass
 * @class html5.lib.wrap
 * @type class
 */

// Public {{{1
function C(tag, attrs) {  // {{{2
/**
 * Wrap constructor
 *
 * @param tag {String|Object} Tag to be wrapped or created
 * @param attrs {Object} Attributes of tag
 *
 * @method constructor
 */

  switch (typeof (tag || undefined)) {
  case 'string':
    if (tag.charAt(0) === '<') {
      var t = document.createElement('template');
      t.innerHTML = tag;
      this.el = document.adoptNode(t.content).firstElementChild;
      break;
    }

    this.el = document.createElement(tag);
    break;
  case 'object':
    if (tag instanceof C) {
      this.el = tag.free();
      break;
    }

    this.el = tag;
    break;
  default:
    throw O.log.error(this, 'INVALID_ARGS', arguments);
  }

  switch (typeof (attrs || undefined)) {
  case 'undefined':
    break;
  case 'object':
    this.attrs(attrs);
    break;
  case 'string':
    this.el.setAttribute('class', attrs);
    break;
  default:
    throw O.log.error(this, 'INVALID_ARGS', arguments);
  }
};

exports.find = function(sel) {  // {{{2
/**
 * Find first element within the current element using the selector
 * `sel`.
 *
 * @param sel {String}
 *
 * @returns {Object} Element wrapper
 *
 * @method find
 */

  var el = this.el.querySelector(sel);

  if (! el) return null;

  if (el.ose instanceof C) {
    return el.ose;
  }

  return new C(el);
};

exports.hook = function() {  // {{{2
/**
 * Create tie between an element and its wrapper by setting the `el.ose` property.
 *
 * @method hook
 *
 * @returns {Object} `this`
 */

  this.el.ose = this;

  return this;
};

exports.free = function() {  // {{{2
/**
 * Remove tie between an element and its wrapper
 *
 * @returns {Object} HTML element
 *
 * @method free
 */

  var el = this.el;
  delete el.ose;
  delete this.el;

  return el;
};

exports.on = function(name, cb, useCapture) {  // {{{2
/**
 * Add event listener to element
 *
 * @param name {String} Event name
 * @param cb {Function} Callback
 *
 * @method on
 * @chainable
 */

  this.el.addEventListener(name, cb, useCapture);

  return this;
};

exports.off = function(name, cb) {  // {{{2
/**
 * Remove event listener from element
 *
 * @param name {String} Event name
 * @param cb {Function} Callback to be removed
 *
 * @method off
 */

  O.log.todo();

  return this;
};

exports.attr = function(name, val) {  // {{{2
/**
 * Set or get single attribute
 *
 * @param name {String} Attribute name
 * @param val {String} Value to be set

 * @method attr
 */

  if (arguments.length === 1) {
    return this.el.getAttribute(name);
  }

  switch (val) {
  case null:
  case undefined:
    this.el.removeAttribute(name);
    return this;
  }

  this.el.setAttribute(name, val);
  return this;
};

exports.attrs = function(vals) {  // {{{2
/**
 * Set multiple attribute
 *
 * @param vals {Object} Key/value pairs of attributes to be set

 * @method attrs
 */

  for (var key in vals) {
    this.attr(key, vals[key]);
  }
  return this;
};

exports.val = function(val) {  // {{{2
/**
 * Set or get value
 *
 * @param [val] {*} Value to be set
 *
 * @return {*} Return current value when called with no arguments, otherwise return `this` (chaining).
 *
 * @method attr
 */

  switch (this.el.tagName) {
  case 'SPAN':
    if (this.hasClass('buttons')) {
      return buttonsVal(this, arguments);
    }

    if (this.hasClass('slider')) {
      return sliderVal(this, arguments);
    }

    // NO BREAK
  case 'I':
  case 'A':
  case 'ASIDE':
  case 'DIV':
  case 'P':
    if (! arguments.length) {
      return this.el.textContent;
    }

    switch (val) {
    case ' ':
      this.el.textContent = '\u200b';
      return this;
    }

    this.el.textContent = val;
    return this;
  /*
  case 'html5-CHECKBOX':
  case 'html5-SWITCH':
    if (arguments.length) {
      val = Boolean(val);
      if (this.el.checked !== val) {
        this.el.checked = val;
      }
      return this;
    }
    return this.el.checked;
  case 'html5-SLIDER':
    if (arguments.length) {
      this.el.els.input.value = val;
      return this;
    }
    return this.el.els.input.value;
  case 'html5-PROGRESS':
    if (! arguments.length) {
      return this.el.value;
    }

    switch (typeof (val || undefined)) {
    case 'undefined':
      val = 0;
      // NO BREAK
    case 'number':
      this.el.fillTime = 0;
      this.el.value = val;
      return this;
    case 'object':
      this.el.fillTime = 0;
      this.el.value = (val.value || 0) * 100 / (val.max || 100);
      if (typeof val.duration === 'number' && typeof val.aim === 'number') {
        transitProgress(this.el, val.aim, val.max || 100, val.duration || 0);
      }
      return this;
    }
  */
  }

  if (! arguments.length) {
    return this.el.getAttribute('value');
  }

  switch (val) {
  case null:
  case undefined:
    this.el.removeAttribute('value', val);
    return this;
  }

  this.el.setAttribute('value', val);
  return this;
};

exports.prop = function(name, val) {  // {{{2
/**
 * Set or get single property
 *
 * @param name {String} Property to be set
 * @param val {String} Value to be set
 *
 * @method prop
 */

  if (arguments.length === 1) {
    return this.el[name];
  }

  switch (val) {
  case null:
  case undefined:
    delete this.el[name];
    return this;
  }

  this.el[name] = val;
  return this;
};

exports.props = function(vals) {  // {{{2
/**
 * Set or get single property
 *
 * @param vals {Object} Key/value pairs of properties to be set
 *
 * @method props
 */

  for (var key in vals) {
    this.prop(key, vals[key]);
  }
  return this;
};

exports.style = function(name, val) {  // {{{2
/**
 * Set single CSS style
 *
 * @param name {String} Name of style property
 * @param val {String|Number} Value to be set
 *
 * @method style
 */

  if (arguments.length === 1) {
    return this.el.style[name];
  }

  switch (val) {
  case null:
  case undefined:
    this.el.style[name] = '';
    return this;
  }

  this.el.style[name] = val;
  return this;
};

exports.styles = function(vals) {  // {{{2
/**
 * Set multiple CSS styles
 *
 * @param vals {Object} Key/value pairs of styles and their values
 *
 * @method styles
 */

  for (var key in vals) {
    this.style(key, vals[key]);
  }
  return this;
};

exports.show = function() {  // {{{2
/**
 * Show element
 *
 * @returns {Object} `this`
 *
 * @method show
 * @chainable
 */

  if (this.el.style.display !== "none") return this;

  this.el.style.display = this.el._display || 'block';
  delete this.el._display;

  return this;
};

exports.hide = function() {  // {{{2
/**
 * Hide element
 *
 * @returns {Object} `this`
 *
 * @method hide
 */

  if (this.el.style.display === "none") return this;

  this.el._display = this.el.style.display;
  this.el.style.display = 'none';

  return this;
};

exports.empty = function() {  // {{{2
/**
 * Remove all children
 *
 * @returns {Object} `this`
 *
 * @method empty
 */

  // TODO: broadcast "removed" event

  this.el.innerHTML = '';
  return this;
};

exports.html = function(val) {  // {{{2
/**
 * Set inner HTML
 *
 * @param val {String} Inner HTML
 *
 * @return {Object} `this`
 *
 * @method html
 */

  // TODO: broadcast "removed" event

  if (arguments.length) {
    this.el.innerHTML = val;
    return this;
  }

  return this.el.innerHTML;
};

exports.text = function(val) {  // {{{2
/**
 * Set text content
 *
 * @param val {String} Text
 *
 * @return {Object} `this`
 *
 * @method text
 */

  if (! arguments.length) {
    return this.el.textContent;
  }

  switch (typeof val) {
  case 'undefined':
    this.el.textContent = '';
    return this.hide();
  case 'string':
    if (val === ' ') {
      this.el.textContent = '\u200b';
      return this.show();
    }

    this.el.textContent = val;
    return this.show();
  case 'boolean':
  case 'number':
    this.el.textContent = val.toString();
    return this.show();
  case 'object':
    if (val === null) {
      this.el.textContent = '';
      return this.hide();
    }
  }

  O.log.error(this, 'Invalid text', val);
  return this;
};

exports.new = function(tag, attrs) {  // {{{2
/**
 * Create new element
 *
 * @param tag {String} Element tag name or HTML snippet
 * @param attrs {Object} Key/value pairs of attributes and their values
 *
 * @return {Object} Created element wrapper
 *
 * @method new
 */

  return new C(tag, attrs);
};

exports.wrap = function(el) {  // {{{2
/**
 * Create new element or wrap existing element
 *
 * @param el {String|Object} Element to be created or wrapped
 *
 * @return {Object} Wrapped element
 *
 * @method wrap
 */

  if (el instanceof C) return el;
  if (el.ose instanceof C) return el.ose;

  return new C(el);
};

exports.append = function(tag, attrs) {  // {{{2
/**
 * Create new element and append to `this.el`
 *
 * @param tag {String|Object} Tag name, tag element or HTML snippet
 * @param attrs {Object|String} Key/value pairs of attributes and their values or element class
 *
 * @return {Object} Created element wrapper
 *
 * @method append
 */

  switch (typeof (tag || undefined)) {
  case 'string':
    var res = new C(tag, attrs);
    this.el.appendChild(res.el);
    return res;
  case 'object':
    if (attrs) break;

    if (tag instanceof C) {  // `tag` is a wrap
      this.el.appendChild(tag.el);
      return tag;
    }

    if (tag.ose instanceof C) {  // `tag` is element with wrap assigned
      this.el.appendChild(tag);
      return tag.ose;
    }

    var res = new C(tag);  // `tag` should be an element
    this.el.appendChild(tag);
    return res;
  }

  throw O.log.error(this, 'INVALID_ARGS', arguments);
};

exports.add = function(val) {  // {{{2
/**
 * Append child element or elements
 *
 * @param val {String|Object|Array} Stuff to be added
 *
 * @returns {Object} `this`
 *
 * @method add
 */

  switch (typeof (val || undefined)) {
  case 'undefined':
    return this;
  case 'string':
    var t = document.createElement('template');
    t.innerHTML = val;
    this.el.appendChild(document.adoptNode(t.content));
    return this;
  case 'object':
    if (val instanceof C) {
      this.el.appendChild(val.el);
      return this;
    }

    if (! Array.isArray(val)) {
      this.el.appendChild(val instanceof C ? val.el : el);
      return this;
    }

    for (var i = 0; i < val.length; i++) {
      this.add(val[i]);
    }
    return this;
  }

  throw O.log.error(this, 'INVALID_ARGS', arguments);
};

exports.parent = function() {  // {{{2
  return this.wrap(this.el.parentElement);
};

exports.prependTo = function(parent) {  // {{{2
/**
 * Prepend to parent element
 *
 * @param parent {Object} Parent element
 *
 * @returns {Object} `this`
 *
 * @method prependTo
 */

  O.log.todo();

  return this;
};

exports.appendTo = function(parent) {  // {{{2
/**
 * Append to parent element
 *
 * @param parent {Object} Parent element
 *
 * @returns {Object} `this`
 *
 * @method appendTo
 */

  if (parent instanceof C) {
    parent.el.appendChild(this.el);
    return this;
  }

  parent.appendChild(this.el);
  return this;
};

exports.before = function(sibling) {  // {{{2
/**
 * Append element before element
 *
 * @param sibling {Object} Sibling element
 *
 * @returns {Object} `this`
 *
 * @method before
 */

  if (sibling instanceof C) {
    sibling = sibling.el;
  }

  sibling.parentNode.insertBefore(this.el, sibling);

  return this;
};

exports.after = function(sibling) {  // {{{2
/**
 * Append element after element
 *
 * @param sibling {Object} Sibling element
 *
 * @returns {Object} `this`
 *
 * @method after
 */

  if (sibling instanceof C) {
    sibling = sibling.el;
  }

  if (sibling.nextSibling) {
    sibling.parentNode.insertBefore(this.el, sibling.nextSibling);
  } else {
    sibling.parentNode.appendChild(this.el);
  }

  return this;
};

exports.stop = function(ev) {  // {{{2
/**
 * Stop event propagation and prevent default behaviour
 *
 * @param ev {Object} Event
 *
 * @method stop
 */

  ev.stopPropagation();
  ev.stopImmediatePropagation();
  ev.preventDefault();
};

exports.target = function(ev) {  // {{{2
/**
 * Wrap current target of event
 *
 * @param ev {Object} Event
 *
 * @return {Object} Wrapped element
 *
 * @method target
 */

  return this.wrap(ev.currentTarget);
};

exports.remove = function() {  // {{{2
/**
 * Remove element from DOM
 *
 * @param sel {String} Selector
 *
 * @method remove
 */

  if (arguments.length) {
    O.log.todo('Do not provide arguments to remove');
    return;
    //return this.find().remove();
  }

  this.el.parentNode.removeChild(this.el);

  var ev = new CustomEvent('removed', {wrap: this});
  var el = this.el;
  delete this.el;
  if (el.ose === this) {
    delete el.ose;
  }
  el.dispatchEvent(ev);

  return this;
};

exports.addClass = function(val) {  // {{{2
/**
 * Add class to element
 *
 * @param val {String} Class value
 *
 * @method addClass
 */

  var c = this.el.getAttribute('class') || '';
  if (c.match('\\b' + val + '\\b')) {
    return this;
  }

  this.el.setAttribute('class', c + ' ' + val);
  return this;
};

exports.hasClass = function(val) {  // {{{2
/**
 * Check if element has class
 *
 * @param val {String} Class value
 *
 * @method hasClass
 */

  var c = this.el.getAttribute('class');
  if (c) {
    return Boolean(c.match('\\b' + val + '\\b'));
  }

  return false;
};

exports.removeClass = function(val) {  // {{{2
/**
 * Remove class from element
 *
 * @param val {String} Class value
 *
 * @method removeClass
 */

  var c = this.el.getAttribute('class');
  if (! c) return this;

  c = c
    .replace(RegExp('\\s+' + val + '\\b'), '', 'g')
    .replace(RegExp('\\b' + val + '\\s+'), '', 'g')
  ;

  if (c) {
    this.el.setAttribute('class', c);
    return this;
  };

  this.el.removeAttribute('class');

  return this;
};

exports.view2 = function(el, so) {  // {{{2
/** TODO: Rename to `view`
 *
 * Create new view
 *
 * @param [el] {Object} Element
 * @param so {Object} State object
 *
 * @returns {Object} Newly created view element
 *
 * @method view
 */

  if (arguments.length === 1) {
    so = el;
    el = undefined;
  }

  var res;
  if (so.view.charAt(0) === '.') {
    res = this.O.new(so.view)(el);
  } else {
    if (so.view.indexOf('/') < 0) {
      res = O.new('./view/' + so.view)(el);
    } else {
      res = this.O.new(so.view)(el);
    }
  }

  res.so = so;

  return res;
};

exports.select = function() {  // {{{2
/**
 * Select text in first child node
 *
 * @returns {Object} `this`
 *
 * @method select
 */

  var r = document.createRange();
  r.selectNode(this.el.childNodes[0]);

  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);

  return this;
};

exports.left = function(val) {  // {{{2
/**
 * Get element left
 *
 * @returns {Number} Element left in pixels
 *
 * @method left
 */

  switch (typeof val) {
  case 'number':
    this.el.style.left = val + 'px';
    return this;
  case 'string':
    this.el.style.left = val;
    return this;
  }

  return this.el.offsetLeft;
};

exports.top = function(val) {  // {{{2
/**
 * Get element top
 *
 * @returns {Number} Element top in pixels
 *
 * @method top
 */

  switch (typeof val) {
  case 'number':
    this.el.style.top = val + 'px';
    return this;
  case 'string':
    this.el.style.top = val;
    return this;
  }

  return this.el.offsetTop;
};

exports.width = function(val) {  // {{{2
/**
 * Get element width
 *
 * @returns {Number} Element width in pixels
 *
 * @method width
 */

  switch (typeof val) {
  case 'number':
    this.el.style.width = val + 'px';
    return this;
  case 'string':
    this.el.style.width = val;
    return this;
  }

  return this.el.clientWidth;
};

exports.height = function(val) {  // {{{2
/**
 * Get element height
 *
 * @returns {Number} Element height in pixels
 *
 * @method height
 */

  switch (typeof val) {
  case 'number':
    this.el.style.height = val + 'px';
    return this;
  case 'string':
    this.el.style.height = val;
    return this;
  }

  return this.el.clientHeight;
};

exports.focus = function() {  // {{{2
/**
 * Set element focus
 *
 * @method focus
 */

  this.el.focus();
};

exports.focusNext = function(el) {  // {{{2
  if (arguments.length === 0) {
    el = this.el;
  } else if (! el) {
    el = document.activeElement || document.body;
  }

  el.blur();

  while (el) {
    if (el.firstChild) {
      el = el.firstChild;
    } else if (el.nextSibling) {
      el = el.nextSibling;
    } else {
      el = parent(el);
    }

    if (! el) return;

    if (typeof el.focus === 'function') {
      el.focus();
      if (document.activeElement === el) {
        return el;
      }
    }
  }

  return;

  function parent(e) {
    if (e.parentNode) e = e.parentNode;

    if (e.nextSibling) return e.nextSibling;

    if (e === document.body) return e;

    return parent(e);
  }
};

exports.focusPrev = function(el) {  // {{{2
  if (arguments.length === 0) {
    el = this.el;
  } else if (! el) {
    el = document.activeElement;
    if (! el) {
      el = document.body.lastChild;
      while (el.lastChild) {
        el = el.lastChild;
      }
    }
  }

  el.blur();

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

    if (typeof el.focus === 'function') {
      el.focus();
      if (document.activeElement === el) return el;
    }
  }

  return;
};

exports.section = function(attrs) {  // {{{2
  return this.append('section', attrs);
};

exports.ul = function(attrs) {  // {{{2
  return this.append('ul', attrs);
};

exports.li = function(attrs) {  // {{{2
  return this.append('li', attrs);
};

exports.h2 = function(text, attrs) {  // {{{2
  var res = this.append('h2', attrs).text(text);

  return this;
};

exports.h3 = function(text, attrs) {  // {{{2
  var res = this.append('h3', attrs).text(text);

  return this;
};

exports.p = function(text, attrs) {  // {{{2
  var res = this.append('p', attrs).text(text);

  return this;
};

exports.span = function(text, attrs) {  // {{{2
  var res = this.append('span', attrs).text(text);

  return this;
};

exports.div = function(text, attrs) {  // {{{2
  var res = this.append('div', attrs).text(text);

  return this;
};

exports.buttons = function(buttons, params, cb) {  // {{{2
/**
 * @param params {Object}
 * @param params.char {Boolean} Type of buttons can be 'text' or 'char'
 */

  if (! params) params = {};

  var res = this.append('span', 'buttons').hook();
  if (params.char) {
    res.addClass('char');
  } else {
    res.addClass('text');
  }

  if (params.readonly) res.attr('readonly', true);
  if (params.relation) res.relation = params.relation;

  if (! Array.isArray(buttons)) {
    throw O.log.todo();
  }

  buttons.forEach(function(btn) {
    var i = res.append('i')
//      .text(btn)
//      .text(params.char ?
//        exports.buttonActions[btn] || btn :
//        btn
//      )
      .attr('act', btn)
      .on('click', function(ev) {
        res.stop(ev);

        if (! res.attr('readonly')) cb(btn);
      })
    ;

    /*
    if (params.char) {
      i.attr('data-icon', btn);
      i.attr('data-l10n-id', btn);
    } else {
      i.text(btn);
    }
    */

    if (! params.readonly) {
      i.attr('tabindex', 0);
    }
  });

  if (params.default) {
    buttonsVal(res, [params.default]);
  }

  return this;
};

exports.button = function(action, cb) {  // {{{2
  this.append('<i>', 'button char')
//    .text(action)
    .attr('act', action)
    .attr('tabindex', 0)
//    .attr('data-icon', action)
//    .attr('data-l10n-id', action)
    .on('click', cb)
  ;

//    .add(exports.buttonActions[action] || text)
//    .attr('action', action)
//    .attr('aria-value', text)

  return this;
};

exports.textButton = function(action, text, cb) {  // {{{2
  this.append('<i>', 'button text')
    .add(text)
    .attr('tabindex', 0)
    .attr('act', action)
//    .attr('action', action)
//    .attr('aria-value', text)
    .on('click', cb)
  ;

  return this;
};

exports.buttonActions = {  // {{{2
  // https://en.wikibooks.org/wiki/Unicode/List_of_useful_symbols

  left: '\u27E8',
  vellip: '\u22EE',
  hellip: '\u22EF',
  on: 'I',
  off: '0',
};

exports.slider = function(params, cb) {  // {{{2
  var el = this.append('span', 'slider')
    .hook()
    .attr('tabindex', 0)
  ;

  el.min = params.min || 0;
  el.max = params.max || 1;
  el.value = params.value || 0;

  el.on('click', function(ev) {
    el.stop(ev);

    var val = (ev.clientX - el.left() - SLIDER_PADDING) / (el.width() - SLIDER_PADDING * 2) * el.max + el.min;
    if (val < el.min) val = el.min;
    if (val > el.max) val = el.max;

//    console.log('SLIDER CLICK', val, ev.clientX, el.left(), el.width());

    cb(val);

    return false;
  });

  el.append('span')
    .append('span')
      .text(' ')
      .width(0)
  ;

  el.append('div')
    .text(' ')
    /*
    .on('mousedown', function(ev) {
      el.stop(ev);
      el.drag = O.ui.input.startDrag(ev);

      el.drag.ondrop(function(ev) {
        console.log('END DRAG', ev)

        delete el.drag;
        if (! ev) return;

        el.stop(ev);
        var val = (ev.clientX - el.left() - SLIDER_PADDING) / (el.width() - SLIDER_PADDING * 2) * el.max + el.min;
        if (val < el.min) val = el.min;
        if (val > el.max) val = el.max;
        cb(val);

        return;
      });

      return false;
    })
  */
  ;

  sliderVal(el, [el.value]);

  /*
  el.append('div')
    .text(' ')
    .on('mousedown', function(ev) {
      console.log('PROGRESS MOVE');
    }
  );
  */

  return this;
};

// Private {{{1
var SLIDER_PADDING=40;

function sliderVal(that, args) {  // {{{2A
  switch (args.length) {
  case 0:
    return that.value;
  case 1:
    args = args[0];

    switch (typeof args) {
    case 'undefined':
      return set(0);
    case 'number':
      return set(args);
    case 'string':
      return set(parseInt(args));
    case 'object':
      if (args === null) return set(0);

      if (args.min) that.min = args.min;
      if (args.max) that.max = args.max;

      return set(typeof args.value === 'number' ? args.value : that.value);
    }
  }

  throw O.log.error(that, 'INVALID_ARGS', args);

  function set(val) {
    if (isNaN(val)) {
      O.log.error(that, 'INVALID_ARGS', args);
      return;
    }

    if (val < that.min) val = that.min;
    if (val > that.max) val = that.max;
    that.value = val;

    var w = (that.width() - SLIDER_PADDING * 2) * (val - that.min) / that.max;

    that.find('span>span>span').width(w);
    var div = that.find('div');
//    div.left(w - div.width() / 2);
    div.left(w + SLIDER_PADDING - 16);

    return;
  }
}

function buttonsVal(that, args) {  // {{{2
  switch (args.length) {
  case 0:
    switch (that.relation || undefined) {
    case 'single':
      return that.el.value;
    }

    var res = {};
    that.el.querySelectorAll('i').forEach(function(btn) {
      res[btn.getAttribute('act')] = btn.getAttribute('value');
    });
    return res;
  case 1:
    args = args[0];

    switch (that.relation || undefined) {
    case 'single':
      if (that.el.value) {
        that.el.querySelector('i[action="' + that.el.value + '"]').removeAttribute('value');
      }
      that.el.value = args;

      switch (args) {
      case null:
      case undefined:
        return;
      }

      that.el.querySelector('i[action="' + that.el.value + '"]').setAttribute('value', 1);
      return;
    }

    return that.el.querySelector('i[action="' + args + '"]').value;
  case 2:
    that.el.querySelector('i[act="' + args[0] + '"]').setAttribute('value', args[1]);
    return;
  }

  throw O.log.error(that, 'INVALID_ARGS', args);
}

function transitProgress(el, aim, max, duration) {  // {{{2
  setTimeout(function() {
    el.fillTime = duration;
    el.value = aim * 100 / max;
  }, 0);
}

/* OBSOLETE {{{1
exports.dialog = function(type) {  // {{{2
/ **
 * Create new view
 *
 * @param type {String} dialog type
 *
 * @returns {Object} Newly created view element
 *
 * @method dialog
 * /

  if (O.ui.dialog) {
    throw O.log.error('Duplicit dialog');
  }

  var res = this.new('html5-dialog' + (type ? '-' + type : ''))
    .appendTo(document.body)
  ;
  O.ui.newHistory();
//  O.ui.updateHistory();

  var lastHistory = O.ui.lastHistory;

  res.on('removed', function() {
    if (res === O.ui.dialog) {
      delete O.ui.dialog;
      if (lastHistory === O.ui.lastHistory) {
        history.back();
      }
    }
  });

  res.on('closed', function(ev) {
    if (res === O.ui.dialog) {
      res.remove();
    }
  });

  O.ui.dialog = res;
  return res;
};

*/
