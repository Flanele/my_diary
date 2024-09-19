const { src, dest, watch, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const fileInclude = require('gulp-file-include');


function styles() {
  return src('frontend/scss/style.scss') 
    .pipe(scss({ outputStyle: 'compressed' })) 
    .pipe(concat('style.min.css')) 
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('frontend/css')); 
}

function html() {
  return src('frontend/*.html') 
    .pipe(fileInclude({
      prefix: '@@',    
      basepath: '@file' 
    }))
    .pipe(dest('frontend')); 
}

// @@include('./partials/header.html')

function watching() {
  watch(['frontend/scss/**/*.scss'], { interval: 1000, usePolling: true }, styles);
  watch(['frontend/**/*.html'], { interval: 1000, usePolling: true }, html);
}


exports.styles = styles;
exports.watching = watching;
exports.html = html;
exports.default = series(styles, html, watching);
