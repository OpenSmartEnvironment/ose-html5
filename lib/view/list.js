'use strict';

var O = require('ose').class(module, './index');

/** Docs {{{1
 * @submodule html5.view
 */

/**
 * @caption List of entries view
 *
 * @readme
 * View for displaying lists of entries
 *
 * @class html5.lib.view.list
 * @type class
 * @extends html5.lib.view
 */

// Public {{{1
exports.layout = 'list';

exports.loadData = function(cb) {  // {{{2
//  console.log('LIST LOAD DATA', this.stateObj);

  var that = this;
  var shards;

  if (cb) {
    this.doAfterDisplay = cb;
  }

  var so = this.stateObj;

  if (so.ident.schema) {
    this.schema = O.getScope(so.ident.schema);
  }

  return O.data.getSpace(so.ident.space || O.here.space.name, function(err, space) {  // {{{3
    if (err) return setup(err);

    that.space = space;

    return space.findShards(so.ident, onShards);
  });

  function onShards(err, val) {  // {{{3
//    console.log('LIST SHARDS', err, val);

    if (err) return setup(err);

    switch (val.length) {
    case 0:
      return listEmpty(that);
    case 1:
      return that.space.findShard(val[0], setup);
    }

    shards = [];
    return O.async.each(val, function(sid, cb) {
      that.space.getShard(sid, function(err, shard) {
        if (err) return cb(err);

        if (that.schema) {
          if (that.schema !== shard.schema) {
            return cb(O.error(that, 'INVALID_STATE_OBJ', 'Shard has different schema than specified one', so));
          }
        } else {
          that.schema = shard.schema;
        }

        shards.push(shard);

        return cb();
      });
    }, setup);
  }

  function setup(err, shard) {  // {{{3
    if (err) return that.afterDisplay(err);

    if (shard) {
      that.shard = shard;
      if (that.schema) {
        if (that.schema !== shard.schema) {
          return this.afterDisplay(O.error(that, 'INVALID_STATE_OBJ', 'Shard has different schema than specified one', so));
        }
      } else {
        that.schema = shard.schema;
      }
    } else {
      if (! shards || ! shards.length) {
        throw O.log.error(that, 'Shards not found', shards);
      }

      that.shards = shards;
    }

    that.extend(that.schema);

    if (so.ident.kind) {
      if (! that.schema) {
        that.afterDisplay(O.error(that, 'INVALID_STATE_OBJ', 'Kind can\'t be found without schema defined', so));
        return;
      }

      that.kind = that.schema.kinds[so.ident.kind];
      if (! that.kind) {
        that.afterDisplay(O.error(that, 'INVALID_STATE_OBJ', 'Kind was not found within a schema', so));
      }

      that.extend(that.kind);
    }

    that.empty();
    that.header && that.printHeader();

    that.update(so, true);
  };

  // }}}3
};

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'list') return false;
  if (! val.ident) return false;

  if (val.layout && (this.stateObj.layout !== val.layout)) return false;

  if (this.space && val.ident.space !== this.space.name) return false;

  if (val.ident.shard) {
    if (! (this.shard && this.shard.isIdentified(val))) return false;
  }

  if (val.ident.schema && ! (this.schema && this.schema.name === val.ident.schema)) return false;

  if (val.ident.kind && ! (this.kind && this.kind.name === val.ident.kind)) return false;

  return true;
};

exports.update = function(stateObj, force, keep) {  // {{{2
/**
 * Call to update list
 *
 * @param stateObj {Object} New state object
 * @param force {Boolean} If true, perform update even though stateObj is unchanged.
 * @param keep {Boolean} Keep non-persistent list items.
 *
 * @method update
 */

  if (
    ! force &&
    O._.isEqual(stateObj.filter, this.stateObj.filter) &&
    O._.isEqual(stateObj.sortby, this.stateObj.sortby)
  ) {
    this.afterDisplay();
    return;
  }

  if (! keep) {
    this.empty();
  }

  this.displayLayout && this.displayLayout();

  if (stateObj.filter) {
    this.stateObj.filter = stateObj.filter;
  }

  if (stateObj.sortby) {
    this.stateObj.sortby = stateObj.sortby;
  }

  var params = {
    filter: this.stateObj.filter,
    sortby: this.stateObj.sortby,
  };

//  console.log('UPDATE', this.stateObj, stateObj);

  this.counter = 0;

  if (this.shard) {
    ++this.counter;
    this.shard.query(
      this.stateObj.ident.map,
      params,
      onShardData.bind(this, this.shard)
    );
  } else {
    for (var i = 0; i < this.shards.length; i++) {
      ++this.counter;
      this.shards[i].query(
        this.stateObj.ident.map,
        params,
        onShardData.bind(this, this.shards[i])
      );
    }
  }

  if (! force) {
    O.ui.updateHistory();
  }

//  this.afterDisplay();
  return;
};

exports.printItem = function(entry) {  // {{{2
/**
 * Prints entry list item
 *
 * @param entry {Object} Entry instance to be printed
 *
 * @method printItem
 */

  if (this.stateObj.listItems) {
    var p = this.view2({view: 'listItem'});
    return this.append(p).loadData(null, entry);
  }

  this.new('li', {tabindex: 0})
    .add(this.new('h3').text(entry.getCaption()))
    .on('click', this.tapItem.bind(this, entry))
    .appendTo(this)
  ;

  return dec(this);
};

exports.tapItem = function(entry, ev) {  // {{{2
/**
 * Called when user taps on a list item
 *
 * @param entry {Object} Entry
 * @param ev {Object} Tap event object
 *
 * @method tapItem
 */

  this.stop(ev);

  if (typeof this.selectValue === 'function') {
    this.selectValue(entry.identify());
    return;
  }

  O.ui.display({content: {
    view: 'detail',
    ident: entry.identify(),
  }});
  return;
};

exports.printHeader = function() {  // {{{2
/**
 * Prints list header
 *
 * @method printHeader
 */

  var that = this;

  this.header.h1('"' + this.kind.name + '" list');

  // }}}3
};

exports.onSearch = function(value) {  // {{{2
  O.log.todo();
  return;

  var filter = JSON.parse(JSON.stringify(this.stateObj.filter || {}));

  filter.search = value;

  this.update({filter: filter});
};

exports.getIdent = function() {  // {{{2
  var res = {};

  if (this.shard.space !== O.here.space) {
    res.space = this.shard.space.name;
  }

  if (this.shard) {
    res.shard = this.shard.id;
  }

  /* TODO
  if (this.schema) {
    res.schema = this.schema.name;
  }
  */

  if (this.kind) {
    res.kind = this.kind.name;
  }

  return res;
};

// }}}1
// Event Handlers {{{1
function onShardData(shard, err, val) {  // {{{2
//  console.log('LIST ON SHARD DATA', val);

  var that = this;

  if (err) {
    return this.afterDisplay(err);  // TODO do more than log
  }

//  val = val.map;

  for (var i = 0; i < val.length; i++) {
//    console.log('LIST GET ENTRY', val[i]);

    ++this.counter;

    shard.get(val[i], onEntry);
  }

  return dec(this);

  function onEntry(err, entry) {
//    console.log('LIST ON ENTRY', arguments);

    if (err) {
      return this.afterDisplay(err);  // TODO do more than log
    }

    that.printItem(entry);
    return;
  }
}

// }}}1
// Private {{{1
function dec(that) {  // {{{2
  --that.counter;
  if (that.counter === 0) that.afterDisplay();
}

function listEmpty(that) {  // {{{2
  that
    .empty()
    .add('No items')
  ;

  that.afterDisplay();
}

// }}}1
