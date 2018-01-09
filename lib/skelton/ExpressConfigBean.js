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
var ConfigBean = require('node-app-boot').ConfigBean;
var util = require('util');

module.exports = ExpressConfigBean;

util.inherits(ExpressConfigBean, ConfigBean);
function ExpressConfigBean(){
}

ExpressConfigBean.prototype.port = function(){
    return '8080';
};

ExpressConfigBean.prototype.sessionMiddleware = function(){
    var session = require('express-session');
    return session({
       resave : true,
       saveUninitialized : true
    });
};

ExpressConfigBean.prototype.cookieMiddleware = function(){
    return require('cookie-parser')();
};

ExpressConfigBean.prototype.setBodyParserMiddleware = function(app){
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
};

ExpressConfigBean.prototype.loggerMiddleware = function(){
    return require('morgan')('dev');
};

ExpressConfigBean.prototype.errorHandlerMiddleware = function(){
    return null;
};

ExpressConfigBean.prototype.getPublicFolderPath = function(){
    return 'public';
};

