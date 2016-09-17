var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var handlebars = require('handlebars');
var messageBuilder = require('./message-builder.js');
var utils = require('./utils.js');

var buildMessageFromTemplate = function( templateName, overrideConfPath, formPath ) {
	var handlebarsPath = path.join( '.', 'templates', templateName + '.hbs' );
	var baseConfPath = path.join( '.', 'conf', templateName + '.json' );

	if( !utils.doesFileExist( handlebarsPath ) ) {
		return 'There was a problem loading your template. Confirm it matches known templates: main';
	}
	if( !utils.doesFileExist( baseConfPath ) ) {
		return 'There was a problem loading your template. Confirm it matches known templates: main';		
	}
	if( !utils.doesFileExist( formPath ) || path.extname( formPath ) !== '.json' ) {
		return 'There was a problem loading your form. Please ensure the path matches a json file containing an export of your form.';
	}
	if( !utils.doesFileExist( overrideConfPath ) || path.extname( overrideConfPath ) !== '.json' ) {
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

var buildMessages = function( confPath, templatesPath ) {
	if( utils.doesFileExist( confPath ) && path.extname( confPath ) === '.json' ) {
		console.log( 'Using config file located at: ' + confPath );
	} else {
		throw 'There was a problem loading your configuration >> FilePath = ' + confPath;
	}
	messageBuilder.setTemplatesPath( templatesPath );

	var contents = fs.readFileSync( confPath, 'utf-8' );
	var configuration = JSON.parse( contents );
	var metaPath = path.join( configuration.base_dir, 'meta', 'forms' );
	var srcPath = path.join( configuration.base_dir, 'src' );
	messageBuilder.addFormsPath( metaPath );
	_.each( configuration.messages, function( messageConf ) {
		console.log( 'Generating ' + messageConf.type + ' message for ' + messageConf.form_name + ' Form (lang=' + messageConf.language + ')' );
		var message = messageBuilder.buildFromConf( messageConf );
    	var formMessagePath = path.join( srcPath, 'messages', messageConf.form_name, messageConf.type, messageConf.language + '.html' );
    	fs.writeFileSync( formMessagePath, message );
	} );
};

exports.buildMessageFromTemplate = buildMessageFromTemplate;
exports.buildMessagesFromConfig = buildMessages;