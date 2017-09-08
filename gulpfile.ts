import * as gulp from 'gulp';
import * as del from "del";
import * as sass from "gulp-sass";
import * as minifyHtml from 'gulp-minify-html';
import * as angularTemplatecache from 'gulp-angular-templatecache';
import * as browserify from 'browserify';
import * as source from 'vinyl-source-stream';
import * as buffer from 'vinyl-buffer';
import * as rollup from 'rollup-stream';
import * as importCss from 'gulp-import-css';
import * as path from 'path';
import * as sourcemaps from 'gulp-sourcemaps';
import * as  babel from 'gulp-babel';
import * as angularFilesort from 'gulp-angular-filesort';
import * as inject from 'gulp-inject';
import * as uglify from 'gulp-uglify';
import { Gulpclass, Task, SequenceTask, MergedTask } from "gulpclass";
import * as  filter from 'gulp-filter';
import * as cleanCss from 'gulp-clean-css';
import * as concatCss from 'gulp-concat-css';
import * as concat from 'gulp-concat';
import * as convertEncoding from 'gulp-convert-encoding';
import * as bom from 'gulp-bom';
import * as urlAdjuster from 'gulp-css-url-adjuster';


import { projectConfig, projectRoot } from './config';

const paths = {
  projectRoot,
  dist: `${projectRoot}/webapp/ng-boot`,
  tmp: './tmp',
  src: './src',
};

@Gulpclass()
export class Gulpfile {

  @SequenceTask('build:dev')
  public buildDev() {
    return ['cache', ':build:dev:js', 'html', ':sass:dev', ':css', ':build:dev:vendor:js', ':build:dev:lib'];
  }

  @SequenceTask('build:prod')
  public buildProd() {
    return ['cache', ':build:prod:js', 'html', ':sass:prod',':css', ':build:prod:vendor:js' ,':build:prod:lib'];
  }

  @Task(':build:prod:js')
  public buildProdJs() {
    return browserify({ entries: './src/index.js', debug: false, insertGlobals: false })
      .transform('babelify')
      .bundle()
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(convertEncoding({to: 'utf8'}))
      .pipe(gulp.dest(paths.dist));
  }
  
  @Task(':build:prod:vendor:js')
  public buildProdVendorsJs() {
    return browserify({ entries: './src/vendors.js', debug: false, insertGlobals: false })
      .transform('babelify')
      .bundle()
      .pipe(source('vendors.js'))
      .pipe(buffer())
	  .pipe(uglify())
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }
  
  @Task(':build:dev:vendor:js')
  public buildDevVendorsJs() {
    return browserify({ entries: './src/vendors.js', debug: false, insertGlobals: false })
      .transform('babelify')
      .bundle()
      .pipe(source('vendors.js'))
      .pipe(buffer())
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }

  @Task(':build:dev:js')
  public buildDevJs() {
    return browserify({ entries: './src/index.js', debug: false, insertGlobals: false })
      .transform('babelify')
      .bundle()
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }
  
  @Task(':build:dev:lib')
  public buildDevLib() {
    return gulp.src(projectConfig.externalLibs)
      .pipe(concat('lib.js'))
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }  
  
  @Task(':build:prod:lib')
  public buildProdLib() {
    return gulp.src(projectConfig.externalLibs)
      .pipe(concat('lib.js'))
      .pipe(uglify())
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }  

  @Task('cache')
  public cacheTemplate() {
    return gulp
      .src([
        `${paths.src}/**/*.html`, `!${paths.src}/index.html`
      ])
      .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe(angularTemplatecache('templateCacheHtml.js', {
        module: 'myapp'
      }))
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.tmp + '/.'));
  }
  
  @Task()
  public html() {
    return gulp.src('src/index.html')
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }

  @Task()
  public clean(done) {
    return del([paths.dist + '/', paths.tmp + '/'], { force: true });
  }  
  /**
   * Creates a package and publishes it to npm.
   */
  @SequenceTask("default")
  public default() {
      return ["clean", "build:dev", 'watch'];
  }
  
  @SequenceTask()
  public dist() {
      return ["clean", "build:prod"];
  }
  
  @Task('watch', [':watch:js', ':watch:template', ':watch:html', ':watch:sass'])
  public watch() {
  }

  @Task(':css')
  public css(cb: Function) {
    return gulp.src(projectConfig.externalCss)
      .pipe(urlAdjuster({
        prepend: '/css/css/',
      }))
      .pipe(concatCss('global.css'))
      .pipe(convertEncoding({ to: 'utf8' }))
      .pipe(gulp.dest(paths.dist));
  }

  @Task(':sass:dev')
  public sassDev(cb: Function) {
    return gulp.src([paths.src + '/**/*.scss'])
      .pipe(sass().on('error', sass.logError))
      .pipe(importCss())
      .pipe(concatCss('style.css'))
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }
  
  @Task(':sass:prod')
  public sassProd(cb: Function) {
    return gulp.src(paths.src + '/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(importCss())
      .pipe(concatCss('style.css'))
      .pipe(cleanCss())
      .pipe(convertEncoding({to: 'utf8'}))      
      .pipe(gulp.dest(paths.dist));
  }
  
  @Task(':watch:js')
  public watchJS() {
    return gulp.watch('src/**/*.js', [':build:dev:js']);
  }

  @Task(':watch:template')
  public watchTemplate() {
    return gulp.watch(['src/**/*.html', '!src/index.html'], ['build:dev']);
  }

  @Task(':watch:html')
  public watchHtml() {
    return gulp.watch(['src/index.html'], ['html']);
  }

  @Task(':watch:vendor:js')
  public watchVendorsJs() {
    return gulp.watch(['src/vendors.js'], [':build:dev:vendor:js']);
  }

  @Task(':watch:sass')
  public watchSass() {
    return gulp.watch(['src/**/*.scss'], [':sass:dev']);
  }
}