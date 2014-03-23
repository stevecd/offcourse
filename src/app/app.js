var gui = require("nw.gui");
var win = gui.Window.get();
var cheerio = require("cheerio");
var unirest = require("unirest");
var oncourse = require("node-oncourse");
var fs = require("q-io/fs");
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

.controller( 'offCourseCtrl', function offCourseCtrl ( $scope, $location, $modal ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | offCourse' ;
    }
  });
  $scope.go = function(place) {
    $location.path("/" + place);
  };

  $scope.$on("queue:begin", function(event, numJobs) {
    var modalInstance = $modal.open({
      templateUrl: 'oncourse/queue_modal.tpl.html',
      controller: function($scope, $modalInstance) {
        $scope.abort = function() {
          //$modalInstance.close(chartStudyFactory.create($scope.selected.studyType, $scope.selected.size));
          $modalInstance.dismiss('abort');
        };
      }
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



