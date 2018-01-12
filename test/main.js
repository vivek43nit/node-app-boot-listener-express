var AppManager = require('node-app-boot');

var ExpressBootAppListener = require('../lib/ExpressBootAppListener');

(function () {
    if (require.main === module) {
        new AppManager({
            home : __dirname,
            directoryFilter : function(dir){
                return !(dir === __dirname+"/lib") && !(dir === __dirname+"/node_modules");
            },
            bootAppListeners : [ new ExpressBootAppListener()]
        }).init();
    }
}());