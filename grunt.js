module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        lint: {
            grunt: 'grunt.js',
            src: 'src/**/*.js',
            specs: 'specs/**/*Spec.js'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true,
                strict: true
            },
            globals: {define: true},
            specs: {
                globals: {describe: true, it: true, expect: true, define: true, beforeEach: true}
            }
        },
        watch: {
            files: ['<config:lint.src>', '<config:lint.specs>'],
            tasks: 'lint test'
        },
        jasmine: {
            src: 'src/**/*.js',
            specs: 'specs/**/*Spec.js',
            helpers: ['specs/helpers/require.js', 'specs/helpers/requireConfig.js'],
            template: {
                src: 'specs/helpers/requirejs-runner.tmpl',
                opts: {
                    requireConfig: {
                        paths: {
                            'domReady': 'specs/helpers/domReady',
                            'barista': 'src/barista',
                            'underscore': 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min'
                        },

                        shim: {
                            underscore: { exports: '_'}
                        }
                    }
                }
            },
            amd: true
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-runner');

    grunt.registerTask('test', 'jasmine');
    grunt.registerTask('default', 'lint test');
};