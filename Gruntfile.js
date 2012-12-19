module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
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
            self: 'Gruntfile.js',
            src: {files: {src: '<%=meta.src%>'}},
            specs: {
                files: {src: '<%=meta.specs%>'},
                options: {
                    globals: {describe: true, it: true, expect: true, define: true, beforeEach: true}
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
                    cjsTranslate: true,
                    optimize: 'uglify2',
                    paths: {
                        underscore: 'empty:'
                    }
                }
            },
            noamd: {
                options: {
                    name: '<%=pkg.main.slice(0, -3)%>',
                    out: 'dist/<%=pkg.name%>-noamd.min.js',
                    cjsTranslate: true,
                    optimize: 'uglify2',
                    paths: {
                        underscore: 'empty:'
                    },
                    wrap: {
                        startFile: 'src/noamd.wrap.start',
                        endFile: 'src/noamd.wrap.end'
                    }
                }
            }
        }
    });

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