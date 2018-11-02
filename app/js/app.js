/*
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(exports) {
'use strict';

function downloadStarter() {
  ga('send', 'event', 'button', 'download');
}

function recordPlunker(demo) {
  ga('send', 'event', 'plunker', demo);
}

function recordPageview(opt_url) {
  var url = opt_url || location.pathname + location.hash;
  ga('send', 'pageview', url);
  ga('devrelTracker.send', 'pageview', url);
}

exports.recordPageview = recordPageview;
exports.downloadStarter = downloadStarter;
exports.recordPlunker = recordPlunker;

// Analytics -----
/* jshint ignore:start */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
/* jshint ignore:end */

ga('create', 'UA-39334307-1', 'auto', {'siteSpeedSampleRate': 50});
ga('create', 'UA-49880327-9', 'auto', {'name': 'devrelTracker'});
recordPageview();

// Entypoint for element definitions - full path is needed for fragment loading on any doc URL.
window.define([window.location.origin + '/elements/pw-shell.js']);

})(window);
