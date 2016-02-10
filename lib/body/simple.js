'use strict';

const O = require('ose')(module)
  .singleton('../wrap')
;

exports = O.init(document.body).hook();

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
 * @class html5.lib.body.simple
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
exports.init = function(stateObj) {  // {{{2
/**
 * Internal OSE UI startup method
 *
 * @param stateObj {Object} State to be displayed
 *
 * @method run
 * @internal
 */

  var that = this;

  O.ui.head.loadCss('ose-html5/css/simple.css');

  this.empty();

  this.main = O.new('../box')('main');
  this.main.beforeDisplay = beforeDisplay.bind(this);
  this.main.afterDisplay = afterDisplay.bind(this);
  this.append2(this.main);

  this.header = this.tree('header');
  this.main.header = this.header.span();
  this.tree('span', 'row left').button('char', 'menu', function(ev) {
    that.drawer.show();
  });
  this.tree('span', 'row right').button('char', 'menu', function(ev) {
    that.localDrawer.show();
  });

  this.drawer = O.new('../drawer')();
  this.append2(this.drawer);
  this.drawer.addLink('Dashboard', 'dashboard', tapDashboard.bind(this));
  this.drawer.addLink('About', 'about', about.bind(this));

  /* TODO
  this.drawer.addLink('Show URI', 'showUri', showUri.bind(this));
  this.drawer.addLink('New entry', 'newEntry', newEntry.bind(this));
  this.drawer.addLink('Install hosted webapp', 'installHostedWebapp', installHostedWebapp.bind(this));
  */

//  O.log.debug('UI initialized');

  this.display(stateObj, 'init', O.log.bindError());
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

  this.display(O.ui.defaultStateObj, 'user');
};

function about() {  // {{{2
  window.location = 'http://opensmartenvironment.github.io/doc';
}

function beforeDisplay(demand, source) {  // {{{2
  O.ui.updateHistory();

  if (source === 'user') {
    O.ui.newHistory({main: demand});
  }
}

function afterDisplay(demand, source, err) {  // {{{2
  O.ui.updateHistory();
}

