'use strict';

module.exports = function ( grunt ) {

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
            test: 'test/**/*Test.js',
            testSrc: ['<%=meta.test%>', '!test/coffeeCompatibilityTest.js'],
            buildScripts: ['Gruntfile.js', 'tasks/**/*.js'],
            testAppPort: 9001
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
                options: {
                    run: true,
                    urls: ['http://localhost:<%=meta.testAppPort%>/noamd-tests.html']
                }
            },
            amd: {
                options: {
                    run: false,
                    urls: ['http://localhost:<%=meta.testAppPort%>/amd-tests.html']
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
                    'bower_components/mocha/mocha.css',
                    'bower_components/chai/chai.js'
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
                files: ['<%=meta.src%>', '<%=meta.testSrc%>', 'test/coffeeCompatibilityTest.coffee', 'test/integration/*.html'],
                tasks: ['jshint', 'process-sources']
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
                    banner: '// barman <%=pkg.version%>\n' +
                        '// <%=pkg.homepage%>\n' +
                        '// Copyright (c) 2013 Diego Fernandez\n' +
                        '// Barman may be freely distributed under the MIT license.\n'
                },
                files: {
                    'dist/barman.min.js': ['dist/barman.js']
                }
            }
        },

        clean: ['.tmp', 'test/coffeeCompatibilityTest.js'],

        browserify: {
            lib: {
                src: ['lib/index.js'],
                dest: 'dist/barman.js',
                options: {
                    standalone: 'barman'
                }
            },

            test: {
                src: ['<%=meta.test%>'],
                dest: '.tmp/allTests.js',
                options: {
                    external: ['../lib']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('test', ['coffee', 'simplemocha']);
    grunt.registerTask('process-sources', ['coffee', 'browserify', 'copy']);
    grunt.registerTask('integration-test', ['process-sources', 'connect', 'mocha']);
    grunt.registerTask('dist', ['clean', 'default', 'integration-test', 'update-package', 'uglify']);
    grunt.registerTask('dev', ['process-sources', 'connect', 'watch']);

    grunt.registerTask('update-package', function () {
        var nodePackage = grunt.file.readJSON('package.json'),
            bowerPackage = grunt.file.readJSON('bower.json'),
            pkg = grunt.config.get('pkg');

        nodePackage.name = pkg.name;
        nodePackage.description = pkg.description;
        nodePackage.version = pkg.version;
        nodePackage.keywords = pkg.keywords;
        nodePackage.homepage = pkg.homepage;

        bowerPackage.name = pkg.name;
        bowerPackage.description = pkg.description;
        bowerPackage.version = pkg.version;
        bowerPackage.keywords = pkg.keywords;
        bowerPackage.homepage = pkg.homepage;

        grunt.file.write('package.json', JSON.stringify(nodePackage, null, 4));
        grunt.file.write('bower.json', JSON.stringify(bowerPackage, null, 4));
    });

};