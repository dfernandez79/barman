module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        meta: {
            src: 'src/**/*.js',
            specs: 'specs/**/*Spec.js'
        },
        lint: {
            grunt: 'grunt.js',
            src: '<config:meta.src>',
            specs: '<config:meta.specs>'
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
            files: ['<config:meta.src>', '<config:meta.specs>'],
            tasks: 'lint test'
        },
        simplemocha: {
            all: {
                src: '<config:meta.specs>',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('test', 'simplemocha');
    grunt.registerTask('default', 'lint test');
};