# node-app-boot-listener-express
A module to configure and run your application very fast using express. It provides java spring type feature in nodejs to define your routes anywhere and also with a predefined skelton for possible middleware of express.

# Where to Use
1. If you are from Java or Object Oriented Programming background, you want to develop a new web application using express and you are facing many difficulties in configuring express middleware and also facing difficulties in binding routes together, then this module is best suited for you.
2. If you want to develop your own module for users and want that your user do not need to worry about the configuration and chain management then read its source code and you will surely find a way to achieve that by using [node-app-boot] module.

### Current features :
- **ExpressConfigBean** : Inherit this class and define your own middleware settings if required, by overriding its methods. **You must define at max once ExpresConfigBean child class.**
- **ExpressRouteConfigBean** : Inherit this class and define your routes where ever you want in your project, without having tension for binding your routes in express app instance. It has option to define basePath also. **Create as many instance of child class of this class as you want**

# Steps to include this module in your project for creating a web application

> This module comes with a pre-defined configuration setup in its **ExpressConfigBean**.

Configuration functions available in this class and its default values :
1. **port()** : default value **'8080'**. It must return a string.
2. **sessionMiddleware()** : default **express-session** module instance with config :
```sh
    {
        resave : true,
        saveUninitialized : true,
        //secret : 'this_key_is_required' //but not defined in default
    }
```
**Note : You must override this method**, because from recent express-session **secret** key is required in the config, and i am not setting this config, so that each user should define their own secret key.
3. **cookieMiddleware** : default a instance of cookie-parser middleware.
4. **setBodyParserMiddleware(app)** : by default it has json and urlencoded parser
5. **loggerMiddleware()** : default **require('morgan')('dev')**
6. **errorHandlerMiddleware** : default null, means it will use express default errorHandlerMiddleware
7. **getPublicFolderPath** : default **'public'**, by default it will set your public folder as public to serve static content like images etc.

###### Example : Lets we want to listen on port 3030, not on 8080. So lets create a file **MyExpressConfigBean.js** file in root folder of project.

***Code for MyExpressConfigBean.js***
```sh
var ExpressConfigBean = require('node-app-boot-listener-express').ExpressConfigBean;

var util = require('util');

//inheriting Config class from ExpressConfigBean
util.inherits(MyExpressConfigBean, ExpressConfigBean);

function MyExpressConfigBean(){
}

//overriding port method and returning 5050 
MyExpressConfigBean.prototype.port = function(){
    return '5050';  //string
}

//must have a override method for middleware
MyExpressConfigBean.prototype.sessionMiddleware = function(){
    var session = require('express-session');
    return session({
       resave : true,
       saveUninitialized : true,
       secret : '12321321'  //passing secret key is now compulsory
    });
};

//just create a object of current class and export it
var singleton = new MyExpressConfigBean();
module.exports = singleton;
```

`Note : Your file name must end with ConfigBean and inherit ExpressConfigBean class. And there must be only one class that is inheriting ExpressConfigBean.`

> Now after setting the config, we need to just define our routes. For it you just need to Inherit your route classed from **ExpressRouteConfigBean**. It has two methods that will help you in setting up your routes.
**Note : Your routes files names must ends with ConfigBean**

*   Methods in **ExpressRouteConfigBean** :
    * **getBasePath()** : by default it returns '/', that is all the routes inside this class will be relative to root. You may change its value if you want to change the base path.
    * **addRoutes(route)** : This method implementation is blank. It has a guranted not null instance of express.Router. You just need to set your routes in this method.

Now for example lets we have to create following routes
1. **/status** : to check the status, that server is running or not
2. **/user/add** : to add a user
3. **/user/delete** : to delete a user

For It we are creating creating two file inside a *route* folder. You can use any folder name you want.
1. StatusRouteConfigBean.js :  for   /status
2. UserRouteConfigBean.js : for    /user/add and /user/delete

***Code for StatusRouteConfigBean.js***
```sh
var ExpressRouteConfigBean = require('../../lib/ExpressBootAppListener').ExpressRouteConfigBean;

var util = require('util');

util.inherits(StatusRouteConfigBean, ExpressRouteConfigBean);
function StatusRouteConfigBean(){
}

//no need to override getBasePath method

//overriding addRoutes method
StatusRouteConfigBean.prototype.addRoutes = function(route){
    route.get('/status',function(req, res){
        res.json({
            status : "OK"
        });
    });
}

//Creating its object and exporting
var singleton = new StatusRouteConfigBean();
module.exports = singleton;
```

***Code for UserRouteConfigBean.js***
```sh
var ExpressRouteConfigBean = require('../../lib/ExpressBootAppListener').ExpressRouteConfigBean;

var util = require('util');

util.inherits(UserRouteConfigBean, ExpressRouteConfigBean);
function UserRouteConfigBean(){
}

UserRouteConfigBean.prototype.getBasePath = function(){
    //now defining base path as user directly
    return '/user';
};

UserRouteConfigBean.prototype.addRoutes = function(route){
    //route for /user/add
    route.post('/add',function(req, res){
        //code for adding user and return response
    });
    
    //route for /user/delete
    route.post('/delete',function(req, res){
        //code for deleting user and return response
    });
}

var singleton = new UserRouteConfigBean();
module.exports = singleton;
```

>Now create a main file to run the application. Say it is main.js in root of application folder

***Code for main.js***
```sh
var AppManager = require('node-app-boot');
var ExpressBootAppListener = require('node-app-boot-listener-express');

(function () {
    if (require.main === module) {
        new AppManager({
            //require if APP_HOME is not set in environment variables
            home : __dirname,
            
            //require to pass instance of node-app-boot-listener-express, to tell AppManager that it is a node-boot-listener Module
            bootAppListeners : [ new ExpressBootAppListener() ]
        }).init();
    }
}());
```

### Running your app
Without DEBUG logging
```sh
$ node main.js
```

With DEBUG logging
```sh
$ DEBUG=* node main.js
```

License
----
MIT

[//]: # (Reference links)
   [Git-Wiki-Page]: <https://github.com/vivek43nit/node-app-boot-listener-express/wiki>
   [git-repo-url]: <https://github.com/vivek43nit/node-app-boot-listener-express.git>
   [node-app-boot]: <https://www.npmjs.com/package/node-app-boot>