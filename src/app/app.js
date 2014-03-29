var gui = require("nw.gui");
var win = gui.Window.get();
var oncourse = require("node-oncourse");
var fs = require("q-io/fs");
var Q = require("q");
win.hide();

angular.module('offCourse', [
  'templates-app',
  'templates-common',
  'ui.router',
  'ui.bootstrap',
  'offCourse.main',
  'offCourse.login',
  'mgo-angular-wizard',
  'offCourse.shuffle',
  'offCourse.backup',
  'offCourse.oncourse',
  'DWand.nw-fileDialog'
])

.config( function offCourseConfig ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');
})

.run( function run($rootScope, $state, ocInterface) {
 $rootScope.$on('$stateChangeStart', function(event,toState,toParams,fromState,fromParams) {
    if(toState.data.loginRequired && !ocInterface.online) {
      event.preventDefault();
      $state.go('login');
      return false;
    }
  });
})

.controller('ModalInstanceCtrl', function($scope, $modalInstance) {
})

.controller( 'offCourseCtrl', function offCourseCtrl ( $scope, $rootScope, $location, $modal, $timeout ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | offCourse' ;
    }
  });
  $scope.go = function(place) {
    $location.path("/" + place);
  };

  var modalInstance = {};
  $scope.queue = {};

  $scope.$on("queue:begin", function(event,numJobs) {
    $scope.queue.jobs = numJobs;
  });
  $scope.$on("task:started", function($event, message) {
    $scope.queue.message = message;
  });
  $scope.$on("task:message", function($event, message) {
    $scope.$apply(function() {
      $scope.queue.message = message;
    });
  });
  $scope.$on("task:finished", function($event, message) {
    $scope.$apply(function() {
      $scope.queue.message = message;
      $scope.queue.jobs -= 1;
    });
  });
  $scope.$on("queue:finished", function() {
    $scope.queue.message = "Task Complete!";
    $timeout(function() {
      modalInstance.dismiss('complete');
    }, 2000);
  });
  $scope.abort = function() {
    console.log("Abort!");
  };

  $scope.$on("queue:begin", function(event, numJobs) {
    $scope.queue.jobs = numJobs;
    $scope.queue.message = "";
    modalInstance = $modal.open({
      backdrop: 'static',
      scope: $scope,
      templateUrl: 'oncourse/queue_modal.tpl.html',
      controller: 'ModalInstanceCtrl',
      keyboard: false
    });

    modalInstance.result.then(function() {
      console.log("got modal result");
    });
  });
})

.controller( 'MenuController', function NavController($scope, $location) {
})

;

//bootstrap it
angular.element(document).ready(function() {
  win.show();
  angular.bootstrap(document, ['offCourse']);
});



