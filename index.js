var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var AdmZip = require('adm-zip');
var walk = require('walk');

function processIBZip( zipFile ) {
  if( typeof zipFile === 'undefined' || zipFile === null ) {
    var msg = 'did not set a zip file argument';
    console.log( msg );
  	return msg;
  }
  var err;
  try {
    var stat = fs.statSync( zipFile );
  } catch ( e ) {
    err = e;
  }
  if( (typeof err !== 'undefined' && err !== null) || path.extname( zipFile ) !== '.zip' ) {
    var msg = zipFile + ' is not a valid zip file';
    console.log( msg );
    return msg;
  }

  var deleteFolderRecursive = function( dirPath ) {
    if( fs.existsSync( dirPath ) ) {
      fs.readdirSync( dirPath ).forEach(function(file,index){
        var subPath = path.join( dirPath, file );
        if(fs.lstatSync(subPath).isDirectory()) { // recurse
          deleteFolderRecursive(subPath);
        } else { // delete file
          fs.unlinkSync(subPath);
        }
      });
      fs.rmdirSync( dirPath );
    }
  };

  deleteFolderRecursive( './meta/' );
  deleteFolderRecursive( './src/' );

  // extract zip
  var zip = new AdmZip(zipFile);
  zip.extractAllTo( './meta/', true );

  // blow out integrations.json
  var contents = fs.readFileSync( './meta/integrations/integrations.json', 'utf-8' );
  var integrationJSON = JSON.parse( contents );
  for( var i = 0; i < integrationJSON.integrations.length; i++ ) {
  	var integration = integrationJSON.integrations[i];
  	// console.log( integration );
  	// console.log( integration.script );
  	var integrationPath = path.join( 'src', 'integrations', integration.type, integration.name + '.js' );
  	console.log( 'Creating file:: '+ integrationPath );
  	mkdirp.sync( path.dirname( integrationPath ) );
  	fs.writeFileSync( integrationPath, integration.script );
  }

  var nodes = [];

  var walker = walk.walk( '.', { followLinks: false } );

  walker.on( 'file', function( root, stat, next ){ nodes.push( path.join( root, stat.name ) ); next(); } );
  walker.on( 'end', function(){ console.log( nodes ); } );
}

exports.processIBZip = processIBZip;