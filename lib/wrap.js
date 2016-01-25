'use strict';

const O = require('ose')(module)
  .class(init)
;

var Box = O.getClass('./box');
var FieldWrap = O.getClass('ose/lib/field/wrap');

/** Docs {{{1
 * @module html5
 */

/**
 * @caption HTML Element wrapper
 *
 * @readme
 * This class provides helper functions for DOM manipulation.
 *
 * @aliases elementWrapper elementWrapperClass
 * @class html5.lib.wrap
 * @type class
 */

// Class {{{1
function init(tag, attrs, params) {  // {{{2
/**
 * HTML Element wrapper constructor.
 *
 * @todo
 * Templates must have single root.
 *
 * @param tag {String|Object} Tag or element to be wrapped or created
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
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

    if (tag in exports.controls) {
      this.control = exports.controls[tag];

      if (this.control.template) {
        this.el = document.importNode(this.control.template.content, true).firstElementChild;
      } else {
        this.el = document.createElement(tag);
      }

      this.el.ose = this;
      break;
    }

    this.el = document.createElement(tag);
    break;
  case 'object':
    if (typeof tag.tagName === 'string') {
      if (tag.tagName === 'TEMPLATE') {
        this.el = document.adoptNode(tag.content).firstElementChild;
        break;
      }

      this.el = tag;
      break;
    }

    // NO BREAK
  default:
    throw O.log.error(this, 'INVALID_ARGS', arguments);
  }

  if (this.control && this.control.init) {
    this.control.init(this);
  }

  this.attrs(attrs);
  this.params(params);
};

// Public {{{1
exports.hook = function() {  // {{{2
/**
 * Hook a HTML element to its wrapper by setting the `ose` property of
 * the element.
 *
 * @method hook
 *
 * @returns {Object} `this`
 */

  this.el.ose = this;

  return this;
};

exports.unhook = function() {  // {{{2
/**
 * Remove hook between an element and its wrapper by removing the
 * `ose` property of the element.
 *
 * @returns {Object} HTML element
 *
 * @method unhook
 */

  var el = this.el;
  delete el.ose;
  delete this.el;

  return el;
};

exports.new = function(tag, attrs, params) {  // {{{2
/**
 * Create a new element
 *
 * @copyParams constructor
 *
 * @return {Object} Created element wrapper
 *
 * @method new
 */

  return new O.exports(tag, attrs, params);
};

exports.parentBox = function() {  // {{{2
/**
 * Return first [view box] found in parent tree
 *
 * @returns {Object} Parent view box
 *
 * @method parentBox
 */

  var el = this.el;

  while (el) {
    if (el.ose && el.ose instanceof Box) return el.ose;

    el = el.parentElement;
  }
};

exports.parent = function() {  // {{{2
/**
 * Return parent element wrapper
 *
 * @returns {Object} Parent element wrapper
 *
 * @method parent
 */

  if (! this.el.parentElement) return undefined;

  if (this.el.parentElement.ose instanceof O.exports) return this.el.parentElement.ose;

  return new O.exports(this.el.parentElement);
};

exports.append2 = function(val) {  // {{{2
/** TODO: Rename to `append`
 * Append child element or elements
 *
 * @param val {String|Object|Array} Stuff to be appended
 *
 * @returns {Object} `this`
 *
 * @method append2
 */

  switch (O.typeof(val)) {
  case 'null':
  case 'undefined':
    return this;
  case 'string':
    var t = document.createElement('template');
    t.innerHTML = val;
    this.el.appendChild(document.adoptNode(t.content));
    return this;
  case 'array':
    for (var i = 0; i < val.length; i++) {
      this.append2(val[i]);
    }
    return this;
  case 'object':
    if (val instanceof O.exports) {
      this.el.appendChild(val.el);
      return this;
    }

    if (val instanceof HTMLElement) {
      this.el.appendChild(val);
      return this;
    }

    break;
  }

  throw O.log.error(this, 'INVALID_ARGS', arguments);
};

exports.tree = function(tag, attrs, params) {  // {{{2
/**
 * Create new element and append it to the current element.
 *
 * @copyParams constructor
 *
 * @returns {Object} Newly created element wrapper
 *
 * @method tree
 */

  tag = new O.exports(tag, attrs, params);

  this.el.appendChild(tag.el);

  return tag;
};

exports.stub = function(tag, attrs, params) {  // {{{2
/**
 * Create new element and append it to the current element.
 *
 * @copyParams constructor
 *
 * @returns {Object} Current element wrapper
 *
 * @method tree
 * @chainable
 */

  tag = new O.exports(tag, attrs, params);

  this.el.appendChild(tag.el);

  return this;
};

exports.view2 = function(el, demand) {  // {{{2
/**
 * Create new view
 *
 * @param [el] {Object} Element
 * @param demand {Object} State object
 *
 * @returns {Object} Newly created view object
 *
 * @method view2
 */

  if (arguments.length === 1) {
    demand = el;
    el = undefined;
  }

  var res;
  if (demand.view.charAt(0) === '.') {
    res = this.O.new(demand.view)(el);
  } else {
    if (demand.view.indexOf('/') < 0) {
      res = O.new('./view/' + demand.view)(el);
    } else {
      res = this.O.new(demand.view)(el);
    }
  }

  res.demand = demand;

  return res;
};

exports.prependTo = function(parent) {  // {{{2
/*
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

  if (parent instanceof O.exports) {
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

  if (sibling instanceof O.exports) {
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

  if (sibling instanceof O.exports) {
    sibling = sibling.el;
  }

  if (sibling.nextSibling) {
    sibling.parentNode.insertBefore(this.el, sibling.nextSibling);
  } else {
    sibling.parentNode.appendChild(this.el);
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

  if (this.el.style.display === 'none') return this;

  this.el._display = this.el.style.display;
  this.el.style.display = 'none';

  return this;
};

exports.find = function(sel) {  // {{{2
/**
 * Find first element within the current element using the selector
 * `sel`.
 *
 * @param sel {Object|String}
 *
 * @returns {Object} Element wrapper
 *
 * @method find
 */

  if (sel instanceof O.exports) {
    return sel;
  }
  if (sel instanceof HTMLElement) {
    if (sel.ose instanceof O.exports) return sel.ose;
    return new O.exports(sel);
  }

  sel = this.el.querySelector(sel);

  if (! sel) return undefined;

  if (sel.ose instanceof O.exports) return sel.ose;
  return new O.exports(sel);
};

exports.findEach = function(sel, cb) {  // {{{2
/**
 * Find all elements corresponding to a selector and calls a callback
 * for each one of them.
 *
 * @param sel {String} CSS selector
 * @param cb {Function} Callback
 *
 * @method findEach
 * @chainable
 */

  var sel = this.el.querySelectorAll(sel);

  for (var i = sel.length - 1; i >= 0; i--) {
    var el = sel.children[i];

    if (el.ose instanceof O.exports) {
      cb(el.ose);
    } else {
      cb(new O.exports(el));
    }
  }
};

exports.eachChild = function(cb) {  // {{{2
/**
 * Call `cb` for each child element
 *
 * @param cb {Function} Callback
 *
 * @method eachChild
 * @chainable
 */

  for (var i = this.el.children.length - 1; i >= 0; i--) {
    var el = this.el.children[i];

    if (el.ose instanceof O.exports) {
      cb(el.ose);
    } else {
      cb(new O.exports(el));
    }
  }
};

exports.params = function(val) {  // {{{2
/**
 * Set up wrapper parameters
 *
 * @param val {*} Parameters to be set
 *
 * @method params
 * @chainable
 */

  if (! val) return this;

  if (this.control && this.control.params) {
    val = this.control.params(this, val);
  }

  switch (O.typeof(val)) {
  case 'null':
  case 'undefined':
    return this;
  case 'boolean':
  case 'number':
  case 'string':
    this.val(val);
    return this;
  case 'object':
    if (val instanceof FieldWrap) {
      this.setField(val);
      return this;
    }

    if ('field' in val && val.field instanceof FieldWrap) {
      this.setField(val.field);
      delete val.field;
    }

    if ('key' in val) {
      this.on('key', val.key);
      delete val.key;
    }
    if ('tap' in val) {
      this.on('tap', val.tap);
      delete val.tap;
    }
    if ('hold' in val) {
      this.on('hold', val.hold);
      delete val.hold;
    }
    if ('drag' in val) {
      this.on('drag', val.drag);
      delete val.drag;
    }
    if ('input' in val) {
      this.on('input', val.input);
      delete val.input;
    }
    if ('value' in val) {
      this.val(val.value);
      delete val.value;
    }
    if ('readonly' in val) {
      if (val.readonly) {
        this.attr('readonly', undefined);
      } else {
        this.attr('readonly', null);
      }
      delete val.readonly;
    }

    O._.extend(this, val);
    return this;
  case 'function':
    if (this.control) {
      this.on('input', val);
    } else {
      this.on('tap', val);
    }
    return this;
  }

  throw O.log.error(this, 'INVALID_ARGS', val);
};

exports.attr = function(name, val) {  // {{{2
/**
 * Set or get a single element attribute
 *
 * @param name {String} Attribute name
 * @param [val] {String} Value to be set

 * @method attr
 */

  if (arguments.length === 1) {
    return this.el.getAttribute(name);
  }

  switch (val) {
  case null:
    this.el.removeAttribute(name);
    return this;
  case undefined:
    this.el.setAttribute(name, '');
    return this;
  }

  this.el.setAttribute(name, val);
  return this;
};

exports.attrs = function(val) {  // {{{2
/**
 * Set multiple element attributes
 *
 * @param val {Object|String} Key/value pairs of attributes to be set

 * @method attrs
 * @chainable
 */

  switch (typeof (val || undefined)) {
  case 'undefined':
    return this;
  case 'string':
    this.el.setAttribute('class', val);
    return this;
  case 'object':
    if (val instanceof FieldWrap) {
      this.setField(val);
      return this;
    }

    for (var key in val) {
      this.attr(key, val[key]);
    }
    return this;
  case 'function':
    val(this);
    return this;
  }

  throw O.log.error(this, 'INVALID_ARGS', val);
};

exports.style = function(name, val) {  // {{{2
/**
 * Set or get single CSS style for an element
 *
 * @param name {String} Name of style property
 * @param [val] {String|Number} Value to be set
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
 * Set multiple CSS styles for an element
 *
 * @param vals {Object} Key/value pairs of styles and their values
 *
 * @method styles
 * @chainable
 */

  for (var key in vals) {
    this.style(key, vals[key]);
  }
  return this;
};

exports.empty = function() {  // {{{2
/**
 * Empty an element's `innerHTML`
 *
 * @returns {Object} `this`
 *
 * @method empty
 * @chainable
 */

  this.el.innerHTML = '';
  return this;
};

exports.val = function(val) {  // {{{2
/**
 * Set or get value element value
 *
 * @param [val] {*} Value to be set
 *
 * @return {*} Return current value when called with no arguments, otherwise return `this` (chaining).
 *
 * @method val
 * @chainable
 */

  if (arguments.length) {
    if (this.control && this.control.setVal) {
      this.control.setVal(this, val);
    } else {
      this.el.textContent = val;
    }
    return this;
  }

  if (this.control && this.control.getVal) {
    return this.control.getVal(this);
  }

  return this.el.textContent;
};

exports.html = function(val) {  // {{{2
/**
 * Set or get an element's `innerHTML`
 *
 * @param [val] {String} Inner HTML
 *
 * @return {*} Return current `innerHTML` when called with no arguments, otherwise return `this` (chaining).
 *
 * @method html
 */

  if (arguments.length) {
    this.el.innerHTML = val;
    return this;
  }

  return this.el.innerHTML;
};

exports.text = function(val) {  // {{{2
/**
 * Set or get the text content of an element
 *
 * @param [val] {String} Text content
 *
 * @return {*} Return current `innerHTML` when called with no arguments, otherwise return `this` (chaining).
 *
 * @method text
 */

  if (! arguments.length) {
    return this.el.textContent;
  }

  switch (typeof val) {
  case 'undefined':
    this.el.textContent = '';
    return this;
  case 'string':
    this.el.textContent = val;
    return this;
  case 'boolean':
  case 'number':
    this.el.textContent = val.toString();
    return this;
  case 'object':
    if (val === null) {
      this.el.textContent = '';
      return this;
    }
  }

  O.log.error(this, 'Invalid text', val);
  return this;
};

exports.remove = function() {  // {{{2
/**
 * Remove element from its parent
 *
 * @method remove
 * @chainable
 */

  var el = this.el;

  el.parentNode.removeChild(el);

  if (this._removed) {
    this._removed({});
  }

  var that = this;

  setTimeout(function() {
    delete that.el;
    if (el.ose === that) {
      delete el.ose;
    }
  });

  return this;
};

exports.addClass = function(val) {  // {{{2
/**
 * Add class to element
 *
 * @param val {String} Class value
 *
 * @method addClass
 * @chainable
 */

  var c = this.el.getAttribute('class') || '';
  if (c.match('\\b' + val + '\\b')) {
    return this;
  }

  this.el.setAttribute('class', c ? c + ' ' + val : val);
  return this;
};

exports.hasClass = function(val) {  // {{{2
/**
 * Check if an element has the givne class
 *
 * @param val {String} Class value
 *
 * @returns {Boolean} whether the element has the given class
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
 * @chainable
 */

  val = val.trim();

  var c = this.el.getAttribute('class');
  if (! c) return this;

  c = c.trim();

  if (c !== val) {
    c = c
      .replace(RegExp('\\s+' + val + '\\b'), '', 'g')
      .replace(RegExp('\\b' + val + '\\s+'), '', 'g')
    ;

    if (c) {
      this.el.setAttribute('class', c);
      return this;
    };
  }

  this.el.removeAttribute('class');
  return this;
};

exports.listen = function(name, cb, useCapture) {  // {{{2
/**
 * Add event listener to element
 *
 * @param name {String} Event name
 * @param cb {Function} Callback
 * @param useCapture {Boolean} useCapture
 *
 * @method listen
 * @chainable
 */

  this.el.addEventListener(name, cb, useCapture);

  return this;
};

exports.removeListener = function(name, cb, useCapture) {  // {{{2
/**
 * Remove event listener from element
 *
 * @param name {String} Event name
 * @param cb {Function} Callback to be removed
 * @param useCapture {Boolean} useCapture
 *
 * @method removeListener
 * @chainable
 */

  this.el.removeEventListener(name, cb, useCapture);

  return this;
};

exports.on = function(name, cb) {  // {{{2
/**
 * Set up event handler on wrapper
 *
 * @param name {String} Event name
 * @param cb {Function} Callback
 *
 * @method on
 * @chainable
 */

  if (this.el.ose !== this) this.el.ose = this;

  switch (name) {
  case 'removed':
    listenRemoved(this.el, cb);
    return this;
  }

  name = '_on_' + name;

  if (name in this) {
    this[name].push(cb);
  } else {
    this[name] = [cb];
  }

  return this;
};

exports.off = function(name, cb) {  // {{{2
/**
 * Remove event handler from wrapper
 *
 * @param name {String} Event name
 * @param [cb] {Function} Callback to be removed
 *
 * @method off
 * @chainable
 */

  name = '_on_' + name;
  if (arguments.length === 1) {
    delete this[name];
    return this;
  }

  var arr = this[name];
  if (! arr) return;

  var i = arr.indexOf(cb);
  if (i >= 0) arr.splice(i, 1);

  if (arr.length === 0) {
    delete this[name];
  }

  return this;
};

exports.trigger = function(name, ev) {  // {{{2
/**
 * Trigger event handlers on the wrapper
 *
 * @param name {String} Event name
 * @param ev {Object} Event object
 *
 * @method trigger
 *
 * @returns {False|undefined} Returns false if event was stopped (if some event handler returned `false`).
 */

  var arr = this['_on_' + name];

  if (arr) {
    if (! ev.wrap) ev.wrap = this;

    for (var i = 0; i < arr.length; i++) {
      if (arr[i](ev) === false) return false;
    }
  }

  if (this.control && name in this.control) {
    if (! ev.wrap) ev.wrap = this;

    if (this.control[name](this, ev) === false) return false;
  }

  return undefined;
};

exports.select = function() {  // {{{2
/**
 * Select text in first child node
 *
 * @returns {Object} `this`
 *
 * @method select
 * @chainable
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
 * Get or set element left CSS property
 *
 * @param [val] Value to be set
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
 * Get or set element top CSS property
 *
 * @param [val] Value to be set
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
 * Get or set element width css property
 *
 * @param [val] Value to be set
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
 * Get or set element height CSS property
 *
 * @param [val] Value to be set
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

exports.offset = function() {  // {{{2
/**
 * Get element offset
 *
 * @return {Object} Offset object
 *
 * @method offset
 */

  var rect = this.el.getBoundingClientRect();

  if (rect.width || rect.height) {
    var doc = this.el.ownerDocument;
    var win = doc === doc.window ?
      doc :
      doc.nodeType === 9 && doc.defaultView
    ;

    return {
      x: rect.left + win.pageXOffset - doc.documentElement.clientLeft,
      y: rect.top + win.pageYOffset - doc.documentElement.clientTop,
    };
  }

  return {
    x: 0,
    y: 0,
  };
};

exports.setField = function(wrap) {  // {{{2
/**
 * Set up a connection between a data field and the current element wrapper
 *
 * @param wrap {Object} Field wrapper object
 *
 * @method setField
 * @chainable
 */

  if (wrap.layout.readonly || wrap.field.readonly) {
    this.attr('readonly', undefined);
  } else {
    this.on('input', wrap.input.bind(wrap));
  }

  if (this.control && this.control.patch) {
    wrap.onPatch(this.control.patch.bind(null, this, wrap));
    return this;
  }

  wrap.onPatch(Function('el', 'wrap', 'patch', 'el.textContent = wrap.field.asEditText(wrap.value);').bind(undefined, this.el, wrap));
  return this;
};

exports.controls = {};  // HTML Controls {{{1

exports.section = function(attrs, params) {  // {{{2
/**
 * Create and append new `<section>` element
 *
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @returns {Object} Newly created element
 *
 * @method section
 */

  return this.tree('section', attrs, params);
};

exports.ul = function(attrs, params) {  // {{{2
/**
 * Create and append new `<ul>` element
 *
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @returns {Object} Newly created element
 *
 * @method ul
 */

  return this.tree('ul', attrs, params);
};

exports.li = function(attrs, params) {  // {{{2
/**
 * Create and append new `<li>` element
 *
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @returns {Object} Newly created element
 *
 * @method li
 */

  return this.tree('li', attrs, params);
};

exports.h1 = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `<h1>` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method h1
 * @chainable
 */

  var res = this.tree('h1', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.h2 = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `<h2>` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method h2
 * @chainable
 */

  var res = this.tree('h2', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.h3 = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `<h3>` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method h3
 * @chainable
 */

  var res = this.tree('h3', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.p = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `p` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method p
 * @chainable
 */

  var res = this.tree('p', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.span = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `span` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method span
 * @chainable
 */

  var res = this.tree('span', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.div = function(text, attrs, params) {  // {{{2
/**
 * Create and append new `div` element
 *
 * @param [text] {String} Text to be set
 * @param [attrs] {String|Object} Attributes of element, supplied string is used as element class
 * @param [params] {String|Object} Parameters of element wrapper, string is used as `element.textContent`
 *
 * @method div
 * @chainable
 */

  var res = this.tree('div', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.register = function(name, control) {  // {{{2
/**
 * Register new control element
 *
 * @param name {String} Name of control element
 * @param control {Object} Control element definition
 *
 * @method register
 */

  if (typeof control === 'string') {
    control = require(control);
  }

  control.name = name;

  if (control.template) {
    switch (typeof control.template) {
    case 'string':
      var t = control.template;
      control.template = document.createElement('template');
      control.template.innerHTML = t;
      break;
    case 'function':
      var t = control.template;
      control.template = document.createElement('template');
      control.template.appendChild(t().el);
      break;
    }

    if (! (control.template && control.template.tagName === 'TEMPLATE')) {
      throw O.log.error('INVALID_ARGS', 'template', control.template);
    }
  }

  if (control.extend) {
    if (name in O.prototype) {
      throw O.log.error('Can\'t register control, extend already exist', name);
    }

    O.prototype[name] = control.extend;
  }

  exports.controls[name] = control;
};

// Private {{{1
function listenRemoved(el, cb) {  // {{{2
/*
 * Element wrappers that has `wrap._removed = function() {...}` method defined must be removed by calling `wrap.remove()`
 */

  while (el) {
    if (el.ose && el.ose._removed) {
      if ('_on_removed' in el.ose) {
        el.ose._on_removed.push(cb);
        return;
      }

      el.ose._on_removed = [cb];
      return;
    }

    el = el.parentNode;
  }

  setTimeout(function() {
    if (! el.parentNode) {
      throw O.log.error('Can\'t listen to "removed" event on orphaned child');
    }

    listenRemoved(el, cb);
  });
}

/* CHECK {{{1
function listenRemoved(el, cb) {  // {{{2
  if (! el.parentNode) {
    setTimeout(function() {
      if (! el.parentNode) {
        throw O.log.error('Can\'t listen to "removed" event on orphaned child');
      }
      listenRemoved(el, cb);
    });
    return;
  }

  if (el.parentNode.removeObserver) {
    el.parentNode.removeObserveChildren.push({el: el, cb: cb});
  } else {
    el.parentNode.removeObserveChildren = [{el: el, cb: cb}];
    childRemoveObserver(el.parentNode);
  }
}

function childRemoveObserver(el) {  // {{{2
  el.removeObserver = new MutationObserver(function(records) {
    records.forEach(function(record) {
      for (var i = 0; i < record.removedNodes.length; i++) {
        var child = record.removedNodes[i];

        el.removeObserveChildren.forEach(function(c) {
          if (c.el === child) c.cb();
        });
      }
    });
  });

  el.removeObserver.observe(el, {childList: true});
}

}}}1 */
