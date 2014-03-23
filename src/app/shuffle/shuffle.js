angular.module('offCourse.shuffle', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'shuffle', {
    url: '/shuffle',
    views: {
      "main": {
        controller: 'ShuffleController',
        templateUrl: 'shuffle/shuffle.tpl.html'
      }
    },
    data:{
      pageTitle: 'Shuffle',
      loginRequired: true
    },
    onEnter: function() {
    },
    onExit: function() {
    }
  });
})

.controller('ShuffleController', function ShuffleController($scope) {

})
;
