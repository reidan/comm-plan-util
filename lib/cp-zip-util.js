var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var AdmZip = require('adm-zip');
var walk = require('walk');

function processCommPlan( zipFile ) {
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

  // clean-up
  deleteFolderRecursive( './meta/' );

  // need to reconsider this...
  deleteFolderRecursive( './src/' );

  // extract zip
  var zip = new AdmZip(zipFile);
  zip.extractAllTo( './meta/', true );

  // blow out integrations.json
  var contents = fs.readFileSync( './meta/integrations/integrations.json', 'utf-8' );
  var integrationJSON = JSON.parse( contents );
  for( var i = 0; i < integrationJSON.integrations.length; i++ ) {
  	var integration = integrationJSON.integrations[i];
  	var integrationPath = path.join( 'src', 'integrations', integration.type, integration.name + '.js' );
  	console.log( 'Creating file:: '+ integrationPath );
  	mkdirp.sync( path.dirname( integrationPath ) );
  	fs.writeFileSync( integrationPath, integration.script );
  }

  // blow out forms
  var formWalker = walk.walk( './meta/forms', { followLinks: false } );
  formWalker.on( 'file', function( root, stat, next ){ 
    console.log( path.join( root, stat.name ) ); 
    var contents = fs.readFileSync( path.join( '.', root, stat.name ), 'utf-8' );
    var formJSON = JSON.parse( contents );
    console.log( contents );
    var formMessagePath = path.join( 'src', 'messages', formJSON.name, 'email' );
    mkdirp.sync( formMessagePath );
    _.each( formJSON.messages.emailTemplates, function( emailTemplate ) {
      var emailPath = path.join( formMessagePath, emailTemplate.languageCode + '.html' );
      fs.writeFileSync( emailPath, emailTemplate.email );
    } );
    next(); 

  } );
  formWalker.on( 'end', function(){   
    var nodes = [];
    var walker = walk.walk( '.', { followLinks: false } );
    walker.on( 'file', function( root, stat, next ){ nodes.push( path.join( root, stat.name ) ); next(); } );
    walker.on( 'end', function(){ console.log( nodes ); } ); 
  } );
}

function packageCommPlan( baseDir, output ) {
  var integrations = {};
  var forms = {};
  var locationsWalked = [];
  console.log( baseDir );
  var intPath = path.join( baseDir, 'src', 'integrations' );
  var messagePath = path.join( baseDir, 'src', 'messages' );
  console.log( intPath );

  var intOptions = {
    listeners: {
      file: function( root, stat, next ){ 
        console.log( stat.name );
        var integrationName = stat.name.split( '.' )[0];
        var contents = fs.readFileSync( path.join( root, stat.name ), 'utf-8' );
        // var integrationJSON = JSON.parse( contents );
        // console.log( contents );
        integrations[ integrationName ] = contents;
        next(); 
      },
      end: function( root, stat, next ){ 
        locationsWalked.push( intPath );
      }
    },
    followLinks: false
  };

  var integrationWalker = walk.walkSync( intPath, intOptions );

  var formOptions = {
    listeners: {
      file: function( root, stat, next ){ 
        console.log( stat.name );
        console.log( root );
        // var integrationName = root.split( '.' )[1];
        var contents = fs.readFileSync( path.join( root, stat.name ), 'utf-8' );
        // var formJSON = JSON.parse( contents );
        // forms[ stat.name ] = formJSON;
        next(); 
      },
      end: function( root, stat, next ){ 
        locationsWalked.push( messagePath );
      }
    },
    followLinks: false
  };
  var formWalker = walk.walkSync( messagePath, formOptions );
  console.log( _.keys( integrations ) );
  console.log( _.keys( forms ) );
  console.log( locationsWalked );
}

exports.processCommPlan = processCommPlan;
exports.packageCommPlan = packageCommPlan;