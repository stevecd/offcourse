angular.module( 'offCourse.login', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginController',
        templateUrl: 'login/login.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'Login'
    },
    onEnter: function() {
    }
  });
})

.controller( 'LoginController', function LoginController( $scope, $state, ocInterface ) {
  $scope.formInfo = {
    buttonText: 'Log in'
  };
  window.oci = ocInterface;
  $scope.login = function() {
    //TODO fill in login()
    //ocInterface.online = true;
    //$state.go('main');
    if(!ocInterface.authenticating) {
      $scope.formInfo.buttonText = 'Authenticating...';
      ocInterface.login($scope.formInfo.username, $scope.formInfo.password).then(function() {
        if(ocInterface.online) {
          $state.go('main');
        } else {
          $scope.formInfo.buttonText = 'Log in';
          toastr.error("Authentication Failure.");
        }
      });
    }
  };
})

.directive( 'snapHeight', function($window) {
  return {
    restrict: 'A',
    replace: false,
    link: function(scope, element, attr) {
      var resize = function() {
        win.setResizable(true);
        win.resizeTo(300,element.height() + 60);
        setTimeout(function() {
          win.setResizable(scope.$eval(attr.snapHeight));
        },100); //ugly hack
      };
      resize();
    }
  };
})

;
