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

.controller('ShuffleController', function ShuffleController($scope,ocInterface,skippedDayStore) {
  $scope.shuffleObj = {
    endDate: null
  };
  
  $scope.finishedWizard = function() {
    oci.insertLesson(
      $scope.shuffleObj.targetDate,
      $scope.shuffleObj.period,
      $scope.shuffleObj.endDate,
      skippedDayStore.skips
    ).then(null,function(err) {
      toastr.error(err.stack, "Task failed!");
      console.log(err.stack);
    });
  };
})

.factory('skippedDayStore', function() {
  var store = {};
  store.skips = [];
  store.saveSkips = function(filename) {
    return fs.write(filename, store.skips.join("\n"), "w");
  };
  store.loadSkips = function(filename) {
    return fs.read(filename).then(function(content) {
      store.skips = content.split(/\r\n|\n|\r/);
    });
  };
  return store;
})

.directive('skipSelect', function(skippedDayStore, fileDialog) {
  return {
    restrict: "AE",
    templateUrl: "shuffle/skip_select.tpl.html",
    scope: {
      startDate: '=',
      endDate: '='
    },
    link: function(scope, element, attrs) {
      var self = this;
      scope.months = [];
      
      angular.forEach(['startDate', 'endDate'], function(key) {
        scope.$watch(key, function(value) {
          self.refreshView();
        });
      });

      this.refreshView = function() {
        var a = moment(scope.startDate).date(1);
        var b = moment(scope.endDate).endOf('month');
        scope.months = [];
        for (var m = a; m.isBefore(b); m.add('months', 1)) {
          var monthObj = {
            name: m.format("MMM"),
            year: m.format("YYYY"),
            weeks: []
          };
          var lastWeek = moment(m).endOf('month');
          var firstWeek = moment(m).startOf('month');
          for(var w=firstWeek;moment(w).startOf('week').isBefore(lastWeek);w.add('weeks', 1)) {
            week = {
              index: w.week(),
              days: []
            };
            week.days.push({
              day: moment(w).day(0),
              type: 'weekend'
            });
            for(var i=1;i<6;i++) {
              if(moment(w).day(i).month() === m.month()) {
                week.days.push({
                  day: moment(w).day(i),
                  type: 'weekday'
                });
              } else {
                week.days.push({
                  day: moment(w).day(i),
                  type: 'outsideday'
                });
              }
            }
            week.days.push({
              day: moment(w).day(6),
              type: 'weekend'
            });
            monthObj.weeks.push(week);
          }
          scope.months.push(monthObj);
        }

        // add .skipped attribute to days already skipped in skippedDayStore.skips
        scope.months.forEach(function(m) {
          m.weeks.forEach(function(w) {
            w.days.forEach(function(d) {
              var daystring = moment(d.day).format("YYYY-MM-DD");
              var storedIndex = skippedDayStore.skips.indexOf(daystring);
              if(~storedIndex) {
                d.skipped = true;
              }
            });
          });
        });
      };

      scope.saveSkips = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        fileDialog.saveAs(function(filename) {
          skippedDayStore.saveSkips(filename).then(function() {
            toastr.success("Skips saved to " + filename);
          }, function(err) {
            toastr.error("Error saving skips");
          });
        }, "skipfile.json", ".json");
      };

      scope.loadSkips = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        fileDialog.openFile(function(filename) {
          skippedDayStore.loadSkips(filename).then(function() {
            toastr.success("Loaded skips from " + filename);
            scope.$apply(function() {
              self.refreshView();
            });
          }, function(err) {
            toastr.error("Error loading skips");
          });
        }, false, [".json", ".txt"]);
      };

      scope.clickedDay = function(day) {
        if(day.type === 'weekday') {
          day.skipped = !day.skipped;
          var daystring = moment(day.day).format("YYYY-MM-DD");
          var storedIndex = skippedDayStore.skips.indexOf(daystring);
          if(~storedIndex) {
            skippedDayStore.skips.splice(storedIndex, 1);
          } else {
            skippedDayStore.skips.push(daystring);
          }
        }
      };
    }
  };
})
;
