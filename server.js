//dependencies
var express = require('express');
var WebSocket = require('ws');
var hueControl = require('./local_modules/hueControl.js');
var ratingLogger = require('./local_modules/ratingHistory.js');
var loggingStatistics = require('./local_modules/loggingStatistics.js');


/* ########     app creationand configuration      ########*/
var app = express();
//to be able to extract the javascript object from the body of a request
app.use(express.bodyParser());

//to not exit everything if an error is thrown
process.on('uncaughtException', function (err) {
    /*handleWSError(err)*/
});


//host our workshop application as well as its static content
app.use('/', express.static(__dirname + '/'));
app.use('/static/app/bower_components/', express.static(__dirname + '/static/bower_components'));


var userRequests = {};


var AMAZON_WS_URL = "ws://ec2-54-93-187-220.eu-central-1.compute.amazonaws.com/ws/";

hueControl.setAllLampsColor(0, 0);


var sendPingToWS = function (ws) {
    var ping = JSON.stringify({
        type: "ping",
        data: new Date().getTime()
    });
    ws.send(ping);
};


var connectWebsocket = function () {
    return  new WebSocket(AMAZON_WS_URL);
};
var ws = connectWebsocket();

/*var handleWSError = function (err) {
    if (err.code == 'ECONNRESET' || err.code == 'ECONNREFUSED' || err.code == 'ETIMEDOUT') {
        console.log(err.code);
        ws.close();

        console.log("WS disconnect. attempting reconnect...");
        //clearing ping, will be restarted upon open event
        if (pingObject) clearInterval(pingObject);

        ws = connectWebsocket()
    }
};*/

ws.on('close', function(event){
    console.log(event);
    if (pingObject) clearInterval(pingObject);
    console.log("disconnect. lets reconnect");
    ws = connectWebsocket();
})

var pingObject = null;
ws.on('open', function () {
    console.log("WS connection success");
    setInterval(sendPingToWS, 10000, ws);
});

//for disconnects auto reconnect
/*ws.on('close', function () {
 console.log("WS disconnect. attempting reconnect...");
 //clearing ping, will be restarted upon open event
 if (pingObject) clearInterval(pingObject);
 ws = connectWebsocket();
 });*/

ws.on('message', function (data, flags) {
    data = JSON.parse(data);
    userRegister(data.data.username);
    switch (data.type) {
        case "comment":
            userComment(data.data.username, data.data.comment);
            break;
        case "rating":
            userGenericRating(data.data.username, parseInt(data.data.rating));
            break;
    }
});


// ==================================================================
//every user in the workshop calls this once he calls the website
var userRegister = function (username) {
    //if user does not yet exist add him
    if (!userRequests[username]) {
        console.log("user " + username + " joined the workshop");
        userRequests[username] = {
            speed: 0,
            theory: 0
        }
    }
};

// ==================================================================
// user custom textual response
var userComment = function (username, comment) {
    ratingLogger.logUserComment(username, comment.text);
    console.log("user comment received");
};


// ==================================================================
// our API for controlling the lights. we take the user requests here

var lastRating = new Date();

var userGenericRating = function (username, rating) {

    //only accept ratings every 500ms or more
    //TODO not very pretty
    var now = new Date();
    if (now - lastRating < 500) {
        return;
    }
    lastRating = now;

    console.log("user " + username + " wants " + rating);

    if (rating == 1 || rating == 0 || rating == -1) {

        userRequests[username].theory = rating;
        userRequests[username].speed = rating;

        var hue = hueControl.calcGenericColor(userRequests);
        var sat = 255
        /*hueControl.calcSaturation(userRequests, "theory");*/
        hueControl.setAllLampsColor(hue, sat);

        //for later evaluation purposes
        ratingLogger.logRating(userRequests, username, "theory", rating, {hue: hue, sat: sat});
    }
};

var userRating = function (username, rating, type) {
    if (rating == 1 || rating == 0 || rating == -1) {

        userRequests[username][type] = rating;

        var hue, sat = null;

        switch (type) {
            case "theory":
                hue = hueControl.calcTheoryColor(userRequests);
                sat = hueControl.calcSaturation(userRequests, "theory");
                hueControl.setTheoryColor(hue, sat);
                ratingLogger.logRating(userRequests, username, "theory", rating, {hue: hue, sat: sat});
                break;
            case "speed":
                hue = hueControl.calcSpeedColor(userRequests);
                sat = hueControl.calcSaturation(userRequests, "speed");
                hueControl.setSpeedColor(hue, sat);
                ratingLogger.logRating(userRequests, username, "speed", rating, {hue: hue, sat: sat});
                break;
        }
    }

};

/* DEPRECATED

 var userSpeedRating = function (username, speed) {
 console.log("user " + username + " wants speed " + speed);
 if (speed == 1 || speed == 0 || speed == -1) {
 userRequests[username].speed = speed;
 var hue = hueControl.calcSpeedColor(userRequests);
 var sat = hueControl.calcSaturation(userRequests, "speed");
 hueControl.setSpeedColor(hue, sat);

 //for later evaluation purposes
 ratingLogger.logRating(userRequests, username, "speed", speed, {hue: hue, sat: sat});
 }
 };

 var userTheoryRating = function (username, theory) {
 console.log("user " + username + " wants theory " + theory);

 if (theory == 1 || theory == 0 || theory == -1) {

 userRequests[username].theory = theory;

 var hue = hueControl.calcTheoryColor(userRequests);
 var sat = hueControl.calcSaturation(userRequests, "theory");
 hueControl.setTheoryColor(hue, sat);

 //for later evaluation purposes
 ratingLogger.logRating(userRequests, username, "theory", theory, {hue: hue, sat: sat});
 }
 };*/


// ==================================================================
// This is for the speakers slide logging. Every Time the speaker
// changes a slide, its being logged
app.put('/api/slides', function (req, res) {
    var slideData = req.body;
    console.log("slide changed to h: " + slideData.h + ", v: " + slideData.v);
    ratingLogger.logSlideChange(slideData);

    res.send("success");
});

// ==================================================================
// retrieve logging data here
app.get('/api/logs', function (req, res) {
    loggingStatistics.getAllLogFiles(function (files) {
        res.send(files);
    })
});

app.get('/api/logs/:logFileName', function (req, res) {

    loggingStatistics.getLogFile(req.params.logFileName, function (loggingContent) {
        res.send(loggingContent);
    })
});


// start the server and listen to the port supplied
var server = app.listen(8080, function () {
    console.log('Listening on port %d', server.address().port);
});




