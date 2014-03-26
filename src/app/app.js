var gui = require("nw.gui");
var win = gui.Window.get();
var cheerio = require("cheerio");
var unirest = require("unirest");
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
  window.gg = $modalInstance;
  $scope.$on("$destroy", function() {
    console.log("Destroyed!");
  });
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
    console.log("huh?");
    $scope.queue.message = message;
  });
  $scope.$on("task:finished", function($event, message) {
    console.log("what?");
    $scope.queue.message = message;
    $scope.queue.jobs -= 1;
  });
  $scope.$on("queue:finished", function() {
    console.log("yeah");
    $scope.queue.message = "Task Complete!";
    $timeout(function() {
      modalInstance.dismiss('complete');
    }, 2000);
  });
  $scope.abort = function() {
    console.log("Abort!");
    //$modalInstance.close(chartStudyFactory.create($scope.selected.studyType, $scope.selected.size));
    //$modalInstance.dismiss('abort');
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
    window.cc = modalInstance;

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



