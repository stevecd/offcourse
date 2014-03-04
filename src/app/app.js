angular.module('basicNwStarter', [
  'templates-app',
  'templates-common',
  'ui.router',
  'basicNwStarter.main'
])

.config( function basicNwStarterConfig ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/main');
})

.run( function run() {
})

.controller( 'basicNwStarterCtrl', function basicNwStarterCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | basicNwStarter' ;
    }
  });
})

.controller( 'MenuController', function NavController($scope, $location) {
})

;

//bootstrap it
angular.element(document).ready(function() {
  angular.bootstrap(document, ['basicNwStarter']);
});
