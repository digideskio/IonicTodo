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

        $scope.projectPopup    = [];
        $scope.activeProject = '';

        $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.isDefaultState = function () {
            var state = false;
            if ($scope.projectList.length < 1) {
                $scope.defaultStateMessage = 'No projects.';
                $scope.defaultTask = function() {$scope.newProject();};
                state = true;
            } else if ($scope.activeProject.tasks.length < 1) {
                $scope.defaultStateMessage = 'Projects need tasks!';
                $scope.defaultTask = function() {$scope.showTaskModal();}
            }
            return state;
        };

        $scope.projectList = ProjectService.all;
        $scope.$watch( function (){ return ProjectService.all; }, function (newVal) {
            $scope.projectList = newVal;
            $scope.activeProject = $scope.projectList[ProjectService.getLastActiveIndex()];
        });

        $scope.newProject = function () {
            var projectPopup = $ionicPopup.show({
                template: '<input autofocus type="text" ng-model="projectPopup.title">',
                title: 'Name your project:',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (event) {
                            if (!$scope.projectPopup.title) {
                                event.preventDefault();
                            } else {
                                return $scope.projectPopup.title;
                            }
                        }
                    }
                ]
            });
            projectPopup.then(function (result) {
                if ($scope.projectPopup.title) {
                    ProjectService.create(result);
                    $ionicSideMenuDelegate.toggleLeft(false);
                    $scope.projectPopup = [];
                }
            });
        };

        $scope.deleteProject = function (index) {
            var deleteProjectPopup = $ionicPopup.show({
                title: 'Are you sure you wish to delete this project?',
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function () {
                            return false;
                        }
                    },
                    {
                        text: 'Delete',
                        type: 'button-assertive',
                        onTap: function () {
                            return true;
                        }
                    }
                ]
            });
            deleteProjectPopup.then(function (res) {
                if (res) {
                    ProjectService.delete(index);
                    $ionicSideMenuDelegate.toggleLeft(false);
                }
            });
        };

        $scope.selectProject = function (project, index) {
            $scope.activeProject = $scope.projectList[index];
            ProjectService.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        $scope.toggleProjectList = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.showTaskModal = function () {
            $scope.taskModal.show();
        };

        $scope.hideTaskModal = function () {
            $scope.taskModal.hide();
        };

        $scope.createTask = function (task) {
            if (!$scope.activeProject || !task) {
                return;
            }
            TaskService.create(task.title);
            $scope.taskModal.hide();
            task.title = '';
        };

        $scope.deleteTask = function (index) {
            var deleteTaskPopup = $ionicPopup.show({
                title: 'Are you sure you wish to delete this task?',
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function () {
                            return false;
                        }
                    },
                    {
                        text: 'Delete',
                        type: 'button-assertive',
                        onTap: function () {
                            return true;
                        }
                    }
                ]
            });
            deleteTaskPopup.then(function (res) {
                if (res) {
                    TaskService.delete(index);
                }
            });
        };

        $scope.completeTask = function (index) {
            TaskService.complete(index);
        };
    }]
);

app.service('TaskService',
    ['ProjectService',
    function(ProjectService) {

        var self = this;

        function update(array) {
            var localData = ProjectService.all;
            localData[ProjectService.getLastActiveIndex()].tasks = array;
            window.localStorage.projects = angular.toJson(localData);
        }

        function get() {
            return ProjectService.all[ProjectService.getLastActiveIndex()].tasks;
        }

        self.create = function(taskName) {
            var tasksArray = get();
            var newTask = {
                title: taskName,
                completed: false
            };
            tasksArray.push(newTask);

            update(tasksArray);
        };

        self.delete = function(index) {
            var tasksArray = get();
            tasksArray.splice(index, 1);
            update(tasksArray);
        };

        self.complete = function(index) {
            var tasksArray = get();
            tasksArray[index].completed = true;
            tasksArray[index].completedDate = new Date().toISOString();
            update(tasksArray);
        };
    }]
);

app.service('ProjectService', function () {
    var self = this;

    self.all = get();

    function update(array) {
        window.localStorage.projects = angular.toJson(array);
        self.all = array;
        console.log("ProjectService Update", array);
    }

    function get() {
        var projectString = window.localStorage.projects;
        if (projectString) {
            return angular.fromJson(projectString);
        }
        return [];
    }

    self.create = function(projectTitle) {
        var projectArray = get();
        var newProject = {
            title: projectTitle,
            tasks: []
        };
        projectArray.push(newProject);
        var newIndex = projectArray.length - 1;

        update(projectArray);
        self.setLastActiveIndex(newIndex);
    };

    self.delete = function(index) {
        var projectArray = get();
        projectArray.splice(index, 1);

        update(projectArray);
    };

    self.getLastActiveIndex = function() {
        return parseInt(window.localStorage.lastActiveProject, 10) || 0;
    };

    self.setLastActiveIndex = function(index) {
        window.localStorage.lastActiveProject = index;
    };
});
