angular.module( 'basicNwStarter.main', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'main', {
    url: '/main',
    views: {
      "main": {
        controller: 'MainController',
        templateUrl: 'main/main.tpl.html'
      }
    },
    data:{ pageTitle: 'Main' }
  });
})

.controller( 'MainController', function MainController( $scope, $http ) {
})

;
