'use strict';


angular.module('IoTWorkshopWebApp')
    .controller('LoggingCtrl', function ($scope, $resource) {
        var LogFiles = $resource('/api/logs/:id', {id: "@id"});

        $scope.logFileNames = LogFiles.query();


        $scope.logFileSelected = function (logSelected) {
            $scope.logFileSelected = LogFiles.query({id: logSelected.filename}, function(success){
                //adding a google chart
                prepareDataAndDrawChart(success);
            });

            //pre settings for table
            $scope.predicate = 'time';
            $scope.reverse = false;


        }


        var prepareDataAndDrawChart = function (logFileSelected) {
            logFileSelected
            var theoryData = [];
            var speedData = [];

            //get all lamp rating data and put them in separate arrays
            var i = logFileSelected.length;
            while (i--) {
                if (logFileSelected[i].type == 'userRating') {
                    if(logFileSelected[i].ratingType == 'theory'){
                        theoryData.push(angular.copy(logFileSelected[i]));
                    }
                    if(logFileSelected[i].ratingType == 'speed'){
                        speedData.push(angular.copy(logFileSelected[i]));
                    }
                }
            }

            //google chart needs arrays as inputs
            theoryData = convertDataObjectsToArrays(theoryData, "theory");
            speedData  = convertDataObjectsToArrays(speedData, "speed");

            drawChart(theoryData, {curveType: 'function'}, 'theory_chart');
            drawChart(speedData, {curveType: 'function'},  'speed_chart');
        }

        /**
         *
         * @param dataArray : the dataArray in which the data is in.
         * @param type
         * @returns {Array}
         */
        var convertDataObjectsToArrays = function(dataArray, type){
            var returnArray = [];

            var average;
            //add an average Line to every row
            if(type == "theory"){
                average = 56100;
            }else{
                average = 12750;
            }

            returnArray.push(['Zeit','Durchschnitt', 'Hue Farbwert', {type:'string', role: 'tooltip'}]);
            var i = dataArray.length;
            while(i--){
                var simpleTime = new Date(dataArray[i].time).toLocaleTimeString();
                returnArray.push([simpleTime, average, dataArray[i].hue,  ("Count: " + dataArray[i].userCount +" Sum: " + dataArray[i].currentRatingAverage)]);
            }
            return returnArray;
        }


        var drawChart = function (data, options, cssID) {
            data = google.visualization.arrayToDataTable(data);;
            var chart = new google.visualization.LineChart(document.getElementById(cssID));
            chart.draw(data, options);
        }

    });

