var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var handlebars = require('handlebars');
var formHelper = require( './form-helper.js' );

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
};

function MessageBuilder() {
	this.templates = {};

	this.templates.main = {
		baseConf : {
	"font_family": "gotham, verdana, sans-serif",
	"font_size": {
		"main": "16px",
		"properties": "14px"
	},
	"colors": {
		"text": "#444444",
		"background": "#f6f6f6",
		"text_properties": "#444444",
		"background_properties": "#fcfcfc",
		"border_properties": "#e4e4e4"
	},
	"padding": {
		"row": "5px 10px"
	},
	"width": {
		"properties_table": {
			"max": "800px"
		}
	},
	"images": {
		"xm_logo": {
			"url": "https://na1.xmatters.com/static/images/logo.png",
			"height": "35px"
		},
		"third_party_logo": {
			"url": "",
			"height": "",
			"width": ""
		}
	},
	"properties": [
		{
			"label": "label",
			"name": ""
		}
	],
	"main_message": {
		"text": "",
		"parts": []
	}
}
	};
	this.templates.main.handlebarsTemplate = handlebars.compile( '<table style="width: 100%;  font-family: {{font_family}}; font-size: {{font_size}}; text-align: center; color: {{colors.text}}; background-color: {{colors.background}}; border: 0; border-collapse: collapse; padding: 0; margin: 0;"> <tbody> <tr> <td style="text-align: center; border: 0; padding: 21px 0 0;"> <div> {{#with images.xm_logo}} <img alt="xMatters" src="{{url}}"{{#if height}} height="{{height}}"{{/if}}{{#if width}} width="{{width}}"{{/if}}> {{/with}} </div> </td> </tr> <tr> <td style="text-align: center; border: 0; padding: 18px 0 0;"> <div>{{#if main_message.text}}{{main_message.text}}{{/if}}{{#if main_message.parts}}{{#each main_message.parts}}{{#if isProperty}}{{xm_property name}}{{/if}}{{#if isText}}{{text}}{{/if}}{{/each}}{{/if}}</div> </td> </tr> <tr> <td style="padding: 7px 0px 0px; margin: 0; border: 0;"> <div style="width:100%; text-align: center;"> <div style="display: inline-block; max-width: {{width.properties_table.max}}; width: 100%;"> <table style="width: 100%; font-size: {{font_size.properties}}; text-align: left; color: {{colors.text_properties}}; background-color: {{colors.background_properties}}; padding: 0; margin: 0; border: 0; border-collapse: collapse"> <tbody> {{#each properties}} <tr style="border: solid 1px {{../colors.border_properties}};"> <td style="padding: {{../padding.row}};"> <div><strong>{{label}}</strong></div> <div>{{xm_property name}}</div> </td> </tr> {{/each}} </tbody> </table> </div> </div> </td> </tr> <tr> <td style="text-align: center; border: 0; padding: 4px 0px 21px;"> {{#with images.third_party_logo}} <img src="{{url}}"{{#if height}} height="{{height}}"{{/if}}{{#if width}} width="{{width}}"{{/if}}> {{/with}} </td> </tr> </tbody> </table>' );

	var builder = this;

	// Add custom helpers
	handlebars.registerHelper('xm_property', function( propertyName ) {
		var property = builder.formProperties[ propertyName ];
		return '${' + property.id + '}';
	} );

	return this;
}

MessageBuilder.prototype.getTemplate = function( templateName ) {
	if( this.templates.hasOwnProperty( templateName ) ) {
		return this.templates[ templateName ];
	} else {
		var handlebarsPath = path.join( '.', 'templates', templateName + '.hbs' );
		var baseConfPath = path.join( '.', 'conf', templateName + '.json' );

		if( doesFileExist( handlebarsPath ) ) {
			throw 'There was a problem loading your template. Confirm it matches known templates: main';
		}
		if( doesFileExist( baseConfPath ) ) {
			throw 'There was a problem loading your template. Confirm it matches known templates: main';		
		}

		var baseTemplateConf = require('../' + baseConfPath);

		var templateSrc = fs.readFileSync( './templates/main.hbs', 'utf-8' );
		var handlebarsTemplate = handlebars.compile( templateSrc );	

		var template = {
			baseConf: baseTemplateConf,
			handlebarsTemplate: handlebarsTemplate
		};
		this.templates[ templateName ] = template;
		return template;
	}
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