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
import { scroll } from '@polymer/app-layout/helpers/helpers.js';

class PwFooter extends PolymerElement {
  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;
      }

      a {
        color: #999;
        text-decoration: none;
      }

      .footer-media-links {
        background: #e8345a;  /* a more sedated version of pink-a400 */
        padding: 20px;
      }

      .footer-media-links a {
        color: black;
        display: inline-block;
        padding: 3px 20px;
        font-size: 13px;
        font-weight: 500;
        text-shadow: none;
        text-decoration: none;
        text-align: center;
        min-width: 100px;
        white-space: nowrap;
      }

      .footer-media-links a span {
        line-height: 24px;
        margin-left: 5px;
      }

      .footer-links {
        background: #263238;  /* blue-grey-900 */
        padding: 30px 10px;
      }

      .footer-links > * {
        margin: 10px;
      }

      .footer-links .title {
        font-family: 'Roboto Slab', 'Roboto', 'Noto', sans-serif;
        color: white;
        border-top: 1px solid #707375;
        padding-top: 10px;
        font-size: 13px;
      }

      .footer-links a {
        text-decoration: none;
        color: #979797;
        display: block;
        font-size: 11px;
        line-height: 20px;
      }

      .copyright {
        background: black;
        color: white;
        padding: 10px;
      }

      .copyright div {
        font-size: 11px;
      }

      .copyright img {
        padding-left: 10px;
        height: 20px;
      }

      .copyright * {
        vertical-align: middle;
      }

      @media (max-width: 767px) {
        .footer-media-links a {
          min-width: 24px;
          padding-left: 15px;
          padding-right: 15px;
        }

        .footer-media-links a span{
          display: none;
        }
      }

      @media (max-width: 479px) {
        .footer-links.layout.horizontal {
          flex-direction: column;
          padding: 20px 10px;
        }

        .footer-links > * {
          flex: 0 0 auto;
        }

        .copyright .additional-text {
          display: none;
        }
      }
    </style>

    <footer>
      <section class="footer-media-links">
        <div class="layout horizontal center center-justified">
          <a href="https://twitter.com/intent/follow?screen_name=polymer" title="Follow @polymer on Twitter" aria-label="Follow polymer on Twitter">
            <iron-icon icon="social-icons:twitter"></iron-icon>
            <span>@Polymer</span>
          </a>
          <a href="https://github.com/polymer" title="Get the Polymer code on GitHub" aria-label="Get the Polymer code on GitHub">
            <iron-icon icon="social-icons:github"></iron-icon>
            <span>/Polymer</span>
          </a>
          <a href="https://polymer-slack.herokuapp.com/" title="Join the Polymer slack channel" aria-label="Join the Polymer slack channel">
            <iron-icon icon="social-icons:slack"></iron-icon>
            <span>Slack Channel</span>
          </a>
          <a href="https://stackoverflow.com/questions/tagged/polymer" title="StackOverflow questions tagged Polymer" aria-label="StackOverflow questions tagged Polymer">
            <iron-icon icon="social-icons:so"></iron-icon>
            <span>Stack Overflow</span>
          </a>
        </div>
      </section>

      <section class="footer-links layout horizontal justified">
        <div class="flex">
          <div class="title">Products</div>
          <a href="https://github.com/Polymer/lit-element/blob/master/README.md">LitElement</a>
          <a href="https://github.com/Polymer/pwa-starter-kit/blob/master/README.md">PWA Starter Kit</a>
          <a href="https://github.com/material-components/material-components-web-components/blob/master/README.md">Material Web Components</a>
        </div>

        <div class="flex">
          <div class="title">Products</div>
          <a href="https://polymer.github.io/lit-html/">lit-html</a>
          <a href="https://classic.polymer-project.org">Polymer Classic library</a>
          <a href="https://github.com/Polymer/prpl-server/blob/master/README.md">PRPL Server</a>
        </div>


        <div class="flex">
          <div class="title">About the Project</div>
          <a href="/blog/">Blog</a>
          <a href="https://github.com/Polymer/project/blob/master/Roadmap.md">Roadmap</a>
          <a href="https://github.com/Polymer/project/blob/master/Contributing.md">Contributing</a>
        </div>

        <div class="flex">
          <div class="title">Community</div>
          <a href="https://www.webcomponents.org/">WebComponents.org</a>
        </div>
      </section>

      <div class="copyright layout horizontal">
        <div class="flex">
          &copy; 2018 Polymer Authors.
          <span class="additional-text">Code Licensed under the BSD License. Documentation licensed under CC BY 3.0.<span>
        </div>
        <a href="#" on-click="_smoothScrollToTop">
          Back to Top<img src="/images/logos/p-logo.png" alt="Polymer Logo">
        </a>
      </div>
    </footer>
    `;
  }

  _smoothScrollToTop(event) {
    event.preventDefault();
    scroll({ top: 0, behavior: 'smooth' });

    // Kick focus back to the page
    // User will start from the top of the document again
    event.target.blur();
  }
}

customElements.define('pw-footer', PwFooter);
