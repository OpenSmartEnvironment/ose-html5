'use strict';

var O = require('ose').class(module, C, './wrap');

/** Docs {{{1
 * @module html5
 */

/**
 * @caption Main content
 *
 * @readme
 * Class handling displaying of the main content on the page.
 *
 * It is placed right in the `<body>` and displays the main content of
 * the application. 
 *
 * @class html5.lib.content
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
function C() {  // {{{2
/**
 * Main content initialization
 *
 * @method constructor
 */

  O.super.call(this, 'section', 'main');
  this.hook();
};

exports.display = function(so, source, cb) {  // {{{2
/**
 * Display content based on `so`
 *
 * @param so {Object} Object defining what is to be displayed
 * @param source {String}  Where this method is called from
 *
 * @return {Object} View
 *
 * @method display
 */

//  console.log('CONTENT DISPLAY', so, source, this.content && this.content.id);

  if (typeof source === 'function') {
    cb = source;
    source = undefined;
  }

  if (! so) {
    return cb(O.error(this, 'INVALID_STATE_OBJ'));
  }
  if (typeof cb !== 'function') {
    throw O.log.error('INVALID_ARGS', arguments);
  }

  if (this.content) {
    if (this.content.verifyStateObj(so, source)) {
      if (this.content.update) {
        return this.content.update(so, cb);
      }
      return cb();
    }

    var c = this.content;
    delete this.content;
    c.remove();
  }

//  this.search.hide(true);

  this.content = this.view2(so);
  this.append2(this.content);
  this.content.header = O.ui.header.newHeader();
  this.content.loadData(cb);
  this.content.show();
  this.setActive(this.content);
};

exports.setActive = function(view) {  // {{{2
/**
 * Activate `view`
 *
 * @param view {Object} View instance
 *
 * @method setActive
 */
//  console.log('CONTENT SET ACTIVE', view && view.id, view);

  this.activeView = view;

//  this.search.displayIcon(view && view.onSearch ? true : false);

};

