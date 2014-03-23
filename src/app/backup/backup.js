angular.module('offCourse.backup', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'backup', {
    url: '/backup',
    views: {
      "main": {
        controller: 'BackupController',
        templateUrl: 'backup/backup.tpl.html'
      }
    },
    data:{
      pageTitle: 'Backup',
      loginRequired: true
    },
    onEnter: function() {
    },
    onExit: function() {
    }
  });
})

.controller('BackupController', function BackupController($scope) {

})
;
