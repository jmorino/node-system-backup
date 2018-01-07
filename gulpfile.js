const gulp        = require("gulp");
const babel       = require("gulp-babel");
const cached      = require("gulp-cached");
const sourcemaps  = require('gulp-sourcemaps');
const plumber     = require('gulp-plumber');
const del         = require("del");


const config = {
	src : 'src',
	dist : 'lib'
};


//=============================================================================
//=========================== Development =====================================
//=============================================================================


gulp.task("clean", function() {
	return del([`${config.dist}/**`,`!${config.dist}`]);
});

//=================================================================================================================

gulp.task("compile", function() {
	return gulp.src(`${config.src}/**/*.js`)
		.pipe(plumber())
		.pipe(cached('js', { optimizeMemory : true }))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.dist));
});

//=================================================================================================================

gulp.task('dev', ['compile'], function() {
	gulp.watch(`${config.src}/**/*.js`, ['compile']);
});
