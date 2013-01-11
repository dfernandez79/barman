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
                boss: false,
                eqnull: true,
                node: true,
                es5: true,
                strict: true,
                unused: true,
                trailing: false
            },
            self: 'Gruntfile.js',
            src: {files: {src: '<%=meta.src%>'}, options: {globals: {define: true}}},
            specs: {
                files: {src: '<%=meta.specs%>'},
                options: {
                    expr: true,
                    immed: false,
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
                    paths: {
                        underscore: 'empty:'
                    }
                }
            },
            noamd: {
                options: {
                    name: '<%=pkg.main.slice(0, -3)%>',
                    out: 'dist/<%=pkg.name%>-noamd.min.js',
                    optimize: 'uglify2',
                    paths: {
                        underscore: 'empty:'
                    },
                    wrap: {
                        startFile: 'src/noamdWrap.start',
                        endFile: 'src/noamdWrap.end'
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