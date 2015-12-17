'use strict';

var O = require('ose').module(module);

var Dialog = O.class('./dialog');

/** Doc {{{1
 * @class html5.lib
 */

// Public {{{1
exports.lastStateObj = null;  // {{{2
/**
 * Last displayed "page bit" key object
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

exports.config = function(name, val, deps) {  // {{{2
  O.extend('ui', require('./index'));

  this.configData = val;

  if (val.init) {
    require(val.init)(deps);
  }

  var that = this;
  deps.add({after: 'finish'}, function(cb) {
    cb();

    O.async.setImmediate(function() {
      that.run();
    });
  });
};

exports.run = function() {  // {{{2
/**
 * Internal OSE UI startup method
 *
 * @method run
 * @internal
 */

//  console.log('UI RUN');

  bindVisibility(this);

  window.onpopstate = onPopstate.bind(this);
  window.onbeforeunload = beforeUnload.bind(this);

  this.body = O.new('./wrap')(document.body);
  this.body.hook();

//  this.body.attr('role', 'application');
//  this.body.addClass('theme-communications');

  this.main = O.new('./main')();

  this.globalDrawer = O.new('./drawer')();
  this.globalDrawer.addLink('Dashboard', 'dashboard', tapDashboard.bind(this));
  this.globalDrawer.addLink('Show URI', 'showUri', showUri.bind(this));
  this.globalDrawer.addLink('About', 'about', about.bind(this));

  // TODO
//  this.globalDrawer.addLink('New entry', 'newEntry', newEntry.bind(this));
  //this.globalDrawer.addLink('Install hosted webapp', 'installHostedWebapp', installHostedWebapp.bind(this));

  O.log.notice('UI initialized');

  var so = this.configData.defaultStateObj || history.state || {content: this.defaultStateObj};
  var match = window.location.hash.match(/^#h(\d+)/);
  if (match) {
    this.lastHistory = parseInt(match[1]);
  } else {
    this.lastHistory = 0;
  }

  //  window.history.replaceState(so, '');

  this.body.find('div#oseLoading').remove();

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
    ! this.globalDrawer.visible()
// TODO    (! (this.globalDrawer.visible() || this.main.search.visible()))
  ) {
    this.newHistory();
  }

  this.lastSource = source;

  this.globalDrawer.hide(true);
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
    O.ui.display({content: so}, 'user', function(err) {
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

exports.isMobile = function()  {  // {{{2
/**
 * Tests whether the UI is displayed in a mobile browser
 *
 * @returns {Boolean}
 *
 * @method isMobile
 */

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
/**
 * Checks browser orientation
 *
 * @method checkOrientation
 * @deprecated
 */

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

// }}}1
// Event Handlers {{{1
function onPopstate(ev) {  // {{{2
//  console.log('POP STATE', window.history.state);

  this.display(window.history.state, 'history', function(err) {
    if (err) O.log.error(err);
  });
};

function beforeUnload(ev) {  // {{{2
  this.updateHistory();
}

function tapDashboard() {  // {{{2
  this.globalDrawer.hide(true);

  this.display({content: this.defaultStateObj});
};

function newEntry() {  // {{{2
  // select space, shard, kind
  // edit new entry
  // generate id, save entry

  var dialog = new Dialog();

  this.globalDrawer.hide();

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

function about() {  // {{{2
  window.location = 'http://opensmartenvironment.github.io/doc';
};

function showUri() {  // {{{2
  var that = this;

  this.globalDrawer.hide();

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
    dialog.new('button').text('Go').on('click', function(ev) {
      dialog.remove();
      window.history.pushState(so, '', url);
    }),
    dialog.new('button').text('Close').on('click', function(ev) { dialog.el.close(); }),
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

  this.globalDrawer.hide();

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

// }}}1
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

function bindVisibility(that) {  // {{{2
  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange;
  if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityChange = 'mozvisibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  if (typeof hidden === 'undefined') {
    O.log.unhandled('Visibility API is not supported');
    return false;
  }

  document.addEventListener(visibilityChange, function onChange() {
    if (that.visibilityTimeout) {
      clearTimeout(that.visibilityTimeout);
      delete that.visibilityTimeout;
    }

    if (document[hidden]) {
//      console.log('DOCUMENT HIDE');

      that.visibilityTimeout = setTimeout(function() {  // Wait 10 seconds before peer disconnect.
        delete that.visibilityTimeout;
        O.gw.disconnect();
      }, 10000);
    } else {
//      console.log('DOCUMENT SHOW');

      if (! O.gw.isConnected()) {
        O.gw.connect();
      }
    }
  });

  return true;
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

// }}}1



/* CHECK {{{1
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
