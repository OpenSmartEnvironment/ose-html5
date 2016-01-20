'use strict';

const O = require('ose')(module)
  .setPackage('ose-html5')
  .singleton()
  .prepend('browser')
;

exports = O.init();

O.content('../content');

/** Docs {{{1
 * @caption HTML5 frontend
 *
 * @readme
 * OSE package providing an mobile-first HTML5 user interface.
 *
 * Each browser page (tab) displaying the OSE frontend is an [OSE
 * instance]. As part of the base [OSE plugin] configuration, a
 * [peer], representing the backend OSE instance, is created and
 * connected to.
 *
 * The connection is realized via a WebSocket in a standard OSE
 * [peer-to-peer] way. All information needed for displaying requested
 * content is exchanged through this WebSocket channel. After a
 * successful connection is established, content is displayed using
 * dynamic injection.
 *
 * @todo
 * The frontend is made to be displayed as a webpage or Firefox OS
 * webapp (currently only hosted).
 *
 *
 * @description
 *
 * ## Initialization
 * When the browser sends an HTML request to a backend (Node.js) OSE
 * instance, this instance responds by generating and providing
 * index.html. The `<head>` of the index.html contains `<script>` and
 * `<style>` tags. Most of these scripts are shared between Node.js
 * and the browser environments. The `<body>` contains a single
 * `<script>` that loads the application.
 *
 * ## State object
 * The state object defines what is displayed by the application. It
 * can be saved in the browser's history. Views receive
 * the state object in as a parameter of their `display()` methods.
 *
 *
 * @features
 * - HTML5 user interface optimized for phones and tablets
 *
 * @aliases oseUi HTML5frontend
 * @module html5
 * @main html5
 */

/**
 * @caption OSE frontend core
 *
 * @readme
 * Core singleton of html5 plugin.
 *
 * This singleton is available through the `O.ui` property.
 *
 * @class html5.lib
 * @type singleton
 * @extends EventEmitter
 * @main html5.lib
 */
// Public {{{1
exports.browserConfig = function(resp, data, req) {
  O._.extend(resp, data);

  resp.acceptLanguage = req.headers['accept-language'];
};
