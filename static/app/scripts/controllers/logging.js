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

            //note we iterate over the array backwards twice which causes our array to be in the correct direction again. Only once and we would have had inverted data
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

            drawChart(theoryData,{fontSize: "20"}, 'theory_chart'); /*, {curveType: 'function'}*/
            drawChart(speedData,{fontSize: "20"},  'speed_chart');
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
            /* old version. We now add additional "fake" data so the graph shows discrete style function instead of connecting point to point with lines that suggest values that arent even possible

            while(i--){
                var date = new Date(dataArray[i].time);
                returnArray.push([date, average, dataArray[i].hue,  ("Count: " + dataArray[i].userCount +" Sum: " + dataArray[i].currentRatingAverage)]);
            }*/

            while(i--){


                //date for the "next" item. But we add a fake on in between first
                var date = new Date(dataArray[i].time);

                //here we add "fake" data to make our graph look discrete
                if(returnArray.length > 1){
                    var prevCopy = angular.copy(returnArray[returnArray.length-1]);
                    prevCopy[0].setTime(date.getTime() - 1); //take the date of element to add and reduce it by 1 ms.
                    returnArray.push(prevCopy);
                }

                returnArray.push([date, average, dataArray[i].hue,  ("Count: " + dataArray[i].userCount +" Sum: " + dataArray[i].currentRatingAverage)]);
            }

            return returnArray;
        }


        var drawChart = function (data, options, cssID) {
            data = google.visualization.arrayToDataTable(data);;
            var chart = new google.visualization.LineChart(document.getElementById(cssID));
            chart.draw(data, options);
        }

    });

