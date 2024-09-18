const { src, dest, watch } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');


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


function watching() {
    watch(['frontend/scss/**/*.scss'], { interval: 1000, usePolling: true }, styles);
}


exports.styles = styles;
exports.watching = watching;
exports.default = watching; 
