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
  $scope.shuffleObj = {
    startBoundary: null,
    endBoundary: null
  };
})

.directive('skipSelect', function() {
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
      window.farf = scope;
      window.pp = this;

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
      };
      scope.clickedDay = function(day) {
        console.log("OI");
        if(day.type === 'weekday') {
          day.skipped = !day.skipped;
        }
      };
    }
  };
})
;
