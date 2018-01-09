/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
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