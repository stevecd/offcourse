angular.module( 'offCourse.oncourse', [
  'ui.router'
])

.factory( 'ocInterface', function($rootScope, $q) {
  var iface = {
    online: false,
    queue: []
  };

  iface.login = function(username, password) {
    iface.client = new oncourse.Client(username, password);
    return iface.client.login().then(function(success) {
      iface.online = success;
    });
  };

  iface.backupPlannerDateRange = function(startDate, endDate, file) {
    startDate = moment(startDate).weekday(1);
    endDate = moment(endDate).weekday(1);

    var difference = endDate.diff(startDate, 'weeks') + 1;
    var startDates = [];
    var weeks = [];

    for(var i = 0; i < numWeeks; i++) {
      startDates.push(moment(startDate).add('d', i * 7));
    }
    $rootScope.$broadcast("queue:begin", numWeeks.length);

    var sequence = $q.resolve();
    startDates.forEach(function(start) {
      sequence = sequence.then(function () {
        return sequence.then(function() {
          $rootScope.$broadcast("task:started", "GET week started: " + start.format("MM-DD-YYYY"));
          return iface.client.getPlannerHTML(start, 1).then(function(week) {
            $rootScope.$broadcast("task:finished", "GET week started: " + start.format("MM-DD-YYYY"));
            weeks.push(week);
          });
        });
      });
    });
    return sequence.then(function() {
      $rootScope.$broadcast("queue:finished");
      return fs.write(file, JSON.stringify(weeks, null, 2));
    });
  };

  return iface;
})

;
