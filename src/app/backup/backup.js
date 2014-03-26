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

.controller('BackupController', function BackupController($rootScope, $scope, ocInterface, fileDialog) {
  $scope.backup = {
    fileName:"./backup.txt"
  };
  $scope.chooseFile = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    fileDialog.saveAs(function(filename) {
      $scope.$apply(function() {
        $scope.backup.fileName = filename;
      });
    }, $scope.backup.fileName, ".txt");
  };
  $scope.beginBackup = function($event) {
    console.log("Fart!");
    //ocInterface.testFunc();
    ocInterface.backupPlannerDateRange($scope.backup.startDate, $scope.backup.endDate, $scope.backup.fileName);
  };
})
;
