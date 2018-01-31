const _ = require("lodash");

const express = require("express");
const bodyparser = require("body-parser");
const compression = require("compression");
const passport = require("passport");
const config = require("config");

// auth strategies
const BasicStrategy = require("passport-http").BasicStrategy;

// controllers
const controllers = require("./controllers");

// defaults
const DEFAULT_PORT = 3000;


class Application {
    constructor() {
        this._app = express();
    }

    configure() {
        this._app.set("view engine", "pug");

        this._app.use(compression({ filter: this._shouldCompress }))
        this._app.use("/public", express.static("public"));

        this._app.use(bodyparser.urlencoded({ extended: false }));
        this._app.use(bodyparser.json());

        const username = config.get("auth.username");
        const password = config.get("auth.password");

        passport.use(new BasicStrategy((user, pass, done) => {
            if (username === user && password === pass) {
                return done(null, username);
            }

            return done(null, false);
        }));
    }

    start() {
        this._initControllers();

        const port = process.env.PORT || DEFAULT_PORT;

        this._app.listen(port, () => {
            console.log(`Application is running and listening on port ${port}`);
        });
    }

    _initControllers() {
        _.each(controllers, (controller) => new controller(this._app));
    }

    _shouldCompress(request, response) {
        if (request.headers["x-no-compression"]) {
            return false
        }

        return compression.filter(request, response)
    }
}


module.exports = Application;