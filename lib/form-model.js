var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');

function FormModel( json, filename ) {
	this.json = json;
	this.filename = filename;
	return this;
}

FormModel.prototype.getJSON = function() {
	return this.json;
};

FormModel.prototype.getPath = function() {
    var formMessagePath = path.join( 'src', 'messages', this.json.name, 'email' );
	return formMessagePath;
};

FormModel.prototype.createMessageFiles = function() {
  	var formMessagePath = this.getPath();
    _.each( this.json.messages.emailTemplates, function( emailTemplate ) {
    	var emailPath = path.join( formMessagePath, emailTemplate.languageCode + '.html' );
    	console.log( emailPath );
  		mkdirp.sync( path.dirname( emailPath ) );
    	fs.writeFileSync( emailPath, emailTemplate.email );
    } );
};

FormModel.prototype.loadMessageFiles = function( formFilePath ) {
  	var formMessagePath = this.getPath();
    _.each( this.json.messages.emailTemplates, function( emailTemplate ) {
     	var emailPath = path.join( formMessagePath, emailTemplate.languageCode + '.html' );
		emailTemplate.email = fs.readFileSync( emailPath, 'utf-8' );
    } );
};

function buildFromJSON( json, filename ) {
	return new FormModel( json, filename );
}

exports.buildFromJSON = buildFromJSON;