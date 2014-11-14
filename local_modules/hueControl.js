var Client = require('node-rest-client').Client;
/*  https://www.npmjs.org/package/node-rest-client  */
client = new Client();


var hueConf = {
    username: "pascaldeveloper",
    apiURL: "http://192.168.200.103/api",
    workshopLampIDs: {
        speed: "2",
        theory: "3"
    },
    /*keep this as it is the official HUE API*/
    lights: "/lights"

};


var callForCoffee = function () {
    var urlTheory = hueConf.apiURL + "/" + hueConf.username + hueConf.lights + "/" + hueConf.workshopLampIDs.theory + "/state";
    var urlSpeed = hueConf.apiURL + "/" + hueConf.username + hueConf.lights + "/" + hueConf.workshopLampIDs.speed + "/state";

    var args = {
        data: JSON.stringify({
            "alert": "lselect"
        })
    };


    //set both lamps to perform breath cycles
    client.put(urlSpeed, args, function (data) {});
    client.put(urlTheory, args, function (data) {});


    //stop them after a while
    var newArgs = {
        data: JSON.stringify({
            "alert": "none"
        })
    };

    setTimeout(function(){
        client.put(urlSpeed, newArgs, function(data){})
        client.put(urlTheory, newArgs, function(data){})
    }, 3000)

};

var setTheoryColor = function (hue, sat) {
    setLampColor(hue, sat, hueConf.workshopLampIDs.theory);
};

var setAllLampsColor = function(hue, sat){
    for (var lamp in hueConf.workshopLampIDs){
        if(hueConf.workshopLampIDs.hasOwnProperty(lamp)){
            setLampColor(hue, sat, hueConf.workshopLampIDs[lamp]);
        }
    }
};

var setLampColor = function(hue, sat, lamp){
    var url = hueConf.apiURL + "/" + hueConf.username + hueConf.lights + "/" + lamp + "/state";

    var args = {
        data: JSON.stringify({
            "on": true,
            "hue": hue,
            "sat": sat
        })
    };

    client.put(url, args, function (data) {
    });
}

var getLamps = function (callback) {
    // registering remote methods
    // direct way
    var url = hueConf.apiURL + "/" + hueConf.username + hueConf.lights;

    client.get(url, function (data) {
        // parsed response body as js object
        callback(data);
    });
};

var setSpeedColor = function (hue, sat) {
   setLampColor(hue, sat, hueConf.workshopLampIDs.speed);
};

var calcTheoryColor = function (userRequests) {
    var blue = 46920;
    var red = 65280;
    var span = red - blue;

    //we use the count to determine how many users we have in the workshop
    var count = 0;
    //the speedSum determines what color the lamp should display
    var theorySum = 0;
    for (var user in userRequests) {
        if (userRequests.hasOwnProperty(user)) {
            count++;
            theorySum += parseInt(userRequests[user].theory);
        }
    }
    //if we have 10 participants the range of values for speedSum is [-10 ; 10] so 21 possible values and therefore 20 possible steps.
    var stepSize = Math.floor(span / (count * 2));

    // this value will be the amount of steps to take from the "bottom" which would be 12750 or yellow color code
    // if count is 10 and speedSum is -4 (meaning 4 more clicked slower than faster) the new value would be 6 meaning 6*stepSize + yellow = color to display
    var stepsToTake = theorySum + count;
    var hue = stepsToTake * stepSize + blue;

    printUserRatingDetails(userRequests, "theory");    //console.log("Lamp color code for Theory will be: " + '' + hue);
    return hue;
};

var calcSpeedColor = function (userRequests) {
    var red = 0;
    var limegreen = 25500;
    var span = limegreen - red;

    //we use the count to determine how many users we have in the workshop
    var count = 0;
    //the speedSum determines what color the lamp should display
    var speedSum = 0;
    for (var user in userRequests) {
        if (userRequests.hasOwnProperty(user)) {
            count++;
            speedSum += parseInt(userRequests[user].speed);
        }
    }
    //if we have 10 participants the range of values for speedSum is [-10 ; 10] so 21 possible values and therefore 20 possible steps.
    var stepSize = Math.floor(span / (count * 2));

    // this value will be the amount of steps to take from the "bottom" which would be 12750 or yellow color code
    // if count is 10 and speedSum is -4 (meaning 4 more clicked slower than faster) the new value would be 6 meaning 6*stepSize + yellow = color to display
    var stepsToTake = speedSum + count;
    var hue = stepsToTake * stepSize + red;

    printUserRatingDetails(userRequests, "speed");
    //console.log("Lamp color code for speed will be: " + '' + hue);
    return hue;
};

var calcSaturation = function (userRequests, type) {
    var sum = 0;
    var FULL_SAT = 255;
    var NO_SAT = 0;
    var userCount = 0;


    for (var user in userRequests) {
        if (userRequests.hasOwnProperty(user)) {
            userCount++;
            sum += parseInt(userRequests[user][type]);
        }
    }

    //if we have 10 participants the range of values for sum is [-10 ; 10] so 21 possible values and therefore 20 possible steps. our range is twice FULL_SAT
    var stepSize = Math.floor((FULL_SAT * 2) / (userCount * 2));
    var stepsToTake = sum + userCount;

    //now we get a range from -255 to 0 to 255 (because we substract 255 at the end so no steps is -255 and stepsize is so large that with 10 users and 10 steps we end up with 2*255)
    var saturation = (NO_SAT + stepsToTake * stepSize) - FULL_SAT;
    return Math.abs(saturation);
};

var printUserRatingDetails = function(userRequests, type){
    var userCount=0,
        neg=0,
        nul=0,
        plus = 0;
        var sum = 0;

    for (var user in userRequests) {
        if (userRequests.hasOwnProperty(user)) {
            userCount++;
            switch(userRequests[user][type]){
                case 1:
                    plus++;break;
                case 0:
                    nul++;break;
                case -1:
                    neg++;break;
            }
            sum += userRequests[user][type];
        }
    }
    console.log(userCount + " Users: (-1): " + neg + " (0): " + nul + " (1): " + plus + " Sum: " + sum);
};

module.exports = {
    callForCoffee: callForCoffee,
    getLamps: getLamps,
    setLampColor: setLampColor,
    setAllLampsColor: setAllLampsColor,
    setTheoryColor: setTheoryColor,
    setSpeedColor: setSpeedColor,
    calcTheoryColor: calcTheoryColor,
    calcSpeedColor: calcSpeedColor,
    calcSaturation: calcSaturation

};