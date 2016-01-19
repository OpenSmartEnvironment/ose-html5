'use strict';

const O = require('ose')(module)
  .singleton('./wrap')
;

exports = O.init(document.body);
exports.hook();

O.extend('ui', exports);

// Public {{{1
exports.lastStateObj = null;  // {{{2
/**
 * Last displayed view state object
 *
 * @property lastStateObj
 * @type Object
 */

exports.defaultStateObj = {view: 'dashboard'};  // {{{2
/**
 * View displayed by default
 *
 * @property defaultStateObj
 * @type Object
 */

exports.run = function(config) {  // {{{2
/**
 * Internal OSE UI startup method
 *
 * @method run
 * @internal
 */

//  console.log('UI RUN');

  this.config = config;
  if (config.acceptLanguage) {
    this.language = config.acceptLanguage.split(',')[0];
  }

  this.register('button', './control/button');
  this.register('buttons', './control/buttons');
  this.register('checkbox', './control/checkbox');
  this.register('onoff', './control/onoff');
  this.register('slider', './control/slider');

  this.main = O.new('./main')();
  this.append2(this.main);

  this.header = O.new('./header')();
  this.main.append2(this.header);

  this.drawer = O.new('./drawer')();
  this.append2(this.drawer);
  this.drawer.addLink('Dashboard', 'dashboard', tapDashboard.bind(this));
  this.drawer.addLink('About', 'about', about.bind(this));

  /* TODO
  this.drawer.addLink('Show URI', 'showUri', showUri.bind(this));
  this.drawer.addLink('New entry', 'newEntry', newEntry.bind(this));
  this.drawer.addLink('Install hosted webapp', 'installHostedWebapp', installHostedWebapp.bind(this));
  */

  O.log.notice('UI initialized');

  var so = this.config.defaultStateObj || history.state || {content: this.defaultStateObj};
  var match = window.location.hash.match(/^#h(\d+)/);
  if (match) {
    this.lastHistory = parseInt(match[1]);
  } else {
    this.lastHistory = 0;
  }

  //  window.history.replaceState(so, '');

  this.find('div#oseLoading').remove();

  this.display(so, 'init', O.log.bindError());

  this.input = O.new('./input')();
};

exports.newHistory = function() {  // {{{2
/**
 * Creates a new empty state item to the browser's history
 *
 * @method newHistory
 * @internal
 */

  window.history.pushState({}, '', '#h' + ++this.lastHistory);
};

exports.updateHistory = function() {  // {{{2
/**
 * Updates the last history item with the current state object
 *
 * @method updateHistory
 * @internal
 */

  window.history.replaceState(this.getStateObj(), '');
};

exports.display = function(so, source, cb) {  // {{{2
/**
 * Displays or updates ui based on the state object.
 *
 * @param so {Object} State object
 * @param source {String 'user'|'history'} Source of the call
 *
 * @method display
 */

//  console.log('NEW StateObj', {lastSource: this.lastSource, source: source}, JSON.stringify(so));

  if (typeof source === 'function') {
    cb = source;
  } else {
    if (! source) source = 'user';
  }

  if (! so) {
    return cb(O.error(this, 'INVALID_STATE_OBJ'));
  }
  if (cb) {
    if (typeof cb !== 'function') {
      throw O.log.error('INVALID_ARGS', arguments);
    }
  } else {
    cb = function(err) {
      if (err) O.log.error(err);
    }
  }

  switch (this.lastSource) {
  case 'init':
  case 'user':
    if (source !== 'history') {
      this.updateHistory();
    }
    break;
  }

  if (
    source === 'user' &&
    this.drawer.hidden
  ) {
    this.newHistory();
  }

  this.lastSource = source;

  this.drawer.hide(true);
  this.main.display(so.content, source, cb);

  /* TODO
  if (this.dialog) {
    this.dialog.remove();
    delete this.dialog;
  }
  */

  switch (source) {
  case 'user':
    this.updateHistory();
    break;
  }
};

exports.bindContent = function(so) {  // {{{2
/**
 * Creates new event handler that calls the "O.ui.display(so)"
 *
 * @param so {Object} State object to be displayed
 *
 * @returns {Function} Event handler calling "O.ui.display(so)"
 *
 * @method bindContent
 */

  return function(ev) {
    exports.display({content: so}, 'user', function(err) {
      if (err) O.log.error(err);
    });

    return false;
  };
};

exports.getStateObj = function() {  // {{{2
/**
 * Gets state object
 *
 * @returns {Object} State object
 *
 * @method getStateObj
 * @internal
 */
//  console.log('GET STATE OBJ', this.rightBox.content);

  if (! this.main) return {};

  var result = {};

  if (this.main.content) {
    result.content = this.main.content.so;
  }

  // if (this.rightBox.content && this.rightBox.content.visible()) {
  //   result.right = this.rightBox.content.so;
  // }

  /* TODO
  if (this.dialog) {
    result.dialog = true;
  }
  */

  return result;
};

exports.portrait = function() {  // {{{2
/**
 * Switch to portrait mode
 *
 * @method portrait
 * @deprecated
 */

  O.log.todo('deprecated');
  return;

  this.leftBox.width = '80%';
  if (this.leftBox.visible()) this.leftBox.show();
};

exports.landscape = function() {  // {{{2
/**
 * Switch to landscape mode
 *
 * @method landscape
 */

  O.log.todo('deprecated');
  return;

  this.leftBox.width = window.screen.height * 0.8;
  if (this.leftBox.visible()) this.leftBox.show();
};

// Event Handlers {{{1
function tapDashboard() {  // {{{2
  this.drawer.hide(true);

  this.display({content: this.defaultStateObj});
};

function about() {  // {{{2
  window.location = 'http://opensmartenvironment.github.io/doc';
};

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

  var def = O.new('ose/lib/orm/object')('ident');
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

    O.ui.display({content: {
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

  var so = this.getStateObj();
  var hash = '#' + encodeURIComponent(JSON.stringify(so));
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
      window.history.pushState(so, '', url);
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
