var fs = require('fs');



//returns an array of our logfiles. The array contains objects of form: {filename: "<filename>"}
var getAllLogFiles = function (callback) {
    fs.readdir("log/", function (err, files) {
        var returnFiles = [];
        for (var i = 0; i < files.length; i++) {
            if (files[i].indexOf(".log") > 0) {
                returnFiles.push({filename: files[i]});
            }
        }
        callback(returnFiles);
    });
};

var getLogFile = function (filename, callback) {
    var logArray = convertFileStringToObjectArray(getLogFileContent(filename));
    logArray = removeUnneededData(logArray);
    callback(logArray);
}

//==============Helper Functions ==================
//=================================================

var removeUnneededData = function(logArray){
    for(var i = 0; i<logArray.length;i++){

        //delete unneccessary data from logging to save bandwidth
        if(logArray[i].hasOwnProperty("name")){
            delete logArray[i]["name"];
        }
        if(logArray[i].hasOwnProperty("hostname")){
            delete logArray[i]["hostname"];
        }
        if(logArray[i].hasOwnProperty("pid")){
            delete logArray[i]["pid"];
        }
        if(logArray[i].hasOwnProperty("level")){
            delete logArray[i]["level"];
        }
        if(logArray[i].hasOwnProperty("hostname")){
            delete logArray[i]["hostname"];
        }
        if(logArray[i].hasOwnProperty("msg")){
            delete logArray[i]["msg"];
        }
        if(logArray[i].hasOwnProperty("v")){
            delete logArray[i]["v"];
        }

    }
    return logArray
}
//our logging is written as JSON object per line, so we add a few commas in between and wrap it as an array
var convertFileStringToObjectArray = function(fileContentString){
    fileContentString= fileContentString.replace(/\}/g, "},");
    fileContentString= fileContentString.slice(0, fileContentString.length-2);
    fileContentString= "[" + fileContentString+ "]";
    return eval(fileContentString)
}

var getLogFileContent = function (logFileName) {
    return fs.readFileSync("log/" + logFileName, {encoding: "utf8"});
}

module.exports = {
    getAllLogFiles: getAllLogFiles,
    getLogFile: getLogFile
};