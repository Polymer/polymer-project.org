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
const argv = require('yargs').argv;
const browserSync = require('browser-sync').create();
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
const composer = require('gulp-uglify/composer');
const gulpUglifyEs = composer(require('uglify-es'), console);

const AUTOPREFIXER_BROWSERS = ['last 2 versions', 'ios 8', 'Safari 8'];

markdownIt.use(markdownItAttrs);
// keep markdownIt from escaping template markup.
markdownIt.normalizeLink = function(link) { return link; }
markdownIt.validateLink = function(link) { return true; }

// reload is a noop unless '--reload' cmd line arg is specified.
const reload = argv.reload ? browserSync.reload : function() {
  return new require('stream').PassThrough({objectMode: true});
}

gulp.task('style', 'Compile sass, autoprefix, and minify CSS', function() {
  const sassOpts = {
    precision: 10,
    outputStyle: 'expanded',
    onError: console.error.bind(console, 'Sass error:')
  };

  return gulp.src('app/sass/**/*.scss')
    .pipe($.changed('dist/css'))
    .pipe($.sass(sassOpts))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.cssmin()) // Minify and add license
    .pipe($.license('BSD2', {
      organization: 'The Polymer Project Authors. All rights reserved.',
      tiny: true
    }))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('images', 'Optimize images', function() {
  return gulp.src('app/images/**/*')
    .pipe($.changed('dist/images'))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{convertTransform: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

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
      // Leave a trailing opening <div class="article-wrapper"><article> in the TOC, so that we can wrap the original
      // markdown content into a div, for styling
      data.content = toc.process(content, {
        // header: '<h<%= level %><%= attrs %> id="<%= anchor %>" class="has-permalink"><%= header %></h<%= level %>>',
        // TOC: '<div class="details-wrapper"><details id="toc"><summary>Contents</summary><%= toc %></details></div><div class="article-wrapper"><article>',
        TOC: '<h2 id="table-of-contents">Table of Contents</h2><%= toc %>',
        // openUL: '<ul data-depth="<%= depth %>">',
        // closeUL: '</ul>',
        // openLI: '<li data-level="H<%= level %>"><a href="#<%= anchor %>"><%= text %></a>',
        // closeLI: '</li>',
        tocMax: 3,
        anchor: function(header, attrs) {
          // if we have an ID attribute, use that, otherwise
          // use the default slug
          var id = attrs.match(/(?:^|\s+)id="([^"]*)"/)
          return id ? id[1] : toc.anchor(header);
        }
      })// + '</article></div>';
    } else {
      data.content = content//'<div class="article-wrapper"><article>' + content + '</article></div>';
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
    .pipe(convertMarkdownToHtml('templates/blog.template'))
    .pipe($.rename({extname: '.html'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('jshint', 'Lint JS', function() {
  return gulp.src([
      'gruntfile.js',
      'app/js/**/*.js',
      'app/elements/**/*.js',
      'app/elements/**/*.html'
    ])
    .pipe($.changed('dist/js'))
    .pipe($.jshint.extract()) // Extract JS from .html files
    .pipe($.jshint({esnext: true}))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('js', 'Minify JS to dist/', ['jshint'], function() {
  const externalJs = require('polymer-cli/node_modules/polymer-build/lib/external-js');
  const polyfills = [
    externalJs.getRegeneratorRuntime(),
    ';\n',
    externalJs.getBabelHelpersFull(),
    ';\n',
    externalJs.getAmdLoader(),
    ';\n',
    fs.readFileSync(require.resolve('web-animations-js/web-animations-next-lite.min.js'), 'utf-8'),
    ';\n',
  ];
  return gulp.src(['app/js/**/*.js'])
    .pipe(gulpUglifyEs()) // Minify js output
    .pipe($.header(polyfills.join('')))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build-bundles', 'Build element bundles', function() {
  return merge(
    $.run('polymer build').exec())
});

gulp.task('copy', 'Copy site files (polyfills, templates, etc.) to dist/', function() {
  const app = gulp.src([
      '*',
      'app/manifest.json',
      'app/service-worker.js',
      '!{README.md,package.json,gulpfile.js}',
    ], {nodir: true})
    .pipe(gulp.dest('dist'));

  // HTML pages (such as index.html) use gulp-highlight instead of the markdown
  // code highlighter. It's slower than the markdown one since it has to parse
  // the page to look for code snippets, so it's only used for non-markdown pages.
  const docs = gulp.src([
      'app/**/*.html',
      '!app/{bower_components,elements}/**',
     ], {base: 'app/'})
    .pipe($.highlight({
      selector: 'pre code'
    }))
    .pipe(gulp.dest('dist'));

  const samples = gulp.src([
      'app/blog/samples/**/*'
    ], {base: 'app/'})
    .pipe(gulp.dest('dist'));

  const gae = gulp.src([
      'app/**/blog.yaml',
      'app/**/authors.yaml',
      '{templates,lib}/**/*'
     ])
    .pipe(gulp.dest('dist'));

  const webcomponentsjs = gulp.src([
      'node_modules/@webcomponents/webcomponentsjs/**'
    ], {base: 'node_modules/@webcomponents/'})
    .pipe(gulp.dest('dist'));

  // Copy the bundles that polymer build produced.
  const bundles = gulp.src([
      'build/default/app/elements/*'
    ])
    .pipe(gulp.dest('dist/elements'));
  const demo1 = gulp.src([
      'app/2.0/samples/homepage/contact-card/build/default/**/*'
    ])
    .pipe(gulp.dest('dist/2.0/samples/homepage/contact-card'));
  const demo2 = gulp.src([
      'app/2.0/samples/homepage/google-map/build/default/**/*'
    ])
    .pipe(gulp.dest('dist/2.0/samples/homepage/google-map'));

  const summit = gulp.src([
      'app/summit*/**/*',
      'app/summit*/*',
    ], {base: 'app'})
    .pipe(gulp.dest('dist'));

  return merge(app, docs, samples, gae, webcomponentsjs, bundles, summit);
});

gulp.task('watch', 'Watch files for changes', function() {
  browserSync.init({
    notify: true,
    open: !!argv.open,
    proxy: 'localhost:8080' // proxy serving through app engine.
  });
  gulp.watch('app/sass/**/*.scss', ['style', reload]);
  gulp.watch('app/elements/**/*', function() {
    runSequence('build-bundles', 'copy');
    reload();
  });
  gulp.watch('app/js/*.js', ['js', reload]);

  gulp.watch('app/blog/*.md', ['md:blog', reload]);
  gulp.watch(['templates/*.html', 'app/**/*.html'], ['copy', reload]);
  // Watch for changes to server itself.
  gulp.watch('*.py', function(files) {
    gulp.src('*.py').pipe(gulp.dest('dist'));
    reload();
  });
  gulp.watch('app/**/*.{yaml,yml}', function(files) {
    gulp.src('app/**/*.{yml,yaml}').pipe(gulp.dest('dist'));
    reload();
  });
}, {
  options: {
    'reload': 'Reloads browser tab when watched files change',
    'open': 'Opens a browser tab when launched'
  }
});

gulp.task('clean', 'Remove dist/ and other built files', function() {
  return del(['dist', 'app/css']);
});

// Default task. Build the dest dir.
gulp.task('default', 'Build site', ['clean', 'jshint'], function(done) {
  runSequence(
    ['copy', 'md:blog', 'style', 'images', 'js'],
    done);
});
