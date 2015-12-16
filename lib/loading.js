'use strict';

window.COMPONENTS_BASE_URL = '/ose-html5/bower_components/';

window.addEventListener('load', function load() {
  var div = document.getElementById('oseLoading')
  var loading = document.createElement('html5-loading');
  var p = document.querySelector('div#oseLoading > p');
  div.insertBefore(loading, p);
});
