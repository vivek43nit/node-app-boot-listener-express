/* 
 * The MIT License
 *
 * Copyright 2018 Vivek Kumar.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var util = require('util');
var http = require('http');
var express = require('express');
var debug = require('debug')('appmanager:express:starter');

var BootAppListener = require('node-app-boot').BootAppListener;

//A child class of ConfigBean class to get different config for the express server
var ExpressConfigBean = require('./skelton/ExpressConfigBean');

//A child class of ConfigBean to get all routes for the express
var ExpressRouteConfigBean = require('./skelton/ExpressRouteConfigBean');

util.inherits(ExpressBootAppListener, BootAppListener);

ExpressBootAppListener.ExpressConfigBean = ExpressConfigBean;
ExpressBootAppListener.ExpressRouteConfigBean = ExpressRouteConfigBean;

function ExpressBootAppListener() {
    //inherited from AppListener
    this.priority = 99;
    
// variable for using internally
    this.config = null;
    
    //for storing ConfigBean for express provided by user 
    this.configBean = null;
    
    //for storing all instances of child classes of ExpressRouteConfigBean
    this.routeConfigBean = [];
}

/*
 * You will have to define this function to tell AppManager that which classes are yours
 * AppManager will call this function while scanning for all valid classes.
 * return a array of classes whose child class intances you want.
 */
ExpressBootAppListener.prototype.classTypes = function () {
    return [ExpressConfigBean, ExpressRouteConfigBean];
};

/*
 * AppManager will call this method for each qualifying object of the classes you passed above in classTypes method.
 * You can store your classes in a array to take your actions with them on init method.
 */
ExpressBootAppListener.prototype.addClass = function (obj) {
    if (obj !== null) {
        if (obj instanceof ExpressConfigBean) {
            if (this.configBean != null) {
                throw new Error("Ambiguity in ExpressBootAppListener.ExpressConfigBean : more than one ExpressConfigBean exists");
            } else {
                this.configBean = obj;
                debug("overrided ExpressConfigBean instance found :",obj);
            }
        } else if (obj instanceof ExpressRouteConfigBean) {
            debug("new ExpresRouteConfigBean instance found : ", obj);
            this.routeConfigBean.push(obj);
        }
    }
};

/*
 * Your Module init method. When all scanning is done by AppManager, your init method will be invoked.
 * Prepare only objects of your services here. Do not take any action here that may depends upon config fetching from db
 */
ExpressBootAppListener.prototype.init = function (config) {
    this.config = config;
    this.app = require('./ExpressInstance');

    if (this.configBean == null) {
        this.configBean = new ExpressConfigBean();
    }
};

/*
 * Do config setting here if any required. Do not start your services here.
 */
ExpressBootAppListener.prototype.preStart = function (next) {
    debug("setting middlewares for express during preStart...");
    this._setMiddleWares();
 
    debug("setting routes for express during preStart...");
    this._setRoutes();

    next();
}

//internal use only
/*
 * Check this method for how ExpressConfigBean class instance is used for setting all middleware of express
 */
ExpressBootAppListener.prototype._setMiddleWares = function () {
    debug("setting logger middleware");
    this.app.use(this.configBean.loggerMiddleware());

    debug("setting body-parsers middleware");
    this.configBean.setBodyParserMiddleware(this.app);

    debug("setting cookie parser middleware");
    this.app.use(this.configBean.cookieMiddleware());

    debug("setting session middleware");
    this.app.use(this.configBean.sessionMiddleware());

    debug("setting public folder for static access");
    if (this.configBean.getPublicFolderPath() !== null) {
        this.app.use(express.static(this.configBean.getPublicFolderPath()));
    } else {
        debug("warn : no public folder mentioned");
    }

    debug("setting error-handler middleware");
    if (this.configBean.errorHandlerMiddleware() !== null) {
        this.app.use(this.configBean.errorHandlerMiddleware());
    } else {
        debug("default errorHandler of express used");
    }
    debug("all middleware settings done");
};

//for internal use only
/*
 * Check this method for how ExpressRouteConfigBean class instance is used for settign routes.
 */
ExpressBootAppListener.prototype._setRoutes = function () {
    var self = this;
    this.routeConfigBean.forEach(function (route) {
        let basePath = route.getBasePath();
        let router = express.Router();
        debug("adding routes of %s with base-path : '%s'", route.constructor.name, basePath);
        route.addRoutes(router);
        self.app.use(route.getBasePath(), router);
    });
    debug("all routes adding done");
}

/*
 * Always start your services in onStart method
 */
ExpressBootAppListener.prototype.onStart = function (next) {
    var port = normalizePort(this.configBean.port());
    this.app.set('port', port);

    this.server = http.createServer(this.app);

    this.server.on('error', this._onErrorInServer.bind(this));
    this.server.on('listening', this._onServerListening.bind(this));

    this.server.listen(port, function (){
        next();
    });

};

ExpressBootAppListener.prototype.onClose = function (type, exitCode) {
    if (this.server != null && this.server.listening) {
        util.log("Stopping http request listening...");
        this.server.close(function () {
            util.log("Server stopped gracefully");
        });
    }
};

ExpressBootAppListener.prototype._raiseError = function (err) {
    process.emit('error', err);
};

ExpressBootAppListener.prototype._onErrorInServer = function (error) {
    if (error.syscall !== 'listen') {
        this._raiseError(error);
    }
    var port = this.configBean.port();
    var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            this._raiseError(error);
    }
};

ExpressBootAppListener.prototype._onServerListening = function () {
    var addr = this.server.address();
    var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
    util.log('started http request listening on ' + bind);
};

//private function to normalize port
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;     // named pipe
    }
    if (port >= 0) {
        return port;    // port number
    }
    return false;
}

module.exports = ExpressBootAppListener;