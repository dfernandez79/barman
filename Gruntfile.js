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
                browser: true,
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
                white: false,
                unused: true
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
            noamd: {
                src: [ 'integration-tests/noamd-tests.html'],
                options: { run: true }
            },
            amd: {
                src: [ 'integration-tests/amd-tests.html'],
                options: { run: false }
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: 'dist/barman.min.js.map',
                    sourceMapRoot: 'https://raw.github.com/dfernandez79/barman/v<%=pkg.version%>'
                },
                files: {
                    'dist/barman.min.js': ['src/barman.js']
                }
            }
        },

        requirejs: {
            std: {
                options: {
                    name: 'barmanSpec',
                    out: 'integration-tests/js/barmanSpec.amd.js',
                    optimize: 'none',
                    baseUrl: 'specs',
                    paths: {
                        chai: 'empty:',
                        '../src/barman': 'empty:'
                    },
                    cjsTranslate: true,
                    onBuildWrite: function ( moduleName, path, contents ) {

                        // hack to remove the module ID from barmanSpec, so is possible to re-locate it
                        // in the requirejs configuration
                        if ( moduleName == 'barmanSpec' ) {
                            return contents.replace(/^define\('barmanSpec',/, "define(")
                                .replace(/\.\.\/src\/barman/g, 'barman');
                        }

                        return contents;

                    }
                }
            }
        },

        docco: {
            file: {
                src: '<%=meta.src%>',
                dest: 'docs/',
                options: {
                    css: 'docs/source-docs.css'
                }
            }
        }

    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-docco');


    grunt.registerTask('test', 'simplemocha');
    grunt.registerTask('integration-test', ['requirejs', 'mocha']);

    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('dist', ['default', 'uglify', 'integration-test']);

};