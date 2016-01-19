'use strict';

const O = require('ose')(module)
  .class(C)
;

var FieldWrap = O.getClass('ose/lib/orm/wrap');

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
function C(tag, attrs, params) {  // {{{2
/**
 * HTML Element wrapper constructor.
 * Templates must have single root.
 *
 * @param tag {String|Object} Tag or element to be wrapped or created
 * @param attrs {String|Object} Attributes of element, supplied string is used as element class
 * @param params {String|Object} Parameters of element wrapper, string is used as `element.textContent`
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
 * Create tie between an element and its wrapper by setting the `el.ose` property.
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
 * Remove tie between an element and its wrapper
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
 * Create new element
 *
 * @param tag {String} Element tag name or HTML snippet
 * @param attrs {Object} Key/value pairs of attributes and their values
 *
 * @return {Object} Created element wrapper
 *
 * @method new
 */

  return new O.exports(tag, attrs, params);
};

exports.parent = function() {  // {{{2
  if (! this.el.parentElement) return undefined;

  if (this.el.parentElement.ose instanceof O.exports) return this.el.parentElement.ose;

  return new O.exports(this.el.parentElement);
};

exports.append2 = function(val) {  // {{{2
/** TODO: Rename to `append`
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
    if (val instanceof O.exports) {
      this.el.appendChild(val.el);
      return this;
    }

    if (val instanceof HTMLElement) {
      this.el.appendChild(val);
      return this;
    }

    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        this.append2(val[i]);
      }
      return this;
    }

    break;
  }

  throw O.log.error(this, 'INVALID_ARGS', arguments);
};

exports.tree = function(tag, attrs, params) {  // {{{2
  tag = new O.exports(tag, attrs, params);

  this.el.appendChild(tag.el);

  return tag;
};

exports.stub = function(tag, attrs, params) {  // {{{2
  tag = new O.exports(tag, attrs, params);

  this.el.appendChild(tag.el);

  return this;
};

exports.view2 = function(el, so) {  // {{{2
/**
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
 * Set multiple attribute
 *
 * @param val {Object} Key/value pairs of attributes to be set

 * @method attrs
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

exports.empty = function() {  // {{{2
/**
 * Remove all children
 *
 * @returns {Object} `this`
 *
 * @method empty
 */

  this.el.innerHTML = '';
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
 * Set inner HTML
 *
 * @param val {String} Inner HTML
 *
 * @return {Object} `this`
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
 * Remove element from DOM
 *
 * @param sel {String} Selector
 *
 * @method remove
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
 *
 * @method removeListener
 * @chainable
 */

  this.el.removeEventListener(name, cb, useCapture);

  return this;
};

exports.on = function(name, cb) {  // {{{2
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

  return;
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

exports.offset = function() {  // {{{2
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
  return this.tree('section', attrs, params);
};

exports.ul = function(attrs, params) {  // {{{2
  return this.tree('ul', attrs, params);
};

exports.li = function(attrs, params) {  // {{{2
  return this.tree('li', attrs, params);
};

exports.h1 = function(text, attrs, params) {  // {{{2
  var res = this.tree('h1', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.h2 = function(text, attrs, params) {  // {{{2
  var res = this.tree('h2', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.h3 = function(text, attrs, params) {  // {{{2
  var res = this.tree('h3', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.p = function(text, attrs, params) {  // {{{2
  var res = this.tree('p', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.span = function(text, attrs, params) {  // {{{2
  var res = this.tree('span', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.div = function(text, attrs, params) {  // {{{2
  var res = this.tree('div', attrs, params);

  if (text !== undefined) res.val(text);

  return this;
};

exports.register = function(name, control) {  // {{{2
  if (typeof control === 'string') {
    control = require(control);
  }

  control.name = name;

  exports.controls[name] = control;

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
    O.exports.prototype[name] = control.extend;
  }
};

// Private {{{1
function listenRemoved(el, cb) {  // {{{2
/*
 * Element wrappers that has `wrap._removed = function() {...}` method defined must be removed by calling `wrap.remove()`
 */

  listen();

  function listen() {
    if (el.ose && el.ose._removed) {
      if ('_on_removed' in el.ose) {
        el.ose._on_removed.push(cb);
        return;
      }

      el.ose._on_removed = [cb];
      return;
    }

    if (el.parentNode) {
      el = el.parentNode;
      return listen();
    }

    return wait();
  }

  function wait() {
    setTimeout(function() {
      if (! el.parentNode) {
        throw O.log.error('Can\'t listen to "removed" event on orphaned child');
      }

      el = el.parentNode;
      listen();
    });
  }
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
