'use strict';

const O = require('ose')(module)
  .singleton('./wrap')
;

exports = O.init(document.body).hook();

O.extendO('ui', exports);

/** Docs {{{1
 * @module html5
 */

/**
 * @caption HTML body wrapper
 *
 * @readme This singleton wraps the `document.body` and provides the
 * basic part of the UI. It creates the following basic components:
 *
 * - main
 *   Shows a view containing data
 *
 * - header
 *   Renders the app's header
 *
 * - drawer
 *   Renders the app's drawer
 *
 * - input
 *   Handles events in the UI
 *
 * @class html5.lib.body
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
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

  main: {view: 'dashboard'},
};

exports.run = function(config) {  // {{{2
/**
 * Internal OSE UI startup method
 *
 * @param config {Object} Configuration
 * 
 * @method run
 * @internal
 */

  this.config = config;
  if (config.acceptLanguage) {
    this.language = config.acceptLanguage.split(',')[0];
  }

  this.register('button', './control/button');
  this.register('buttons', './control/buttons');
  this.register('checkbox', './control/checkbox');
  this.register('onoff', './control/onoff');
  this.register('slider', './control/slider');

  this.main = O.new('./box')('main');
  this.main.beforeDisplay = beforeDisplay.bind(this);
  this.main.afterDisplay = afterDisplay.bind(this);
  this.append2(this.main);

  this.header = this.tree('header');
  this.main.header = this.header.span();
  this.tree('span', 'row left').button('char', 'menu', function(ev) {
    O.ui.drawer.show();
  });
  this.tree('span', 'row right').button('char', 'menu', function(ev) {
    O.ui.localDrawer.show();
  });

  this.drawer = O.new('./drawer')();
  this.append2(this.drawer);
  this.drawer.addLink('Dashboard', 'dashboard', tapDashboard.bind(this));
  this.drawer.addLink('About', 'about', about.bind(this));

  /* TODO
  this.drawer.addLink('Show URI', 'showUri', showUri.bind(this));
  this.drawer.addLink('New entry', 'newEntry', newEntry.bind(this));
  this.drawer.addLink('Install hosted webapp', 'installHostedWebapp', installHostedWebapp.bind(this));
  */

//  O.log.debug('UI initialized');

  this.stateObj = this.config.defaultStateObj || history.state;
  if (O._.isEmpty(this.stateObj)) {
    this.stateObj = JSON.parse(JSON.stringify(this.defaultStateObj));
  }

  var match = window.location.hash.match(/^#h(\d+)/);
  if (match) {
    this.stateObj.id = parseInt(match[1]);
  } else {
    this.stateObj.id = 0;
  }

  window.history.replaceState(this.stateObj, '');

  this.find('div#oseLoading').remove();

  this.display(this.stateObj, 'init', O.log.bindError());

  this.input = O.new('./input')();
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
    this.stateObj.main = this.main.content && this.main.content.demand;

    window.history.replaceState(this.stateObj, '');
  }
};

exports.display = function(stateObj, source, cb) {  // {{{2
/**
 * Displays or updates ui based on the state object.
 *
 * @param stateObj {Object} State object
 * @param source {String} Request source, can be "user", "init" or "history"
 * @param [cb] {Function} Callback
 *
 * @method display
 */

//  O.log.debug('Body display', {lastSource: this.lastSource, source: source, stateObj: stateObj});

  // Check whether history is ignored
  if (source === 'history') {
    if (stateObj.ignore) {
      if (this.stateObj.id > stateObj.id) {
        window.history.back();
      } else {
        window.history.forward();
      }

      return;
    }

    this.lastStateObj = this.stateObj;
    this.stateObj = stateObj;
  }

  this.main.display(stateObj.main, source, cb);
};

// Event Handlers {{{1
function tapDashboard() {  // {{{2
  this.drawer.hide(true);

  this.display(this.defaultStateObj, 'user');
};

function about() {  // {{{2
  window.location = 'http://opensmartenvironment.github.io/doc';
}

function beforeDisplay(demand, source) {  // {{{2
  this.updateHistory();

  if (source === 'user') {
    this.newHistory({main: demand});
  }
}

function afterDisplay(demand, source, err) {  // {{{2
  this.updateHistory();
}

// Private {{{1
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

/* CHECK {{{1
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

    O.ui.display({main: {
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
