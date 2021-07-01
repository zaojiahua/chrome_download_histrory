import fs from "fs";
import { series } from 'gulp';
import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import preprocessify from 'preprocessify';
import gulpif from "gulp-if";

var sass = require('gulp-sass')(require('sass'));
const $ = require('gulp-load-plugins')();
const mergeStream = require('merge-stream');

var production = process.env.NODE_ENV === "production";
var target = process.env.TARGET || "chrome";
var environment = process.env.NODE_ENV || "development";

var generic = JSON.parse(fs.readFileSync(`./config/${environment}.json`));
var specific = JSON.parse(fs.readFileSync(`./config/${target}.json`));
var context = Object.assign({}, generic, specific);

var manifest = {
    dev: {
        "background": {
            "scripts": [
                "scripts/livereload.js",
                "scripts/background.js"
            ]
        }
    },

    firefox: {
        "applications": {
            "gecko": {
                "id": "my-app-id@mozilla.org"
            }
        }
    }
}

// -----------------
// COMMON
// -----------------
gulp.task('styles', () => {
    return gulp.src('src/styles/**/*.scss')
        .pipe($.plumber())
        .pipe(sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(gulp.dest(`build/${target}/styles`));
});

gulp.task("manifest", () => {
    return gulp.src('./manifest.json')
        .pipe(gulpif(!production, $.mergeJson({
            fileName: "manifest.json",
            jsonSpace: " ".repeat(4),
            endObj: manifest.dev
        })))
        .pipe(gulpif(target === "firefox", $.mergeJson({
            fileName: "manifest.json",
            jsonSpace: " ".repeat(4),
            endObj: manifest.firefox
        })))
        .pipe(gulp.dest(`./build/${target}`))
});

gulp.task('js', () => {
    return buildJS(target)
})

gulp.task('ext', series('manifest', 'js', () => {
    return mergeAll(target)
}));

// Tasks
gulp.task('clean', () => {
    return pipe(`./build/${target}`, $.clean())
})

gulp.task('build', series('clean', 'styles', 'ext'));

gulp.task('watch', series('build', () => {
    $.livereload.listen();

    gulp.watch('./src/**/*', series('build', (cb) => {
      $.livereload.reload();
      cb()
    }));
}));

gulp.task('default', series('build'));

// -----------------
// DIST
// -----------------
gulp.task('zip', () => {
    return pipe(`./build/${target}/**/*`, $.zip(`${target}.zip`), './dist')
})

gulp.task('dist', series('build', 'zip'));


// Helpers
function pipe(src, ...transforms) {
    return transforms.reduce((stream, transform) => {
        const isDest = typeof transform === 'string'
        return stream.pipe(isDest ? gulp.dest(transform) : transform)
    }, gulp.src(src, { allowEmpty: true }))
}

function mergeAll(dest) {
    return mergeStream(
        pipe('./src/icons/**/*', `./build/${dest}/icons`),
        pipe(['./src/_locales/**/*'], `./build/${dest}/_locales`),
        pipe([`./src/images/${target}/**/*`], `./build/${dest}/images`),
        pipe(['./src/images/shared/**/*'], `./build/${dest}/images`),
        pipe(['./src/**/*.html'], `./build/${dest}`))
}

function buildJS(target) {
    const files = [
        'background.js',
        'contentscript.js',
        'options.js',
        'popup.js',
        'livereload.js'
    ]

    let tasks = files.map(file => {
        return browserify({
                entries: 'src/scripts/' + file,
                debug: true
            })
            .transform('babelify', { presets: ['es2015'] })
            .transform(preprocessify, {
                includeExtensions: ['.js'],
                context: context
            })
            .bundle()
            .pipe(source(file))
            .pipe(buffer())
            .pipe(gulpif(!production, $.sourcemaps.init({ loadMaps: true })))
            .pipe(gulpif(!production, $.sourcemaps.write('./')))
            .pipe(gulpif(production, $.uglify({
                "mangle": false,
                "output": {
                    "ascii_only": true
                }
            })))
            .pipe(gulp.dest(`build/${target}/scripts`));
    });

    return mergeStream(...tasks);
}