var Client = require('node-rest-client').Client;
/*  https://www.npmjs.org/package/node-rest-client  */
client = new Client();

var AMAZON_PROXY_URL = "http://ec2-54-93-187-220.eu-central-1.compute.amazonaws.com";
var API_URI = "/api/user/";


//TODO e2e test

//we will create 100 user accounts (register with 100 different usernames)

//we will then rate with 10 random user accounts per second giving off a random action (+, 0, -, comment) We will continue doing so for 3min

// our lamp should not change color more often than every 500ms, all systems should be fine with the load.


var e2eTest = function(){
    var users = createUsers();

    var intervalObject = setInterval(function(){
        performRandomUserAction(getRandomUser(users));
    },100);

    //let test run for 3 min then make it cancel
    setTimeout(function(){
        clearInterval(intervalObject);
    }, 1000*180);

};


var createUsers = function(){
    var users = [];
    for(var i = 0; i<100;i++){
        users.push("user"+i);
        registerUser("user"+i);
    }
    return users;
};


var registerUser = function(username){
    client.post(AMAZON_PROXY_URL + API_URI + username,"", function(data){
    });
};

var performRandomUserAction = function(username){
    // 1 = +1, 2 = 0, 3 = -1, 4 = comment
    var action = Math.floor((Math.random()*4)+1);
    switch (action){
        case 1:
            performRating(username, 1);
            break;
        case 2:
            performRating(username, 0);
            break;
        case 3:
            performRating(username, -1);
            break;
        case 4:
            postComment(username);
            break;
    }
};

var getRandomUser = function(users){
    var index = Math.floor((Math.random()*100));
    return users[index];
};

var postComment = function(username){
    client.post(AMAZON_PROXY_URL + API_URI + username + "/comment",{username: username, comment: "foobar2000 by " + username}, function(data){
    });
};

var performRating = function(username, rating){
    client.put(AMAZON_PROXY_URL + API_URI + username + "/theory/" + rating,"", function(data){
    });
};

e2eTest();






