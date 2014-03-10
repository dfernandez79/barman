'use strict';

module.exports = function( grunt ) {

  grunt.initConfig({

    pkg: {
      name: 'barman',
      description: 'A small library to brew JavaScript objects.',
      version: '0.4.2',
      homepage: 'https://github.com/dfernandez79/barman',
      keywords: [
        'traits',
        'oop',
        'classes',
        'objects',
        'object composition',
        'inheritance',
        'class'
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
          base: '.tmp'
        }
      }
    },

    watch: {
      test: {
        files: [ '<%=meta.src%>', '<%=meta.testSrc%>', 'test/integration/*.html' ],
        tasks: [ 'jshint', 'process-sources' ],
        options: {
          livereload: true
        }
      }
    },

    uglify: {
      dist: {
        options: {
          report: 'gzip',
          sourceMap: true,
          sourceMapIncludeSources: true,
          sourceMapName: 'dist/barman.min.js.map',
          banner: '// barman <%=pkg.version%>\n' +
            '// <%=pkg.homepage%>\n' +
            '// Copyright (c) 2014 Diego Fernandez\n' +
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
          alias: [ './lib:barman' ],

          // expect.js checks for typeof Buffer if it's defined. 
          // New versions of browserify, tries to automatically include common
          // NodeJS globals if they are referenced in code.
          // For that reason allTests.js had a require('buffer') that fails
          // even if buffer is never used. This flag avoids that globals 
          // detection
          detectGlobals: false
        }
      }
    }

  });

  require('load-grunt-tasks')( grunt );

  grunt.loadTasks( './tasks' );

  grunt.registerTask( 'default', [ 'jshint', 'test' ] );
  grunt.registerTask( 'test', [ 'simplemocha' ] );
  grunt.registerTask( 'process-sources', [ 'browserify', 'copy' ] );
  grunt.registerTask( 'integration-test', [ 'process-sources', 'connect', 'mocha' ] );
  grunt.registerTask( 'dist', [ 'clean', 'default', 'integration-test', 'update-package', 'uglify' ] );
  grunt.registerTask( 'dev', [ 'process-sources', 'connect', 'watch' ] );

};