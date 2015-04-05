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
    ['$scope', '$timeout', '$ionicModal', '$ionicSideMenuDelegate', '$ionicPopup', 'Projects',
    function ($scope, $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicPopup, Projects) {
        var createProject = function(projectTitle) {
            var newProject = Projects.newProject(projectTitle);
            $scope.projects.push(newProject);
            Projects.save($scope.projects);
            $scope.selectProject(newProject, $scope.projects.length-1);
        };
        $scope.popup = [];
        
        $scope.isDefaultState = function () {
            var state = false;
            if ($scope.projects.length < 1) {
                state = true;
            }
            return state;
        }

        $scope.projects = Projects.all();
        
        $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

        $scope.newProject = function() {
            var theProject = $ionicPopup.show({
                template: '<input type="text" ng-model="popup.title">',
                title: 'Enter project title',
                subTitle: 'something something',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function (event) {
                            if (!$scope.popup.title) {
                                event.preventDefault();
                            } else {
                                return $scope.popup.title;
                            }
                        }
                        
                    }
                ]
            });
            theProject.then(function (results) {
                if ($scope.popup.title) {
                    createProject($scope.popup.title);
                    $scope.popup = [];
                }
            });
        };

        $scope.selectProject = function(project, index) {
            $scope.activeProject = project;
            Projects.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.createTask = function(task) {
            if (!$scope.activeProject || !task) {
                return;
            }
            $scope.activeProject.tasks.push({
                title: task.title
            });
            $scope.taskModal.hide();

            Projects.save($scope.projects);

            task.title = "";
        };

        $scope.newTask = function() {
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function() {
            $scope.taskModal.hide();
        };

        $scope.toggleProjects = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };


//        $timeout(function() {
//            if ($scope.projects.length == 0) {
//                while (true) {
//                    var projectTitle = prompt('Your first project title:');
//                    if (projectTitle) {
//                        createProject(projectTitle);
//                        break;
//                    }
//                }
//            }
//        });
    }]
);

app.factory('Projects', function () {
    return {
        all: function() {
            var projectString = window.localStorage['projects'];
            
            if (projectString) {
                return angular.fromJson(projectString);
            }
            return [];
        },
        save: function(projects) {
            window.localStorage['projects'] = angular.toJson(projects);
        },
        newProject: function(projectTitle) {
            return {
                title: projectTitle,
                tasks: []
            }
        },
        getLastActiveIndex: function() {
            return parseInt(window.localStorage['lastActiveProject']) || 0;
        },
        setLastActiveIndex: function(index) {
            window.localStorage['lastActiveProject'] = index;
        }
    }
});