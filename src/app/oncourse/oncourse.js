angular.module( 'offCourse.oncourse', [
  'ui.router'
])

.factory( 'ocInterface', function($rootScope, $q, $timeout) {
  var oci = {
    authenticating: false,
    online: false,
    queue: []
  };

  oci.login = function(username, password) {
    oci.client = new oncourse.Client(username, password);
    oci.authenticating = true;
    return oci.client.login().then(function(success) {
      oci.online = success;
      oci.authenticating = false;
    }, function(err) {
      oci.authenticating = false;
    });
  };

  //Insert lesson task
  oci.insertLesson = function(targetDate, period, endDate, skips) {
    var momentSkips = skips.map(function(skip){return moment(skip);});
    //first, grab all lessons between targetDate and endDate.
    $rootScope.$broadcast("queue:begin", 2);
    $rootScope.$broadcast("task:started", "Reading Lessons...");
    return oci.client.getPlannerHTMLDateRange(targetDate, endDate).then(function(weeks) {
      //weeks contains the two weeks which contain these dates and all of the weeks in between
      var lessonsToShuffle = [];
      var sequence = Q.resolve();
      weeks.forEach(function(week) {
        var column = week.columns.filter(function(c) {
          return c.period === period;
        })[0];
        if(column) {
          column.cells.forEach(function(cell){ lessonsToShuffle.push(cell); });
        }
      });

      //lessonsToShuffle now has all of the lessons for the specified period
      //now it must be filtered to remove days outside the range and skipped days
      lessonsToShuffle = lessonsToShuffle.filter(function(lesson) {
        var mdate = moment(lesson.date, 'YYYYMMDD');
        return (!oci.client.momentIndexOf(momentSkips, mdate) &&
               (!~[0,6].indexOf(parseInt(mdate.weekday()))) &&
               (mdate.isAfter(moment(targetDate).subtract('day', 1))) &&
               (mdate.isBefore(moment(endDate).add('day', 1))));
      });

      // get homework
      lessonsToShuffle.forEach(function(lesson) {
        if(lesson.hasHomework) {
          sequence = sequence.then(function() {
            $rootScope.$broadcast("task:message", "Reading Homework on " + moment(lesson.date, "YYYYMMDD").format("YYYY-MM-DD"));
            return oci.client.getLesson(moment(lesson.date, "YYYYMMDD").format("YYYY-MM-DD"), lesson.period).then(function(l) {
              lesson.homework = l.homework;
            });
          });
        }
      });

      //get standards
      lessonsToShuffle.forEach(function(lesson) {
        if(lesson.standardsId) {
          sequence = sequence.then(function() {
            $rootScope.$broadcast("task:message", "Reading Standards on " + moment(lesson.date, "YYYYMMDD").format("YYYY-MM-DD"));
            return oci.client.getLinkedStandards(moment(lesson.date, "YYYYMMDD").format("YYYY-MM-DD"), lesson.period).then(function(standards) {
              lesson.standards = standards;
            });
          });
        }
      });
      
      sequence = sequence.then(function() {
        $rootScope.$broadcast("task:finished", "Reading Lessons...");
        // homework and standards filled out
        // find the first paste day
        var pasteDay = moment(endDate).add('day', 1);
        while(oci.client.momentIndexOf(momentSkips, pasteDay) || ~[0,6].indexOf(parseInt(pasteDay.weekday()))) {
          pasteDay.add('day', 1);
        }

        var shuffleSequence = Q.resolve();
        var reversedLessons = lessonsToShuffle.reverse();
        reversedLessons.forEach(function(lesson) {
          shuffleSequence = shuffleSequence.then(function() {
            $rootScope.$broadcast("task:message", "Post Lesson " + lesson.date + " >> " + pasteDay.format("MM/DD/YYYY"));
            return oci.client.postLesson(lesson.html, lesson.homework, pasteDay.format('YYYY-MM-DD'),lesson.period).then(function() {
              if(lesson.standards) {
                var standardSequence = Q.resolve();
                lesson.standards.forEach(function(standard) {
                  standardSequence = standardSequence.then(function() {
                    $rootScope.$broadcast("task:message", "Link Standard " + standard.prefix + " >> " + pasteDay.format("MM/DD/YYYY"));
                    return oci.client.linkStandard(standard.id, pasteDay.format('MM/DD/YYYY'), lesson.period);
                  });
                });
                return standardSequence;
              }
            }).then(function() {
              pasteDay = moment(lesson.date, 'YYYYMMDD');
            });
          });
        });
        return shuffleSequence;
      });
      return sequence;
    }).then(function() {
      $rootScope.$broadcast("task:finished", "Finished Shuffling Lessons!");
      $rootScope.$broadcast("queue:finished");
    });
  };

  //Backup Task
  oci.backupPlannerDateRange = function(startDate, endDate, file) {
    startDate = moment(startDate).weekday(1);
    endDate = moment(endDate).weekday(1);

    var numWeeks = endDate.diff(startDate, 'weeks') + 1;
    var startDates = [];
    var weeks = [];

    for(var i = 0; i < numWeeks; i++) {
      startDates.push(moment(startDate).add('d', i * 7));
    }
    $rootScope.$broadcast("queue:begin", numWeeks + 3);

    var sequence = Q.resolve();
    startDates.forEach(function(start) {
      sequence = sequence.then(function () {
        return oci.client.getPlannerHTML(start.format("YYYY-MM-DD"), 1).then(function(week) {
          $rootScope.$broadcast("task:finished", "GET week started: " + start.format("MM-DD-YYYY"));
          weeks.push(week[0]);
          return $timeout(function() {
          }, 500);
        });
      });
    });

    sequence = sequence.then(function() {
      var numHomeworkJobs = 0;
      var homeworkSequence = Q.resolve();
      var currentJob = 0;
      weeks.forEach(function(week) {
        week.columns.forEach(function(column) {
          column.cells.forEach(function(cell) {
            if(cell.hasHomework && cell.date) {
              numHomeworkJobs += 1;
              homeworkSequence = homeworkSequence.then(function() {
                return oci.client.getLesson(moment(cell.date, "YYYYMMDD").format("YYYY-MM-DD"), cell.period).then(function(lesson) {
                  currentJob += 1;
                  $rootScope.$broadcast("task:message", "Grabbing lesson homework (Subtask: "+currentJob+"/" + numHomeworkJobs + ")");
                  cell.homework = lesson.homework;
                });
              });
            }
          });
        });
      });

      $rootScope.$broadcast("task:started", "Grabbing lesson homework (Subtask: 0/" + numHomeworkJobs + ")");

      return homeworkSequence.then(function() {
        $rootScope.$broadcast("task:finished", "Finished grabbing lesson homework");
      });
    });

    sequence = sequence.then(function() {
      var numStandardsJobs = 0;
      var standardsSequence = Q.resolve();
      var currentJob = 0;
      weeks.forEach(function(week) {
        week.columns.forEach(function(column) {
          column.cells.forEach(function(cell) {
            if(cell.standardsId) {
              numStandardsJobs += 1;
              standardsSequence = standardsSequence.then(function() {
                return oci.client.getLinkedStandards(moment(cell.date, "YYYYMMDD").format("YYYY-MM-DD"), cell.period).then(function(standards) {
                  currentJob += 1;
                  $rootScope.$broadcast("task:message", "Grabbing lesson standards (Subtask: "+currentJob+"/" + numStandardsJobs + ")");
                  cell.standards = standards;
                });
              });
            }
          });
        });
      });
      $rootScope.$broadcast("task:started", "Grabbing lesson standards (Subtask: 0/" + numStandardsJobs + ")");

      return standardsSequence.then(function() {
        $rootScope.$broadcast("task:finished", "Finished grabbing lesson standards");
      });
    });
   
    return sequence.then(function() {
      return fs.write(file, JSON.stringify(weeks, null, 2), "w").then(function() {
        $rootScope.$broadcast("task:finished", "Write planner to file: " + file);
        return $timeout(function() {
          $rootScope.$broadcast("queue:finished");
        }, 2000);
      });
    });
  };

  return oci;
})

;
