'use strict';

const O = require('ose')(module)
  .class(init, './wrap')
;

/** Docs {{{1
 * @module html5
 * @submodule html5.view
 */

/**
 * @caption View box class
 *
 * @readme
 * View box object handles one view at a time. Calling `box.display(demand, source, cb)` new view is created or existing one is updated.
 *
 * @aliases viewbox
 * @class html5.lib.main
 * @type class
 * @extends html5.lib.wrap
 */

// Public {{{1
function init(attrs, params) {  // {{{2
/**
 * Main section initialization
 *
 * @method constructor
 */

  O.inherited(this)('section', attrs, params);

  this.hook();
};

exports.display = function(demand, source, cb) {  // {{{2
/**
 * Display new view or update existing one inside this box based on `demand`.
 *
 * @param demand {Object} Object defining what is to be displayed
 * @param cb {Function} Final callback
 *
 * @return {Object} View
 *
 * @method display
 */

  cb = O.checkCb(cb);

  if (! demand) {
    if (this.content) {
      this.content.remove();
    }

    return O.async.setImmediate(cb);
  }

  if (typeof demand !== 'object') {
    return O.async.setImmediate(function() {
      cb(O.error('INVALID_ARGS', 'demand', demand));
    });
  }

  if (this.content) {
    if (this.content.verifyDemand(demand)) {
      if (typeof this.content.update === 'function') {
        return this.content.update(demand, cb);
      }

      return O.async.setImmediate(cb);
    }
  }

  this.beforeDisplay && this.beforeDisplay(demand, source);

  if (this.content) {
    this.content.remove();
  }

  this.content = this.view2(demand);
  this.append2(this.content);
  if (this.header) {
    this.content.header = this.header.empty();
  }

  bindRemoved(this, this.content);

  this.content.loadData((function(err) {
    this.afterDisplay && this.afterDisplay(demand, source, err);
    cb(err);
  }).bind(this));

  this.content.show();
};

// Internal {{{1
exports._removed = function(ev) {
  this.trigger('removed', ev);

  if (this.content) {
    this.content.remove();
    delete this.content;
  }
};

// Private {{{1
function bindRemoved(that, content) {
  content.on('removed', function(ev) {
    if (content === that.content) {
      delete that.content;
    }
    if (! that.content && that.header) {
      that.header.empty();
    }
  });
}
