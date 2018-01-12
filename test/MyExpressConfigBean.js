var ExpressConfigBean = require('../lib/ExpressBootAppListener').ExpressConfigBean;

var util = require('util');

util.inherits(MyExpressConfigBean, ExpressConfigBean);
function MyExpressConfigBean(){
    
}
//MyExpressConfigBean.prototype.port = function(){
//    return '5050';
//}

MyExpressConfigBean.prototype.sessionMiddleware = function(){
    var session = require('express-session');
    return session({
       resave : true,
       saveUninitialized : true,
       secret : '12321321'
    });
};

var singleton = new MyExpressConfigBean();
module.exports = singleton;