var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var AdmZip = require('adm-zip');
var walk = require('walk');
var integrationModel = require('./integration-model.js');
var formModel = require('./form-model.js');
var xmUtil = require('./utils.js');

function processCommPlan( zipFile ) {
  if( typeof zipFile === 'undefined' || zipFile === null ) {
    var msg = 'did not set a zip file argument';
    console.log( msg );
  	return msg;
  }
  if( !xmUtil.doesFileExist( zipFile ) || path.extname( zipFile ) !== '.zip' ) {
    var msg = zipFile + ' is not a valid zip file';
    console.log( msg );
    return msg;
  }

  // clean-up
  xmUtil.deleteFolderRecursive( './meta/' );

  // extract zip
  var zip = new AdmZip(zipFile);
  zip.extractAllTo( './meta/', true );

  // blow out integrations.json
  var contents = fs.readFileSync( './meta/integrations/integrations.json', 'utf-8' );
  var integrationsJSON = JSON.parse( contents );
  _.each( integrationsJSON.integrations, function( integrationJSON ) {
  	var integration = integrationModel.buildFromJSON( integrationJSON );
    integration.createScriptFile();
  } );

  // blow out forms
  var formWalker = walk.walk( './meta/forms', { followLinks: false } );
  formWalker.on( 'file', function( root, stat, next ){ 
    var contents = fs.readFileSync( path.join( '.', root, stat.name ), 'utf-8' );
    var form = formModel.buildFromJSON( JSON.parse( contents ) );
    form.createMessageFiles();
    next(); 
  } );

  formWalker.on( 'end', function(){   
    var nodes = [];
    var walker = walk.walk( '.', { followLinks: false } );
    walker.on( 'file', function( root, stat, next ){ nodes.push( path.join( root, stat.name ) ); next(); } );
    walker.on( 'end', function(){ console.log( nodes ); } ); 
  } );
}

function packageCommPlan( outputFilename ) {
  // update the integrations.json
  var contents = fs.readFileSync( './meta/integrations/integrations.json', 'utf-8' );
  var integrationJSON = JSON.parse( contents );
  for( var i = 0; i < integrationJSON.integrations.length; i++ ) {
    var integration = integrationModel.buildFromJSON( integrationJSON.integrations[i] );
    integration.loadScriptFile();
  }
  fs.writeFileSync( './meta/integrations/integrations.json', JSON.stringify( integrationJSON, null, 2 ) );


  // update the forms
  var formWalker = walk.walk( './meta/forms', { followLinks: false } );
  formWalker.on( 'file', function( root, stat, next ){ 
    var formPath = path.join( '.', root, stat.name );
    var contents = fs.readFileSync( formPath, 'utf-8' );
    var form = formModel.buildFromJSON( JSON.parse( contents ) );
    form.loadMessageFiles();
    fs.writeFileSync( formPath, JSON.stringify( form.getJSON(), null, 2 ) );
    next(); 
  } );

  mkdirp('./tmp');
  var zip = new AdmZip();
  zip.addLocalFolder( './meta', '.' );
  zip.writeZip( path.join( 'tmp', outputFilename + '.zip' ) );
}

exports.processCommPlan = processCommPlan;
exports.packageCommPlan = packageCommPlan;