---
title: LitElement release candidate
---

First presented at Google I/O last year by the Polymer team, LitElement is a simple base class for creating fast, lightweight Web Components. Today we're excited to announce the first release candidate of LitElement.

With LitElement, you can create and share Custom Elements that work on any site, and [play nicely with frameworks of all kinds](https://custom-elements-everywhere.com). LitElement uses [lit-html](https://lit-html.polymer-project.org/) to render components, and adds API to declare reactive properties and attributes. Elements update automatically when their properties change.

Early adopters are already implementing and launching web apps using LitElement. We've worked hard to stabilize the API and make the code production-ready. We're targeting production-ready releases of lit-html 1.0 and LitElement 2.0 in the coming weeks.


## Wait, did you say 2.0?

Yes, the LitElement release candidate is published to the _unscoped_ `lit-element` npm package (it was previously at `@polymer/lit-element`), and will be 2.0.0-rc.2.  Our first production release will be 2.0.0. 

This doesn't signify some gigantic new change. We've been planning to move LitElement to an unscoped npm package, like lit-html. However, a community member already published a `lit-element` 1.0.0 package on npm. The owner of that package kindly gave us the rights to it, but to prevent breakage, the new version needs to be a major version bump.


## Please try it!

You can get the release candidate of LitElement today from npm. Please give it a spin and let us know what you think:

Install the release candidate:

`npm install --save lit-element`


Import LitElement:

`import {LitElement, html} from 'lit-element';`


### If you're new to LitElement

Visit the [LitElement docs](https://lit-element.polymer-project.org/) for examples. We're still working on the docs, and will continue to update them between now and the 2.0 production release.

Note that code examples may have the older import statements (with the `@polymer/lit-element` package name). Simply remove the `@polymer/` portion if you're working with the release candidate.


### If you're already using LitElement

If you have a current project using LitElement, you can update it to the release candidate version as follows:


1.  Remove the old (scoped) version of LitElement from your project.

    `npm uninstall --save @polymer/lit-element`

1.  Install the new (release candidate) version of LitElement.

    `npm install lit-element`

1.  Update your import statements to reflect the new package name. For example:

    <code style="text-decoration: line-through">import {LitElement, html} from '@polymer/lit-element';</code>

    Becomes:

    `import {LitElement, html} from 'lit-element';`

That's it!

For a list of API changes and fixes in the latest version, see the  [LitElement Changelog](https://github.com/Polymer/lit-element/blob/master/CHANGELOG.md).

