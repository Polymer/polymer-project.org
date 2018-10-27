/*
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';
import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-toast/paper-toast.js';

class PwShell extends PolymerElement {
  static get template() {
    return html`
    <style include="iron-flex iron-positioning">
      :host {
        --app-header-z-index: 101;
        --app-drawer-z-index: 102;
      }

      a {
        color: #6b6b6b;
        text-decoration: none;
      }

      a.iron-selected {
        color: #333;
      }

      .header {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        background-color: #FFF;
        font-weight: 400;
        z-index: var(--app-header-z-index);
      }

      .header-toolbar {
        padding: 0 8px;
      }

      .header-toolbar paper-icon-button {
        width: 40px;
      }

      .header-toolbar .logo-link {
        padding-left: 20px;
        height: 24px;
      }

      .header-toolbar .logo-link img {
        height: 100%;
        vertical-align: middle;
      }

      .header-toolbar .logo-link span {
        font-size: 20px;
        color: black;
        padding-left: 5px;
        vertical-align: middle;
      }

      nav {
        height: 64px;
        padding: 0 8px;
      }

      .sections-tabs a {
        display: inline-block;
        margin: 0 8px;
        padding-top: 24px;
        height: 100%;
        box-sizing: border-box;
      }

      .sections-tabs a.iron-selected {
        border-bottom: 4px solid #f50057;  /* pink-a400 */
      }

      .search-box {
        width: 100%;
        height: 100%;
        padding: 0 12px;
        font-size: 16px;
        border: none;
        box-sizing: border-box;
        -webkit-transform: translate3d(100%, 0, 0);
        transform: translate3d(100%, 0, 0);
        -webkit-appearance: none;
      }

      .search-box:focus {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        transition: -webkit-transform 0.2s;
        transition: transform 0.2s;
      }

      @media (max-width: 767px) {

        .sections-tabs > a {
          display: none;
        }
      }
    </style>

    <app-location route="{{_route}}" path="{{path}}"></app-location>
    <app-route route="[[_route]]" pattern="/:version/:section" data="{{_routeData}}"></app-route>

    <iron-ajax url="[[path]]" handle-as="document" on-response="_handleResponse" on-error="_handleError" auto></iron-ajax>

    <app-header class="header" reveals snaps shadow>
      <div class="header-toolbar layout horizontal center">
        <a href="/" class="logo-link">
          <span>Polymer Project</span>
        </a>

        <div class="flex"></div>

        <nav>
          <iron-selector class="sections-tabs" attr-for-selected="name" activate-event="" selected="[[_computeSection(path)]]">
            <a href="/" name="home">Home</a>

            <a href="/blog/" name="blog">Blog</a>
          </iron-selector>
        </nav>

        <paper-icon-button icon="pw-icons:search" on-click="_focusSearch" tabindex="-1" aria-label="Search Polymer site"></paper-icon-button>
      </div>

      <label aria-hidden id="searchLabel" hidden>Search Polymer site</label>
      <input id="searchBox" on-change="_onSearchInputChange" type="search" class="search-box fit" placeholder="Search Polymer Site" aria-labelledby="searchLabel">
    </app-header>


    <slot></slot>

    <iron-media-query query="(max-width: 1000px)" query-matches="{{_shouldCollapseToc}}"></iron-media-query>

    <script type="text/javascript">
      /* <![CDATA[ */
      var google_conversion_id = 935743779;
      var google_custom_params = window.google_tag_params;
      var google_remarketing_only = true;
      /* ]]> */
    </script>
    <script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js">
    </script>
    `;
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  static get properties() {
    return {
      /**
       * True if the window size is small enough that the TOC has floated
       * to the top of the view, and should be collapsed.
       */
      _shouldCollapseToc: {
        observer: '_collapseTocChanged'
      },

      path: {
        type: String
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // Lazy load the footer and the icons since they're not critical and you're
    // probably not looking at the bottom of the page on first paint. Also
    // FREAM (First-paint Rules Everything Around Me)
    afterNextRender(this, function() {
      // Ignore jshint for dynamic import().
      import('./lazy-elements.js'); // jshint ignore:line
    });

    // app-route doesn't handle clicking on the TOC anchors.
    window.addEventListener('hashchange', () => this._locationChanged());
    window.addEventListener('location-changed', () => this._locationChanged());

    // Keep track of the scrolling position so that we can fix the TOC (which is in our light dom)
    this._stickyTocPosition = this._getStickyTocPosition();
    document.addEventListener('scroll', () => this._onScroll());
  }

  _focusSearch() {
    this.$.searchBox.focus();
  }

  _onSearchInputChange() {
    window.location = window.location.origin + '/search/?q=' + encodeURIComponent(this.$.searchBox.value);
  }

  _computeSection(path) {
    // This attempts to match the prefix of the current path with the name attribute on one of
    // the links in .sections-tabs (e.g. '1.0/start', '2.0/toolbox', 'blog', 'community', etc.).
    var match = /^\/blog\//.exec(path);
    return match ? match[1] : null;
  }

  _handleError(event) {
    if (this.hasAttribute('server-rendered')) {
      this.removeAttribute('server-rendered');
    }

    window.showToast('This page was not cached for offline use :(');
  }

  _handleResponse(event) {
    // Don't reload the current page on initial navigation, since the server is
    // already serving the correct page.
    if (this.hasAttribute('server-rendered')) {
      this.removeAttribute('server-rendered');
    } else {
      var doc = event.detail.response;
      document.title = doc.title;

      // Since the response is a document that's already parsed, don't
      // just innerHTML it (which converts it to a string and then reparses it),
      // and just use the nodes we need.
      var docShell = doc.querySelector('pw-shell');
      var fragment = document.createDocumentFragment();
      while (docShell.firstChild) {
        fragment.appendChild(docShell.firstChild);
      }

      // Replace shell contents.
      // var shell = this;
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(document.importNode(fragment, true /* deep */));
      // Polymer.dom.flush();  // Force upgrades.

      // Analytics.
      if (window.recordPageview) {
        window.recordPageview();
      }
    }

    // Scroll to an anchor, if we have one.
    if (window.location.hash) {
      this._locationChanged();
    } else {
      setTimeout(() => this._resetScrollPosition(), 0);
    }

    // If we're not in a small view, render the TOC as open.
    this._tocElement = this.querySelector('details');
    if (this._tocElement) {
      this._updateTocStyles();
    }
  }

  _resetScrollPosition() {
    var hash = window.location.hash;
    if (hash) {
      var elem = document.querySelector(hash);
      if (elem) {
        elem.scrollIntoView();
        return;
      }
    }

    scroll({ top: 0 });
  }

  _locationChanged() {
    var hash = window.location.hash;
    if (hash) {
      var el = this.querySelector(hash);
      if (el) {
        el.scrollIntoView();
      } 
    }
  }

  _collapseTocChanged() {
    if (this._tocElement) {
      this._updateTocStyles();

      if (this._shouldCollapseToc) {
        var wrapper = this._tocElement.parentElement;
        this.toggleClass('fixed', false, wrapper);
        this._resetWrapperToRelativePosition(wrapper);
      }
    }
  }

  _getStickyTocPosition() {
    // The header element is in the light dom.
    var header = this.querySelector('#header');
    if (header) {
      return header.getBoundingClientRect().height;
    }
  }

  _onScroll() {
    // We only need to do something if the toc is on the right.
    if (!this._tocElement) {
      return;
    }

    var article = this.querySelector('article');
    if (!article) {
      return;
    }

    var wrapper = this._tocElement.parentElement;
    if (this._shouldCollapseToc) {
      return;
    }

    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    this._resizeToc(wrapper, article, scrollTop);
  }

  _resizeToc(wrapper, article, scrollTop) {
    // If we haven't scrolled passed the target position, relatively position the TOC.
    var fixed = scrollTop >= this._stickyTocPosition;
    this.toggleClass('fixed', fixed, wrapper);

    if (fixed) {
      // How much space we have available for the toc.
      // where on the screen we started + how much the view is scrolled + the height.
      var articleBottom = article.getBoundingClientRect().top + scrollTop + article.offsetHeight;

      // If the remaining content is smaller than the window, then the footer is
      // visible and its offset is the height of the remaining content. Otherwise
      // it's below the fold, so use the window size instead.
      var remainingContentSize = articleBottom - scrollTop;
      var visibleFooterOffset = Math.min(remainingContentSize, window.innerHeight);

      var topPadding = 64;
      var bottomPadding = 20;
      var maxHeight = visibleFooterOffset - topPadding - bottomPadding;
      wrapper.style.display = maxHeight > 0 ? '' : 'none';
      wrapper.style.maxHeight = maxHeight + 'px';
      wrapper.style.top = topPadding + 'px';
    } else {
      this._resetWrapperToRelativePosition(wrapper);
    }
  }

  _updateTocStyles() {
    // This is a new page, so re-calculate the offset at which we're fixing the TOC.
    this._stickyTocPosition = this._getStickyTocPosition();
    this._tocElement.open = !this._shouldCollapseToc;

    // Apply styles to all the divs that need to know there's a TOC
    this.toggleClass('right-nav', !this._shouldCollapseToc, this.querySelector('.article-wrapper'));
    this.toggleClass('right-nav', !this._shouldCollapseToc, this.querySelector('.header-wrapper'));
  }

  _resetWrapperToRelativePosition(wrapper) {
    wrapper.style.display = '';
    wrapper.style.maxHeight = '';
    wrapper.style.top = '0px';
  }

  toggleClass(name, bool, node) {
    node = /** @type {Element} */ (node || this);
    if (arguments.length == 1) {
      bool = !node.classList.contains(name);
    }
    if (bool) {
      node.classList.add(name);
    } else {
      node.classList.remove(name);
    }
  }
}

customElements.define('pw-shell', PwShell);
