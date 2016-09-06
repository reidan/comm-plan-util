var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var handlebars = require('handlebars');
var messageBuilder = require('./message-builder.js');

var doesFileExist = function( filepath ) {
  var err;
  try {
    var stat = fs.statSync( filepath );
  } catch ( e ) {
    err = e;
  }
  if( (typeof err !== 'undefined' && err !== null) ) {
  	console.log( filepath + ' has a problem' );
    return true;
  } else {
  	return false;
  }
}

var buildMessageFromTemplate = function( templateName, overrideConfPath, formPath ) {
	var handlebarsPath = path.join( '.', 'templates', templateName + '.hbs' );
	var baseConfPath = path.join( '.', 'conf', templateName + '.json' );

	if( doesFileExist( handlebarsPath ) ) {
		return 'There was a problem loading your template. Confirm it matches known templates: main';
	}
	if( doesFileExist( baseConfPath ) ) {
		return 'There was a problem loading your template. Confirm it matches known templates: main';		
	}
	if( doesFileExist( formPath ) || path.extname( formPath ) !== '.json' ) {
		return 'There was a problem loading your form. Please ensure the path matches a json file containing an export of your form.';
	}
	if( doesFileExist( overrideConfPath ) || path.extname( overrideConfPath ) !== '.json' ) {
		return 'There was a problem loading your override configuration. Please ensure the path matches a json file containing an export of your form.';
	}


	// Collect the properties of the form
	var formConf = require(formPath);
	var formProps = {};
	_.each( formConf.layoutSections, function( section ){
		_.merge( formProps, _.keyBy( section.sectionItems, 'propertyName' ) );
	} );

	// Process configuration files
	var configuration = {};
	var baseConf = require('./' + baseConfPath);
	var overrideConf = require(overrideConfPath);
	_.merge( configuration, baseConf );
	_.merge( configuration, overrideConf );

	// Add custom helpers
	handlebars.registerHelper('xm_property', function( propertyName ) {
		var property = formProps[ propertyName ];
		return '${' + property.id + '}';
	} );

	// Build output
	var templateSrc = fs.readFileSync( './templates/main.hbs', 'utf-8' );
	var template = handlebars.compile( templateSrc );
	var output = template( configuration );
	mkdirp.sync( 'output' );
	fs.writeFileSync( 'output/main.html', output );

	return 'success';
};

var buildMessages = function( confPath ) {
	if( doesFileExist( confPath ) || path.extname( confPath ) !== '.json' ) {
		return 'There was a problem loading your configuration.';
	}

	var contents = fs.readFileSync( confPath, 'utf-8' );
	var configuration = JSON.parse( contents );
	var metaPath = path.join( configuration.base_dir, 'meta', 'forms' );
	var srcPath = path.join( configuration.base_dir, 'src' );
	messageBuilder.addFormsPath( metaPath );
	_.each( configuration.messages, function( messageConf ) {
		var message = messageBuilder.buildFromConf( messageConf );
    	var formMessagePath = path.join( srcPath, 'messages', messageConf.form_name, messageConf.type, messageConf.language + '.html' );
    	fs.writeFileSync( formMessagePath, message );
	} );
};

exports.buildMessageFromTemplate = buildMessageFromTemplate;
exports.buildMessagesFromConfig = buildMessages;