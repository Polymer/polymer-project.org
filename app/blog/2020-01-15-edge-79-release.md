---
title: "Native Web Components come to Microsoft Edge"
---

Today Microsoft released [Microsoft Edge 79](https://www.microsoft.com/en-us/edge), the first stable version of its new Edge browser, rebuilt from the ground up based on the Chromium engine. It brings support for [many new standards](https://developer.microsoft.com/en-us/microsoft-edge/status/detailssummary/?q=edgeChromium%3AShipped%20edge%3ADeprecated%20edge%3A%27Not%20Supported%27), from CSS `will-change` to the `<summary>` and `<details>` elements.  

Here at the Polymer Project, we're particularly excited about what this means for web components. Since the beginning, the goal of these specifications was to have a native, interoperable component model available across all browsers. With the release of Edge 79, we now have a native implementation available in all major browsers: Edge, Firefox, Chrome, and Safari.

This is great news for web users and developers alike.

Edge users will see performance improvements from web components using native implementations instead of polyfills. They'll also benefit from a cutting edge implementation of shadow DOM with features like Constructible Stylesheets and CSS Shadow Parts.

And many developers can start to consider deploying applications without the web components polyfills at all if their browser support matrix allows. Have you already dropped IE11 support? There's a good chance all your users have native web components support now.

Obviously we've been champions of web components for a long time. It's great to see adoption growing in all kinds of projects, from the [Microsoft Graph Toolkit](https://docs.microsoft.com/en-us/graph/toolkit/overview) to the [Firefox UI](https://briangrinstead.com/blog/firefox-webcomponents/). 

Congratulations to the Edge team for hitting this milestone! It's a huge accomplishment, and  a great way to start 2020.
