module.exports = function ( grunt ) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            src: 'src/**/*.js',
            specs: 'specs/**/*Spec.js'
        },

        jshint: {
            options: {
                node: true,
                esnext: false,
                evil: false,
                couch: false,
                devel: false,
                dojo: false,
                jquery: false,
                mootools: false,
                nonstandard: false,
                prototypejs: false,
                rhino: false,
                worker: false,
                wsh: false,
                yui: false,
                nomen: false,
                white: false
            },

            buildScripts: ['Gruntfile.js', 'tasks/**/*.js' ],

            src: {
                files: {src: '<%=meta.src%>'},
                options: {
                    globals: {define: true}
                }
            },

            specs: {
                files: {src: '<%=meta.specs%>'},
                options: {
                    es5: true,
                    expr: true,
                    globals: {describe: true, it: true, expect: true, define: true, beforeEach: true, afterEach: true}
                }
            }
        },

        watch: {
            files: ['<%=meta.src%>', '<%=meta.specs%>'],
            tasks: ['lint', 'test']
        },

        simplemocha: {
            all: {
                src: '<%=meta.specs%>',
                options: {
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            }
        },

        mocha: {
            integration: {
                src: ['integration-tests/runner.html'],
                options: {run: true}
            }
        },

        requirejs: {
            std: {
                options: {
                    name: '<%=pkg.main.slice(0, -3)%>',
                    out: 'dist/<%=pkg.name%>.min.js',
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    paths: {
                        underscore: 'empty:'
                    },
                    cjsTranslate: true,
                    wrap: {
                        startFile: 'src/wrap.start',
                        endFile: 'src/wrap.end'
                    }
                }
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', 'simplemocha');
    grunt.registerTask('integration-test', 'mocha');
    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('dist', ['default', 'requirejs', 'integration-test']);
    grunt.registerTask('default', ['lint', 'test']);

};