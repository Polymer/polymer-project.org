/*
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// const gulp = require('gulp');
const gulp = require('gulp-help')(require('gulp'));
const $ = require('gulp-load-plugins')();
const del = require('del');
const fs = require('fs');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it')({
    html: true,
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, code).value;
        } catch (__) { console.log(__) }
      } else {
        try {
          return hljs.highlightAuto(code).value;
        } catch (__) { console.log(__) }
      }

      return ''; // use external default escaping
    }
  });
const markdownItAttrs = require('markdown-it-attrs');
const merge = require('merge-stream');
const runSequence = require('run-sequence');
const toc = require('toc');

markdownIt.use(markdownItAttrs);
// keep markdownIt from escaping template markup.
markdownIt.normalizeLink = function(link) { return link; }
markdownIt.validateLink = function(link) { return true; }

function convertMarkdownToHtml(templateName) {
  return $.grayMatter(function(file) { // pull out front matter data.
    const data = file.data;
    data.file = file;
    data.title = data.title || '';
    data.subtitle = data.subtitle || '';

    let content = file.content;
    // Inline code snippets before running through markdown for syntax highlighting.
    content = content.replace(/<!--\s*include_file\s*([^\s]*)\s*-->/g,
      (match, src) => fs.readFileSync(`app/${src}`));
    // Markdown -> HTML.
    content = markdownIt.render(content);

    // If there is a table of contents, toc-ify it. Otherwise, wrap the
    // original markdown content anyway, so that we can style it.
    if (content.match(/<!--\s*toc\s*-->/gi)) {
      data.content = toc.process(content, {
        TOC: '<h3 id="table-of-contents">Table of Contents</h3><%= toc %>',
        tocMax: 3,
        anchor: function(header, attrs) {
          // if we have an ID attribute, use that, otherwise
          // use the default slug
          var id = attrs.match(/(?:^|\s+)id="([^"]*)"/)
          return id ? id[1] : toc.anchor(header);
        }
      });
    } else {
      data.content = content;
    }

    const tmpl = fs.readFileSync(templateName);
    const renderTemplate = $.util.template(tmpl);

    return renderTemplate(data);
  });
}

gulp.task('md:blog', 'Blog markdown -> HTML conversion. Syntax highlight and TOC generation', function() {
  return gulp.src([
      'app/blog/*.md',
    ], {base: 'app/'})
    .pipe(convertMarkdownToHtml('templates/base-blog.html'))
    .pipe($.rename({extname: '.html'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', 'Copy site files (polyfills, templates, etc.) to dist/', function() {
  const app = gulp.src([
      'app/**/*',
      '!app/**/*.md',
      'app.yaml',
      'redirects.yaml',
      'server.py'
    ], {nodir: true})
    .pipe(gulp.dest('dist'));

  const templates = gulp.src([
      'templates/*.html'
     ])
    .pipe(gulp.dest('dist/templates'));

  return merge(app, templates);
});

gulp.task('clean', 'Remove built files', function() {
  return del('dist');
});

// Default task. Build the dest dir.
gulp.task('default', 'Build site', ['clean'], function(done) {
  runSequence(
    ['copy', 'md:blog'],
    done);
});
