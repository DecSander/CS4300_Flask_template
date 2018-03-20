var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var replace = require('gulp-string-replace');
var browserifyinc = require('browserify-incremental');

var browserifyOpts =  {
    entries: 'js/app.js',
    debug: true,
    extensions: ['.js', '.jsx'],
    paths: ['js']
};

var babelifyOpts = {
    presets: ['es2015', 'react'],
    plugins: ["transform-decorators-legacy", "transform-class-properties"],
    sourceMaps: true
};

var incOptions = Object.assign({}, browserifyinc.args, browserifyOpts);
var replOptions = {logs: {enabled: false}};
gulp.task('reactify', function() {
    var b = browserify(incOptions);
    b.transform(babelify, babelifyOpts);
    browserifyinc(b, {cacheFile: './.browserify-cache.json'});
    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(replace('process.env.NODE_ENV', '"development"', replOptions))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'))
});

gulp.task('reactify-production', function() {
    var b = browserify(incOptions);
    b.transform(babelify, babelifyOpts);
    browserifyinc(b, {cacheFile: './.browserify-cache.json'});
    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(replace('process.env.NODE_ENV', '"production"', replOptions))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'))
});

gulp.task('default', ['reactify']);
gulp.task('production', ['reactify-production']);
