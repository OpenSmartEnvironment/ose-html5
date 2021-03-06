'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/http/content')
;

exports = O.init();

/** Docs {{{1
 * @module html5
 */

/**
 * @caption html5 web components content
 *
 * @readme
 * exports singleton defines which files to provide to browsers.
 *
 * @class html5.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public {{{1

// OSE modules
exports.addModule('lib/body/simple');
exports.addModule('lib/browser');
exports.addModule('lib/box.js');
exports.addModule('lib/control/button');
exports.addModule('lib/control/buttons');
exports.addModule('lib/control/checkbox');
exports.addModule('lib/control/onoff');
exports.addModule('lib/control/slider');
//exports.addModule('lib/dialog');
exports.addModule('lib/drawer');
exports.addModule('lib/head');
exports.addModule('lib/index');
exports.addModule('lib/input');
exports.addModule('lib/view/dashboard');
exports.addModule('lib/view/detail');
exports.addModule('lib/view/entry');
exports.addModule('lib/view/index');
exports.addModule('lib/view/list');
exports.addModule('lib/view/listItem');
exports.addModule('lib/view/gesture');

exports.addModule('lib/wrap.js');

// Other Node.js modules
exports.addModule('node_modules/punycode/punycode.js', 'punycode');
exports.addModule('node_modules/url/url.js', 'url');  // TODO move to "ose" package

// Other js
//exports.addJs('node_modules/hammerjs/hammer.min.js');
//exports.addJs('node_modules/qrcodejs/qrcode.min.js');

// Styles
exports.addCss('css/style.css');
exports.addCss('node_modules/fxos-font/fxos-font.css');
//exports.addCss('node_modules/fxos-icons/fxos-icons.css');

