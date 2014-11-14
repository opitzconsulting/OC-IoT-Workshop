'use strict';

angular.module('IoTWorkshopWebApp')
    .controller('RatingCtrl', function ($scope, $http, $timeout, localStorageService) {

        $scope.participant = {};
        $scope.participant.name = localStorageService.getLocalStorageItem('participantName');

        $scope.resonance = {
            speed: 0,
            theory: 0,
            comment: ""
        }

        $scope.commentTimeout = false;


        //we register the user with the server
        $scope.registerUserWithServer = function () {
            $http.post("/api/user/" + $scope.participant.name).then(function (response) {
                if (response.status == 200) {
                    $scope.insertObjectContentIntoOther(response.data, $scope.resonance);
                }
            });
        };
        $scope.registerUserWithServer();


        //calling the backend and submitting the speed value chosen
        $scope.speed = function (speed) {
            $http.put("/api/user/" + $scope.participant.name + "/speed/" + speed)
                .then(function (response) {
                    if (response.status == 200) {
                        $scope.insertObjectContentIntoOther(response.data, $scope.resonance);
                    }
                });
        }

        //calling the backend and submitting the theory value chosen
        $scope.theory = function (theoryAmount) {
            $http.put("/api/user/" + $scope.participant.name + "/theory/" + theoryAmount)
                .then(function (response) {
                    if (response.status == 200) {
                        $scope.insertObjectContentIntoOther(response.data, $scope.resonance);
                    }
                });
        }


        //calling the backend and submitting a comment
        $scope.postComment = function (comment) {

            var payload = {text: comment};
            //post the comment to the backend
            $http({
                method: 'POST',
                url: "/api/user/" + $scope.participant.name + "/comment",
                data: payload,
                headers: {'Content-Type': 'application/json'}
            })
                //on success delete comment
                .then(function (response) {
                    $scope.resonance.comment = "";
                    //hide comment field and submit box for 3 seconds and show success message
                    $scope.commentTimeout = true;
                    $timeout(function () {
                        //after 3 seconds show comment box again
                        $scope.commentTimeout = false;
                    }, 3000);

                }, function (err) {
                    alert("some error occured: " + err.data + "\nBecause of: " + err.status);
                });
        }

        //calling the backend and submitting a coffee request
        $scope.callForCoffee = function () {
            $http.post("/api/user/" + $scope.participant.name + "/coffee");
        }


        $scope.initTooltips = function(){
            var tooltipOptions = {
                "animation": true,
                "placement": "bottom",
                "trigger": "hover"
            }

            $('#speed-slider'). tooltip(tooltipOptions);
            $('#theory-slider').tooltip(tooltipOptions);
            $('#coffeeHelp').tooltip(tooltipOptions);
        }
        $scope.initTooltips();

        //helper function
        $scope.insertObjectContentIntoOther = function (toInsert, destination) {
            for (var element in toInsert) {
                if (toInsert.hasOwnProperty(element)) {
                    destination[element] = toInsert[element];
                }
            }
        }


    });
