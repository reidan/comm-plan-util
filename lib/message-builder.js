var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var handlebars = require('handlebars');
var formHelper = require( './form-helper.js' );
var utils = require('./utils.js');

function MessageBuilder() {
	this.templates = {};
	this.baseTemplatePath; // = conf.templatePath;

	var builder = this;

	// Add custom helpers
	handlebars.registerHelper('xm_property', function( propertyName ) {
		var property = builder.formProperties[ propertyName ];
		return '${' + property.id + '}';
	} );

	handlebars.registerPartial( 'xm_parts', 
		'{{#each parts}}{{#if isProperty}}{{xm_property name}}' +
			'{{/if}}{{#if isText}}{{text}}{{/if}}{{/each}}' 
	);

	return this;
}

MessageBuilder.prototype.getTemplate = function( templateName ) {
	if( this.templates.hasOwnProperty( templateName ) ) {
		return this.templates[ templateName ];
	} else {
		// var handlebarsPath = this.baseTemplatePath + path.join( 'templates', templateName + '.hbs' );
		var handlebarsPath = path.join( this.baseTemplatePath, 'templates', templateName + '.hbs' );
		// var baseConfPath = this.baseTemplatePath + path.join( 'conf', templateName + '.json' );
		var baseConfPath = path.join( this.baseTemplatePath, 'conf', templateName + '.json' );

		if( !utils.doesFileExist( handlebarsPath ) ) {
			throw 'There was a problem loading your template. Confirm file exists at: ' + handlebarsPath;
		}
		if( !utils.doesFileExist( baseConfPath ) ) {
			throw 'There was a problem loading your template. Confirm file exists at: ' + baseConfPath;		
		}

		var baseTemplateConfSrc = fs.readFileSync( baseConfPath, 'utf-8' );
		var baseTemplateConf = JSON.parse( baseTemplateConfSrc );

		var templateSrc = fs.readFileSync( handlebarsPath, 'utf-8' );
		var handlebarsTemplate = handlebars.compile( templateSrc );	

		var template = {
			baseConf: baseTemplateConf,
			handlebarsTemplate: handlebarsTemplate
		};
		this.templates[ templateName ] = template;
		return template;
	}
};

MessageBuilder.prototype.setTemplatesPath = function( templatesPath ) {
	console.log( 'Using template path at ' + templatesPath );
	this.baseTemplatePath = templatesPath;
};

MessageBuilder.prototype.build = function( templateName, formName, config ) {
	var template = this.getTemplate( templateName );

	// Process configuration
	var configuration = {};
	_.merge( configuration, template.baseConf );
	_.merge( configuration, config );

	this.formProperties = formHelper.getProperties( formName );
	// Build output
	return template.handlebarsTemplate( configuration );
};

MessageBuilder.prototype.buildFromConf = function( conf ) {
	return this.build( conf.template_name, conf.form_name, conf.config );
};

MessageBuilder.prototype.addFormsPath = function( formPath ) {
	formHelper.loadForms( formPath );
};

var mb = new MessageBuilder();
module.exports = mb;