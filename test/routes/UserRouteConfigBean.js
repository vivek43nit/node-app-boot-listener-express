var ExpressRouteConfigBean = require('../../lib/ExpressBootAppListener').ExpressRouteConfigBean;

var util = require('util');

util.inherits(UserRouteConfigBean, ExpressRouteConfigBean);
function UserRouteConfigBean(){
    
}

UserRouteConfigBean.prototype.getBasePath = function(){
    return '/user';
};

UserRouteConfigBean.prototype.addRoutes = function(route){
    route.get('/',function(req, res){
        res.json({
            status : "OK"
        });
    });
}

var singleton = new UserRouteConfigBean();
module.exports = singleton;

