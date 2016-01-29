'use strict';

const O = require('ose')(module);

// Public {{{1
exports.config = function(name, val, deps) {  // {{{2
  if (val.init) {
    require(val.init)(deps);
  }

  O.extendO('ui', this);

  var that = this;
  deps.add({after: 'finish'}, function(cb) {
    cb();

    O.async.setImmediate(function() {
      run(that, val);
    });
  });
};

exports.lastStateObj = null;  // {{{2
/**
 * Last displayed view state object
 *
 * @property lastStateObj
 * @type Object
 */

exports.defaultStateObj = {  // {{{2
/**
 * State object displayed by default
 *
 * @property defaultStateObj
 * @type Object
 */

  body: 'simple',
  main: {
    view: 'dashboard'
  },
};

exports.newHistory = function(stateObj) {  // {{{2
/**
 * Creates a new item to the browser's history
 *
 * @param stateObj {Object} New stateObj, provide null to mark current stateObj as ignored (drawers, etc.)
 *
 * @method newHistory
 * @internal
 */

  if (typeof stateObj !== 'object') {
    throw O.log.error(this, 'INVALID_ARGS', 'stateObj', stateObj);
  }

  this.lastStateObj = this.stateObj;

  this.stateObj = stateObj ? stateObj : {ignore: true};

  this.stateObj.id = ++this.lastStateObj.id;

  window.history.pushState(this.stateObj, '', '#h' + this.stateObj.id);
};

exports.updateHistory = function() {  // {{{2
/**
 * Updates the last history item with the current state object
 *
 * @method updateHistory
 * @internal
 */

  if (! this.stateObj.ignore) {
    this.stateObj.main = this.body.main && this.body.main.content && this.body.main.content.demand;

    window.history.replaceState(this.stateObj, '');
  }
};

// Private {{{1
function run(that, config) {  // {{{2
  that.configuration = config;
  if (config.acceptLanguage) {
    that.language = config.acceptLanguage.split(',')[0];
  }

  // When loading with "#h?" in uri use `history.state` otherwise use `config.stateObj`
  var match = window.location.hash.match(/^#h(\d+)/);
  if (match) {
    that.stateObj = history.state || that.defaultStateObj;
    that.stateObj.id = parseInt(match[1]);
  } else {
    that.stateObj = config.stateObj || that.defaultStateObj;
    that.stateObj.id = 0;
  }
  window.history.replaceState(that.stateObj, '');

  // Initialize event handlers
  that.input = O.new('./input')();

  // Initialize head and register OSE html controls
  that.head = require('./head');
  that.head.register('button', './control/button');
  that.head.register('buttons', './control/buttons');
  that.head.register('checkbox', './control/checkbox');
  that.head.register('onoff', './control/onoff');
  that.head.register('slider', './control/slider');

  // Register propper body based on layout
  var layout = that.stateObj.layout || 'simple';
  if (layout.indexOf('/') >= 0) {
    that.body = require(layout);
  } else {
    that.body = require('./body/' + layout);
  }
  that.body.layout = layout;
  that.body.init(that.stateObj);
};

/* CHECK {{{1
function getPeers(filter, each, cb) {  // {{{2
  var l = O.here.space.peers;

  for (var key in l) {
    var p = l[key];

    if (! filter || p.name.pos(filter) !== 0) {
      each(p.name);
    }
  }

  cb();
};

function getSpaces(filter, each, cb) {  // {{{2
  O.data.eachSpace(function(space) {
    if (! filter || space.name.pos(filter) !== 0) {
      each(space.name);
    }
  });

  cb();
};

function decodeHash(that, hash) {  // {{{2
  // returns object containing key for content eventualy other views or null.

//  console.log('DECODE HASH', hash);

  switch (typeof hash) {
    case 'undefined':
      return null;
    case 'object':
      return hash;
    case 'string':
      var match = hash.match(/^#h(\d+)/);

      if (match) {  // Hash is history item.
        return null;
      }

      if (hash.charAt(0) === '#') hash = hash.substr(1);

      if (! hash) {
        return null;
      }

      try {
        return JSON.parse(hash);
      } catch (error) {
        return JSON.parse(decodeURIComponent(hash));
      }
  }

  return null;
};

exports.isMobile = function()  {  // {{{2
/ **
 * Tests whether the UI is displayed in a mobile browser
 *
 * @returns {Boolean}
 *
 * @method isMobile
 * /

  var mobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
      return (mobile.Android() || mobile.BlackBerry() || mobile.iOS() || mobile.Opera() || mobile.Windows());
    }
  };

  if (mobile.any()) return true;
  else return false;
};

exports.checkOrientation = function() {  // {{{2
/ **
 * Checks browser orientation
 *
 * @method checkOrientation
 * @deprecated
 * /

  O.log.todo('deprecated');
  return;

  var that = this;
  var mql = window.matchMedia('(orientation: portrait)');

  if (mql.matches) {
    this.portrait();
  } else {
    this.landscape();
    this.leftBox.width = window.screen.height * 0.8;
  }

  mql.addListener(function(m) {
    if (m.matches) {
      that.portrait();
    } else {
      that.landscape();
    }
  });
};

function newEntry() {  // {{{2
  // select space, shard, kind
  // edit new entry
  // generate id, save entry

  var dialog = new Dialog();

  this.drawer.hide();

  var def = O.new('ose/lib/field/object')('ident');
  def.caption = 'Select new entry identification';
  def.add('space', 'lookup', {get: getSpaces});
  def.add('peer', 'lookup', {get: getPeers});
  def.add('schema', 'lookup');
  def.add('shard', 'lookup');
  def.add('kind', 'lookup');

  var val = this.main.activeView;
  if (val && typeof val.getIdent === 'function') {
    val = val.getIdent();
  } else {
    val = undefined;
  }

  dialog.editDef(def, val, function(err, resp) {
    if (err) return;

    resp.new = true;

    O.ui.body.display({main: {
      view: 'detail',
      ident: resp,
    }});
    return;
  });
  dialog.el.open();
}

function showUri() {  // {{{2
  var that = this;

  this.drawer.hide();

  var stateObj = this.getStateObj();
  var hash = '#' + encodeURIComponent(JSON.stringify(stateObj));
  var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search + hash;

  var dialog = new Dialog();
//  var dialog = this.main.dialog();
  dialog.append('h1').text('URI');
  dialog.append('p').text(url);

  var section = dialog.append('section');

  new QRCode(section.el, {
    text: url,
    width: '200',
    height: '200',
    colorDark : '#000000',
    colorLight : '#ffffff',
    correctLevel : QRCode.CorrectLevel.H,
  });

  // TODO: use dialog.addButton
  dialog.append('<fieldset>').add([
    dialog.new('button').text('Go').on('tap', function(ev) {
      dialog.remove();
      window.history.pushState(stateObj, '', url);
    }),
    dialog.new('button').text('Close').on('tap', function(ev) { dialog.el.close(); }),
  ]);

  dialog.el.open();

  dialog.find('p').select();
};

function installHostedWebapp() {  // {{{2
  var that = this;

  if (navigator.mozApps && navigator.mozApps.install) {
    var manifestURL = window.location.protocol + '//' + window.location.host + '/ose-html5/app/manifest.webapp';

    checkInstalled(manifestURL);
  }

  this.drawer.hide();

  function checkInstalled() {
    var req = navigator.mozApps.checkInstalled(manifestURL);

    req.onsuccess = function() {
      if (this.result) {
        var dialog = new Dialog('alert');
        dialog.text('The Open Smart Environment app already installed.');
        dialog.el.open();
      } else {
        install();
      }
    };

    req.onerror = function() {
      O.log.unhandled("Webapp  install failed\n\n:" + this.err);
    };
  }

  function install() {
    var req = navigator.mozApps.install(manifestURL);
      console.log('installing: ', req);

    req.onsuccess = function() {
      console.log('SUCCESS!!!!!!!!!!\n', this.result);
      navigator.mozApps.install.triggerChange('installed');
    }

    req.onerror = function() {
      console.log('ERROR!!!!!!!!!!\n', this.error);
      O.log.unhandled("Webapp  install failed\n\n:" + this.error);
    }
  }
}

exports.scrollToTop = function(el) {  // {{{2
/ **
 * Scroll element to the top of the screen.
*
 * @param el {Object} jQuery element to be scrolled to the top
 *
 * @method scrollToTop
 * /

  //if (! (el instanceof jQuery)) el = $(el);

/ *
  $('section.content').animate({
    scrollTop: el.offset().top + $('section.content').scrollTop() - $('header.fixed').height()
  }, 100);
* /
};

function onDragend(data, ev) {  // {{{2
  $('body')
    .removeClass('unselectable')
    .off('panmove', data.dragHandle)
    .off('panend', data.dragendHandle)
  ;

  delete this.dragging;

  data.end && data.end(ev, data);

  return false;
};

exports.startDrag = function(data) {  // {{{2
  if (this.dragging) {
    return null;
  }

  if (typeof data === 'function') {
    data = {drag: data};
  }

  this.dragging = data;

  $('body')
    .addClass('unselectable')
    .on('panend', data.dragendHandle = onDragend.bind(this, data))
  ;

  if (data.drag) {
//    $('body').on('drag', data.dragHandle = O._.throttle(data.drag, 5));
//    $('body').on('drag', data.dragHandle = O._.throttle(data.drag, 25));
    $('body').on('panmove', data.dragHandle = data.drag);
  }

  return data;
};

// }}}1 */
