const gulp = require('gulp');
const uglify = require('gulp-uglify');
const minifycss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const gzip = require('gulp-gzip');
const pump = require('pump');

gulp.task('copy-main-js', (cb) => {
  pump([
    gulp.src('./node_modules/fomantic-ui/dist/semantic.min.js'),
	gulp.dest('./static/public/static/js')
  ], cb);
});

gulp.task('copy-component-js', (cb) => {
  pump([
    gulp.src('./node_modules/fomantic-ui/dist/components/*.min.js'),
	gulp.dest('./static/public/static/js/components')
  ], cb);
});

gulp.task('copy-jquery-js', (cb) => {
  pump([
    gulp.src('./node_modules/jquery/dist/jquery.min.js'),
	gulp.dest('./static/public/static/js')
  ], cb);
});

gulp.task('copy-main-css', (cb) => {
  pump([
    gulp.src('./node_modules/fomantic-ui/dist/semantic.min.css'),
	gulp.dest('./static/public/static/css')
  ], cb);
});

gulp.task('copy-component-css', (cb) => {
  pump([
    gulp.src('./node_modules/fomantic-ui/dist/components/*.min.css'),
	gulp.dest('./static/public/static/css/components')
  ], cb);
});

gulp.task('copy-theme-fonts', (cb) => {
  pump([
    gulp.src('./node_modules/fomantic-ui/dist/themes/default/**/*'),
	gulp.dest('./static/public/static/css/themes/default')
  ], cb);
});

gulp.task('copy-images', (cb) => {
  pump([
    gulp.src('./static/assets/images/**/*'),
	  gulp.dest('./static/public/static/images')
  ], cb);
});

gulp.task('set_variables', (cb) => {
  pump([
    gulp.src(['./static/public/**/*.html']),
    replace('GULP_GA_CODE', 'window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "GULP_GA_ID");'),
    replace('GULP_GA_ID', 'G-T0YG01CF3J'),
    gulp.dest('./static/public')
  ], cb);
});

gulp.task('js-compress', (cb) => {
  pump([
    gulp.src('./static/public/**/*.js'),
    uglify(),
    gzip(),
    gulp.dest('./static/public')
  ], cb);
});

gulp.task('minify-css', (cb) => {
  pump([
    gulp.src('./static/public/**/*.css'),
    minifycss({ compatibility: 'ie8' }),
    gzip(),
    gulp.dest('./static/public')
  ], cb);
});

gulp.task('minify-html', (cb) => {
  pump([
    gulp.src('./static/public/**/*.html'),
    htmlmin({
      minifyJS : true,
      minifyCSS : true,
      minifyURLs : true,
      removeComments : true,
      removeRedundantAttributes : true,
      sortAttributes : false,
      sortClassName : false
    }),
    gulp.dest('./static/public')
  ], cb);
});

gulp.task('compress', gulp.series('copy-main-js', 'copy-component-js', 'copy-jquery-js', 'copy-main-css', 'copy-component-css', 'copy-theme-fonts', 'copy-images', 'set_variables', 'js-compress', 'minify-css', 'minify-html'));

gulp.task('default', gulp.series('compress'));
