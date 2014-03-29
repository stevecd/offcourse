offCourse
========================
A node-webkit gui for automating tedious oncoursesystems.com tasks.

If you've ever filled out a year's worth of lesson plans and then had
a snow day or other unplanned school cancellation, you know how incredibly tedious
it is to insert empty days and push everything back.

offCourse enables you to do that in a few clicks.

## Available Tasks
1. Backup - downloads lesson notes, lesson homework, and linked standards for all
lessons between two dates.
2. Shuffle - starting at the end of a given date range, this task moves each lesson plan
over by one day while skipping weekends and any other days you mark.  This is the task
that makes accommodating unplanned cancellations really easy.
3. More to come maybe if there's any demand...

## Quick Start
```
$ git clone git://github.com/stevecd/offcourse
$ cd offcourse
$ npm install
$ bower install
$ grunt watch
$ start node-webkit ( nw ./ )
```

## Packaging
Modify your Gruntfile.js's nodewebkit task, setting whichever environments you
want to true, then:

```
$ grunt build:nodewebkit
```

## Contributing

1. Fork it ( http://github.com/stevecd/offcourse/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request
