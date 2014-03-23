angular.module( 'offCourse.main', [
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
    data:{
      pageTitle: 'Main',
      loginRequired: true
    },
    onEnter: function() {
      win.setResizable(true);
      var mainWidth = localStorage.mainWidth || 800;
      var mainHeight = localStorage.mainHeight || 600;
      win.resizeTo(mainWidth, mainHeight);
    },
    onExit: function() {

    }
  });
})

.controller( 'MainController', function MainController( $scope ) {
})

;
