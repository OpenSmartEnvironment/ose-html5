'use strict';

var O = require('ose').class(module, C, './wrap');

/** Docs {{{1
 * @module html5
 */

/**
 * @caption Field view
 *
 * @readme
 * This [element wrapper] works together with the [ose.orm]
 * component to display and edit fields.
 *
 * @class html5.lib.field
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
function C(wrap, el, attrs) {  // {{{2
/**
 * Field view constructor
 *
 * @param wrap {Object} [Field wrapper]
 * @param [el] {Object} Optional HTML element
 * @param [attrs] {Object} Optional attributes of HTML element
 *
 * @method constructor
 */

  O.super.call(this, el || 'p', attrs);

  this.hook();

  this.wrap = wrap;
  this.wrap.el = this;

  this.on('remove', removed.bind(this));

  if (! (wrap.owner.readonly || wrap.profile.readonly)) {
    this.attr('contentEditable', true);
    this.on('click', onClick.bind(this));
    this.on('blur', onBlur.bind(this));
    this.on('keypress', onKeypress.bind(this));
  }
}

exports.getAsside = function() {  // {{{2
/**
 * Create content of <aside> of <li> based on field description
 *
 * @method getAsside
 */

  if (this.wrap.field.lookup) {
    return this.new('i', {'data-icon': 'expand'}).on('click', onLookup.bind(this));
  }
}

// }}}1
// Event handlers {{{1
function removed(ev) {  // {{{2
  var w = this.wrap;
  delete this.wrap;
  delete w.el;
  w.remove();
}

function onBlur(ev) {  // {{{2
  testValue(this, true);
}

function onClick(ev) {  // {{{2
  testValue(this);
}

function onKeypress(ev) {  // {{{2
//  console.log('KEYPRESS', ev.keyCode, ev);

  switch (ev.keyCode) {
  case 27:  // ESC
    if (this.wrap.edit) {
      if (this.wrap.edit.last === this.value) {
        this.wrap.stopEdit(true);
      } else {
        this.wrap.edit.value = this.wrap.edit.last;
        this.wrap.update();
      }
    }
    this.el.blur();
    return;
  case 13:  // ENTER
  case 40:  // DOWN
    this.stop(ev);
    this.focusNext();
    return;
  case 38:  // UP
    this.stop(ev);
    this.focusPrev();
    return;
  }

  testValue(this);
  return;
}

function onLookup(ev) {  // {{{2
  var that = this;
  var count = 0;
  var f = this.wrap.field;

  var li = this.new('li')
    .on('blur', onBlur, true)  // TODO: Firefox only, use onfocusout
  ;
  var div = li.append('div');
  var h = div.append('h3').text('Select value:');

  if (f.lookup.values) {
    O._.each(f.lookup.values, add);
    finish();
  } else if (f.lookup.get) {
    f.lookup.get(null, add, finish);
  } else if (f.lookup.view) {
    lookupView();
  } else {
    finish();
  }

  function lookupView() {  // {{{3
    var so = {view: f.lookup.view};
    if (f.lookup.ident) {
      so.ident = JSON.parse(JSON.stringify(f.lookup.ident));
    }
    if (f.lookup.filter) {
      so.filter = JSON.parse(JSON.stringify(f.lookup.filter));
    }
    var v = div.view2(so);
    v.selectValue = onSelectValue;
    div.append(v);
    v.loadData(finish);
  }

  function onSelectValue(ident) {  // {{{3
    var v = that.wrap.owner.view;

//    console.log('VALUE SELECTED', ident, v);

    if (v && v.entry && v.entry.shard.isIdentified(ident)) {
      that.wrap.testValue(ident.id);
    } else {
      that.wrap.testValue(ident);
    }

    that.wrap.update();
  }

  function add(caption, val) {  // {{{3
    count++;
    div.append('p', {tabindex: 0})
      .on('click', onClick.bind(null, arguments.length === 1 ? caption : val))
      .text(caption)
    ;
  }

  function finish() {  // {{{3
    li.after(that.wrap.li);

    if (! count) {
      h.attr('tabindex', 0);
    }

    li.focusNext();
  }

  function onClick(val) {  // {{{3
//    console.log('CLICK', val);

    that.val(val);
    testValue(that);

    document.activeElement.blur();
  }

  function onBlur(ev) {  // {{{3
    setTimeout(function() {
//      console.log('ON BLUR', document.activeElement);
      var el = document.activeElement;

      while (el) {
        if (el === li.el) return;
        el = el.parentNode;
      }
      li.remove();
      return;
    }, 0);
  }

  // }}}3

  /*
  var d = O.new('./dialog')('select');
  d.append('h1').text('Select');

  if (this.wrap.field.lookup.values) {
    O._.each(this.wrap.field.lookup.values, function(val) {
      d.append('li').text(val);
    }, this);
  }

  d.on('change', function(ev) {
    console.log('DIALOG CHANGE', arguments);

    that.val(ev.detail.value);
    testValue(that);
  });

  d.open();
  */
}

// }}}1
// Private {{{1
function testValue(that, update) {
  if (update) {
    that.wrap.testValue(that.val(), true);
  } else {
    setTimeout(function() {
      that.wrap.testValue(that.val());
    }, 0);
  }
}

// }}}1
