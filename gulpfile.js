const gulp = require("gulp");
const less = require("gulp-less");
const clean = require("gulp-clean");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const sequence = require("run-sequence");


gulp.task("clean", () => {
    return gulp.src("public/build", { read: false })
        .pipe(clean());
});

gulp.task("less", () => {
    return gulp.src("public/less/main.less")
        .pipe(less())
        .pipe(rename("bundle.css"))
        .pipe(gulp.dest("public/build"));
});

gulp.task("js", () => {
    return gulp.src("public/js/main.js")
        .pipe(rename("bundle.js"))
        .pipe(gulp.dest("public/build"));
});

gulp.task("libs", () => {
     gulp.src(["public/libs/bootstrap/css/bootstrap.min.css", "public/libs/bootstrap/datetimepicker.min.css"])
        .pipe(concat("libs.css"))
        .pipe(gulp.dest("public/build"));

     gulp.src(["public/libs/js.cookie.js",
               "public/libs/moment.min.js",
               "public/libs/jquery/jquery.min.js",
               "public/libs/jquery/jquery.sticky.js",
               "public/libs/bootstrap/js/bootstrap.min.js",
               "public/libs/bootstrap/datetimepicker.min.js",
               "public/libs/bootstrap/validator.js"])
         .pipe(concat("libs.js"))
         .pipe(gulp.dest("public/build"));

     gulp.src("public/libs/bootstrap/fonts/**/*.*", { base: "public/libs/bootstrap/fonts" })
         .pipe(gulp.dest("public/fonts"));
});

gulp.task("watch", () => {
    gulp.watch("public/less/**/*.less", ["less"]);
    gulp.watch("public/js/**/*.js", ["js"]);
});

gulp.task("build", ["clean"],  () => {
    sequence("less", "js", "libs");
});