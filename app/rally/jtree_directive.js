angular.module('spark.rally') .directive('jstree', [ '$templateCache', '$compile', function ( $templateCache, $compile) {
    return {
        restrict: "EA",
        //In-Progress: This is an isolated scope that we want to implement in the future for better angular practice
        //scope: {ngModel: '='},

        link: function (scope, element, attrs) {
            var undoFlag = false;

            scope.$watch(attrs.undo, function () {
                if (scope.undoData) {

                    var editState = scope.editEnable();
                    scope.enabled = true;

                    undoFlag = true;
                    $(element).jstree(true).move_node(scope.undoData.input.node, scope.undoData.input.parent, scope.undoData.position);

                    scope.enabled = editState;
                }

            }, true);

            scope.$watch(attrs.iterationFilter, function () {

                if (scope.iterationFilter) {

                    $(element).jstree("open_all");

                    var editState = scope.editEnable();
                    console.log("Edit State: ", editState);
                    scope.enabled = true;

                    $(element).jstree().delete_node(scope.iterationFilter.displayNoneIDs);

                    //Highlights user stories with matched iteration
                    //Disabled: Highlighting is not needed
                    /*for(i=0; i < scope.iterationFilter.iterationIDs.length; i++){
                     $("#" + scope.iterationFilter.iterationIDs[i]).addClass("jstree-iteration");
                     }*/

                    //Searches (by name) iteration filtered data if user has value entered in search box when they use the iteration filter
                    $(element).jstree(true).search($('#treeSearch').val());

                    //Disabled: Old method for hiding uneeded nodes
                    /*for(m=0; m < scope.iterationFilter.displayNoneIDs.length; m++){
                     $("#" + scope.iterationFilter.displayNoneIDs[m]).attr("style", "display: none");
                     }*/

                    scope.enabled = editState;
                    console.log("Edit State After: ", scope.enabled);
                }

            }, true);

            scope.$watch(attrs.ngModel, function () {
                var to = false;
                $('#treeSearch').keyup(function () {
                    if (to) {
                        clearTimeout(to);
                    }
                    to = setTimeout(function () {
                        var v = $('#treeSearch').val();
                        $(element).jstree(true).search(v);
                    }, 250);
                });

                //Destroys last instance of jstree so a new one can be created
                $(element).jstree("destroy");

                //In-Progress: This function will fire when a node is moved to a new parent. When this occurs the front end will send data to the backend to update Rally.
                $(element).bind('move_node.jstree', function (e, data) {
                    console.log('Move Data: ', data);
                    if (data.old_parent != data.parent && undoFlag == false) {
                        scope.nodeInfo = {node: '', parent: '', oldParent: ''};
                        scope.nodeInfo.node = data.node.id;
                        scope.nodeInfo.parent = data.node.parent;
                        scope.nodeInfo.oldParent = data.old_parent;
                        scope.nodeInfo.oldPosition = data.old_position;
                        scope.$apply(attrs.moveNode);
                        console.log(scope.nodeInfo);
                    } else {
                        undoFlag = false;
                    }

                })


                $(element).bind("select_node.jstree", function (e, data) {
                    scope.nodeID = data.node.id;
                    scope.$apply(attrs.storeNode);
                    console.log(data.node.id);

                })

                var popoverContent = $templateCache.get("popover.html");
                var finalContent = $compile("<div>" + popoverContent + "</div>")(scope);

                var options = {
                    html: true,
                    content: finalContent,
                    title: false,
                    placement: 'top',
                    trigger: 'focus'
                };

                //These events are currently disabled so we can determine what is the best way to assign the popover
                //This event is used to bind the popover to the root parents that are loaded
                /*$(element).on("ready.jstree", function(){
                 $(".jstree-anchor").popover(options);
                 })

                 //This event is uesd to bind the popover to any child that is opened
                 $(element).on("after_open.jstree", function (){
                 $(".jstree-anchor").popover(options);
                 })*/

                $(element).on("hover_node.jstree", function (e, data, node) {
                    $(".jstree-hovered").popover(options);
                    //console.log("event: ", e);
                    //console.log("data: ", data);
                })

                //jstree format setup
                $(element).jstree(
                    {
                        //"state" plugin currently disabled since it does not work alongside our select node function
                        plugins: ["themes", "search", "dnd", "crrm", "ui"],
                        search: {
                            "case_sensitive": false,
                            //only displays matches found in search bar
                            "show_only_matches": true,
                            //fuzzy set to false so search looks for exact matches
                            "fuzzy": false
                        },
                        core: {
                            multiple: false,
                            themes: {
                                "theme": "default",
                                "icons": true,
                                "dots": false
                            },
                            //Allows for nodes to be dragged
                            check_callback: function (operation, node, node_parent, node_position, more) {

                                return scope.editEnable();
                            },
                            data: scope[attrs.ngModel]
                        }
                    }
                );

            }, true);

        }

    };
}]);
;