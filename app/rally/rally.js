'use strict';

angular.module('spark.rally', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/rally', {
            templateUrl: 'rally/rally.html',
            controller: 'rallyCtrl'
        });
    }])
    .controller("popoverCtrl", function ($scope, dataService, myAuthentication, $modal) {

        //Functionality of the add button
        $scope.addButton = function () {

        }

        //Functionality of info button
        $scope.infoButton = function () {
            $scope.nodeID = myAuthentication.nodeID;
            console.log("PCtrl ID: ", $scope.nodeID);
            //Call to get metadata of node
            dataService.metadata(
                {
                    input: $scope.nodeID
                },
                {},
                function (val, response) {
                    $scope.modalData = val.data;
                    console.log(val.data);
                    var myModal = $modal({
                        contentTemplate: 'modal.html',
                        scope: $scope,
                        show: true
                    });
                },
                function (response) {
                }
            )
        }

        //Functionality of the delete button
        $scope.deleteButton = function () {

        }

    })
    .controller('rallyCtrl', ['auth','RallyProject', function (auth,RallyProject) {
        auth.checkLogin();

        //getproject list
        (function () {
            $scope.load = true;

            $scope.projectList=RallyProject.query();

//            dataService.projectList(
//                {},
//                {},
//                function (val, response) {
//                    console.log("Data Received: ", val.data);
//                    $scope.projectList = val.data;
//                    $scope.load = false;
//                },
//                function (response) {
//                    $scope.error="Cannot get Project List.";
//                    $scope.load = false;
//                }
//            );
        })();


        //Call to request release list data
        $scope.getRelease = function () {
            $scope.load = true;
            dataService.releaseList(
                {input: $scope.projectChosen},
                {},
                function (val, response) {
                    console.log("Data Received: ", val.data);
                    $scope.releaseList = val.data;
                    $scope.load = false;
                    var timeoutCount = 0;
                },
                function (response) {
                    switch (response.status) {
                        case 0:
                            if (timeoutCount < maxTimeoutAttempts) {
                                console.log("PHP timeout: Retrying connection...");
                                myAuthentication.msg.text = "PHP timeout: Retrying connection...", myAuthentication.msg.colorCode = "y";
                                $scope.getRelease();
                                timeoutCount++;
                            } else {
                                console.log("Timed Out: Could not reach php server");
                                myAuthentication.msg.text = "Timed Out: Could not reach php server", myAuthentication.msg.colorCode = "r";
                                timeoutCount = 0;
                            }
                            break;
                    }
                    $scope.load = false;
                }
            );
        };

        //Call to request tree data
        $scope.getTreeData = function () {

            $scope.load = true;
            dataService.treeData(
                {
                    project: $scope.projectChosen,
                    release: $scope.releaseChosen
                },
                {},
                function (val, response) {
                    console.log("Data Received: ", val.data);
                    $scope.tree = val.data;

                    //Creates/Clears the undo array whenever a new tree is loaded
                    $scope.undoArray = [];

                    $scope.iterationList = [];
                    for (var c = 0; c < $scope.tree.length; c++) {
                        if ($scope.tree[c].Iteration) {
                            $scope.iterationList.push($scope.tree[c].Iteration);
                        }
                    }
                    $scope.iterationList = $scope.iterationList.filter(onlyUnique);
                    $scope.iterationList.sort();
                    $scope.iterationList.push("All");

                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }

                    $scope.load = false;
                    timeoutCount = 0;
                },
                function (response) {
                    switch (response.status) {
                        case 0:
                            if (timeoutCount < maxTimeoutAttempts - 1) {
                                console.log("PHP timeout: Retrying connection...");
                                myAuthentication.msg.text = "PHP timeout: Retrying connection...", myAuthentication.msg.colorCode = "y";
                                $scope.load = false;
                                $scope.getTreeData();
                                timeoutCount++;
                            } else {
                                $scope.load = false;
                                console.log("Timed Out: Could not reach php server");
                                myAuthentication.msg.text = "Timed Out: Could not reach php server", myAuthentication.msg.colorCode = "r";
                                timeoutCount = 0;
                            }
                            break;
                    }
                }
            );
        }

        //Call to filter tree by iteration
        $scope.filterIteration = function () {
            var treeArray = $scope.tree.slice(0); //$scope.x = $scope.y ?
            var iterationIDs = [];
            var displayNoneIDs = [];
            var prevParent = [];
            var newParent = [];
            //For loops to find user stories that match iteration value. Also finds the parents of those user stories
            for (i = 0; i < treeArray.length; i++) {
                if (treeArray[i].Iteration) {
                    if (treeArray[i].Iteration == $scope.iterationChosen) {
                        iterationIDs.push(treeArray[i].id);
                        newParent.push(treeArray[i].parent);
                    } else {
                        displayNoneIDs.push(treeArray[i].id);
                    }
                    treeArray.splice(i, 1);
                    i--;
                }
            }

            treeArray = iterationReduction(newParent);
            for (var n = 0; n < treeArray.length; n++) {
                displayNoneIDs.push(treeArray[n].id);
            }

            $scope.iterationFilter = {
                iterationIDs: iterationIDs,
                displayNoneIDs: displayNoneIDs
            };

            function iterationReduction(newParent) {
                prevParent = newParent.slice();
                newParent = [];
                //Loops for each parent
                for (var j = 0; j < prevParent.length; j++) {
                    //Loops through each treeArray value to find next level of parents
                    for (var k = 0; k < treeArray.length; k++) {

                        if (prevParent[j] == treeArray[k].id) {
                            newParent.push(treeArray[k].parent);
                            treeArray.splice(k, 1);
                            k--;
                        }

                    }
                }
                newParent = newParent.filter(onlyUnique);
                if (newParent.length) {
                    treeArray = iterationReduction(newParent);
                }
                return treeArray;
            }

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

        }

        //Call to change the parent of a node
        $scope.moveNode = function (data) {
            var moveNodeData = {node: data.node, parent: data.parent};

            dataService.dragdrop(
                {
                    input: moveNodeData
                },
                {},
                function (val, response) {
                    console.log("Move Successful");
                    myAuthentication.msg.text = "User Story Move Successful", myAuthentication.msg.colorCode = "g";
                    //On successful node move, information is stored for undo action
                    var undoNodeData = {
                        input: {node: data.node, parent: data.oldParent},
                        input_type: 'dragdrop',
                        position: data.oldPosition
                    };
                    $scope.undoArray.push(undoNodeData);
                    console.log("UndoArray: ", $scope.undoArray);
                    $scope.load = false;
                    timeoutCount = 0;
                },
                function (response) {
                    switch (response.status) {
                        case 0:
                            if (timeoutCount < maxTimeoutAttempts - 1) {
                                console.log("PHP timeout: Retrying connection...");
                                myAuthentication.msg.text = "PHP timeout: Retrying connection...", myAuthentication.msg.colorCode = "y";
                                $scope.moveNode(data);
                                timeoutCount++;
                            } else {
                                console.log("Timed Out: Could not reach php server");
                                myAuthentication.msg.text = "Timed Out: Could not reach php server", myAuthentication.msg.colorCode = "r";
                                timeoutCount = 0;
                            }
                            break;
                    }
                    $scope.load = false;
                }
            );
        }

        //Undo function that currently undos any move node action. Note: This function is compatible to add add/delete undo functions in the future
        $scope.undoAction = function () {
            $scope.undoData = $scope.undoArray.pop();
            console.log('Undo Data', $scope.undoData);
            console.log('Undo Array', $scope.undoArray);
            dataService.undo(
                {
                    input: $scope.undoData.input,
                    input_type: $scope.undoData.input_type
                },
                {},
                function (val, response) {
                    //Delets the undo Data. This is because if the user does an action undos and does the same action and undos again, the directive will not catch the undoData watch since the undoData would not have technically changed. This makes sure the watch catches all instances of the undo button click. Unfortunately deleting undoData also triggers watch however it will not try and move a node due to the directive code. This code can/should be updated in the future as needed.
                    delete $scope.undoData;
                    console.log('Undo Successful');
                    myAuthentication.msg.text = "Undo Move Successful", myAuthentication.msg.colorCode = "g";
                },
                function (response) {
                }
            )
        }

        //Enable drag and drop
        $scope.editEnable = function () {
            return $scope.enabled;

        };

        //Call to logout of rally plug-in
        $scope.logOut = function () {
            $scope.load = true;
            dataService.logOut(
                {},
                {},
                function (val, response) {
                    console.log("Logout Successful");
                    $scope.load = false;
                    delete $scope.tree;
                    delete $scope.releaseList;
                    delete $scope.projectList;
                    delete $scope.projectChosen;
                    delete $scope.releaseChosen;
                    myAuthentication.success = false;
                    timeoutCount = 0;
                },
                function (response) {
                    switch (response.status) {
                        case 0:
                            if (timeoutCount < maxTimeoutAttempts - 1) {
                                console.log("PHP timeout: Retrying connection...");
                                myAuthentication.msg.text = "PHP timeout: Retrying connection...", myAuthentication.msg.colorCode = "y";
                                $scope.logOut();
                                timeoutCount++;
                            } else {
                                console.log("Timed Out: Could not reach php server");
                                myAuthentication.msg.text = "Timed Out: Could not reach php server", myAuthentication.msg.colorCode = "r";
                                timeoutCount = 0;
                            }
                            break;
                    }
                    $scope.load = false;
                }
            );
        }

        //Call to store selected jstree node ID
        $scope.storeNode = function (data) {
            myAuthentication.nodeID = data;
        }
    }])
;
