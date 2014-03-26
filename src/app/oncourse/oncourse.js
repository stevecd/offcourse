angular.module( 'offCourse.oncourse', [
  'ui.router'
])

.factory( 'ocInterface', function($rootScope, $q, $timeout) {
  var oci = {
    online: false,
    queue: []
  };

  oci.login = function(username, password) {
    oci.client = new oncourse.Client(username, password);
    return oci.client.login().then(function(success) {
      oci.online = success;
    });
  };

  oci.testFunc = function() {
    var sequence = Q.resolve();
    params = [1,2,3,4,5,6];
    params.forEach(function(param) {
      sequence = sequence.then(function() {
      }).then(function() {
        return $timeout(function() {
          console.log("fart");
        }, 1000);
      }).then(function() {
          console.log(param + " :^)");
      }).then(function() {
        console.log("poot");
        return $timeout(function() {
          console.log("poop");
        }, 3000);
      });
    });

    return sequence;
  };

  oci.backupPlannerDateRange = function(startDate, endDate, file) {
    startDate = moment(startDate).weekday(1);
    endDate = moment(endDate).weekday(1);

    var numWeeks = endDate.diff(startDate, 'weeks') + 1;
    var startDates = [];
    var weeks = [];

    for(var i = 0; i < numWeeks; i++) {
      startDates.push(moment(startDate).add('d', i * 7));
    }
    $rootScope.$broadcast("queue:begin", numWeeks + 1);

    var sequence = Q.resolve();
    startDates.forEach(function(start) {
      sequence = sequence.then(function () {
        console.log("OIzzz");
        $rootScope.$apply(function() {
          $rootScope.$broadcast("task:started", "GET week started: " + start.format("MM-DD-YYYY"));
        });
        return $timeout(function() {
          console.log("OI3");
          $rootScope.$broadcast("task:finished", "GET week finished: " + start.format("MM-DD-YYYY"));
        }, 1000);
        //return oci.client.getPlannerHTML(start, 1).then(function(week) {
          //$rootScope.$broadcast("task:finished", "GET week started: " + start.format("MM-DD-YYYY"));
          //weeks.push(week);
        //});
      });
    });
    return sequence.then(function() {
      $rootScope.$apply(function() {
        $rootScope.$broadcast("task:started", "Write planner to file: " + file);
      });
      console.log("OI");
      return $timeout(function() {
        console.log("OI2");
        $rootScope.$broadcast("task:finished", "Write planner to file: " + file);
        $rootScope.$broadcast("queue:finished");
      }, 1000);
      //return fs.write(file, JSON.stringify(weeks, null, 2)).then(function() {
        //$rootScope.$broadcast("task:finished", "Write planner to file: " + file);
        //$rootScope.$broadcast("queue:finsiehd");
      //});
    });
  };

  return oci;
})

;
