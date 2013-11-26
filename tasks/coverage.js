'use strict';


module.exports = function( grunt ) {

  grunt.registerTask('coverage', function() {
    var done = this.async();
    grunt.util.spawn({
      cmd: './node_modules/.bin/istanbul',
      args: 'cover ./node_modules/.bin/_mocha -- -R spec'.split(' ')
    }, done);
  });

};