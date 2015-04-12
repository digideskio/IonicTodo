// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('todo', ['ionic']);

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.controller('TodoCtrl',
    ['$scope', '$timeout', '$ionicModal', '$ionicSideMenuDelegate', '$ionicPopup', 'TaskService', 'ProjectService',
    function ($scope, $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicPopup, TaskService, ProjectService) {

        $scope.activeProject = '';
        $scope.projectList = ProjectService.all();

        $scope.selectProject = function (project, index) {
            $scope.activeProject = project;
            ProjectService.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        };

//        $scope.newProject = function () {
//            var projectPopup = $ionicPopup.show({
//                template: '<input autofocus type="text" ng-model="popup.title">',
//                title: 'Name your project:',
//                scope: $scope,
//                buttons: [
//                    {text: 'Cancel'},
//                    {
//                        text: 'Save',
//                        type: 'button-positive',
//                        onTap: function (event) {
//                            if (!$scope.popup.title) {
//                                event.preventDefault();
//                            } else {
//                                return $scope.popup.title;
//                            }
//                        }
//                    }
//                ]
//            });
//            projectPopup.then(function (result) {
//                if ($scope.popup.title) {
//                    createProject();
//                }
//            });
//        };

    }]
);

app.service('TaskService',
    ['ProjectService',
    function(ProjectService) {

        var self = this;

        self.all = function() {
            var localData = window.localStorage['projects'],
                activeProject = ProjectService.getLastActiveIndex();
            if (localData) {
                var result = angular.fromJson(localData);
                console.log(result);
                return result[activeProject].tasks;
            }
            return [];
        }

        self.create = function(task) {
            console.log(task, ProjectService.getLastActiveIndex());
        }

        self.remove = function(task) {
        }

        self.complete = function(task) {
        }
    }]
);

app.service('ProjectService', function () {
    var self = this;

    self.all = function() {
        var projectString = window.localStorage['projects'];

        if (projectString) {
            return angular.fromJson(projectString);
        }
        return [];
    }

    self.update = function(newTasks) {
        var projectArray = self.all(),
            index = self.getLastActiveIndex();
        
        projectArray[index].tasks = newTasksasks;
        window.localStorage['projects'] = angular.toJson(projectArray);
    }

    self.create = function(projectTitle) {
        var projectArray = self.all();
        var newProject = {
            title: projectTitle,
            tasks: []
        };
        projectArray.push(newProject);
        window.localStorage['projects'] = angular.toJson(projectArray);
    }

    self.getLastActiveIndex = function() {
        return parseInt(window.localStorage['lastActiveProject'], 10) || 0;
    }

    self.setLastActiveIndex = function(index) {
        window.localStorage['lastActiveProject'] = index;
    }
});