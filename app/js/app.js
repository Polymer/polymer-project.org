/*
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

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

searchBox.addEventListener('keypress', function(event) {
  if (event.keyCode === 13 /* enter */) {
    const site = window.location.hostname;
    const query = encodeURIComponent(searchBox.value);
    ga('send', 'pageview', '/search?q='+query);
    window.location = 'https://www.google.com/search?q=site%3A'+site+'+'+query;
    event.preventDefault();
  }
});
