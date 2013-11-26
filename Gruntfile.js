'use strict';

module.exports = function( grunt ) {

  grunt.initConfig({

    pkg: {
      name: 'barman',
      description: 'A small library to brew JavaScript objects.',
      version: '0.4.0',
      homepage: 'https://github.com/dfernandez79/barman',
      keywords: [
        'traits',
        'oop',
        'classes',
        'objects',
        'object composition'
      ]
    },

    meta: {
      src: 'lib/**/*.js',
      testSrc: 'test/*.js',
      buildScripts: [ 'Gruntfile.js', 'tasks/**/*.js' ],
      testAppPort: 9001
    },

    jshint: {
      src: {
        files: {
          src: [ '<%=meta.src%>', '<%=meta.buildScripts%>' ]
        },
        options: {
          jshintrc: '.jshintrc'
        }
      },

      tests: {
        files: {
          src: [ '<%=meta.testSrc%>' ]
        },
        options: {
          jshintrc: 'test/.jshintrc'
        }
      }
    },

    simplemocha: {
      all: {
        src: '<%=meta.testSrc%>',
        options: {
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        }
      }
    },

    mocha: {
      noamd: {
        options: {
          run: true,
          urls: [ 'http://localhost:<%=meta.testAppPort%>/noamd-tests.html' ]
        }
      },
      amd: {
        options: {
          run: false,
          urls: [ 'http://localhost:<%=meta.testAppPort%>/amd-tests.html' ]
        }
      }
    },

    copy: {
      test: {
        expand: true,
        src: [
          'dist/barman.js',
          'test/integration/noamd-tests.html',
          'test/integration/amd-tests.html',
          'bower_components/requirejs/require.js',
          'bower_components/mocha/mocha.js',
          'bower_components/mocha/mocha.css'
        ],
        dest: '.tmp/',
        flatten: true
      }
    },

    connect: {
      test: {
        options: {
          port: '<%=meta.testAppPort%>',
          base: '.tmp',
          hostname: '*'
        }
      }
    },

    watch: {
      test: {
        files: [ '<%=meta.src%>', '<%=meta.testSrc%>', 'test/integration/*.html' ],
        tasks: [ 'jshint', 'process-sources' ]
      }
    },

    uglify: {
      dist: {
        options: {
          sourceMap: 'dist/barman.min.js.map',
          sourceMapPrefix: 1,
          sourceMappingURL: 'https://raw.github.com/dfernandez79/barman/v<%=pkg.version%>/dist/barman.min.js.map',
          sourceMapRoot: 'https://raw.github.com/dfernandez79/barman/v<%=pkg.version%>',
          banner: '// barman <%=pkg.version%>\n' +
            '// <%=pkg.homepage%>\n' +
            '// Copyright (c) 2013 Diego Fernandez\n' +
            '// Barman may be freely distributed under the MIT license.\n'
        },
        files: {
          'dist/barman.min.js': [ 'dist/barman.js' ]
        }
      }
    },

    clean: [ '.tmp', 'coverage' ],

    browserify: {
      lib: {
        src: [ 'lib/index.js' ],
        dest: 'dist/barman.js',
        options: {
          standalone: 'barman'
        }
      },

      test: {
        src: [ '<%=meta.testSrc%>' ],
        dest: '.tmp/allTests.js',
        options: {
          external: [ 'barman' ],
          alias: [ './lib:barman' ]
        }
      }
    }

  });

  grunt.loadNpmTasks( 'grunt-browserify' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-mocha' );
  grunt.loadNpmTasks( 'grunt-simple-mocha' );

  grunt.loadTasks( './tasks' );

  grunt.registerTask( 'default', [ 'jshint', 'test' ] );
  grunt.registerTask( 'test', [ 'simplemocha' ] );
  grunt.registerTask( 'process-sources', [ 'browserify', 'copy' ] );
  grunt.registerTask( 'integration-test', [ 'process-sources', 'connect', 'mocha' ] );
  grunt.registerTask( 'dist', [ 'clean', 'default', 'integration-test', 'update-package', 'uglify' ] );
  grunt.registerTask( 'dev', [ 'process-sources', 'connect', 'watch' ] );

};