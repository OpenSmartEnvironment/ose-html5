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
  var that = this;
  var shards;

  this.startUpdate(cb);

  this.on('removed', removed.bind(this));

  var ident = this.so.ident;
  var schema = O.data.schemas[ident.schema];
  /*
  if (ident.schema) {
    this.schema = O.data.schemas[ident.schema];
  }
  */

  if (! ident.space) {
    return setSpace(O.here.space);
  }

  return O.data.getSpace(ident.space, function(err, space) {  // {{{3
    if (err) return that.endUpdate(err);
    return setSpace(space);
  });

  function setSpace(space) {  // {{{3
    that.space = space;

    if (ident.shard) {
      return space.findShard(ident.shard, onShard);
    }

    return space.findShards(ident, onShards);
  }

  function onShard(err, shard) {  // {{{3
    if (err) return that.endUpdate(err);

    that.shard = shard;
    if (schema) {
      if (schema.name !== shard.schema.name) {
        return that.endUpdate('INVALID_STATE_OBJ', 'Shard has different schema than specified one', that.so);
      }
    } else {
      schema = shard.schema;
    }

    return setup();
  }

  function onShards(err, val) {  // {{{3
    if (err) return that.endUpdate(err);

    switch (val.length) {
    case 0:
      return listEmpty(that);
    case 1:
      return that.space.findShard(val[0], onShard);
    }

    that.shards = [];
    return O.async.each(val, function(sid, cb) {
      that.space.getShard(sid, function(err, shard) {
        if (err) return cb(err);

        if (schema) {
          if (schema.name !== shard.schema.name) {
            return cb(O.error(that, 'INVALID_STATE_OBJ', 'Shard has different schema than specified one', that.so));
          }
        } else {
          schema = shard.schema;
        }

        that.shards.push(shard);

        return cb();
      });
    }, function(err) {
      if (! that.updating) return;

      if (err) return that.endUpdate(err);
      return setup();
    });
  }

  function setup() {  // {{{3
    // Assign kind
    if (ident.kind) {
      if (! schema) {
        return that.endUpdate('INVALID_STATE_OBJ', 'Kind can\'t be found without schema defined', that.so);
      }

      that.kind = schema.kinds[ident.kind];
      if (! that.kind) {
        that.endUpdate('INVALID_STATE_OBJ', 'Kind was not found within a schema', that.so);
      }
    }

    // Extend list view
    if (that.kind) {
      O._.extend(that, that.kind.getLayout(that.layout, that.so.layout));

      if (that.kind.layouts && that.layout in that.kind.layouts) {
        O._.extend(that, that.kind.layouts[that.layout]);
      }
    }
    switch (typeof (that.extend || undefined)) {
    case 'undefined':
      break;
    case 'function':
      that.extend();
      break;
    case 'string':
      O._.extend(that, require(that.extend));
      break;
    case 'object':
      O._.extend(that, that.extend);
      break;
    default:
      throw O.error(that, 'Invalid extend', that.extend);
    }

    // Display data
    that.empty();
    that.displayHeader();

    that.update(that.so, true);
    that.endUpdate();
  };

  // }}}3
};

exports.verifyStateObj = function(val) {  // {{{2
  if (val.view !== 'list') return false;
  if (! val.ident) return false;

  if (val.layout && (this.so.layout !== val.layout)) return false;

  if (this.space && val.ident.space !== this.space.name) return false;

  if (val.ident.shard) {
    if (! (this.shard && this.shard.isIdentified(val))) return false;
  }

  if (val.ident.schema && this.so.schema !== val.ident.schema) return false;

  if (val.ident.kind && ! (this.kind && this.kind.name === val.ident.kind)) return false;

  return true;
};

exports.update = function(so, force, keep) {  // {{{2
/**
 * Call to update list
 *
 * @param so {Object} New state object
 * @param force {Boolean} If true, perform update even though so is unchanged.
 * @param keep {Boolean} Keep non-persistent list items.
 *
 * @method update
 */

  if (
    ! force &&
    O._.isEqual(so.filter, this.so.filter) &&
    O._.isEqual(so.sortby, this.so.sortby)
  ) {
    return;
  }

  ++this.updating;

  if (! keep) {
    this.empty();
  }

  if (so.filter) {
    this.so.filter = so.filter;
  }

  if (so.sortby) {
    this.so.sortby = so.sortby;
  }

  var params = {
    filter: this.so.filter,
    sortby: this.so.sortby,
  };

  this.displayLayout && this.displayLayout();

  if (this.shard) {
    ++this.updating;
    this.shard.query(
      this.so.query,
      params,
      onShardData.bind(this, this.shard)
    );
  } else {
    for (var i = 0; i < this.shards.length; i++) {
      ++this.updating;
      this.shards[i].query(
        this.so.query,
        params,
        onShardData.bind(this, this.shards[i])
      );
    }
  }

  if (! force) {
    O.ui.updateHistory();
  }

  this.endUpdate();
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

  if (! this.so.listItems) {
    this.li({focusable: 'focusable'})
      .h3(entry.getCaption())
      .on('tap', this.tapItem.bind(this, entry))
    ;

    return this.endUpdate();
  }

  var that = this;

  var p = this.view2({view: 'listItem'});
  this.append2(p);

  return p.loadData(function(err) {
    that.endUpdate();
  }, entry);
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

  if (typeof this.selectValue === 'function') {
    this.selectValue(entry.identify());
    return false;
  }

  O.ui.display({content: {
    view: 'detail',
    ident: entry.identify(),
  }});
  return false;
};

exports.displayHeader = function() {  // {{{2
/**
 * Prints list header
 *
 * @method displayHeader
 */

  if (! this.header) return;

  this.header.h2('"' + this.so.caption + '" list');
};

exports.onSearch = function(value) {  // {{{2
  O.log.todo();
  return;

  var filter = JSON.parse(JSON.stringify(this.so.filter || {}));

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

  if (this.kind) {
    res.kind = this.kind.name;
  }

  return res;
};

// Event Handlers {{{1
function removed(shard, err, val) {  // {{{2
  this.eachChild(function(child) {
    child.remove();
  });
}

function onShardData(shard, err, val) {  // {{{2
//  console.log('LIST ON SHARD DATA', val);

  if (err) {
    return this.endUpdate();
//    return this.endUpdate(err);
  }

  var that = this;

  for (var i = 0; i < val.length; i++) {
//    console.log('LIST GET ENTRY', val[i]);

    ++this.updating;

    shard.get(val[i], onEntry);
  }

  return this.endUpdate();

  function onEntry(err, entry) {
//    console.log('LIST ON ENTRY', arguments);

    if (err) {
      return this.endUpdate();
//      return this.endUpdate(err);
    }

    that.printItem(entry);
    return;
  }
}

// Private {{{1
function listEmpty(that) {  // {{{2
  that
    .empty()
    .text('No items')
  ;

  that.endUpdate();
}

