'use strict';


module.exports = function( grunt ) {

  grunt.registerTask('update-package', function() {
    var
      nodePackage = grunt.file.readJSON( 'package.json' ),
      bowerPackage = grunt.file.readJSON( 'bower.json' ),
      pkg = grunt.config.get( 'pkg' );

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

    grunt.file.write( 'package.json', JSON.stringify( nodePackage, null, 2 ) );
    grunt.file.write( 'bower.json', JSON.stringify( bowerPackage, null, 2 ) );
  });

};