'use strict';

module.exports = function ( grunt ) {
    var path = require('path'),
        fs = require('fs'),

        LOCAL_PRE_COMMIT_SCRIPT = 'git-hooks/pre-commit',
        GITDIR_PRE_COMMIT_SCRIPT = '.git/hooks/pre-commit';


    grunt.registerTask('githooks', 'Installs or removes git pre-commit hooks', function ( action ) {
        if ( !action || action === 'install' ) {

            installGitHooks();

        } else if ( action === 'uninstall' ) {

            uninstallGitHooks();

        } else {

            grunt.log.error('The action "' + action +
                '" is not recognized by githooks, use "githooks:install" or "githooks:uninstall" instead.');
            return false;
        }
    });

    function installGitHooks() {
        var src = path.resolve(LOCAL_PRE_COMMIT_SCRIPT),
            link = path.resolve(GITDIR_PRE_COMMIT_SCRIPT);

        try {

            fs.symlinkSync(src, link);
            grunt.log.writeln('Symlink ' + link + ' -> ' + src + ' created');

        } catch ( err ) {

            if ( err.code === 'EEXIST' ) {
                grunt.log.writeln('Symlink ' + link + ' already exists. No action taken.');
            } else {
                throw err;
            }

        }
    }

    function uninstallGitHooks() {
        var link = path.resolve(GITDIR_PRE_COMMIT_SCRIPT);

        try {
            fs.unlinkSync(link);
            grunt.log.writeln('Symlink ' + link + ' removed');

        } catch ( err ) {
            if ( err.code !== 'ENOENT' ) {
                throw err;
            }
        }
    }

};