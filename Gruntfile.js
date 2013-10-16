'use strict';

module.exports = function ( grunt ) {

    grunt.initConfig({

        pkg: {
            name: 'barman',
            description: 'A small library to brew JavaScript objects.',
            version: '0.3.0'
        },

        meta: {
            src: 'lib/**/*.js',
            test: 'test/**/*Test.js',
            testSrc: ['<%=meta.test%>', '!test/coffeeCompatibilityTest.js'],
            buildScripts: ['Gruntfile.js', 'tasks/**/*.js']
        },

        jshint: {
            src: {
                files: {src: ['<%=meta.src%>', '<%=meta.buildScripts%>']},
                options: {jshintrc: '.jshintrc'}
            },

            tests: {
                files: {src: ['<%=meta.testSrc%>']},
                options: {jshintrc: 'test/.jshintrc'}
            }
        },

        simplemocha: {
            all: {
                src: '<%=meta.test%>',
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
                src: [ 'integration/noamd-tests.html'],
                options: { run: true }
            },
            amd: {
                src: [ 'integration/amd-tests.html'],
                options: { run: false }
            }
        },

        coffee: {
            tests: {
                files: {
                    'test/coffeeCompatibilityTest.js': 'test/coffeeCompatibilityTest.coffee'
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: 'dist/barman.min.js.map',
                    sourceMapPrefix: 1,
                    sourceMappingURL: 'https://raw.github.com/dfernandez79/barman/v<%=pkg.version%>/dist/barman.min.js.map',
                    sourceMapRoot: 'https://raw.github.com/dfernandez79/barman/v<%=pkg.version%>',
                    preserveComments: function ( node, comment ) { return comment.line < 4; }
                },
                files: {
                    'dist/barman.min.js': ['dist/barman.js']
                }
            }
        },

        docco: {
            file: {
                src: '<%=meta.src%>',
                dest: 'docs/',
                options: {
                    css: 'docs/annotated-source.css'
                }
            }
        },

        clean: ['test/coffeeCompatibilityTest.js'],

        browserify: {
            lib: {
                src: ['lib/barman.js'],
                dest: 'dist/barman.js'
            },
            options: {
                standalone: 'barman'
            }
        }

    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('test', ['coffee:tests', 'simplemocha']);
    grunt.registerTask('integration-test', ['coffee:tests', 'uglify', 'mocha']);

    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('dist', ['default', 'integration-test', 'docco']);

};